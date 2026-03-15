import type { ScenarioResult } from '../../domain/types'
import { formatRange } from '../../shared/utils/format'
import { Card } from '../../shared/components/Card'

interface ScenarioCardProps {
  result: ScenarioResult
}

const scenarioConfig = {
  optimistic: { label: 'Optimistic', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  realistic: { label: 'Realistic', color: 'text-amber-400', dot: 'bg-amber-400' },
  pessimistic: { label: 'Pessimistic', color: 'text-red-400', dot: 'bg-red-400' },
}

export function ScenarioCard({ result }: ScenarioCardProps) {
  const config = scenarioConfig[result.type]

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
      <p className="mt-1 font-mono text-lg font-semibold text-slate-200">
        {formatRange(result.totalLatency.min, result.totalLatency.max)}
      </p>
    </Card>
  )
}
