import { useState } from 'react'
import { PRESETS } from '../features/presets/templates'
import { ConfirmDialog } from '../shared/components/ConfirmDialog'

interface HeaderProps {
  onSave: () => void
  onLoad: () => void
  onLoadPreset: (index: number) => void
}

const btnClass =
  'rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700'

export function Header({ onSave, onLoad, onLoadPreset }: HeaderProps) {
  const [pendingPreset, setPendingPreset] = useState<number | null>(null)

  return (
    <>
      <header className="flex h-12 items-center justify-between border-b border-slate-700 bg-slate-850 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold tracking-tight text-slate-200">
            System Latency Estimator
          </h1>
          <div className="mx-1 h-5 w-px bg-slate-700" />
          {PRESETS.map((preset, i) => (
            <button
              key={preset.name}
              onClick={() => setPendingPreset(i)}
              className={btnClass}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onLoad} className={btnClass}>
            Load
          </button>
          <button
            onClick={onSave}
            className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white transition-colors hover:bg-emerald-500"
          >
            Save
          </button>
          <div className="mx-1 h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <a
              href="https://github.com/jrollin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200"
            >
              jrollin
            </a>
            <a
              href="https://github.com/jrollin/capacity-planning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {pendingPreset !== null && (
        <ConfirmDialog
          message={`Load "${PRESETS[pendingPreset].name}" preset? This will replace your current canvas.`}
          onConfirm={() => {
            onLoadPreset(pendingPreset)
            setPendingPreset(null)
          }}
          onCancel={() => setPendingPreset(null)}
        />
      )}
    </>
  )
}
