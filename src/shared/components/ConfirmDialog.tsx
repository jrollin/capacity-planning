import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-2xl">
        <p className="text-sm text-slate-200">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-emerald-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
