import { useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { getComponentById } from '../../domain/component-catalog'
import { buildAdjacency, buildEdgeLatencyMap } from '../../domain/engine'
import { formatLatency } from '../../shared/utils/format'
import { Card } from '../../shared/components/Card'
import type { PipelineEdge, ScenarioType } from '../../domain/types'

const percentiles = [
  { key: 'optimistic' as ScenarioType, label: 'p50', color: 'text-emerald-400', activeBg: 'bg-emerald-500/20 border-emerald-500/50' },
  { key: 'realistic' as ScenarioType, label: 'p95', color: 'text-amber-400', activeBg: 'bg-amber-500/20 border-amber-500/50' },
  { key: 'pessimistic' as ScenarioType, label: 'p99', color: 'text-red-400', activeBg: 'bg-red-500/20 border-red-500/50' },
]

export function RequestFlowCard() {
  const [activePercentile, setActivePercentile] = useState<ScenarioType>('realistic')

  const { calculationResult, nodes, edges } = useStore(
    (s) => ({
      calculationResult: s.calculationResult,
      nodes: s.nodes,
      edges: s.edges,
    }),
    shallow,
  )

  if (!calculationResult) return null

  const criticalPath = calculationResult.criticalPath
  const bottleneckIds = new Set(calculationResult.bottlenecks.map((b) => b.nodeId))
  const scenario = calculationResult.scenarios[activePercentile]
  const totalLatency = scenario.totalLatency.max

  const pipelineEdges: PipelineEdge[] = edges.map((e) => {
    const d = e.data as { latencyMs?: number; sequential?: boolean; sequentialOrder?: number } | undefined
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      latencyMs: d?.latencyMs ?? 1,
      sequential: d?.sequential,
      sequentialOrder: d?.sequentialOrder,
    }
  })

  const nodeIds = nodes.map((n) => n.id)
  const { adjacency } = buildAdjacency(nodeIds, pipelineEdges)
  const edgeLatencyMap = buildEdgeLatencyMap(pipelineEdges)

  function getNodeLatency(nodeId: string): number {
    return scenario.nodeLatencies.get(nodeId)?.max ?? 0
  }

  function getEdgeLatency(source: string, target: string): number {
    return edgeLatencyMap.get(`${source}->${target}`) ?? 0
  }

  const activeConfig = percentiles.find((p) => p.key === activePercentile)!

  interface StepInfo {
    nodeId: string
    icon: string
    name: string
    stepLatency: number
    cumulativeLatency: number
    isBottleneck: boolean
    percentOfTotal: number
    fanOut?: { type: 'sequential' | 'parallel'; steps: StepInfo[]; totalLatency: number }
  }

  function buildSteps(): StepInfo[] {
    const steps: StepInfo[] = []
    let cumulative = 0

    for (let i = 0; i < criticalPath.length; i++) {
      const nodeId = criticalPath[i]
      const node = nodes.find((n) => n.id === nodeId)
      const def = node ? getComponentById(node.data.componentId) : undefined
      const nodeLatency = getNodeLatency(nodeId)

      if (i > 0) {
        cumulative += getEdgeLatency(criticalPath[i - 1], nodeId)
      }
      cumulative += nodeLatency

      const children = adjacency.get(nodeId) ?? []
      let fanOut: StepInfo['fanOut']

      if (children.length > 1) {
        const outEdges = pipelineEdges.filter((e) => e.source === nodeId)
        const seqEdges = outEdges
          .filter((e) => e.sequential)
          .sort((a, b) => (a.sequentialOrder ?? 0) - (b.sequentialOrder ?? 0))
        const parEdges = outEdges.filter((e) => !e.sequential)

        const buildSubStep = (targetId: string): StepInfo => {
          const targetNode = nodes.find((n) => n.id === targetId)
          const targetDef = targetNode ? getComponentById(targetNode.data.componentId) : undefined
          const lat = getNodeLatency(targetId)
          return {
            nodeId: targetId,
            icon: targetDef?.icon ?? '?',
            name: targetDef?.name ?? targetId,
            stepLatency: lat,
            cumulativeLatency: cumulative + getEdgeLatency(nodeId, targetId) + lat,
            isBottleneck: bottleneckIds.has(targetId),
            percentOfTotal: totalLatency > 0 ? lat / totalLatency : 0,
          }
        }

        if (seqEdges.length > 0) {
          const seqSteps = seqEdges.map((e) => buildSubStep(e.target))
          const seqTotal = seqSteps.reduce((sum, s) => sum + s.stepLatency, 0)

          if (parEdges.length > 0) {
            const parSteps = parEdges.map((e) => buildSubStep(e.target))
            fanOut = {
              type: 'parallel',
              steps: [...seqSteps, ...parSteps],
              totalLatency: Math.max(seqTotal, ...parSteps.map((s) => s.stepLatency)),
            }
          } else {
            fanOut = { type: 'sequential', steps: seqSteps, totalLatency: seqTotal }
          }
        } else {
          const parSteps = children.map(buildSubStep)
          fanOut = {
            type: 'parallel',
            steps: parSteps,
            totalLatency: Math.max(...parSteps.map((s) => s.stepLatency)),
          }
        }
      }

      steps.push({
        nodeId,
        icon: def?.icon ?? '?',
        name: def?.name ?? nodeId,
        stepLatency: nodeLatency,
        cumulativeLatency: cumulative,
        isBottleneck: bottleneckIds.has(nodeId),
        percentOfTotal: totalLatency > 0 ? nodeLatency / totalLatency : 0,
        fanOut,
      })
    }

    return steps
  }

  const steps = buildSteps()
  const entrySet = new Set(
    nodeIds.filter((id) => !pipelineEdges.some((e) => e.target === id)),
  )

  function stepColor(step: StepInfo): string {
    if (step.isBottleneck) return 'text-red-400'
    if (step.percentOfTotal > 0.3) return 'text-amber-400'
    return 'text-slate-300'
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">Request Flow</span>
        <div className="flex gap-1">
          {percentiles.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePercentile(p.key)}
              className={`rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                activePercentile === p.key
                  ? `${p.activeBg} ${p.color}`
                  : 'border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.nodeId}>
            <div className={`flex items-center gap-2 py-1 text-xs ${stepColor(step)}`}>
              <span className="w-4 text-center">
                {entrySet.has(step.nodeId) ? '▶' : '│'}
              </span>
              <span>{step.icon}</span>
              <span className="flex-1 truncate font-medium">{step.name}</span>
              <span className="text-slate-500">+{formatLatency(step.stepLatency)}</span>
              <span className="font-mono text-[10px] text-slate-400">
                {formatLatency(step.cumulativeLatency)}
              </span>
            </div>

            {step.fanOut && (
              <div className="ml-4 border-l border-slate-700 pl-2">
                {step.fanOut.type === 'sequential' ? (
                  <>
                    <div className="py-0.5 text-[10px] text-blue-400">
                      ── sequential (1→{step.fanOut.steps.length}) ──
                    </div>
                    {step.fanOut.steps.map((sub, j) => (
                      <div key={sub.nodeId} className={`flex items-center gap-2 py-0.5 text-xs ${stepColor(sub)}`}>
                        <span className="w-4 text-center text-[10px] font-bold text-blue-400">[{j + 1}]</span>
                        <span>{sub.icon}</span>
                        <span className="flex-1 truncate">{sub.name}</span>
                        <span className="text-slate-500">+{formatLatency(sub.stepLatency)}</span>
                        <span className="font-mono text-[10px] text-slate-400">{formatLatency(sub.cumulativeLatency)}</span>
                      </div>
                    ))}
                    <div className="py-0.5 text-[10px] text-slate-500">── sum: {formatLatency(step.fanOut.totalLatency)} ──</div>
                  </>
                ) : (
                  <>
                    <div className="py-0.5 text-[10px] text-slate-500">── parallel branches ──</div>
                    {step.fanOut.steps.map((sub) => (
                      <div key={sub.nodeId} className={`flex items-center gap-2 py-0.5 text-xs ${stepColor(sub)}`}>
                        <span className="w-4 text-center">║</span>
                        <span>{sub.icon}</span>
                        <span className="flex-1 truncate">{sub.name}</span>
                        <span className="text-slate-500">+{formatLatency(sub.stepLatency)}</span>
                        <span className="font-mono text-[10px] text-slate-400">{formatLatency(sub.cumulativeLatency)}</span>
                      </div>
                    ))}
                    <div className="py-0.5 text-[10px] text-slate-500">── max: {formatLatency(step.fanOut.totalLatency)} ──</div>
                  </>
                )}
              </div>
            )}

            {i < steps.length - 1 && (
              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-600">
                <span className="w-4 text-center">│</span>
                <span>{getEdgeLatency(step.nodeId, steps[i + 1].nodeId)}ms net</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-slate-700 pt-2">
        <div className="flex justify-between text-[10px]">
          <span className={activeConfig.color}>Total ({activeConfig.label})</span>
          <span className="font-mono text-slate-300">
            {formatLatency(scenario.totalLatency.min)}–{formatLatency(scenario.totalLatency.max)}
          </span>
        </div>
      </div>
    </Card>
  )
}
