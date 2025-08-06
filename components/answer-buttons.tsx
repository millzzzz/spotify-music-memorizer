import { Button } from "@/components/ui/button"

interface AnswerButtonsProps {
  onAnswer: (answer: 'again' | 'good') => void
}

export function AnswerButtons({ onAnswer }: AnswerButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={() => onAnswer('again')}
        className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
        aria-label="Mark as Again (J)"
      >
        Again
      </Button>
      <Button
        onClick={() => onAnswer('good')}
        className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
        aria-label="Mark as Good (K)"
      >
        Good
      </Button>
    </div>
  )
}
