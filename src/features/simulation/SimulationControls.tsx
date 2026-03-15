import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { Slider } from '../../shared/components/Slider'
import { formatRps, formatRange } from '../../shared/utils/format'

export function SimulationControls() {
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-200">Load</span>
        {realisticRange && (
          <span className="font-mono text-[10px] text-slate-400">
            {formatRange(realisticRange.min, realisticRange.max)}
          </span>
        )}
      </div>
      <Slider
        label="RPS"
        value={requestRps}
        min={1}
        max={100000}
        onChange={setRequestRps}
        formatValue={(v) => `${formatRps(v)}`}
        logarithmic
      />
    </div>
  )
}
