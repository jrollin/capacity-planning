import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { PipelineGraph } from '../../domain/types'
import { calculatePipeline } from '../../domain/engine'
import { Card } from '../../shared/components/Card'
import { formatLatency, formatRps } from '../../shared/utils/format'
import { theme } from '../../shared/theme'
import { useMemo } from 'react'

interface LoadCurveChartProps {
  graph: PipelineGraph
  currentRps: number
}

const RPS_POINTS = [
  10, 50, 100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000,
  30000, 50000, 75000, 100000,
]

export function LoadCurveChart({ graph, currentRps }: LoadCurveChartProps) {
  const data = useMemo(() => {
    if (graph.nodes.length === 0) return []

    return RPS_POINTS.map((rps) => {
      const result = calculatePipeline(graph, rps)
      if (!result) return null

      return {
        rps,
        p50: Math.round(result.scenarios.optimistic.totalLatency.max),
        p95: Math.round(result.scenarios.realistic.totalLatency.max),
        p99: Math.round(result.scenarios.pessimistic.totalLatency.max),
      }
    }).filter(Boolean)
  }, [graph])

  if (data.length === 0) return null

  return (
    <Card title="Latency vs Load">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ left: 10, right: 10 }}>
          <XAxis
            dataKey="rps"
            tick={{ fill: theme.slate400, fontSize: 10 }}
            tickFormatter={(v) => formatRps(v)}
            scale="log"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            tick={{ fill: theme.slate400, fontSize: 10 }}
            tickFormatter={(v) => formatLatency(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.slate800,
              border: `1px solid ${theme.slate700}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(v) => `${formatRps(Number(v))} rps`}
            formatter={(value, name) => [
              formatLatency(Number(value)),
              String(name),
            ]}
          />
          <ReferenceLine
            x={currentRps}
            stroke={theme.slate600}
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke={theme.emerald500}
            strokeWidth={1.5}
            dot={false}
            name="Optimistic"
          />
          <Line
            type="monotone"
            dataKey="p95"
            stroke={theme.amber500}
            strokeWidth={1.5}
            dot={false}
            name="Realistic"
          />
          <Line
            type="monotone"
            dataKey="p99"
            stroke={theme.red500}
            strokeWidth={1.5}
            dot={false}
            name="Pessimistic"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
