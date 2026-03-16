import { useCallback, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Header } from './Header'
import { ComponentSidebar } from '../features/sidebar/ComponentSidebar'
import { Canvas } from '../features/canvas/Canvas'
import { RightPanel } from '../features/panels/RightPanel'
import { useAutoCalculate } from '../features/simulation/hooks/useAutoCalculate'
import { useStore } from '../store'
import { PRESETS } from '../features/presets/templates'
import {
  saveToLocalStorage,
  exportToFile,
  importFromFile,
} from '../features/persistence/save-load'

export function MainLayout() {
  useAutoCalculate()

  const undoCanvas = useStore((s) => s.undoCanvas)
  const redoCanvas = useStore((s) => s.redoCanvas)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redoCanvas()
        } else {
          undoCanvas()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redoCanvas()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoCanvas, redoCanvas])

  const { nodes, edges, requestRps, setNodes, setEdges, setRequestRps } =
    useStore((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      requestRps: s.requestRps,
      setNodes: s.setNodes,
      setEdges: s.setEdges,
      setRequestRps: s.setRequestRps,
    }))

  const handleSave = useCallback(() => {
    saveToLocalStorage(nodes, edges, requestRps)
    exportToFile(nodes, edges, requestRps)
  }, [nodes, edges, requestRps])

  const handleLoad = useCallback(async () => {
    const data = await importFromFile()
    if (data) {
      setNodes(data.nodes)
      setEdges(data.edges)
      if (data.requestRps) setRequestRps(data.requestRps)
    }
  }, [setNodes, setEdges, setRequestRps])

  const handleLoadPreset = useCallback(
    (index: number) => {
      const preset = PRESETS[index]
      if (preset) {
        setNodes(preset.nodes)
        setEdges(preset.edges)
      }
    },
    [setNodes, setEdges],
  )

  return (
    <ReactFlowProvider>
      <div className="flex h-screen flex-col" style={{ height: '100dvh' }}>
        {/* Skip link for keyboard users */}
        <a href="#canvas-main" className="skip-link">
          Skip to canvas
        </a>

        <Header
          onSave={handleSave}
          onLoad={handleLoad}
          onLoadPreset={handleLoadPreset}
        />
        <div className="flex flex-1 overflow-hidden">
          <ComponentSidebar />
          <main id="canvas-main" className="flex-1" role="main" aria-label="Pipeline canvas">
            <Canvas />
          </main>
          <RightPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
