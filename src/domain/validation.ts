import type { PipelineGraph } from './types'

export interface ValidationError {
  type: 'cycle' | 'disconnected' | 'empty'
  message: string
  nodeIds?: string[]
}

export function validateGraph(graph: PipelineGraph): ValidationError[] {
  const errors: ValidationError[] = []

  if (graph.nodes.length === 0) {
    errors.push({ type: 'empty', message: 'Graph has no nodes' })
    return errors
  }

  const cycleError = detectCycle(graph)
  if (cycleError) errors.push(cycleError)

  const disconnectedError = detectDisconnected(graph)
  if (disconnectedError) errors.push(disconnectedError)

  return errors
}

function detectCycle(graph: PipelineGraph): ValidationError | null {
  const adjacency = new Map<string, string[]>()
  for (const node of graph.nodes) {
    adjacency.set(node.id, [])
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.push(edge.target)
  }

  const visited = new Set<string>()
  const inStack = new Set<string>()

  function dfs(nodeId: string): string[] | null {
    visited.add(nodeId)
    inStack.add(nodeId)

    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (inStack.has(neighbor)) {
        return [neighbor, nodeId]
      }
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor)
        if (cycle) return cycle
      }
    }

    inStack.delete(nodeId)
    return null
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      const cycle = dfs(node.id)
      if (cycle) {
        return {
          type: 'cycle',
          message: 'Graph contains a cycle',
          nodeIds: cycle,
        }
      }
    }
  }

  return null
}

function detectDisconnected(graph: PipelineGraph): ValidationError | null {
  if (graph.nodes.length <= 1) return null

  const adjacency = new Map<string, Set<string>>()
  for (const node of graph.nodes) {
    adjacency.set(node.id, new Set())
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  }

  const visited = new Set<string>()
  const queue = [graph.nodes[0].id]
  visited.add(graph.nodes[0].id)

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  const disconnected = graph.nodes
    .filter((n) => !visited.has(n.id))
    .map((n) => n.id)

  if (disconnected.length > 0) {
    return {
      type: 'disconnected',
      message: 'Graph has disconnected components',
      nodeIds: disconnected,
    }
  }

  return null
}
