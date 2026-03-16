import { useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import type { PipelineFlowNode } from '../../store/slices/canvas'
import { useStore } from '../../store'
import { getComponentById, COMPONENT_CATALOG, CATEGORIES } from '../../domain/component-catalog'
import { formatLatency, formatPercent } from '../../shared/utils/format'
import { Badge } from '../../shared/components/Badge'

export function PipelineNode({ id, data }: NodeProps<PipelineFlowNode>) {
  const { calculationResult, openConfigDrawer, removeNode, edges, addInnerCall, removeInnerCall, toggleInnerCallSequential, moveInnerCall } = useStore(
    (s) => ({
      calculationResult: s.calculationResult,
      openConfigDrawer: s.openConfigDrawer,
      removeNode: s.removeNode,
      edges: s.edges,
      addInnerCall: s.addInnerCall,
      removeInnerCall: s.removeInnerCall,
      toggleInnerCallSequential: s.toggleInnerCallSequential,
      moveInnerCall: s.moveInnerCall,
    }),
    shallow,
  )

  const [pickerOpen, setPickerOpen] = useState(false)
  const [draggedCallId, setDraggedCallId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  const isEntryNode = edges.length > 0 && !edges.some((e) => e.target === id)

  const definition = getComponentById(data.componentId)
  const bottleneck = calculationResult?.bottlenecks.find((b) => b.nodeId === id)
  const isOnCriticalPath = calculationResult?.criticalPath.includes(id)
  const utilization = bottleneck?.utilization ?? 0
  const hasOverride = data.latencyOverride !== undefined || data.throughputOverride !== undefined

  const innerCallsLatency = (() => {
    const calls = data.innerCalls
    if (!calls || calls.length === 0) return 0
    let seqSum = 0
    const parValues: number[] = []
    for (const call of calls) {
      const callDef = getComponentById(call.componentId)
      if (!callDef) continue
      const lat = callDef.latency.p50
      if (call.sequential) seqSum += lat
      else parValues.push(lat)
    }
    return seqSum + (parValues.length > 0 ? Math.max(...parValues) : 0)
  })()

  const utilizationColor =
    utilization > 0.8
      ? 'bg-red-500'
      : utilization > 0.5
        ? 'bg-amber-500'
        : 'bg-emerald-500'

  const isPendingSource = data._isPendingSource as boolean | undefined

  const borderClass = isPendingSource
    ? 'border-emerald-400 shadow-emerald-500/30 shadow-lg'
    : bottleneck
      ? 'border-red-500 bottleneck-pulse'
      : isOnCriticalPath
        ? 'border-amber-500'
        : 'border-slate-600'

  const innerCalls = data.innerCalls ?? []

  return (
    <div className="flex items-start">
      <div
        className={`group relative min-w-[140px] cursor-pointer rounded-lg border-2 bg-slate-800 px-3 py-2 shadow-lg transition-colors ${borderClass}`}
        onDoubleClick={() => openConfigDrawer(id)}
      >
        <Handle type="target" position={Position.Top} className="!bg-slate-500" />

        {isEntryNode && (
          <div className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 shadow" title="Entry point">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-white">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            removeNode(id)
          }}
          className="nodrag absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-400 opacity-100 transition-opacity hover:bg-red-600 hover:text-white md:h-5 md:w-5 md:text-[10px] md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Remove ${data.label}`}
          title="Remove"
        >
          ✕
        </button>

        <div className="nodrag absolute -right-2 top-1/2 -translate-y-1/2" ref={pickerRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setPickerOpen(!pickerOpen)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-400 hover:bg-emerald-600 hover:text-white md:h-5 md:w-5 md:text-[10px]"
            aria-label="Add inner call"
            title="Add inner call"
          >
            +
          </button>
          {pickerOpen && (
            <div className="absolute left-6 top-0 z-50 w-48 rounded-md border border-slate-600 bg-slate-800 py-1 shadow-xl">
              {CATEGORIES.map((cat) => {
                const components = COMPONENT_CATALOG.filter((c) => c.category === cat.id)
                return (
                  <div key={cat.id}>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {cat.label}
                    </div>
                    {components.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          addInnerCall(id, comp.id)
                          setPickerOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        <span>{comp.icon}</span>
                        <span>{comp.name}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">{data.icon}</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">
              {data.label}
            </span>
            <Badge variant={bottleneck ? 'danger' : 'default'} className="mt-0.5 w-fit">
              p50: {formatLatency(data.latencyOverride?.p50 ?? definition?.latency.p50 ?? 0)}
              {hasOverride && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="ml-1 inline h-3 w-3 text-amber-400">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              )}
            </Badge>
            {innerCallsLatency > 0 && (
              <span className="mt-0.5 text-[10px] text-slate-500">
                +{formatLatency(innerCallsLatency)} inner = {formatLatency((data.latencyOverride?.p50 ?? definition?.latency.p50 ?? 0) + innerCallsLatency)}
              </span>
            )}
          </div>
        </div>

        {utilization > 0 && (
          <div className="mt-2">
            <div className="mb-0.5 flex justify-between text-[10px] text-slate-400">
              <span>Utilization</span>
              <span>{formatPercent(utilization)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className={`h-full rounded-full transition-all ${utilizationColor}`}
                style={{ width: `${Math.min(utilization * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
      </div>

      {innerCalls.length > 0 && (
        <div className="flex items-center">
          <div className="w-3 border-t border-dashed border-slate-600" />
          <div className="flex flex-col gap-1">
            {innerCalls.map((call, i) => {
              const callDef = getComponentById(call.componentId)
              const isDragged = draggedCallId === call.id
              const isDropTarget = dropTarget === call.id && draggedCallId !== call.id
              return (
                <div
                  key={call.id}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation()
                    setDraggedCallId(call.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDropTarget(call.id)
                  }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (draggedCallId && draggedCallId !== call.id) {
                      const fromIdx = innerCalls.findIndex((c) => c.id === draggedCallId)
                      const toIdx = i
                      if (fromIdx >= 0) {
                        const steps = toIdx - fromIdx
                        const dir = steps > 0 ? 'down' : 'up'
                        for (let s = 0; s < Math.abs(steps); s++) {
                          moveInnerCall(id, draggedCallId, dir)
                        }
                      }
                    }
                    setDraggedCallId(null)
                    setDropTarget(null)
                  }}
                  onDragEnd={() => {
                    setDraggedCallId(null)
                    setDropTarget(null)
                  }}
                  className={`nodrag flex cursor-grab items-center gap-1.5 rounded border px-2 py-1 text-[10px] transition-opacity ${
                    isDragged
                      ? 'opacity-40'
                      : isDropTarget
                        ? 'ring-1 ring-slate-400'
                        : ''
                  } ${
                    call.sequential
                      ? 'border-blue-500/30 bg-blue-950/40 text-blue-300'
                      : 'border-amber-500/30 bg-amber-950/40 text-amber-300'
                  }`}
                  title={`${callDef?.name ?? call.componentId} (${call.sequential ? 'sequential' : 'parallel'}) — drag to reorder`}
                >
                  <span className="text-[8px] text-slate-600">⠿</span>
                  <span className="text-xs">{callDef?.icon ?? '?'}</span>
                  <div className="flex flex-col">
                    <span className="whitespace-nowrap font-medium">{callDef?.name ?? call.componentId}</span>
                    {callDef && (
                      <span className="whitespace-nowrap text-[8px] text-slate-500">
                        p50: {formatLatency(callDef.latency.p50)}
                      </span>
                    )}
                  </div>
                  <button
                    className="nodrag ml-0.5 hover:brightness-150"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleInnerCallSequential(id, call.id)
                    }}
                    title={`Switch to ${call.sequential ? 'parallel' : 'sequential'}`}
                  >
                    <span className={call.sequential ? 'text-blue-400' : 'text-amber-400'}>
                      {call.sequential ? '↓seq' : '⑃par'}
                    </span>
                  </button>
                  <button
                    className="nodrag ml-0.5 text-slate-500 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeInnerCall(id, call.id)
                    }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
