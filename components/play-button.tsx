import { Button } from "@/components/ui/button"
import { Pause } from 'lucide-react'

interface PlayButtonProps {
  isPlaying: boolean
  onToggle: () => void
  className?: string
}

export function PlayButton({ isPlaying, onToggle, className }: PlayButtonProps) {
  return (
    <Button
      onClick={onToggle}
      className={className}
      variant="secondary"
      size="icon"
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <Pause className="w-6 h-6" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
      )}
    </Button>
  )
}
