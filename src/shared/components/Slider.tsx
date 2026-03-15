import { useState, useRef, useEffect } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  logarithmic?: boolean
  defaultValue?: number
  editableAsMs?: boolean
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  logarithmic,
  defaultValue,
  editableAsMs,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sliderValue = logarithmic ? Math.log10(Math.max(value, 1)) : value
  const sliderMin = logarithmic ? Math.log10(Math.max(min, 1)) : min
  const sliderMax = logarithmic ? Math.log10(max) : max
  const sliderStep = logarithmic ? 0.01 : step

  const defaultPercent =
    defaultValue !== undefined
      ? ((logarithmic
            ? Math.log10(Math.max(defaultValue, 1))
            : defaultValue) -
          sliderMin) /
        (sliderMax - sliderMin) *
        100
      : undefined

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value)
    const actual = logarithmic ? Math.round(Math.pow(10, raw)) : raw
    onChange(actual)
  }

  function startEdit() {
    if (!editableAsMs) return
    setDraft(String(value))
    setEditing(true)
  }

  function commitEdit() {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed))
      onChange(clamped)
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="w-20 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-right font-mono text-slate-200 outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500">ms</span>
          </div>
        ) : (
          <span
            onClick={startEdit}
            className={`font-mono text-slate-200 ${editableAsMs ? 'cursor-pointer rounded px-1 hover:bg-slate-700' : ''}`}
          >
            {displayValue}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={sliderValue}
          onChange={handleChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-500"
        />
        {defaultPercent !== undefined && (
          <div
            className="pointer-events-none absolute top-0 h-1.5 w-px bg-amber-400"
            style={{ left: `${defaultPercent}%` }}
            title={`Default: ${formatValue ? formatValue(defaultValue!) : defaultValue}`}
          />
        )}
      </div>
    </div>
  )
}
