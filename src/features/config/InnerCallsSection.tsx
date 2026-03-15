import { useState, useRef, useEffect } from 'react'
import type { InnerCall } from '../../domain/types'
import { getComponentById } from '../../domain/component-catalog'
import { COMPONENT_CATALOG, CATEGORIES } from '../../domain/component-catalog'

interface InnerCallsSectionProps {
  innerCalls: InnerCall[]
  onAdd: (componentId: string) => void
  onRemove: (innerCallId: string) => void
  onToggleSequential: (innerCallId: string) => void
  onMove: (innerCallId: string, direction: 'up' | 'down') => void
}

export function InnerCallsSection({
  innerCalls,
  onAdd,
  onRemove,
  onToggleSequential,
  onMove,
}: InnerCallsSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Inner Calls
        </h3>
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className="flex h-5 w-5 items-center justify-center rounded bg-slate-700 text-xs text-slate-400 transition-colors hover:bg-emerald-600 hover:text-white"
            title="Add inner call"
          >
            +
          </button>
          {pickerOpen && (
            <div className="absolute right-0 top-6 z-50 w-48 rounded-md border border-slate-600 bg-slate-800 py-1 shadow-xl">
              {CATEGORIES.map((cat) => {
                const components = COMPONENT_CATALOG.filter((c) => c.category === cat.id)
                return (
                  <div key={cat.id}>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {cat.label}
                    </div>
                    {components.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          onAdd(comp.id)
                          setPickerOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        <span>{comp.icon}</span>
                        <span>{comp.name}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {innerCalls.length === 0 && (
        <p className="text-[10px] text-slate-500">
          No inner calls. Click + to add sub-component dependencies.
        </p>
      )}

      {innerCalls.map((call, i) => {
        const def = getComponentById(call.componentId)
        const isDragged = draggedId === call.id
        const isDropTarget = dropTargetId === call.id && draggedId !== call.id
        return (
          <div
            key={call.id}
            draggable
            onDragStart={() => setDraggedId(call.id)}
            onDragOver={(e) => {
              e.preventDefault()
              setDropTargetId(call.id)
            }}
            onDragLeave={() => setDropTargetId(null)}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedId && draggedId !== call.id) {
                const fromIdx = innerCalls.findIndex((c) => c.id === draggedId)
                const toIdx = i
                if (fromIdx >= 0) {
                  const steps = toIdx - fromIdx
                  const dir = steps > 0 ? 'down' : 'up'
                  for (let s = 0; s < Math.abs(steps); s++) {
                    onMove(draggedId, dir)
                  }
                }
              }
              setDraggedId(null)
              setDropTargetId(null)
            }}
            onDragEnd={() => {
              setDraggedId(null)
              setDropTargetId(null)
            }}
            className={`flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 text-xs transition-all ${
              isDragged
                ? 'opacity-40'
                : isDropTarget
                  ? 'ring-1 ring-slate-400'
                  : ''
            } ${
              call.sequential
                ? 'border-blue-500/50 bg-blue-600/10 text-blue-300'
                : 'border-amber-500/50 bg-amber-600/10 text-amber-300'
            }`}
          >
            <span className="text-[10px] text-slate-600">⠿</span>
            <span className="text-base">{def?.icon ?? '?'}</span>
            <span className="flex-1 text-left">{def?.name ?? call.componentId}</span>
            <button
              onClick={() => onToggleSequential(call.id)}
              className="hover:brightness-150"
              title={`Switch to ${call.sequential ? 'parallel' : 'sequential'}`}
            >
              <span className={`text-[10px] font-medium ${call.sequential ? 'text-blue-400' : 'text-amber-400'}`}>
                {call.sequential ? '↓seq' : '⑃par'}
              </span>
            </button>
            <button
              onClick={() => onRemove(call.id)}
              className="text-[10px] text-slate-500 hover:text-red-400"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )
      })}
    </section>
  )
}
