'use client'

import { useEffect } from 'react'
import { Redo2, Undo2 } from 'lucide-react'

type Props = {
  canUndo: boolean
  canRedo: boolean
  isDirty?: boolean
  onUndo: () => void
  onRedo: () => void
}

export function UndoRedoToolbar({ canUndo, canRedo, isDirty = false, onUndo, onRedo }: Props) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.ctrlKey || event.metaKey
      if (!mod) return

      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        if (!canUndo) return
        event.preventDefault()
        onUndo()
        return
      }
      if (key === 'z' && event.shiftKey) {
        if (!canRedo) return
        event.preventDefault()
        onRedo()
        return
      }
      if (key === 'y') {
        if (!canRedo) return
        event.preventDefault()
        onRedo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canUndo, canRedo, onUndo, onRedo])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Cofnij (Ctrl+Z)"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Undo2 className="h-4 w-4" aria-hidden />
        Cofnij
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title="Ponów (Ctrl+Shift+Z)"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Redo2 className="h-4 w-4" aria-hidden />
        Ponów
      </button>
      {isDirty ? (
        <span className="text-xs text-amber-400/90">Niezapisane zmiany</span>
      ) : (
        <span className="text-xs text-neutral-500">Zapisane w bazie</span>
      )}
    </div>
  )
}
