<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# **Apple Music Memorizer - Comprehensive PRD**

**Version**: 1.0 (MVP)
**Target**: Single-day implementation
**Audience**: Development team using V0.dev + Cursor IDE

## **1. Project Overview**

### **Goal**

Build a functional web app that helps users memorize their Apple Music library using spaced repetition, deployable in one working day.

### **Core Concept**

- Display album artwork with 15-second audio excerpts
- User explicitly controls playback (no autoplay)
- Two-button grading system: **Again** (needs more practice) / **Good** (mastered)
- Three-deck workflow: **NEW** → **AGAIN** → **GOOD**
- Tinder-style swipe animations for gamification
- Comprehensive logging for debugging


## **2. User Experience Flow**

### **A. First-Time User**

1. **Landing** → "Connect Apple Music" authorization
2. **Library Import** → Fetch first 100 songs, create NEW deck
3. **Deck Overview** → See three tiles: NEW (100), AGAIN (0), GOOD (0)
4. **Review Session** → Tap NEW → Study cards → Return to overview

### **B. Returning User**

1. **Login** → Deck Overview with updated counts
2. **Session Selection** → Choose deck based on due cards
3. **Review Loop** → Study → Grade → Swipe animation → Next card

### **C. Card Review Process**

1. **Card Display** → Album artwork + deck indicator + progress info
2. **Manual Play** → User presses play button → 15s random excerpt
3. **Grading** → Again (swipe left) or Good (swipe right)
4. **Transition** → Swipe animation → Next card appears

## **3. Three-Deck System**

| Deck | Purpose | Card Criteria | User Actions |
| :-- | :-- | :-- | :-- |
| **NEW** | Unseen songs | `deck: 'NEW'`, never reviewed | First exposure, grade to AGAIN or GOOD |
| **AGAIN** | Learning phase | `deck: 'AGAIN'`, `nextDue ≤ now` | Active practice until mastered |
| **GOOD** | Mastered songs | `deck: 'GOOD'`, `interval ≥ 30 days` | Optional maintenance reviews |

### **Grading Algorithm (SM-lite)**

```typescript
function grade(card: Card, isGood: boolean): Card {
  let { easiness: e, interval: i } = card;
  
  if (!isGood) {  // AGAIN
    e = Math.max(1.3, e - 0.2);
    i = 1;
    deck = 'AGAIN';
  } else {  // GOOD  
    e += 0.1;
    i = Math.ceil(i * e) || 1;
    deck = i >= 30 ? 'GOOD' : 'AGAIN';
  }
  
  return {
    ...card,
    easiness: e,
    interval: i,
    nextDue: Date.now() + i * 86_400_000,
    deck,
    reps: card.reps + 1
  };
}
```


## **4. Technical Architecture**

### **Tech Stack (Rapid Prototyping Optimized)**

| Layer | Technology | Justification |
| :-- | :-- | :-- |
| **Framework** | React 18 + TypeScript + Vite | Instant HMR, modern tooling |
| **Styling** | Tailwind CSS | Utility-first, matches V0.dev output |
| **State** | Zustand | Minimal boilerplate, perfect for MVP |
| **Audio** | MusicKit JS | Official Apple SDK, OAuth included |
| **Animation** | Framer Motion | Smooth swipe effects |
| **Routing** | React Router | Client-side navigation |
| **Persistence** | localStorage | Zero backend, survives refresh |
| **Testing** | Vitest + React Testing Library | Shares Vite config |
| **Deployment** | Netlify Drop | Zero-config deployment |

### **Data Models**

```typescript
type Deck = 'NEW' | 'AGAIN' | 'GOOD';

type Card = {
  id: string;
  artworkUrl: string;
  durationMs: number;
  easiness: number;     // 1.3-2.5 range
  interval: number;     // days until next review
  nextDue: number;      // epoch timestamp
  deck: Deck;
  reps: number;         // total review count
};

type ReviewState = {
  cards: Record<string, Card>;
  queue: string[];              // filtered by active deck
  activeDeck: Deck | null;
  currentId: string | null;
  
  // Actions
  load(): Promise<void>;
  setDeck(deck: Deck): void;
  answer(isGood: boolean): void;
  refillQueue(): void;
};
```


## **5. Module Structure**

```
src/
├── App.tsx                     // Routes + global styles
├── store.ts                    // Zustand store + scheduler
├── hooks/
│   └── useReview.ts           // Review session logic
├── components/
│   ├── DeckOverview.tsx       // Main navigation screen
│   ├── ReviewPage.tsx         // Review session container
│   ├── Card.tsx               // Flashcard component
│   ├── PlayButton.tsx         // Audio control
│   ├── AnswerButtons.tsx      // Again/Good buttons
│   ├── SwipeAnimator.tsx      // Animation wrapper
│   └── Toast.tsx              // Notification system
├── utils/
│   ├── music.ts               // MusicKit wrappers
│   ├── scheduler.ts           // FSSR algorithm
│   └── logger.ts              // Logging utilities
└── types/
    └── index.ts               // TypeScript definitions
```


## **6. UI/UX Specifications**

### **Design System**

