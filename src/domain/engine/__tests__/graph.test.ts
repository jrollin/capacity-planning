import { describe, it, expect } from 'vitest'
import { buildAdjacency, findAllPaths, buildPathSegments, findCriticalPath } from '../graph'
import type { PipelineEdge } from '../../types'
import {
  LINEAR_PIPELINE,
  PARALLEL_PIPELINE,
  SINGLE_NODE,
} from '../__fixtures__/pipelines'

describe('buildAdjacency', () => {
  it('identifies entry and exit nodes for linear graph', () => {
    const nodeIds = LINEAR_PIPELINE.nodes.map((n) => n.id)
    const result = buildAdjacency(nodeIds, LINEAR_PIPELINE.edges)

    expect(result.entryNodes).toEqual(['gw'])
    expect(result.exitNodes).toEqual(['db'])
  })

  it('identifies single node as both entry and exit', () => {
    const nodeIds = SINGLE_NODE.nodes.map((n) => n.id)
    const result = buildAdjacency(nodeIds, SINGLE_NODE.edges)

    expect(result.entryNodes).toEqual(['gw'])
    expect(result.exitNodes).toEqual(['gw'])
  })

  it('builds correct adjacency for parallel graph', () => {
    const nodeIds = PARALLEL_PIPELINE.nodes.map((n) => n.id)
    const result = buildAdjacency(nodeIds, PARALLEL_PIPELINE.edges)

    expect(result.adjacency.get('gw')).toEqual(
      expect.arrayContaining(['cache', 'db']),
    )
    expect(result.entryNodes).toEqual(['gw'])
    expect(result.exitNodes).toEqual(['svc'])
  })
})

describe('findAllPaths', () => {
  it('finds single path in linear graph', () => {
    const nodeIds = LINEAR_PIPELINE.nodes.map((n) => n.id)
    const { adjacency, entryNodes, exitNodes } = buildAdjacency(
      nodeIds,
      LINEAR_PIPELINE.edges,
    )

    const paths = findAllPaths(adjacency, entryNodes, exitNodes)
    expect(paths).toHaveLength(1)
    expect(paths[0]).toEqual(['gw', 'svc', 'db'])
  })

  it('finds parallel paths', () => {
    const nodeIds = PARALLEL_PIPELINE.nodes.map((n) => n.id)
    const { adjacency, entryNodes, exitNodes } = buildAdjacency(
      nodeIds,
      PARALLEL_PIPELINE.edges,
    )

    const paths = findAllPaths(adjacency, entryNodes, exitNodes)
    expect(paths).toHaveLength(2)
    expect(paths.map((p) => p.join('→'))).toEqual(
      expect.arrayContaining([
        'gw→cache→svc',
        'gw→db→svc',
      ]),
    )
  })
})

describe('buildPathSegments', () => {
  it('builds sequential segments for linear graph', () => {
    const nodeIds = LINEAR_PIPELINE.nodes.map((n) => n.id)
    const { adjacency, entryNodes } = buildAdjacency(
      nodeIds,
      LINEAR_PIPELINE.edges,
    )

    const segments = buildPathSegments(adjacency, entryNodes)
    expect(segments).toHaveLength(1)
    expect(segments[0].isParallel).toBe(false)
    expect(segments[0].nodeIds).toEqual(['gw', 'svc', 'db'])
  })

  it('detects parallel branches', () => {
    const nodeIds = PARALLEL_PIPELINE.nodes.map((n) => n.id)
    const { adjacency, entryNodes } = buildAdjacency(
      nodeIds,
      PARALLEL_PIPELINE.edges,
    )

    const segments = buildPathSegments(adjacency, entryNodes)
    const parallelSegment = segments.find((s) => s.isParallel)
    expect(parallelSegment).toBeDefined()
    expect(parallelSegment!.branches).toHaveLength(2)
  })

  it('produces sequential segments for all-sequential fan-out', () => {
    const edges: PipelineEdge[] = [
      { id: 'e1', source: 'gw', target: 'cache', latencyMs: 1, sequential: true, sequentialOrder: 1 },
      { id: 'e2', source: 'gw', target: 'db', latencyMs: 1, sequential: true, sequentialOrder: 2 },
    ]
    const nodeIds = ['gw', 'cache', 'db']
    const { adjacency, entryNodes } = buildAdjacency(nodeIds, edges)

    const segments = buildPathSegments(adjacency, entryNodes, edges)
    const parallelSegment = segments.find((s) => s.isParallel)
    expect(parallelSegment).toBeUndefined()

    const allNodeIds = segments.flatMap((s) => s.nodeIds)
    expect(allNodeIds).toEqual(['gw', 'cache', 'db'])
  })

  it('handles mixed sequential/parallel fan-out', () => {
    const edges: PipelineEdge[] = [
      { id: 'e1', source: 'gw', target: 'cache', latencyMs: 1, sequential: true, sequentialOrder: 1 },
      { id: 'e2', source: 'gw', target: 'db', latencyMs: 1 },
    ]
    const nodeIds = ['gw', 'cache', 'db']
    const { adjacency, entryNodes } = buildAdjacency(nodeIds, edges)

    const segments = buildPathSegments(adjacency, entryNodes, edges)
    const parallelSegment = segments.find((s) => s.isParallel)
    expect(parallelSegment).toBeDefined()
    expect(parallelSegment!.branches).toHaveLength(2)
  })
})

describe('findCriticalPath', () => {
  it('returns the path with highest total latency', () => {
    const paths = [
      ['a', 'b', 'c'],
      ['a', 'd', 'c'],
    ]
    const latencies: Record<string, number> = { a: 10, b: 5, c: 10, d: 50 }
    const critical = findCriticalPath(paths, (id) => latencies[id] ?? 0)

    expect(critical).toEqual(['a', 'd', 'c'])
  })
})
