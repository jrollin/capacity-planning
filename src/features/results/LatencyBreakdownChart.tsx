import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { CalculationResult } from '../../domain/types'
import { getComponentById } from '../../domain/component-catalog'
import { Card } from '../../shared/components/Card'

interface LatencyBreakdownChartProps {
  result: CalculationResult
  nodeComponentMap: Map<string, string>
}

export function LatencyBreakdownChart({
  result,
  nodeComponentMap,
}: LatencyBreakdownChartProps) {
  const realisticScenario = result.scenarios.realistic

  const data = result.criticalPath.map((nodeId) => {
    const componentId = nodeComponentMap.get(nodeId) ?? ''
    const def = getComponentById(componentId)
    const range = realisticScenario.nodeLatencies.get(nodeId)

    return {
      name: def?.name ?? nodeId,
      latency: range ? Math.round(range.max) : 0,
      isBottleneck: result.bottlenecks.some((b) => b.nodeId === nodeId),
    }
  })

  if (data.length === 0) return null

  return (
    <Card title="Latency Breakdown (Critical Path)">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 10 }}>
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="ms" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value}ms`, 'Latency']}
          />
          <Bar dataKey="latency" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isBottleneck ? '#ef4444' : '#10b981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
