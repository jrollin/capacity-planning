import type {
  LatencyProfile,
  ScenarioType,
  ScenarioRange,
  ScenarioResult,
} from '../types'

interface ScenarioBand {
  minMultiplier: number
  maxMultiplier: number
  percentileKey: keyof LatencyProfile
}

const SCENARIO_BANDS: Record<ScenarioType, ScenarioBand> = {
  optimistic: { minMultiplier: 0.8, maxMultiplier: 1.0, percentileKey: 'p50' },
  realistic: { minMultiplier: 1.0, maxMultiplier: 1.0, percentileKey: 'p95' },
  pessimistic: {
    minMultiplier: 1.0,
    maxMultiplier: 1.0,
    percentileKey: 'p99',
  },
}

export function getScenarioLatency(
  profile: LatencyProfile,
  scenario: ScenarioType,
): ScenarioRange {
  const band = SCENARIO_BANDS[scenario]
  const base = profile[band.percentileKey]

  if (scenario === 'realistic') {
    return { min: profile.p50, max: profile.p95 }
  }

  if (scenario === 'pessimistic') {
    return { min: profile.p95, max: profile.p99 }
  }

  return {
    min: base * band.minMultiplier,
    max: base * band.maxMultiplier,
  }
}

export function computeScenario(
  scenarioType: ScenarioType,
  nodeIds: string[],
  getProfile: (nodeId: string) => LatencyProfile,
  computePathLatency: (
    getNodeLatency: (nodeId: string) => number,
  ) => number,
): ScenarioResult {
  const nodeLatencies = new Map<string, ScenarioRange>()

  for (const nodeId of nodeIds) {
    const profile = getProfile(nodeId)
    nodeLatencies.set(nodeId, getScenarioLatency(profile, scenarioType))
  }

  const minTotal = computePathLatency((nodeId) => {
    return nodeLatencies.get(nodeId)?.min ?? 0
  })

  const maxTotal = computePathLatency((nodeId) => {
    return nodeLatencies.get(nodeId)?.max ?? 0
  })

  return {
    type: scenarioType,
    totalLatency: { min: minTotal, max: maxTotal },
    nodeLatencies,
  }
}
