import type { Edge } from '@xyflow/react'
import type { PipelineFlowNode } from './slices/canvas'

interface Snapshot {
  nodes: PipelineFlowNode[]
  edges: Edge[]
}

const MAX_HISTORY = 50

let past: Snapshot[] = []
let future: Snapshot[] = []

export function captureSnapshot(nodes: PipelineFlowNode[], edges: Edge[]) {
  past.push({
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
  })
  if (past.length > MAX_HISTORY) past = past.slice(-MAX_HISTORY)
  future = []
}

export function undo(
  currentNodes: PipelineFlowNode[],
  currentEdges: Edge[],
): Snapshot | null {
  if (past.length === 0) return null

  future.push({
    nodes: structuredClone(currentNodes),
    edges: structuredClone(currentEdges),
  })

  return past.pop()!
}

export function redo(
  currentNodes: PipelineFlowNode[],
  currentEdges: Edge[],
): Snapshot | null {
  if (future.length === 0) return null

  past.push({
    nodes: structuredClone(currentNodes),
    edges: structuredClone(currentEdges),
  })

  return future.pop()!
}
