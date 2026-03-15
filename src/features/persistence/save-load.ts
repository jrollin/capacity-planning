import type { Edge } from '@xyflow/react'
import type { PipelineFlowNode } from '../../store/slices/canvas'

const STORAGE_KEY = 'system-latency-estimator'

interface SaveData {
  nodes: PipelineFlowNode[]
  edges: Edge[]
  requestRps: number
  version: 1
}

export function saveToLocalStorage(
  nodes: PipelineFlowNode[],
  edges: Edge[],
  requestRps: number,
) {
  const data: SaveData = { nodes, edges, requestRps, version: 1 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadFromLocalStorage(): SaveData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SaveData
  } catch {
    return null
  }
}

export function exportToFile(
  nodes: PipelineFlowNode[],
  edges: Edge[],
  requestRps: number,
) {
  const data: SaveData = { nodes, edges, requestRps, version: 1 }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pipeline.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromFile(): Promise<SaveData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      try {
        const text = await file.text()
        resolve(JSON.parse(text) as SaveData)
      } catch {
        resolve(null)
      }
    }
    input.click()
  })
}
