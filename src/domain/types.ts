export interface LatencyProfile {
  p50: number
  p95: number
  p99: number
}

export interface ThroughputProfile {
  maxRps: number
  concurrencyLimit: number
}

export type ComponentCategory = 'infrastructure' | 'compute' | 'data'

export interface ComponentDefinition {
  id: string
  name: string
  category: ComponentCategory
  icon: string
  latency: LatencyProfile
  throughput: ThroughputProfile
}

export interface InnerCall {
  id: string
  componentId: string
  sequential: boolean
}

export interface PipelineNode {
  id: string
  componentId: string
  latencyOverride?: Partial<LatencyProfile>
  throughputOverride?: Partial<ThroughputProfile>
  innerCalls?: InnerCall[]
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  latencyMs: number
  sequential?: boolean
  sequentialOrder?: number
}

export interface PipelineGraph {
  nodes: PipelineNode[]
  edges: PipelineEdge[]
}

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic'

export interface ScenarioRange {
  min: number
  max: number
}

export interface ScenarioResult {
  type: ScenarioType
  totalLatency: ScenarioRange
  nodeLatencies: Map<string, ScenarioRange>
}

export interface Bottleneck {
  nodeId: string
  utilization: number
  queueWait: number
  componentName: string
}

export interface CalculationResult {
  scenarios: Record<ScenarioType, ScenarioResult>
  criticalPath: string[]
  bottlenecks: Bottleneck[]
  effectiveRps: number
  queueDepths: Map<string, number>
}

export interface PathSegment {
  nodeIds: string[]
  isParallel: boolean
  branches?: PathSegment[][]
}
