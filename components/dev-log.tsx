"use client"

import { useState, useEffect } from "react"
import { useLogStore } from "@/lib/log-store"
import { X, Terminal } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function DevLog() {
  const [isOpen, setIsOpen] = useState(false)
  const { logs } = useLogStore()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '~') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full h-80 rounded-t-lg shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <h3 className="font-semibold">Development Log</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <span className="text-gray-500 text-xs">{log.timestamp}</span>
              <span className={
                log.type === 'error' ? 'text-red-600' :
                log.type === 'success' ? 'text-green-600' :
                'text-gray-700'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
        
        <div className="px-4 py-2 border-t text-xs text-gray-500">
          Press ~ to toggle this log
        </div>
      </div>
    </div>
  )
}
