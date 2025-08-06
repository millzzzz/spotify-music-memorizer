import { CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
}

export function Toast({ message, type }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  }

  const Icon = icons[type]

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg max-w-sm",
        colors[type]
      )}>
        <Icon className={cn("w-4 h-4 flex-shrink-0", iconColors[type])} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
