import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { Slider } from '../../shared/components/Slider'
import { formatRps, formatRange } from '../../shared/utils/format'
import { useAutoCalculate } from './hooks/useAutoCalculate'

export function SimulationBar() {
  useAutoCalculate()

  const { requestRps, setRequestRps, result } = useStore(
    (s) => ({
      requestRps: s.requestRps,
      setRequestRps: s.setRequestRps,
      result: s.calculationResult,
    }),
    shallow,
  )

  const realisticRange = result?.scenarios.realistic.totalLatency

  return (
    <div className="flex items-center gap-6 border-t border-slate-700 bg-slate-850 px-4 py-2">
      <div className="w-80">
        <Slider
          label="Requests/sec"
          value={requestRps}
          min={1}
          max={100000}
          onChange={setRequestRps}
          formatValue={(v) => `${formatRps(v)} rps`}
          logarithmic
        />
      </div>

      {realisticRange && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">Realistic latency:</span>
          <span className="font-mono text-slate-200">
            {formatRange(realisticRange.min, realisticRange.max)}
          </span>
          {result!.bottlenecks.length > 0 && (
            <span className="text-red-400">
              {result!.bottlenecks.length} bottleneck
              {result!.bottlenecks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
