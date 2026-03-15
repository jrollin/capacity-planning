import type { ComponentDefinition } from '../../domain/types'
import { DraggableComponent } from './DraggableComponent'

interface CategoryGroupProps {
  label: string
  components: ComponentDefinition[]
}

export function CategoryGroup({ label, components }: CategoryGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </h3>
      {components.map((def) => (
        <DraggableComponent key={def.id} definition={def} />
      ))}
    </div>
  )
}
