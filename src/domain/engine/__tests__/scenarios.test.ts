import { describe, it, expect } from 'vitest'
import { getScenarioLatency, computeScenario } from '../scenarios'
import type { LatencyProfile } from '../../types'

const PROFILE: LatencyProfile = { p50: 10, p95: 50, p99: 100 }

describe('getScenarioLatency', () => {
  it('returns 0.8x-1.0x p50 for optimistic', () => {
    const range = getScenarioLatency(PROFILE, 'optimistic')
    expect(range.min).toBeCloseTo(8)
    expect(range.max).toBeCloseTo(10)
  })

  it('returns p50-p95 range for realistic', () => {
    const range = getScenarioLatency(PROFILE, 'realistic')
    expect(range.min).toBeCloseTo(10)
    expect(range.max).toBeCloseTo(50)
  })

  it('returns p95-p99 range for pessimistic', () => {
    const range = getScenarioLatency(PROFILE, 'pessimistic')
    expect(range.min).toBeCloseTo(50)
    expect(range.max).toBeCloseTo(100)
  })
})

describe('computeScenario', () => {
  it('sums latencies for sequential path', () => {
    const profiles: Record<string, LatencyProfile> = {
      a: { p50: 10, p95: 50, p99: 100 },
      b: { p50: 5, p95: 20, p99: 50 },
    }

    const result = computeScenario(
      'optimistic',
      ['a', 'b'],
      (id) => profiles[id],
      (getLatency) => getLatency('a') + getLatency('b'),
    )

    expect(result.type).toBe('optimistic')
    expect(result.totalLatency.min).toBeCloseTo(12)
    expect(result.totalLatency.max).toBeCloseTo(15)
  })

  it('populates per-node latency ranges', () => {
    const profiles: Record<string, LatencyProfile> = {
      a: { p50: 10, p95: 50, p99: 100 },
    }

    const result = computeScenario(
      'realistic',
      ['a'],
      (id) => profiles[id],
      (getLatency) => getLatency('a'),
    )

    const nodeRange = result.nodeLatencies.get('a')
    expect(nodeRange).toBeDefined()
    expect(nodeRange!.min).toBeCloseTo(10)
    expect(nodeRange!.max).toBeCloseTo(50)
  })
})
