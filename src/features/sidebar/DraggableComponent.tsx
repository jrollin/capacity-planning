import type { ComponentDefinition } from '../../domain/types'
import { formatLatency } from '../../shared/utils/format'

interface DraggableComponentProps {
  definition: ComponentDefinition
}

export function DraggableComponent({ definition }: DraggableComponentProps) {
  function onDragStart(event: React.DragEvent) {
    event.dataTransfer.setData(
      'application/pipeline-component',
      JSON.stringify(definition),
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-2 text-sm transition-colors hover:border-slate-600 hover:bg-slate-750 active:cursor-grabbing"
    >
      <span className="text-base">{definition.icon}</span>
      <div className="flex flex-1 flex-col">
        <span className="text-slate-200">{definition.name}</span>
        <span className="text-[10px] text-slate-500">
          p50: {formatLatency(definition.latency.p50)}
        </span>
      </div>
    </div>
  )
}
