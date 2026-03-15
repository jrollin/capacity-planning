import Dagre from '@dagrejs/dagre'
import type { PipelineFlowNode } from '../../store/slices/canvas'
import type { Edge } from '@xyflow/react'

const NODE_WIDTH = 180
const NODE_HEIGHT = 80

export function autoLayout(
  nodes: PipelineFlowNode[],
  edges: Edge[],
): PipelineFlowNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

  g.setGraph({
    rankdir: 'TB',
    nodesep: 60,
    ranksep: 80,
  })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  Dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}
