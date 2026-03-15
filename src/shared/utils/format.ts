export function formatLatency(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`
  if (ms < 1000) return `${ms.toFixed(ms < 10 ? 1 : 0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatRps(rps: number): string {
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(1)}M`
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(rps >= 10_000 ? 0 : 1)}k`
  return `${rps}`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatRange(min: number, max: number): string {
  return `${formatLatency(min)} — ${formatLatency(max)}`
}
