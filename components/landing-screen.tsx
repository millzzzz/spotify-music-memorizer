import { Button } from "@/components/ui/button"

interface LandingScreenProps {
  onConnect: () => void
}

export function LandingScreen({ onConnect }: LandingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900 mb-2">
          Spotify Music Memorizer
        </h1>
        <p className="text-gray-600 max-w-md">
          Master your music library with spaced repetition. Connect your Spotify
          account to get started.
        </p>
      </div>
      <Button onClick={onConnect} size="lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.19 14.33c-.2.32-.58.43-.89.23-.28-.18-1.72-1.05-3.4-1.05-1.68 0-3.12.87-3.4 1.05-.31.2-.69.09-.89-.23-.2-.32-.09-.7.23-.89.43-.28 1.98-1.2 3.86-1.2 1.88 0 3.43.92 3.86 1.2.32.19.42.57.23.89zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          Connect Spotify
        </div>
      </Button>
      <p className="text-xs text-gray-500 mt-4">
        Note: The Spotify Web Playback SDK requires an active Spotify client (Desktop or Mobile) to be running for the audio to play.
      </p>
    </div>
  )
}
