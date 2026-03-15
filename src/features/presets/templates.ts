import type { PipelineFlowNode } from '../../store/slices/canvas'
import type { Edge } from '@xyflow/react'

interface Preset {
  name: string
  description: string
  nodes: PipelineFlowNode[]
  edges: Edge[]
}

export const PRESETS: Preset[] = [
  {
    name: 'Simple Web App',
    description: 'DNS → CDN → API Gateway → Backend → SQL DB',
    nodes: [
      {
        id: 'dns-1',
        type: 'pipeline',
        position: { x: 250, y: 0 },
        data: { componentId: 'dns', label: 'DNS', icon: '🌐' },
      },
      {
        id: 'cdn-1',
        type: 'pipeline',
        position: { x: 250, y: 100 },
        data: { componentId: 'cdn', label: 'CDN', icon: '⚡' },
      },
      {
        id: 'gw-1',
        type: 'pipeline',
        position: { x: 250, y: 200 },
        data: { componentId: 'api-gateway', label: 'API Gateway', icon: '🚪' },
      },
      {
        id: 'svc-1',
        type: 'pipeline',
        position: { x: 250, y: 300 },
        data: {
          componentId: 'backend-service',
          label: 'Backend Service',
          icon: '🖥️',
        },
      },
      {
        id: 'db-1',
        type: 'pipeline',
        position: { x: 250, y: 400 },
        data: { componentId: 'sql-db', label: 'SQL DB', icon: '🗃️' },
      },
    ],
    edges: [
      { id: 'e1', source: 'dns-1', target: 'cdn-1', type: 'pipeline' },
      { id: 'e2', source: 'cdn-1', target: 'gw-1', type: 'pipeline' },
      { id: 'e3', source: 'gw-1', target: 'svc-1', type: 'pipeline' },
      { id: 'e4', source: 'svc-1', target: 'db-1', type: 'pipeline' },
    ],
  },
  {
    name: 'Microservice Pipeline',
    description: 'LB → Backend → Cache + DB (parallel)',
    nodes: [
      {
        id: 'lb-1',
        type: 'pipeline',
        position: { x: 250, y: 0 },
        data: { componentId: 'load-balancer', label: 'Load Balancer', icon: '⚖️' },
      },
      {
        id: 'svc-1',
        type: 'pipeline',
        position: { x: 250, y: 100 },
        data: {
          componentId: 'backend-service',
          label: 'Backend Service',
          icon: '🖥️',
        },
      },
      {
        id: 'cache-1',
        type: 'pipeline',
        position: { x: 100, y: 220 },
        data: { componentId: 'cache', label: 'Cache (Redis)', icon: '💾' },
      },
      {
        id: 'db-1',
        type: 'pipeline',
        position: { x: 400, y: 220 },
        data: { componentId: 'sql-db', label: 'SQL DB', icon: '🗃️' },
      },
    ],
    edges: [
      { id: 'e1', source: 'lb-1', target: 'svc-1', type: 'pipeline' },
      { id: 'e2', source: 'svc-1', target: 'cache-1', type: 'pipeline' },
      { id: 'e3', source: 'svc-1', target: 'db-1', type: 'pipeline' },
    ],
  },
  {
    name: 'Event-Driven',
    description: 'API GW → Lambda → Message Queue → Backend → NoSQL',
    nodes: [
      {
        id: 'gw-1',
        type: 'pipeline',
        position: { x: 250, y: 0 },
        data: { componentId: 'api-gateway', label: 'API Gateway', icon: '🚪' },
      },
      {
        id: 'lambda-1',
        type: 'pipeline',
        position: { x: 250, y: 100 },
        data: { componentId: 'lambda-warm', label: 'Lambda (warm)', icon: '⚡' },
      },
      {
        id: 'queue-1',
        type: 'pipeline',
        position: { x: 250, y: 200 },
        data: { componentId: 'message-queue', label: 'Message Queue', icon: '📨' },
      },
      {
        id: 'svc-1',
        type: 'pipeline',
        position: { x: 250, y: 300 },
        data: {
          componentId: 'backend-service',
          label: 'Backend Service',
          icon: '🖥️',
        },
      },
      {
        id: 'nosql-1',
        type: 'pipeline',
        position: { x: 250, y: 400 },
        data: { componentId: 'nosql-db', label: 'NoSQL DB', icon: '📊' },
      },
    ],
    edges: [
      { id: 'e1', source: 'gw-1', target: 'lambda-1', type: 'pipeline' },
      { id: 'e2', source: 'lambda-1', target: 'queue-1', type: 'pipeline' },
      { id: 'e3', source: 'queue-1', target: 'svc-1', type: 'pipeline' },
      { id: 'e4', source: 'svc-1', target: 'nosql-1', type: 'pipeline' },
    ],
  },
]
