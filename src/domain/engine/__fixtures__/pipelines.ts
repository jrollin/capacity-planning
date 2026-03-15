import type { PipelineGraph } from '../../types'

export const LINEAR_PIPELINE: PipelineGraph = {
  nodes: [
    { id: 'gw', componentId: 'api-gateway' },
    { id: 'svc', componentId: 'backend-service' },
    { id: 'db', componentId: 'sql-db' },
  ],
  edges: [
    { id: 'e1', source: 'gw', target: 'svc', latencyMs: 1 },
    { id: 'e2', source: 'svc', target: 'db', latencyMs: 1 },
  ],
}

export const PARALLEL_PIPELINE: PipelineGraph = {
  nodes: [
    { id: 'gw', componentId: 'api-gateway' },
    { id: 'cache', componentId: 'cache' },
    { id: 'db', componentId: 'sql-db' },
    { id: 'svc', componentId: 'backend-service' },
  ],
  edges: [
    { id: 'e1', source: 'gw', target: 'cache', latencyMs: 1 },
    { id: 'e2', source: 'gw', target: 'db', latencyMs: 1 },
    { id: 'e3', source: 'cache', target: 'svc', latencyMs: 1 },
    { id: 'e4', source: 'db', target: 'svc', latencyMs: 1 },
  ],
}

export const DIAMOND_PIPELINE: PipelineGraph = {
  nodes: [
    { id: 'lb', componentId: 'load-balancer' },
    { id: 'svc1', componentId: 'backend-service' },
    { id: 'svc2', componentId: 'backend-service' },
    { id: 'db', componentId: 'sql-db' },
  ],
  edges: [
    { id: 'e1', source: 'lb', target: 'svc1', latencyMs: 1 },
    { id: 'e2', source: 'lb', target: 'svc2', latencyMs: 1 },
    { id: 'e3', source: 'svc1', target: 'db', latencyMs: 1 },
    { id: 'e4', source: 'svc2', target: 'db', latencyMs: 1 },
  ],
}

export const COMPLEX_PIPELINE: PipelineGraph = {
  nodes: [
    { id: 'dns', componentId: 'dns' },
    { id: 'cdn', componentId: 'cdn' },
    { id: 'gw', componentId: 'api-gateway' },
    { id: 'svc', componentId: 'backend-service' },
    { id: 'cache', componentId: 'cache' },
    { id: 'db', componentId: 'sql-db' },
    { id: 'queue', componentId: 'message-queue' },
  ],
  edges: [
    { id: 'e1', source: 'dns', target: 'cdn', latencyMs: 1 },
    { id: 'e2', source: 'cdn', target: 'gw', latencyMs: 1 },
    { id: 'e3', source: 'gw', target: 'svc', latencyMs: 1 },
    { id: 'e4', source: 'svc', target: 'cache', latencyMs: 1 },
    { id: 'e5', source: 'svc', target: 'db', latencyMs: 1 },
    { id: 'e6', source: 'svc', target: 'queue', latencyMs: 1 },
  ],
}

export const SINGLE_NODE: PipelineGraph = {
  nodes: [{ id: 'gw', componentId: 'api-gateway' }],
  edges: [],
}

export const EMPTY_GRAPH: PipelineGraph = {
  nodes: [],
  edges: [],
}
