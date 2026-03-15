import { useState } from 'react'
import { PRESETS } from '../features/presets/templates'
import { ConfirmDialog } from '../shared/components/ConfirmDialog'
import { useIsMobile } from '../shared/hooks/useMediaQuery'
import { useStore } from '../store'

interface HeaderProps {
  onSave: () => void
  onLoad: () => void
  onLoadPreset: (index: number) => void
}

const btnClass =
  'rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-500'

export function Header({ onSave, onLoad, onLoadPreset }: HeaderProps) {
  const [pendingPreset, setPendingPreset] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const setMobilePanel = useStore((s) => s.setMobilePanel)
  const mobilePanel = useStore((s) => s.mobilePanel)

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-700 bg-slate-850 px-3 md:px-4">
        {/* Left side */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && (
            <button
              onClick={() =>
                setMobilePanel(mobilePanel === 'sidebar' ? 'none' : 'sidebar')
              }
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Toggle components panel"
              aria-expanded={mobilePanel === 'sidebar'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <h1 className="text-sm font-semibold tracking-tight text-slate-200">
            <span className="hidden sm:inline">System Latency Estimator</span>
            <span className="sm:hidden">SLE</span>
          </h1>
          {!isMobile && (
            <>
              <div className="mx-1 h-5 w-px bg-slate-700" aria-hidden="true" />
              {PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => setPendingPreset(i)}
                  className={btnClass}
                  aria-label={`Load ${preset.name} preset: ${preset.description}`}
                >
                  {preset.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile ? (
            <>
              <button
                onClick={() =>
                  setMobilePanel(
                    mobilePanel === 'results' ? 'none' : 'results',
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                aria-label="Toggle results panel"
                aria-expanded={mobilePanel === 'results'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </button>
              {/* More menu for presets/save/load on mobile */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  aria-label="More options"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <nav
                      className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl"
                      role="menu"
                      aria-label="Options menu"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Presets
                      </div>
                      {PRESETS.map((preset, i) => (
                        <button
                          key={preset.name}
                          role="menuitem"
                          onClick={() => {
                            setPendingPreset(i)
                            setMenuOpen(false)
                          }}
                          className="flex w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700"
                        >
                          {preset.name}
                        </button>
                      ))}
                      <div className="my-1 h-px bg-slate-700" role="separator" />
                      <button
                        role="menuitem"
                        onClick={() => {
                          onLoad()
                          setMenuOpen(false)
                        }}
                        className="flex w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700"
                      >
                        Load from file
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          onSave()
                          setMenuOpen(false)
                        }}
                        className="flex w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700"
                      >
                        Save / Export
                      </button>
                    </nav>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={onLoad} className={btnClass} aria-label="Load pipeline from file">
                Load
              </button>
              <button
                onClick={onSave}
                className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white transition-colors hover:bg-emerald-500"
                aria-label="Save pipeline to file"
              >
                Save
              </button>
              <div className="mx-1 h-5 w-px bg-slate-700" aria-hidden="true" />
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <a
                  href="https://github.com/jrollin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-200"
                  aria-label="jrollin on GitHub"
                >
                  jrollin
                </a>
                <a
                  href="https://github.com/jrollin/capacity-planning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-200"
                  aria-label="View source on GitHub"
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
            </>
          )}
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
