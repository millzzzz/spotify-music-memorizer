import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onRetry: () => void
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Connection Failed
        </h2>
        <p className="text-gray-600">
          Unable to connect to Apple Music. Please check your connection and try again.
        </p>
      </div>

      <Button 
        onClick={onRetry}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry Connection
      </Button>
    </div>
  )
}
