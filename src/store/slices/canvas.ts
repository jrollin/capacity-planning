import type { StateCreator } from 'zustand'
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import type { ComponentDefinition, InnerCall } from '../../domain/types'
import type { StoreState } from '../index'
import { captureSnapshot, undo, redo } from '../history'

export interface CanvasNodeData {
  componentId: string
  label: string
  icon: string
  latencyOverride?: { p50?: number; p95?: number; p99?: number }
  throughputOverride?: { maxRps?: number; concurrencyLimit?: number }
  innerCalls?: InnerCall[]
  [key: string]: unknown
}

export type PipelineFlowNode = Node<CanvasNodeData, 'pipeline'>

export const DEFAULT_EDGE_LATENCY_MS = 1

export interface CanvasSlice {
  nodes: PipelineFlowNode[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (definition: ComponentDefinition, position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<CanvasNodeData>) => void
  updateEdgeLatency: (edgeId: string, latencyMs: number) => void
  toggleEdgeSequential: (edgeId: string) => void
  addInnerCall: (nodeId: string, componentId: string) => void
  removeInnerCall: (nodeId: string, innerCallId: string) => void
  toggleInnerCallSequential: (nodeId: string, innerCallId: string) => void
  moveInnerCall: (nodeId: string, innerCallId: string, direction: 'up' | 'down') => void
  removeNode: (nodeId: string) => void
  setNodes: (nodes: PipelineFlowNode[]) => void
  setEdges: (edges: Edge[]) => void
  undoCanvas: () => void
  redoCanvas: () => void
}

export const createCanvasSlice: StateCreator<StoreState, [], [], CanvasSlice> = (
  set,
  get,
) => {
  function snap() {
    const { nodes, edges } = get()
    captureSnapshot(nodes, edges)
  }

  return {
  nodes: [],
  edges: [],

  onNodesChange: (changes: NodeChange[]) => {
    const hasRemoval = changes.some((c) => c.type === 'remove')
    if (hasRemoval) snap()
    set({
      nodes: applyNodeChanges(changes, get().nodes) as PipelineFlowNode[],
    })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const hasRemoval = changes.some((c) => c.type === 'remove')
    if (hasRemoval) snap()
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection: Connection) => {
    snap()
    const existing = get().edges
    const alreadyConnected = existing.some(
      (e) =>
        (e.source === connection.source && e.target === connection.target) ||
        (e.source === connection.target && e.target === connection.source),
    )
    if (alreadyConnected) return

    const id = nanoid(8)
    const edge: Edge = {
      id,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'pipeline',
      data: { latencyMs: DEFAULT_EDGE_LATENCY_MS },
    }
    set({ edges: [...existing, edge] })
  },

  addNode: (definition, position) => {
    snap()
    const id = nanoid(8)
    const node: PipelineFlowNode = {
      id,
      type: 'pipeline',
      position,
      data: {
        componentId: definition.id,
        label: definition.name,
        icon: definition.icon,
      },
    }
    set({ nodes: [...get().nodes, node] })
  },

  updateNodeData: (nodeId, data) => {
    snap()
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node,
      ),
    })
  },

  updateEdgeLatency: (edgeId, latencyMs) => {
    snap()
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, latencyMs } }
          : e,
      ),
    })
  },

  toggleEdgeSequential: (edgeId) => {
    snap()
    const edges = get().edges
    const edge = edges.find((e) => e.id === edgeId)
    if (!edge) return

    const isSequential = (edge.data as Record<string, unknown>)?.sequential as boolean | undefined
    const source = edge.source

    if (isSequential) {
      const updated = edges.map((e) => {
        if (e.id === edgeId) {
          const data = { ...(e.data as Record<string, unknown>) }
          delete data.sequential
          delete data.sequentialOrder
          return { ...e, data }
        }
        return e
      })
      const siblings = updated
        .filter((e) => e.source === source && e.id !== edgeId && (e.data as Record<string, unknown>)?.sequential)
        .sort((a, b) =>
          ((a.data as Record<string, unknown>)?.sequentialOrder as number ?? 0) -
          ((b.data as Record<string, unknown>)?.sequentialOrder as number ?? 0),
        )
      let order = 1
      const renumbered = updated.map((e) => {
        const s = siblings.find((s) => s.id === e.id)
        if (s) return { ...e, data: { ...e.data, sequentialOrder: order++ } }
        return e
      })
      set({ edges: renumbered })
    } else {
      const maxOrder = edges
        .filter((e) => e.source === source && (e.data as Record<string, unknown>)?.sequential)
        .reduce((max, e) => Math.max(max, (e.data as Record<string, unknown>)?.sequentialOrder as number ?? 0), 0)
      set({
        edges: edges.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...e.data, sequential: true, sequentialOrder: maxOrder + 1 } }
            : e,
        ),
      })
    }
  },

  addInnerCall: (nodeId, componentId) => {
    snap()
    const call: InnerCall = { id: nanoid(8), componentId, sequential: true }
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, innerCalls: [...(n.data.innerCalls ?? []), call] } }
          : n,
      ),
    })
  },

  removeInnerCall: (nodeId, innerCallId) => {
    snap()
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, innerCalls: (n.data.innerCalls ?? []).filter((c) => c.id !== innerCallId) } }
          : n,
      ),
    })
  },

  toggleInnerCallSequential: (nodeId, innerCallId) => {
    snap()
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                innerCalls: (n.data.innerCalls ?? []).map((c) =>
                  c.id === innerCallId ? { ...c, sequential: !c.sequential } : c,
                ),
              },
            }
          : n,
      ),
    })
  },

  moveInnerCall: (nodeId, innerCallId, direction) => {
    snap()
    set({
      nodes: get().nodes.map((n) => {
        if (n.id !== nodeId) return n
        const calls = [...(n.data.innerCalls ?? [])]
        const idx = calls.findIndex((c) => c.id === innerCallId)
        if (idx < 0) return n
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= calls.length) return n
        ;[calls[idx], calls[targetIdx]] = [calls[targetIdx], calls[idx]]
        return { ...n, data: { ...n.data, innerCalls: calls } }
      }),
    })
  },

  removeNode: (nodeId) => {
    snap()
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
    })
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  undoCanvas: () => {
    const snapshot = undo(get().nodes, get().edges)
    if (snapshot) set({ nodes: snapshot.nodes, edges: snapshot.edges })
  },

  redoCanvas: () => {
    const snapshot = redo(get().nodes, get().edges)
    if (snapshot) set({ nodes: snapshot.nodes, edges: snapshot.edges })
  },
}
}
