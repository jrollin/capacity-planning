import { useEffect, useRef } from 'react'
import { useStore } from '../../../store'

export function useAutoCalculate(debounceMs = 300) {
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const requestRps = useStore((s) => s.requestRps)
  const recalculate = useStore((s) => s.recalculate)

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      recalculate()
    }, debounceMs)

    return () => clearTimeout(timeoutRef.current)
  }, [nodes, edges, requestRps, recalculate, debounceMs])
}
