export interface QueuingResult {
  utilization: number
  queueWait: number
  queueDepth: number
  loadedLatency: number
  isBottleneck: boolean
}

export function computeQueuing(
  baseLatencyMs: number,
  maxRps: number,
  requestRps: number,
): QueuingResult {
  const serviceRate = maxRps
  const arrivalRate = Math.min(requestRps, serviceRate * 0.99)
  const utilization = arrivalRate / serviceRate

  const scalingFactor = computeScalingFactor(utilization)
  const queueWait = computeQueueWait(utilization, serviceRate)
  const queueDepth = arrivalRate * (queueWait / 1000)
  const loadedLatency = baseLatencyMs * (1 + scalingFactor) + queueWait

  return {
    utilization,
    queueWait,
    queueDepth,
    loadedLatency,
    isBottleneck: utilization > 0.8,
  }
}

function computeScalingFactor(utilization: number): number {
  if (utilization < 0.5) return 0
  if (utilization < 0.8) return utilization * utilization
  if (utilization < 0.95) return utilization * utilization * utilization
  return Math.exp(5 * (utilization - 0.95))
}

function computeQueueWait(utilization: number, serviceRate: number): number {
  if (utilization < 0.01) return 0
  const serviceTimeMs = 1000 / serviceRate
  return (utilization / (1 - utilization)) * serviceTimeMs
}
