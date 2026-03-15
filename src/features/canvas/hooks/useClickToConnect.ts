import { useCallback, useState } from 'react'
import type { Node } from '@xyflow/react'
import { useStore } from '../../../store'

export function useClickToConnect() {
  const [pendingSource, setPendingSource] = useState<string | null>(null)
  const onConnect = useStore((s) => s.onConnect)
  const edges = useStore((s) => s.edges)
  const selectNode = useStore((s) => s.selectNode)
  const setActiveRightTab = useStore((s) => s.setActiveRightTab)

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id)
      setActiveRightTab('config')

      if (!pendingSource) {
        setPendingSource(node.id)
        return
      }

      if (pendingSource === node.id) {
        setPendingSource(null)
        return
      }

      const alreadyConnected = edges.some(
        (e) =>
          (e.source === pendingSource && e.target === node.id) ||
          (e.source === node.id && e.target === pendingSource),
      )

      if (!alreadyConnected) {
        onConnect({
          source: pendingSource,
          target: node.id,
          sourceHandle: null,
          targetHandle: null,
        })
      }

      setPendingSource(null)
    },
    [pendingSource, onConnect, edges, selectNode, setActiveRightTab],
  )

  const cancelConnect = useCallback(() => {
    setPendingSource(null)
  }, [])

  return { pendingSource, onNodeClick, cancelConnect }
}