- **Layout**: Centered column, max-width 480px
- **Typography**: Inter font, 16px base size
- **Colors**:
    - Background: `#F9FAFB`
    - Good (green): `#16A34A`
    - Again (red): `#DC2626`
    - Play (blue): `#2563EB`


### **Key Components**

#### **DeckOverview Screen**

- Three stacked tiles showing deck counts
- Live badge updates after each review
- Navigation shortcuts: N (New), A (Again), G (Good)


#### **Review Card**

- 256×256px album artwork
- Deck indicator pill (top-left)
- Progress bar showing repetition count or due date
- Large circular play/pause FAB overlay
- Full-width answer buttons at bottom


#### **Swipe Animations**

- **Again (left)**: -90vw translation, -15° rotation, 250ms
- **Good (right)**: +90vw translation, +15° rotation, 250ms
- **Enter**: Scale 0.95→1.0, opacity fade-in


### **Accessibility**

- 44×44px minimum touch targets
- ARIA labels on all interactive elements
- Keyboard shortcuts: Space (play), J (again), K (good)
- Focus management after animations


## **7. Audio Implementation**

### **MusicKit Integration**

```typescript
// Authorization
await MusicKit.configure({
  developerToken: APPLE_DEVELOPER_TOKEN,
  app: { name: 'Apple Music Memorizer' }
});

// Library access
const music = MusicKit.getInstance();
await music.authorize(['libraryRead', 'musicUserToken']);
```


### **Playback Rules**

1. **No Autoplay** - explicit user action required
2. **Random Excerpts** - `rand(0, duration - 15000)` millisecond offset
3. **15-Second Limit** - auto-stop or user interrupt
4. **Pre-buffering** - silently load next card's audio
5. **State Logging** - every play/pause/stop event

## **8. Observability \& Debugging**

### **Comprehensive Logging**

Every user action and system event logs to:

- Browser console with timestamps
- Toast notifications (auto-dismiss 3s)
- Dev drawer (slide-up on `~` key)
- `window.__debug` state exposure


### **Key Events**

```typescript
log('auth_success', { userId });
log('library_loaded', { songCount: 100 });
log('deck_open', { deck: 'NEW', size: 12 });
log('audio_play', { songId, offset: 42000 });
log('card_swipe', { songId, action: 'again', newDeck: 'AGAIN' });
log('badge_update', { deck: 'NEW', from: 12, to: 11 });
```


## **9. Implementation Timeline**

### **Single-Day Sprint (8 hours)**

| Time | Phase | Deliverables |
| :-- | :-- | :-- |
| **09:00-10:00** | **Setup** | Vite scaffold, import V0 components, MusicKit config |
| **10:00-11:00** | **Auth + Fetch** | Apple Music login, library import, basic card display |
| **11:00-12:00** | **Navigation** | DeckOverview screen, routing, deck filtering |
| **12:00-13:00** | **Audio** | Play/pause controls, random excerpts, pre-buffering |
| **13:00-14:00** | **Scheduler** | FSSR algorithm, grade function, persistence |
| **14:00-15:00** | **Animations** | Framer Motion swipes, card transitions |
| **15:00-16:00** | **Polish** | Toast system, keyboard shortcuts, accessibility |
| **16:00-17:00** | **QA** | Manual testing, edge cases, performance |
| **17:00-18:00** | **Deploy** | Netlify build, final smoke tests |

## **10. Acceptance Criteria**

### **Core Functionality**

- [ ] User authorizes Apple Music and sees library loaded
- [ ] DeckOverview shows accurate counts for NEW/AGAIN/GOOD
- [ ] Review session shows cards only from selected deck
- [ ] Play button starts 15s excerpt at random offset
- [ ] Again/Good buttons trigger correct swipe animations
- [ ] Scheduler promotes/demotes cards between decks correctly
- [ ] Hard refresh preserves all progress via localStorage


### **User Experience**

- [ ] No unexpected audio playback (explicit play only)
- [ ] Smooth 250ms swipe animations with proper easing
- [ ] Keyboard shortcuts work throughout application
- [ ] Toast notifications appear for all major actions
- [ ] Dev drawer shows complete event timeline


### **Technical Quality**

- [ ] No console errors in production build
- [ ] Responsive design works on mobile and desktop
- [ ] All async operations have proper error handling
- [ ] Performance marks show <100ms render times
- [ ] localStorage persists and restores complete state


## **11. Future Enhancements (Post-MVP)**

- **Multi-playlist support** - separate decks per Apple Music playlist
- **Advanced statistics** - learning curves, mastery rates
- **Cloud sync** - iCloud KeyValue store integration
- **Social features** - shared playlists, leaderboards
- **Mobile app** - React Native port
- **Offline mode** - IndexedDB caching


## **12. Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
| :-- | :-- | :-- | :-- |
| Apple Music API limits | Medium | High | Cache aggressively, implement retry logic |
| Audio loading failures | Medium | Medium | Graceful fallbacks, skip button |
| Browser compatibility | Low | Medium | Modern browser targeting, polyfills |
| User adoption | Medium | Low | Focus on core UX, iterate based on feedback |

**Development Instructions**: Build UI in V0.dev first using design specifications above, then implement logic in Cursor using this comprehensive PRD. Prioritize working functionality over perfect polish - ship fast, iterate faster.

