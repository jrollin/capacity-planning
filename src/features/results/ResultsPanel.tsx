import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { DEFAULT_EDGE_LATENCY_MS } from '../../store/slices/canvas'
import type { PipelineGraph } from '../../domain/types'
import { RequestFlowCard } from './RequestFlowCard'
import { ThroughputCard } from './ThroughputCard'
import { BottleneckList } from './BottleneckList'
import { LoadCurveChart } from './LoadCurveChart'

export function ResultsPanel() {
  const { result, requestRps, collapsed, toggle, nodes, edges } = useStore(
    (s) => ({
      result: s.calculationResult,
      requestRps: s.requestRps,
      collapsed: s.resultsPanelCollapsed,
      toggle: s.toggleResultsPanel,
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

  return (
    <aside
      className={`flex flex-col border-l border-slate-700 bg-slate-850 transition-all ${
        collapsed ? 'w-10' : 'w-80'
      }`}
    >
      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-b border-slate-700 text-xs text-slate-400 hover:text-slate-200"
      >
        {collapsed ? '❮' : '❯'}
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-3 overflow-y-auto p-3">
          {!result ? (
            <p className="text-center text-xs text-slate-500">
              Add components and connect them to see results
            </p>
          ) : (
            <>
              <RequestFlowCard />
              <ThroughputCard
                effectiveRps={result.effectiveRps}
                requestRps={requestRps}
              />
              <BottleneckList bottlenecks={result.bottlenecks} />
              <LoadCurveChart graph={graph} currentRps={requestRps} />
            </>
          )}
        </div>
      )}
    </aside>
  )
}
