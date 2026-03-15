import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { getComponentById } from '../../domain/component-catalog'
import { Slider } from '../../shared/components/Slider'
import { formatLatency, formatRps } from '../../shared/utils/format'
import { InnerCallsSection } from './InnerCallsSection'

export function NodeConfigDrawer() {
  const { nodeId, open, close, nodes, edges, updateNodeData, toggleEdgeSequential, addInnerCall, removeInnerCall, toggleInnerCallSequential, moveInnerCall } = useStore(
    (s) => ({
      nodeId: s.selectedNodeId,
      open: s.configDrawerOpen,
      close: s.closeConfigDrawer,
      nodes: s.nodes,
      edges: s.edges,
      updateNodeData: s.updateNodeData,
      toggleEdgeSequential: s.toggleEdgeSequential,
      addInnerCall: s.addInnerCall,
      removeInnerCall: s.removeInnerCall,
      toggleInnerCallSequential: s.toggleInnerCallSequential,
      moveInnerCall: s.moveInnerCall,
    }),
    shallow,
  )

  if (!open || !nodeId) return null

  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return null

  const outgoingEdges = edges.filter((e) => e.source === nodeId)

  const definition = getComponentById(node.data.componentId)
  if (!definition) return null

  const currentLatency = {
    p50: node.data.latencyOverride?.p50 ?? definition.latency.p50,
    p95: node.data.latencyOverride?.p95 ?? definition.latency.p95,
    p99: node.data.latencyOverride?.p99 ?? definition.latency.p99,
  }

  const currentMaxRps =
    node.data.throughputOverride?.maxRps ?? definition.throughput.maxRps

  function updateLatency(key: 'p50' | 'p95' | 'p99', value: number) {
    updateNodeData(nodeId!, {
      latencyOverride: { ...node!.data.latencyOverride, [key]: value },
    })
  }

  function resetDefaults() {
    updateNodeData(nodeId!, {
      latencyOverride: undefined,
      throughputOverride: undefined,
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-slate-700 bg-slate-850 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{definition.icon}</span>
          <h2 className="text-sm font-semibold text-slate-200">
            {definition.name}
          </h2>
        </div>
        <button
          onClick={close}
          className="text-slate-400 hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Latency
          </h3>
          <Slider
            label="p50"
            value={currentLatency.p50}
            min={0.1}
            max={5000}
            step={0.1}
            onChange={(v) => updateLatency('p50', v)}
            formatValue={formatLatency}
          />
          <Slider
            label="p95"
            value={currentLatency.p95}
            min={0.1}
            max={10000}
            step={0.1}
            onChange={(v) => updateLatency('p95', v)}
            formatValue={formatLatency}
          />
          <Slider
            label="p99"
            value={currentLatency.p99}
            min={0.1}
            max={20000}
            step={0.1}
            onChange={(v) => updateLatency('p99', v)}
            formatValue={formatLatency}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Throughput
          </h3>
          <Slider
            label="Max RPS"
            value={currentMaxRps}
            min={10}
            max={500000}
            onChange={(v) =>
              updateNodeData(nodeId!, {
                throughputOverride: {
                  ...node!.data.throughputOverride,
                  maxRps: v,
                },
              })
            }
            formatValue={formatRps}
            logarithmic
          />
        </section>

        <InnerCallsSection
          innerCalls={node.data.innerCalls ?? []}
          onAdd={(componentId) => addInnerCall(nodeId!, componentId)}
          onRemove={(innerCallId) => removeInnerCall(nodeId!, innerCallId)}
          onToggleSequential={(innerCallId) => toggleInnerCallSequential(nodeId!, innerCallId)}
          onMove={(innerCallId, direction) => moveInnerCall(nodeId!, innerCallId, direction)}
        />

        {outgoingEdges.length > 1 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outgoing Calls
            </h3>
            <p className="text-[10px] text-slate-500">Mark calls as sequential to sum their latencies instead of running in parallel.</p>
            {outgoingEdges.map((edge) => {
              const targetNode = nodes.find((n) => n.id === edge.target)
              const targetDef = targetNode ? getComponentById(targetNode.data.componentId) : undefined
              const d = edge.data as { sequential?: boolean; sequentialOrder?: number } | undefined
              const isSeq = d?.sequential ?? false
              const order = d?.sequentialOrder
              return (
                <button
                  key={edge.id}
                  onClick={() => toggleEdgeSequential(edge.id)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                    isSeq
                      ? 'border-blue-500/50 bg-blue-600/10 text-blue-300'
                      : 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{targetDef?.icon ?? '?'}</span>
                  <span className="flex-1 text-left">{targetDef?.name ?? edge.target}</span>
                  {isSeq && order != null && (
                    <span className="rounded bg-blue-600/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      [{order}]
                    </span>
                  )}
                  <span className={`text-[10px] font-medium ${isSeq ? 'text-blue-400' : 'text-slate-500'}`}>
                    {isSeq ? 'sequential' : 'parallel'}
                  </span>
                </button>
              )
            })}
          </section>
        )}

        <button
          onClick={resetDefaults}
          className="mt-auto rounded-md border border-slate-600 px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
