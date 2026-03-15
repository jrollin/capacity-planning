import type { StateCreator } from 'zustand'
import type { CalculationResult, PipelineGraph } from '../../domain/types'
import { calculatePipeline } from '../../domain/engine'
import { DEFAULT_EDGE_LATENCY_MS } from './canvas'
import type { StoreState } from '../index'

export interface SimulationSlice {
  requestRps: number
  calculationResult: CalculationResult | null
  setRequestRps: (rps: number) => void
  recalculate: () => void
}

export const createSimulationSlice: StateCreator<
  StoreState,
  [],
  [],
  SimulationSlice
> = (set, get) => ({
  requestRps: 1000,
  calculationResult: null,

  setRequestRps: (rps) => {
    set({ requestRps: rps })
  },

  recalculate: () => {
    const { nodes, edges, requestRps } = get()

    if (nodes.length === 0) {
      set({ calculationResult: null })
      return
    }

    const graph: PipelineGraph = {
      nodes: nodes.map((n) => ({
        id: n.id,
        componentId: n.data.componentId,
        latencyOverride: n.data.latencyOverride,
        throughputOverride: n.data.throughputOverride,
        innerCalls: n.data.innerCalls,
      })),
      edges: edges.map((e) => {
        const d = e.data as { latencyMs?: number; sequential?: boolean; sequentialOrder?: number } | undefined
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          latencyMs: d?.latencyMs ?? DEFAULT_EDGE_LATENCY_MS,
          sequential: d?.sequential,
          sequentialOrder: d?.sequentialOrder,
        }
      }),
    }

    const result = calculatePipeline(graph, requestRps)
    set({ calculationResult: result })
  },
})
