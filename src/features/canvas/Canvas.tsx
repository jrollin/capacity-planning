import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { PipelineNode } from './PipelineNode'
import { PipelineEdge } from './PipelineEdge'
import { CanvasToolbar } from './CanvasToolbar'
import { useDragAndDrop } from './hooks/useDragAndDrop'
import { useClickToConnect } from './hooks/useClickToConnect'

const selector = (s: ReturnType<typeof useStore.getState>) => ({
  nodes: s.nodes,
  edges: s.edges,
  onNodesChange: s.onNodesChange,
  onEdgesChange: s.onEdgesChange,
  onConnect: s.onConnect,
})

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    shallow,
  )

  const { onDragOver, onDrop } = useDragAndDrop()
  const { pendingSource, onNodeClick, cancelConnect } = useClickToConnect()

  const nodesWithConnectState = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, _isPendingSource: n.id === pendingSource },
      })),
    [nodes, pendingSource],
  )

  const nodeTypes = useMemo(() => ({ pipeline: PipelineNode }), [])
  const edgeTypes = useMemo(() => ({ pipeline: PipelineEdge }), [])

  return (
    <div className="flex-1">
      <ReactFlow
        nodes={nodesWithConnectState}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={cancelConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'pipeline' }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-slate-900"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
        <MiniMap
          className="!bg-slate-800 !border-slate-700"
          maskColor="rgba(15, 23, 42, 0.7)"
          nodeColor="#475569"
        />
        <Panel position="bottom-left">
          <CanvasToolbar />
        </Panel>
        {pendingSource && (
          <Panel position="top-center">
            <div className="rounded-md bg-emerald-600/90 px-3 py-1 text-xs text-white shadow">
              Click another node to connect — Esc or click canvas to cancel
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
