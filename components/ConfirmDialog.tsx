'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  items?: string[]
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  items,
  confirmText = 'OK',
  cancelText = 'Anuluj',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Modal - zawsze w centrum ekranu */}
      <div 
        className="fixed z-[10000] w-full max-w-md px-4"
        style={{ 
          position: 'fixed',
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl opacity-20 blur-xl" />
        
        <div className="relative bg-gray-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-medium text-white flex-1">{title}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {message}
            </p>
            
            {items && items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-400 pl-4"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 bg-white/5 border-t border-white/10">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-all border border-white/10 hover:border-white/20"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // Renderuj w document.body przez Portal - poza hierarchią DOM komponentów
  return createPortal(modalContent, document.body)
}
