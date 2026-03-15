import { describe, it, expect } from 'vitest'
import { computeQueuing } from '../queuing'

describe('computeQueuing', () => {
  it('returns zero queue wait at low utilization', () => {
    const result = computeQueuing(10, 10_000, 100)

    expect(result.utilization).toBeCloseTo(0.01)
    expect(result.queueWait).toBeCloseTo(0.00101, 3)
    expect(result.isBottleneck).toBe(false)
  })

  it('returns moderate load at 50% utilization', () => {
    const result = computeQueuing(10, 1000, 500)

    expect(result.utilization).toBeCloseTo(0.5)
    expect(result.loadedLatency).toBeGreaterThan(10)
    expect(result.isBottleneck).toBe(false)
  })

  it('flags bottleneck above 80% utilization', () => {
    const result = computeQueuing(10, 1000, 850)

    expect(result.utilization).toBeCloseTo(0.85)
    expect(result.isBottleneck).toBe(true)
    expect(result.queueWait).toBeGreaterThan(1)
  })

  it('clamps arrival rate to prevent division by zero', () => {
    const result = computeQueuing(10, 1000, 2000)

    expect(result.utilization).toBeLessThan(1)
    expect(result.loadedLatency).toBeGreaterThan(0)
    expect(Number.isFinite(result.loadedLatency)).toBe(true)
  })

  it('computes queue depth via Little\'s Law', () => {
    const result = computeQueuing(10, 1000, 800)

    expect(result.queueDepth).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(result.queueDepth)).toBe(true)
  })
})
