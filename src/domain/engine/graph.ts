import type { PipelineEdge, PathSegment } from '../types'

interface AdjacencyInfo {
  adjacency: Map<string, string[]>
  reverseAdjacency: Map<string, string[]>
  entryNodes: string[]
  exitNodes: string[]
}

export function buildAdjacency(
  nodeIds: string[],
  edges: PipelineEdge[],
): AdjacencyInfo {
  const adjacency = new Map<string, string[]>()
  const reverseAdjacency = new Map<string, string[]>()

  for (const id of nodeIds) {
    adjacency.set(id, [])
    reverseAdjacency.set(id, [])
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target)
    reverseAdjacency.get(edge.target)?.push(edge.source)
  }

  const entryNodes = nodeIds.filter(
    (id) => (reverseAdjacency.get(id)?.length ?? 0) === 0,
  )
  const exitNodes = nodeIds.filter(
    (id) => (adjacency.get(id)?.length ?? 0) === 0,
  )

  return { adjacency, reverseAdjacency, entryNodes, exitNodes }
}

export function findAllPaths(
  adjacency: Map<string, string[]>,
  entryNodes: string[],
  exitNodes: string[],
): string[][] {
  const exitSet = new Set(exitNodes)
  const paths: string[][] = []

  function dfs(current: string, path: string[], visited: Set<string>) {
    path.push(current)
    visited.add(current)

    if (exitSet.has(current) && (adjacency.get(current)?.length ?? 0) === 0) {
      paths.push([...path])
    } else {
      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) {
          dfs(next, path, visited)
        }
      }
    }

    path.pop()
    visited.delete(current)
  }

  for (const entry of entryNodes) {
    dfs(entry, [], new Set())
  }

  return paths
}

export function buildPathSegments(
  adjacency: Map<string, string[]>,
  entryNodes: string[],
  edges?: PipelineEdge[],
): PathSegment[] {
  const edgesBySource = new Map<string, PipelineEdge[]>()
  if (edges) {
    for (const edge of edges) {
      const list = edgesBySource.get(edge.source) ?? []
      list.push(edge)
      edgesBySource.set(edge.source, list)
    }
  }

  const segments: PathSegment[] = []

  function buildFrom(nodeId: string, visited: Set<string>): PathSegment[] {
    const result: PathSegment[] = []
    let current = nodeId
    let sequentialNodes: string[] = []

    while (current && !visited.has(current)) {
      visited.add(current)
      const children = adjacency.get(current) ?? []

      if (children.length > 1) {
        if (sequentialNodes.length > 0) {
          result.push({ nodeIds: [...sequentialNodes], isParallel: false })
          sequentialNodes = []
        }

        result.push({ nodeIds: [current], isParallel: false })

        const outgoing = edgesBySource.get(current) ?? []
        const seqEdges = outgoing
          .filter((e) => e.sequential)
          .sort((a, b) => (a.sequentialOrder ?? 0) - (b.sequentialOrder ?? 0))
        const seqTargets = new Set(seqEdges.map((e) => e.target))
        const parChildren = children.filter((c) => !seqTargets.has(c))

        if (seqEdges.length === children.length) {
          for (const edge of seqEdges) {
            const sub = buildFrom(edge.target, new Set(visited))
            result.push(...sub)
          }
        } else if (seqEdges.length === 0) {
          const branches = children.map((child) =>
            buildFrom(child, new Set(visited)),
          )
          result.push({
            nodeIds: [],
            isParallel: true,
            branches,
          })
        } else {
          const seqChain: PathSegment[] = []
          for (const edge of seqEdges) {
            seqChain.push(...buildFrom(edge.target, new Set(visited)))
          }

          const parBranches = parChildren.map((child) =>
            buildFrom(child, new Set(visited)),
          )

          const allBranches: PathSegment[][] = [seqChain, ...parBranches]
          result.push({
            nodeIds: [],
            isParallel: true,
            branches: allBranches,
          })
        }
        return result
      }

      sequentialNodes.push(current)

      if (children.length === 0) {
        break
      }
      current = children[0]
    }

    if (sequentialNodes.length > 0) {
      result.push({ nodeIds: sequentialNodes, isParallel: false })
    }

    return result
  }

  for (const entry of entryNodes) {
    segments.push(...buildFrom(entry, new Set()))
  }

  return segments
}

export function findCriticalPath(
  paths: string[][],
  getNodeLatency: (nodeId: string) => number,
  getEdgeLatency?: (source: string, target: string) => number,
): string[] {
  let maxLatency = 0
  let criticalPath: string[] = []

  for (const path of paths) {
    let latency = 0
    for (let i = 0; i < path.length; i++) {
      latency += getNodeLatency(path[i])
      if (i > 0 && getEdgeLatency) {
        latency += getEdgeLatency(path[i - 1], path[i])
      }
    }
    if (latency > maxLatency) {
      maxLatency = latency
      criticalPath = path
    }
  }

  return criticalPath
}

export function buildEdgeLatencyMap(
  edges: PipelineEdge[],
): Map<string, number> {
  const map = new Map<string, number>()
  for (const edge of edges) {
    map.set(`${edge.source}->${edge.target}`, edge.latencyMs)
  }
  return map
}
