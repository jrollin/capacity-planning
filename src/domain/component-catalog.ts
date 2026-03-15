import type { ComponentDefinition, ComponentCategory } from './types'

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  // Infrastructure
  {
    id: 'dns',
    name: 'DNS',
    category: 'infrastructure',
    icon: '🌐',
    latency: { p50: 5, p95: 20, p99: 50 },
    throughput: { maxRps: 100_000, concurrencyLimit: 10_000 },
  },
  {
    id: 'cdn',
    name: 'CDN',
    category: 'infrastructure',
    icon: '⚡',
    latency: { p50: 2, p95: 10, p99: 30 },
    throughput: { maxRps: 100_000, concurrencyLimit: 10_000 },
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    category: 'infrastructure',
    icon: '🚪',
    latency: { p50: 3, p95: 10, p99: 25 },
    throughput: { maxRps: 50_000, concurrencyLimit: 5_000 },
  },
  {
    id: 'load-balancer',
    name: 'Load Balancer',
    category: 'infrastructure',
    icon: '⚖️',
    latency: { p50: 1, p95: 3, p99: 8 },
    throughput: { maxRps: 100_000, concurrencyLimit: 10_000 },
  },
  {
    id: 'reverse-proxy',
    name: 'Reverse Proxy',
    category: 'infrastructure',
    icon: '🔄',
    latency: { p50: 1, p95: 5, p99: 15 },
    throughput: { maxRps: 80_000, concurrencyLimit: 8_000 },
  },

  // Compute
  {
    id: 'backend-service',
    name: 'Backend Service',
    category: 'compute',
    icon: '🖥️',
    latency: { p50: 15, p95: 50, p99: 150 },
    throughput: { maxRps: 5_000, concurrencyLimit: 500 },
  },
  {
    id: 'lambda-warm',
    name: 'Lambda (warm)',
    category: 'compute',
    icon: '⚡',
    latency: { p50: 5, p95: 20, p99: 80 },
    throughput: { maxRps: 3_000, concurrencyLimit: 1_000 },
  },
  {
    id: 'lambda-cold',
    name: 'Lambda (cold)',
    category: 'compute',
    icon: '🧊',
    latency: { p50: 100, p95: 500, p99: 1500 },
    throughput: { maxRps: 1_000, concurrencyLimit: 500 },
  },
  {
    id: 'container',
    name: 'Container',
    category: 'compute',
    icon: '📦',
    latency: { p50: 10, p95: 40, p99: 120 },
    throughput: { maxRps: 8_000, concurrencyLimit: 1_000 },
  },
  {
    id: 'vm',
    name: 'VM',
    category: 'compute',
    icon: '🖲️',
    latency: { p50: 20, p95: 60, p99: 200 },
    throughput: { maxRps: 3_000, concurrencyLimit: 500 },
  },

  // Data
  {
    id: 'sql-db',
    name: 'SQL DB',
    category: 'data',
    icon: '🗃️',
    latency: { p50: 5, p95: 25, p99: 100 },
    throughput: { maxRps: 10_000, concurrencyLimit: 1_000 },
  },
  {
    id: 'nosql-db',
    name: 'NoSQL DB',
    category: 'data',
    icon: '📊',
    latency: { p50: 3, p95: 10, p99: 30 },
    throughput: { maxRps: 50_000, concurrencyLimit: 5_000 },
  },
  {
    id: 'cache',
    name: 'Cache (Redis)',
    category: 'data',
    icon: '💾',
    latency: { p50: 0.5, p95: 1, p99: 3 },
    throughput: { maxRps: 100_000, concurrencyLimit: 10_000 },
  },
  {
    id: 'message-queue',
    name: 'Message Queue',
    category: 'data',
    icon: '📨',
    latency: { p50: 2, p95: 5, p99: 15 },
    throughput: { maxRps: 50_000, concurrencyLimit: 5_000 },
  },
  {
    id: 's3-blob',
    name: 'S3/Blob',
    category: 'data',
    icon: '🪣',
    latency: { p50: 10, p95: 50, p99: 200 },
    throughput: { maxRps: 5_000, concurrencyLimit: 1_000 },
  },
]

export function getComponentById(id: string): ComponentDefinition | undefined {
  return COMPONENT_CATALOG.find((c) => c.id === id)
}

export function getComponentsByCategory(
  category: ComponentCategory,
): ComponentDefinition[] {
  return COMPONENT_CATALOG.filter((c) => c.category === category)
}

export const CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'compute', label: 'Compute' },
  { id: 'data', label: 'Data' },
]
