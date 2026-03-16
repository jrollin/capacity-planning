import { useReactFlow } from '@xyflow/react'
import { useStore } from '../../store'
import { autoLayout } from './auto-layout'

export function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const setNodes = useStore((s) => s.setNodes)

  function handleAutoLayout() {
    if (nodes.length === 0) return
    const layouted = autoLayout(nodes, edges)
    setNodes(layouted)
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }

  const btnClass =
    'flex items-center justify-center rounded p-2 min-w-[36px] min-h-[36px] text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200 md:min-w-0 md:min-h-0 md:px-2 md:py-1'

  return (
    <div
      className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg"
      role="toolbar"
      aria-label="Canvas controls"
    >
      <button onClick={() => zoomIn()} className={btnClass} aria-label="Zoom in" title="Zoom in">
        +
      </button>
      <button onClick={() => zoomOut()} className={btnClass} aria-label="Zoom out" title="Zoom out">
        −
      </button>
      <button
        onClick={() => fitView({ padding: 0.2 })}
        className={btnClass}
        aria-label="Fit view"
        title="Fit view"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>
      <div className="mx-0.5 w-px bg-slate-700" role="separator" aria-hidden="true" />
      <button onClick={handleAutoLayout} className={btnClass} aria-label="Auto layout" title="Auto layout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="8" y="14" width="7" height="7" /><line x1="6.5" y1="10" x2="6.5" y2="14" /><line x1="17.5" y1="10" x2="17.5" y2="14" />
        </svg>
      </button>
    </div>
  )
}
