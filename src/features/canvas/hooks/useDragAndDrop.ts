import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useStore } from '../../../store'
import type { ComponentDefinition } from '../../../domain/types'

export function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow()
  const addNode = useStore((s) => s.addNode)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const raw = event.dataTransfer.getData('application/pipeline-component')
      if (!raw) return

      const definition: ComponentDefinition = JSON.parse(raw)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(definition, position)
    },
    [screenToFlowPosition, addNode],
  )

  return { onDragOver, onDrop }
}
