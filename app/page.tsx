"use client"

import { useEffect, useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useReviewStore, Card } from "@/lib/store"
import { useLogStore } from "@/lib/log-store"
import { setAccessToken, getMyPlaylists } from "@/lib/spotify"
import { LandingScreen } from "@/components/landing-screen"
import { ReviewCard } from "@/components/review-card"
import { EmptyState } from "@/components/empty-state"
import { DeckOverview } from "@/components/deck-overview"
import { DevLog } from "@/components/dev-log"
import { Button } from "@/components/ui/button"
import spotifyApi from "@/lib/spotify"
import { Toast } from "@/components/toast"

type AppState = 'playlist' | 'overview' | 'review';

interface Card {
  id: string;
  artworkUrl: string;
  durationMs: number;
  easiness: number;
  interval: number;
  nextDue: number;
  deck: 'NEW' | 'AGAIN' | 'GOOD';
  reps: number;
  playbackStartPosition: number;
}

export default function App() {
  const { data: session } = useSession()
  const { queue, setDeck, load, initializePlayer } = useReviewStore()
  const { addLog } = useLogStore()
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistObjectSimplified[]>([])
  const [appState, setAppState] = useState<AppState>('playlist')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    if (session?.accessToken) {
      initializePlayer(() => session.accessToken);
    }
  }, [session, initializePlayer]);

  useEffect(() => {
    if (appState === 'review' && queue.length === 0) {
      addLog('Review queue is empty, returning to deck overview.', 'info');
      showToast('Deck complete! Returning to overview.', 'success');
      setAppState('overview');
    }
  }, [queue, appState, addLog, showToast]);

  useEffect(() => {
    if (session?.accessToken) {
      addLog('Spotify session found, setting access token', 'success')
      setAccessToken(session.accessToken)
      getMyPlaylists().then(data => {
        setPlaylists(data.items)
        addLog(`Loaded ${data.items.length} playlists`, 'success')
      })
    }
  }, [session, addLog])

  const handleSignOut = () => {
    addLog('User signed out', 'info')
    signOut({ callbackUrl: '/' })
  }
  
  const handlePlaylistSelect = async (playlistId: string) => {
    addLog(`Fetching tracks for playlist ${playlistId}`, 'info')
    const tracks = await spotifyApi.getPlaylistTracks(playlistId);
    const newCards: Card[] = tracks.items
      .filter(item => item.track && item.track.album.images.length > 0)
      .map(item => ({
        id: item.track.id,
        artworkUrl: item.track.album.images[0].url,
        durationMs: item.track.duration_ms,
        easiness: 2.5,
        interval: 0,
        nextDue: 0,
        deck: 'NEW' as const,
        reps: 0,
        playbackStartPosition: Math.floor(Math.random() * (item.track.duration_ms - 15000)),
      }));
    load(newCards);
    addLog(`Loaded ${newCards.length} tracks into the NEW deck`, 'success')
    setAppState('overview')
  }

  const handleDeckSelect = (deck: 'NEW' | 'AGAIN' | 'GOOD') => {
    setDeck(deck);
    setAppState('review');
  }

  const handleReturnToOverview = () => {
    setDeck(null); // Deselect the deck
    setAppState('overview');
  }

  const renderContent = () => {
    switch (appState) {
      case 'playlist':
        return (
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-4">Select a Playlist</h1>
            <div className="space-y-2">
              {playlists.map(playlist => (
                <Button key={playlist.id} onClick={() => handlePlaylistSelect(playlist.id)} className="w-full">
                  {playlist.name}
                </Button>
              ))}
            </div>
          </div>
        )
      case 'overview':
        return <DeckOverview onDeckSelect={handleDeckSelect} />
      case 'review':
        if (queue.length > 0) {
          return <ReviewCard onError={() => {}} showToast={showToast} onReturn={handleReturnToOverview} />
        }
        // This case is now handled by the useEffect hook, but this is a safe fallback.
        return <EmptyState onRetry={() => setAppState('overview')} />
      default:
        return <EmptyState onRetry={() => setAppState('playlist')} />
    }
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {renderContent()}
          <Button onClick={handleSignOut} variant="outline" className="w-full max-w-md mt-4">Sign Out</Button>
        </div>
        <DevLog />
        {toastMessage && <Toast message={toastMessage} type={toastType} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <LandingScreen onConnect={() => {
            addLog('Connecting to Spotify...', 'info')
            signIn('spotify')
          }} />
        </div>
      </div>
      <DevLog />
      {toastMessage && <Toast message={toastMessage} type={toastType} />}
    </div>
  )
}
