import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { DEFAULT_EDGE_LATENCY_MS } from '../../store/slices/canvas'
import type { PipelineGraph } from '../../domain/types'
import { RequestFlowCard } from './RequestFlowCard'
import { ThroughputCard } from './ThroughputCard'
import { BottleneckList } from './BottleneckList'
import { LoadCurveChart } from './LoadCurveChart'

export function ResultsContent() {
  const { result, requestRps, nodes, edges } = useStore(
    (s) => ({
      result: s.calculationResult,
      requestRps: s.requestRps,
      nodes: s.nodes,
      edges: s.edges,
    }),
    shallow,
  )

  const graph: PipelineGraph = useMemo(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        componentId: n.data.componentId,
        latencyOverride: n.data.latencyOverride,
        throughputOverride: n.data.throughputOverride,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        latencyMs: (e.data as { latencyMs?: number } | undefined)?.latencyMs ?? DEFAULT_EDGE_LATENCY_MS,
      })),
    }),
    [nodes, edges],
  )

  if (!result) {
    return (
      <p className="text-center text-xs text-slate-500">
        Add components and connect them to see results
      </p>
    )
  }

  return (
    <>
      <RequestFlowCard />
      <ThroughputCard
        effectiveRps={result.effectiveRps}
        requestRps={requestRps}
      />
      <BottleneckList bottlenecks={result.bottlenecks} />
      <LoadCurveChart graph={graph} currentRps={requestRps} />
    </>
  )
}
