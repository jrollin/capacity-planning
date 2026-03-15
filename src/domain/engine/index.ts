import type {
  PipelineGraph,
  CalculationResult,
  LatencyProfile,
  Bottleneck,
  ScenarioType,
  PathSegment,
} from '../types'
import { getComponentById } from '../component-catalog'
import { buildAdjacency, findAllPaths, buildPathSegments, findCriticalPath, buildEdgeLatencyMap } from './graph'
import { computeQueuing } from './queuing'
import { computeScenario } from './scenarios'
import { validateGraph } from '../validation'

export function calculatePipeline(
  graph: PipelineGraph,
  requestRps: number,
): CalculationResult | null {
  const errors = validateGraph(graph)
  if (errors.length > 0) return null

  const nodeIds = graph.nodes.map((n) => n.id)
  const { adjacency, entryNodes, exitNodes } = buildAdjacency(nodeIds, graph.edges)

  if (entryNodes.length === 0 || exitNodes.length === 0) return null

  const paths = findAllPaths(adjacency, entryNodes, exitNodes)
  if (paths.length === 0) return null

  const segments = buildPathSegments(adjacency, entryNodes, graph.edges)
  const edgeLatencyMap = buildEdgeLatencyMap(graph.edges)

  function getEdgeLatency(source: string, target: string): number {
    return edgeLatencyMap.get(`${source}->${target}`) ?? 0
  }

  function getProfile(nodeId: string): LatencyProfile {
    const node = graph.nodes.find((n) => n.id === nodeId)
    if (!node) return { p50: 0, p95: 0, p99: 0 }
    const def = getComponentById(node.componentId)
    if (!def) return { p50: 0, p95: 0, p99: 0 }

    const base = {
      p50: node.latencyOverride?.p50 ?? def.latency.p50,
      p95: node.latencyOverride?.p95 ?? def.latency.p95,
      p99: node.latencyOverride?.p99 ?? def.latency.p99,
    }

    const calls = node.innerCalls
    if (!calls || calls.length === 0) return base

    const keys = ['p50', 'p95', 'p99'] as const
    for (const key of keys) {
      let seqSum = 0
      const parValues: number[] = []
      for (const call of calls) {
        const callDef = getComponentById(call.componentId)
        if (!callDef) continue
        const lat = callDef.latency[key]
        if (call.sequential) {
          seqSum += lat
        } else {
          parValues.push(lat)
        }
      }
      base[key] += seqSum + (parValues.length > 0 ? Math.max(...parValues) : 0)
    }

    return base
  }

  function getMaxRps(nodeId: string): number {
    const node = graph.nodes.find((n) => n.id === nodeId)
    if (!node) return Infinity
    const def = getComponentById(node.componentId)
    if (!def) return Infinity
    return node.throughputOverride?.maxRps ?? def.throughput.maxRps
  }

  function computePathLatency(
    getNodeLatency: (nodeId: string) => number,
  ): number {
    return computeSegmentsLatency(segments, getNodeLatency, adjacency, getEdgeLatency)
  }

  const criticalPath = findCriticalPath(
    paths,
    (nodeId) => getProfile(nodeId).p95,
    getEdgeLatency,
  )

  const queuingResults = new Map<string, ReturnType<typeof computeQueuing>>()
  const queueDepths = new Map<string, number>()
  const bottlenecks: Bottleneck[] = []

  for (const nodeId of nodeIds) {
    const profile = getProfile(nodeId)
    const maxRps = getMaxRps(nodeId)
    const result = computeQueuing(profile.p50, maxRps, requestRps)
    queuingResults.set(nodeId, result)
    queueDepths.set(nodeId, result.queueDepth)

    if (result.isBottleneck) {
      const node = graph.nodes.find((n) => n.id === nodeId)
      const def = node ? getComponentById(node.componentId) : undefined
      bottlenecks.push({
        nodeId,
        utilization: result.utilization,
        queueWait: result.queueWait,
        componentName: def?.name ?? 'Unknown',
      })
    }
  }

  bottlenecks.sort((a, b) => b.utilization - a.utilization)

  const effectiveRps = Math.min(
    ...nodeIds.map((id) => getMaxRps(id)),
    requestRps,
  )

  const scenarioTypes: ScenarioType[] = ['optimistic', 'realistic', 'pessimistic']
  const scenarios = {} as CalculationResult['scenarios']

  for (const type of scenarioTypes) {
    scenarios[type] = computeScenario(
      type,
      nodeIds,
      getProfile,
      computePathLatency,
    )
  }

  return {
    scenarios,
    criticalPath,
    bottlenecks,
    effectiveRps,
    queueDepths,
  }
}

function computeSegmentsLatency(
  segments: PathSegment[],
  getNodeLatency: (nodeId: string) => number,
  adjacency: Map<string, string[]>,
  getEdgeLatency: (source: string, target: string) => number,
): number {
  let total = 0

  for (const segment of segments) {
    if (segment.isParallel && segment.branches) {
      const branchLatencies = segment.branches.map((branch) =>
        computeSegmentsLatency(branch, getNodeLatency, adjacency, getEdgeLatency),
      )
      total += Math.max(...branchLatencies, 0)
    } else {
      for (let i = 0; i < segment.nodeIds.length; i++) {
        const nodeId = segment.nodeIds[i]
        total += getNodeLatency(nodeId)
        if (i > 0) {
          total += getEdgeLatency(segment.nodeIds[i - 1], nodeId)
        }
      }
    }
  }

  return total
}

export { buildAdjacency, findAllPaths, buildPathSegments, findCriticalPath, buildEdgeLatencyMap } from './graph'
export { computeQueuing } from './queuing'
export { computeScenario, getScenarioLatency } from './scenarios'
