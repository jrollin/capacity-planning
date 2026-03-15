import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import { useState, useRef, useCallback } from 'react'
import { useStore } from '../../store'
import { theme } from '../../shared/theme'

export function PipelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  data,
}: EdgeProps) {
  const calculationResult = useStore((s) => s.calculationResult)
  const edges = useStore((s) => s.edges)
  const setEdges = useStore((s) => s.setEdges)
  const toggleEdgeSequential = useStore((s) => s.toggleEdgeSequential)
  const edgeData = data as { latencyMs?: number; sequential?: boolean; sequentialOrder?: number } | undefined
  const edgeLatencyMs = edgeData?.latencyMs ?? 1
  const isSequential = edgeData?.sequential ?? false
  const sequentialOrder = edgeData?.sequentialOrder
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovered(true)
  }, [])

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHovered(false)
    }, 150)
  }, [])

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const criticalPath = calculationResult?.criticalPath ?? []
  const sourceIdx = criticalPath.indexOf(source)
  const targetIdx = criticalPath.indexOf(target)
  const isOnCriticalPath =
    sourceIdx !== -1 && targetIdx !== -1 && targetIdx === sourceIdx + 1

  const strokeColor = isSequential ? theme.blue500 : isOnCriticalPath ? theme.amber500 : theme.slate600

  const targetLatency =
    calculationResult?.scenarios.realistic.nodeLatencies.get(target)

  function removeEdge(e: React.MouseEvent) {
    e.stopPropagation()
    setEdges(edges.filter((edge) => edge.id !== id))
  }

  return (
    <>
      {/* Invisible wide path for hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: clicked ? theme.emerald500 : hovered ? theme.slate400 : strokeColor,
          strokeWidth: clicked ? 3 : isOnCriticalPath ? 2.5 : 1.5,
          strokeDasharray: isSequential ? '6 3' : undefined,
          pointerEvents: 'none',
        }}
      />
      <EdgeLabelRenderer>
        <div
          ref={containerRef}
          className="nodrag nopan absolute flex items-center gap-1"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {isSequential && sequentialOrder != null && (
            <span className="rounded bg-blue-600/80 px-1 py-0.5 text-[10px] font-bold text-white">
              [{sequentialOrder}]
            </span>
          )}
          <span
            className={`cursor-pointer rounded px-1 py-0.5 text-[10px] transition-colors ${
              clicked
                ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setClicked((c) => !c)
            }}
          >
            {edgeLatencyMs}ms net{targetLatency ? ` · +${Math.round(targetLatency.max)}ms` : ''}
          </span>
          {(hovered || clicked) && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEdgeSequential(id)
                }}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow ${
                  isSequential
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-slate-600 text-slate-300 hover:bg-blue-600 hover:text-white'
                }`}
                title={isSequential ? 'Make parallel' : 'Make sequential'}
              >
                S
              </button>
              <button
                onClick={removeEdge}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow hover:bg-red-500"
                title="Remove edge"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
