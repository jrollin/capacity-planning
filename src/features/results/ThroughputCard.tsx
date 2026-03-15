import { formatRps } from '../../shared/utils/format'
import { Card } from '../../shared/components/Card'

interface ThroughputCardProps {
  effectiveRps: number
  requestRps: number
}

export function ThroughputCard({ effectiveRps, requestRps }: ThroughputCardProps) {
  const isSaturated = effectiveRps < requestRps

  return (
    <Card title="Throughput">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold text-slate-200">
          {formatRps(effectiveRps)} rps
        </span>
        {isSaturated && (
          <span className="text-xs text-red-400">
            (capped from {formatRps(requestRps)})
          </span>
        )}
      </div>
    </Card>
  )
}
