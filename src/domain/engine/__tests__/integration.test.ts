import { describe, it, expect } from 'vitest'
import { calculatePipeline } from '../index'
import type { PipelineGraph } from '../../types'
import {
  LINEAR_PIPELINE,
  PARALLEL_PIPELINE,
  SINGLE_NODE,
  EMPTY_GRAPH,
} from '../__fixtures__/pipelines'

describe('calculatePipeline', () => {
  it('returns null for empty graph', () => {
    expect(calculatePipeline(EMPTY_GRAPH, 1000)).toBeNull()
  })

  it('calculates single node pipeline', () => {
    const result = calculatePipeline(SINGLE_NODE, 100)

    expect(result).not.toBeNull()
    expect(result!.criticalPath).toEqual(['gw'])
    expect(result!.scenarios.optimistic.totalLatency.min).toBeGreaterThan(0)
    expect(result!.scenarios.optimistic.totalLatency.max).toBeLessThanOrEqual(
      result!.scenarios.realistic.totalLatency.max,
    )
  })

  it('calculates linear pipeline with correct ordering', () => {
    const result = calculatePipeline(LINEAR_PIPELINE, 100)

    expect(result).not.toBeNull()
    expect(result!.criticalPath).toEqual(['gw', 'svc', 'db'])

    const { optimistic, realistic, pessimistic } = result!.scenarios
    expect(optimistic.totalLatency.max).toBeLessThanOrEqual(realistic.totalLatency.max)
    expect(realistic.totalLatency.max).toBeLessThanOrEqual(pessimistic.totalLatency.max)
  })

  it('detects bottlenecks at high load', () => {
    const result = calculatePipeline(LINEAR_PIPELINE, 8000)

    expect(result).not.toBeNull()
    expect(result!.bottlenecks.length).toBeGreaterThan(0)
    expect(result!.bottlenecks[0].utilization).toBeGreaterThan(0.8)
  })

  it('computes effective RPS as min of all nodes', () => {
    const result = calculatePipeline(LINEAR_PIPELINE, 100_000)

    expect(result).not.toBeNull()
    expect(result!.effectiveRps).toBeLessThanOrEqual(5000)
  })

  it('handles parallel pipeline', () => {
    const result = calculatePipeline(PARALLEL_PIPELINE, 100)

    expect(result).not.toBeNull()
    expect(result!.criticalPath.length).toBeGreaterThanOrEqual(2)
  })

  it('scenario latencies increase optimistic < realistic < pessimistic', () => {
    const result = calculatePipeline(LINEAR_PIPELINE, 100)!

    const opt = result.scenarios.optimistic.totalLatency
    const real = result.scenarios.realistic.totalLatency
    const pess = result.scenarios.pessimistic.totalLatency

    expect(opt.min).toBeLessThanOrEqual(real.min)
    expect(real.min).toBeLessThanOrEqual(pess.min)
    expect(opt.max).toBeLessThanOrEqual(real.max)
    expect(real.max).toBeLessThanOrEqual(pess.max)
  })

  it('sequential edges produce summed latency (not max)', () => {
    const sequentialPipeline: PipelineGraph = {
      nodes: [
        { id: 'gw', componentId: 'api-gateway' },
        { id: 'cache', componentId: 'cache' },
        { id: 'db', componentId: 'sql-db' },
      ],
      edges: [
        { id: 'e1', source: 'gw', target: 'cache', latencyMs: 1, sequential: true, sequentialOrder: 1 },
        { id: 'e2', source: 'gw', target: 'db', latencyMs: 1, sequential: true, sequentialOrder: 2 },
      ],
    }

    const parallelPipeline: PipelineGraph = {
      nodes: [
        { id: 'gw', componentId: 'api-gateway' },
        { id: 'cache', componentId: 'cache' },
        { id: 'db', componentId: 'sql-db' },
      ],
      edges: [
        { id: 'e1', source: 'gw', target: 'cache', latencyMs: 1 },
        { id: 'e2', source: 'gw', target: 'db', latencyMs: 1 },
      ],
    }

    const seqResult = calculatePipeline(sequentialPipeline, 100)!
    const parResult = calculatePipeline(parallelPipeline, 100)!

    expect(seqResult.scenarios.realistic.totalLatency.max).toBeGreaterThan(
      parResult.scenarios.realistic.totalLatency.max,
    )
  })

  it('inner calls increase node latency', () => {
    const withoutInnerCalls: PipelineGraph = {
      nodes: [
        { id: 'vm', componentId: 'vm' },
      ],
      edges: [],
    }

    const withInnerCalls: PipelineGraph = {
      nodes: [
        {
          id: 'vm',
          componentId: 'vm',
          innerCalls: [
            { id: 'ic1', componentId: 'sql-db', sequential: true },
            { id: 'ic2', componentId: 's3-blob', sequential: true },
          ],
        },
      ],
      edges: [],
    }

    const baseResult = calculatePipeline(withoutInnerCalls, 100)!
    const innerResult = calculatePipeline(withInnerCalls, 100)!

    expect(innerResult.scenarios.realistic.totalLatency.max).toBeGreaterThan(
      baseResult.scenarios.realistic.totalLatency.max,
    )
  })

  it('parallel inner calls use max instead of sum', () => {
    const sequential: PipelineGraph = {
      nodes: [
        {
          id: 'vm',
          componentId: 'vm',
          innerCalls: [
            { id: 'ic1', componentId: 'sql-db', sequential: true },
            { id: 'ic2', componentId: 'cache', sequential: true },
          ],
        },
      ],
      edges: [],
    }

    const parallel: PipelineGraph = {
      nodes: [
        {
          id: 'vm',
          componentId: 'vm',
          innerCalls: [
            { id: 'ic1', componentId: 'sql-db', sequential: false },
            { id: 'ic2', componentId: 'cache', sequential: false },
          ],
        },
      ],
      edges: [],
    }

    const seqResult = calculatePipeline(sequential, 100)!
    const parResult = calculatePipeline(parallel, 100)!

    // Sequential: VM + SQL + Cache (sum)
    // Parallel: VM + max(SQL, Cache)
    expect(seqResult.scenarios.realistic.totalLatency.max).toBeGreaterThan(
      parResult.scenarios.realistic.totalLatency.max,
    )
  })
})
