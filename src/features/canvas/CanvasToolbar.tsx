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
    'rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200'

  return (
    <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg">
      <button onClick={() => zoomIn()} className={btnClass} title="Zoom in">
        +
      </button>
      <button onClick={() => zoomOut()} className={btnClass} title="Zoom out">
        −
      </button>
      <button
        onClick={() => fitView({ padding: 0.2 })}
        className={btnClass}
        title="Fit view"
      >
        ⊞
      </button>
      <div className="mx-0.5 w-px bg-slate-700" />
      <button onClick={handleAutoLayout} className={btnClass} title="Auto layout">
        ⊞⇅
      </button>
    </div>
  )
}
