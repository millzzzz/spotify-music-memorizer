interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1">
      <div 
        className="bg-blue-600 h-1 rounded-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Audio playback progress"
      />
    </div>
  )
}
