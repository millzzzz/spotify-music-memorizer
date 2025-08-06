import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { transferPlayback } from '@/lib/spotify';

type Deck = 'NEW' | 'AGAIN' | 'GOOD';

export interface Card {
  id: string;
  artworkUrl: string;
  durationMs: number;
  easiness: number;
  interval: number;
  nextDue: number;
  deck: Deck;
  reps: number;
  playbackStartPosition: number;
}

interface ReviewState {
  cards: Record<string, Card>;
  queue: string[];
  activeDeck: Deck | null;
  currentId: string | null;
  initialQueueSize: number;
  isPlaying: boolean;
  playbackStartTime: number;
  player: Spotify.Player | null;
  deviceId: string | null;
  isDeviceActive: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  load: (cards: Card[]) => void;
  setDeck: (deck: Deck | null) => void;
  answer: (isGood: boolean) => void;
  refillQueue: () => void;
  setPlaybackState: (isPlaying: boolean) => void;
  initializePlayer: (getAccessToken: () => string) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      cards: {},
      queue: [],
      activeDeck: null,
      currentId: null,
      initialQueueSize: 0,
      isPlaying: false,
      playbackStartTime: 0,
      player: null,
      deviceId: null,
      isDeviceActive: false,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },
      load: (cards) => {
        const newCards = cards.reduce((acc, card) => {
          acc[card.id] = card;
          return acc;
        }, {} as Record<string, Card>);
        set({ cards: newCards, queue: Object.keys(newCards), currentId: Object.keys(newCards)[0] || null });
      },
      setDeck: (deck) => {
        set({ activeDeck: deck });
        if (deck) {
          get().refillQueue();
        } else {
          set({ queue: [], initialQueueSize: 0 });
        }
      },
      answer: (isGood) => {
        get().setPlaybackState(false);
        const { cards, currentId } = get();
        if (!currentId) return;

        const card = cards[currentId];
        const { reps } = card;
        let { easiness, interval, deck } = card;
        let nextDue: number;

        if (isGood) {
          easiness = Math.max(1.3, easiness + 0.1);
          interval = Math.ceil(interval * easiness) || 1;
          deck = interval >= 30 ? 'GOOD' : 'AGAIN';
          nextDue = Date.now() + interval * 86400000;
        } else {
          easiness = Math.max(1.3, easiness - 0.2);
          interval = 1;
          deck = 'AGAIN';
          nextDue = Date.now(); // Immediately due for review
        }
        
        const updatedCard: Card = {
          ...card,
          easiness,
          interval,
          deck,
          reps: reps + 1,
          nextDue,
        };

        set((state) => ({
          cards: {
            ...state.cards,
            [currentId]: updatedCard,
          },
          queue: state.queue.slice(1),
          currentId: state.queue[1] || null,
        }));
      },
      refillQueue: () => {
        const { cards, activeDeck } = get();
        if (!activeDeck) return;
        
        const now = Date.now();
        const filtered = Object.values(cards)
          .filter(c => c.deck === activeDeck && (activeDeck === 'NEW' || c.nextDue <= now))
          .map(c => c.id);

        set({ queue: filtered, currentId: filtered[0] || null, initialQueueSize: filtered.length });
      },
      setPlaybackState: (isPlaying) => {
        set({
          isPlaying,
          playbackStartTime: isPlaying ? Date.now() : 0,
        });
      },
      initializePlayer: (getAccessToken) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
          const player = new window.Spotify.Player({
            name: 'Spotify Music Memorizer',
            getOAuthToken: (cb: (token: string) => void) => {
              cb(getAccessToken());
            },
            volume: 0.5,
          });

          set({ player });

          player.addListener('ready', async ({ device_id }: { device_id: string }) => {
            console.log('Ready with Device ID', device_id);
            set({ deviceId: device_id });
            try {
              await transferPlayback(device_id);
              console.log('Playback transferred');
              set({ isDeviceActive: true });
            } catch (error) {
              console.error("Playback transfer failed", error);
            }
          });

          player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
            console.log('Device ID has gone offline', device_id);
            set({ isDeviceActive: false });
          });

          player.connect();
        };
      },
    }),
    {
      name: 'spotify-music-memorizer-storage',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['player', 'isDeviceActive', 'isPlaying', 'playbackStartTime'].includes(key))
        ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
); 