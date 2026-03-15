import type { Bottleneck } from '../../domain/types'
import { formatPercent, formatLatency } from '../../shared/utils/format'
import { Card } from '../../shared/components/Card'

interface BottleneckListProps {
  bottlenecks: Bottleneck[]
}

export function BottleneckList({ bottlenecks }: BottleneckListProps) {
  if (bottlenecks.length === 0) {
    return (
      <Card title="Bottlenecks">
        <p className="text-xs text-slate-500">No bottlenecks detected</p>
      </Card>
    )
  }

  return (
    <Card title="Bottlenecks">
      <div className="flex flex-col gap-2">
        {bottlenecks.map((b) => (
          <div
            key={b.nodeId}
            className="flex items-center justify-between rounded border border-red-900/50 bg-red-950/30 px-2 py-1.5"
          >
            <span className="text-xs font-medium text-red-400">
              {b.componentName}
            </span>
            <div className="flex gap-2 text-[10px] text-slate-400">
              <span>{formatPercent(b.utilization)} util</span>
              <span>+{formatLatency(b.queueWait)} queue</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
