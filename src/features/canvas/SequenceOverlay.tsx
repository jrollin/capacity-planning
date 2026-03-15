import { Panel } from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { getComponentById } from '../../domain/component-catalog'
import { buildAdjacency, buildEdgeLatencyMap } from '../../domain/engine'
import { formatLatency } from '../../shared/utils/format'
import type { PipelineEdge } from '../../domain/types'

interface StepInfo {
  nodeId: string
  icon: string
  name: string
  stepLatency: number
  cumulativeLatency: number
  isEntry: boolean
  isBottleneck: boolean
  percentOfTotal: number
  children?: FanOutGroup
}

interface FanOutGroup {
  type: 'sequential' | 'parallel'
  steps: StepInfo[]
  totalLatency: number
}

export function SequenceOverlay() {
  const { calculationResult, nodes, edges, toggleSequenceOverlay } = useStore(
    (s) => ({
      calculationResult: s.calculationResult,
      nodes: s.nodes,
      edges: s.edges,
      toggleSequenceOverlay: s.toggleSequenceOverlay,
    }),
    shallow,
  )

  if (!calculationResult) return null

  const criticalPath = calculationResult.criticalPath
  const bottleneckIds = new Set(calculationResult.bottlenecks.map((b) => b.nodeId))

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
  const entrySet = new Set(
    nodeIds.filter((id) => !pipelineEdges.some((e) => e.target === id)),
  )

  const realisticLatencies = calculationResult.scenarios.realistic.nodeLatencies
  const totalLatency = calculationResult.scenarios.realistic.totalLatency.max

  function getNodeLatency(nodeId: string): number {
    return realisticLatencies.get(nodeId)?.max ?? 0
  }

  function getEdgeLatency(source: string, target: string): number {
    return edgeLatencyMap.get(`${source}->${target}`) ?? 0
  }

  function buildSteps(path: string[]): StepInfo[] {
    const steps: StepInfo[] = []
    let cumulative = 0

    for (let i = 0; i < path.length; i++) {
      const nodeId = path[i]
      const node = nodes.find((n) => n.id === nodeId)
      const def = node ? getComponentById(node.data.componentId) : undefined
      const nodeLatency = getNodeLatency(nodeId)

      if (i > 0) {
        cumulative += getEdgeLatency(path[i - 1], nodeId)
      }
      cumulative += nodeLatency

      const children = adjacency.get(nodeId) ?? []
      let fanOut: FanOutGroup | undefined

      if (children.length > 1) {
        const outEdges = pipelineEdges.filter((e) => e.source === nodeId)
        const seqEdges = outEdges
          .filter((e) => e.sequential)
          .sort((a, b) => (a.sequentialOrder ?? 0) - (b.sequentialOrder ?? 0))
        const parEdges = outEdges.filter((e) => !e.sequential)

        if (seqEdges.length > 0) {
          const seqSteps: StepInfo[] = []
          let seqCum = cumulative
          for (const edge of seqEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target)
            const targetDef = targetNode ? getComponentById(targetNode.data.componentId) : undefined
            const lat = getNodeLatency(edge.target)
            seqCum += getEdgeLatency(nodeId, edge.target) + lat
            seqSteps.push({
              nodeId: edge.target,
              icon: targetDef?.icon ?? '?',
              name: targetDef?.name ?? edge.target,
              stepLatency: lat,
              cumulativeLatency: seqCum,
              isEntry: false,
              isBottleneck: bottleneckIds.has(edge.target),
              percentOfTotal: totalLatency > 0 ? lat / totalLatency : 0,
            })
          }

          const seqTotal = seqSteps.reduce((sum, s) => sum + s.stepLatency, 0)

          if (parEdges.length > 0) {
            const parSteps: StepInfo[] = parEdges.map((edge) => {
              const targetNode = nodes.find((n) => n.id === edge.target)
              const targetDef = targetNode ? getComponentById(targetNode.data.componentId) : undefined
              const lat = getNodeLatency(edge.target)
              return {
                nodeId: edge.target,
                icon: targetDef?.icon ?? '?',
                name: targetDef?.name ?? edge.target,
                stepLatency: lat,
                cumulativeLatency: cumulative + getEdgeLatency(nodeId, edge.target) + lat,
                isEntry: false,
                isBottleneck: bottleneckIds.has(edge.target),
                percentOfTotal: totalLatency > 0 ? lat / totalLatency : 0,
              }
            })

            fanOut = {
              type: 'parallel',
              steps: [...seqSteps, ...parSteps],
              totalLatency: Math.max(seqTotal, ...parSteps.map((s) => s.stepLatency)),
            }
          } else {
            fanOut = { type: 'sequential', steps: seqSteps, totalLatency: seqTotal }
          }
        } else {
          const parSteps: StepInfo[] = children.map((childId) => {
            const targetNode = nodes.find((n) => n.id === childId)
            const targetDef = targetNode ? getComponentById(targetNode.data.componentId) : undefined
            const lat = getNodeLatency(childId)
            return {
              nodeId: childId,
              icon: targetDef?.icon ?? '?',
              name: targetDef?.name ?? childId,
              stepLatency: lat,
              cumulativeLatency: cumulative + getEdgeLatency(nodeId, childId) + lat,
              isEntry: false,
              isBottleneck: bottleneckIds.has(childId),
              percentOfTotal: totalLatency > 0 ? lat / totalLatency : 0,
            }
          })
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
        isEntry: entrySet.has(nodeId),
        isBottleneck: bottleneckIds.has(nodeId),
        percentOfTotal: totalLatency > 0 ? nodeLatency / totalLatency : 0,
        children: fanOut,
      })
    }

    return steps
  }

  const steps = buildSteps(criticalPath)
  const scenarioRange = calculationResult.scenarios

  function colorClass(step: StepInfo): string {
    if (step.isBottleneck) return 'text-red-400'
    if (step.percentOfTotal > 0.3) return 'text-amber-400'
    return 'text-slate-300'
  }

  return (
    <Panel position="top-right">
      <div className="w-[280px] max-h-[70vh] overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Request Flow (critical path)
          </span>
          <button
            onClick={toggleSequenceOverlay}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.nodeId}>
              <div className={`flex items-center gap-2 py-1 text-xs ${colorClass(step)}`}>
                <span className="w-4 text-center">
                  {step.isEntry ? '▶' : '│'}
                </span>
                <span>{step.icon}</span>
                <span className="flex-1 truncate font-medium">{step.name}</span>
                <span className="text-slate-500">+{formatLatency(step.stepLatency)}</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {formatLatency(step.cumulativeLatency)}
                </span>
              </div>

              {step.children && (
                <div className="ml-4 border-l border-slate-700 pl-2">
                  {step.children.type === 'sequential' ? (
                    <>
                      <div className="py-0.5 text-[10px] text-blue-400">
                        ── sequential (1→{step.children.steps.length}) ──
                      </div>
                      {step.children.steps.map((sub, j) => (
                        <div
                          key={sub.nodeId}
                          className={`flex items-center gap-2 py-0.5 text-xs ${colorClass(sub)}`}
                        >
                          <span className="w-4 text-center text-[10px] font-bold text-blue-400">
                            [{j + 1}]
                          </span>
                          <span>{sub.icon}</span>
                          <span className="flex-1 truncate">{sub.name}</span>
                          <span className="text-slate-500">+{formatLatency(sub.stepLatency)}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {formatLatency(sub.cumulativeLatency)}
                          </span>
                        </div>
                      ))}
                      <div className="py-0.5 text-[10px] text-slate-500">
                        ── sum: {formatLatency(step.children.totalLatency)} ──
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-0.5 text-[10px] text-slate-500">
                        ── parallel branches ──
                      </div>
                      {step.children.steps.map((sub) => (
                        <div
                          key={sub.nodeId}
                          className={`flex items-center gap-2 py-0.5 text-xs ${colorClass(sub)}`}
                        >
                          <span className="w-4 text-center">║</span>
                          <span>{sub.icon}</span>
                          <span className="flex-1 truncate">{sub.name}</span>
                          <span className="text-slate-500">+{formatLatency(sub.stepLatency)}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {formatLatency(sub.cumulativeLatency)}
                          </span>
                        </div>
                      ))}
                      <div className="py-0.5 text-[10px] text-slate-500">
                        ── max: {formatLatency(step.children.totalLatency)} ──
                      </div>
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

        <div className="mt-3 border-t border-slate-700 pt-2">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Total</span>
            <span>
              {formatLatency(scenarioRange.optimistic.totalLatency.min)}–
              {formatLatency(scenarioRange.pessimistic.totalLatency.max)}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  )
}
