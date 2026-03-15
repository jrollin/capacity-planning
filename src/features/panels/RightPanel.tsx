import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { ResultsContent } from '../results/ResultsContent'
import { SimulationControls } from '../simulation/SimulationControls'
import { useIsMobile } from '../../shared/hooks/useMediaQuery'

export function RightPanel() {
  const { collapsed, toggle } = useStore(
    (s) => ({
      collapsed: s.resultsPanelCollapsed,
      toggle: s.toggleResultsPanel,
    }),
    shallow,
  )
  const mobilePanel = useStore((s) => s.mobilePanel)
  const setMobilePanel = useStore((s) => s.setMobilePanel)
  const isMobile = useIsMobile()

  // Close mobile panel on escape
  useEffect(() => {
    if (!isMobile || mobilePanel !== 'results') return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobilePanel('none')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isMobile, mobilePanel, setMobilePanel])

  // Mobile: render as overlay
  if (isMobile) {
    if (mobilePanel !== 'results') return null
    return (
      <div className="mobile-overlay" role="dialog" aria-modal="true" aria-label="Results panel">
        <div
          className="mobile-overlay-backdrop"
          onClick={() => setMobilePanel('none')}
          aria-hidden="true"
        />
        <aside className="mobile-overlay-panel mobile-overlay-panel--right">
          <div className="flex h-12 items-center justify-between border-b border-slate-700 px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Results
            </span>
            <button
              onClick={() => setMobilePanel('none')}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Close results panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <PanelContent />
        </aside>
      </div>
    )
  }

  // Desktop: original sidebar behavior
  return (
    <aside
      className={`hidden flex-col border-l border-slate-700 bg-slate-850 transition-all md:flex ${
        collapsed ? 'w-10' : 'w-80'
      }`}
      aria-label="Results panel"
    >
      <button
        onClick={toggle}
        className="flex h-10 items-center justify-end border-b border-slate-700 px-3 text-slate-400 hover:text-slate-200"
        aria-label={collapsed ? 'Expand results panel' : 'Collapse results panel'}
        aria-expanded={!collapsed}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {!collapsed && <PanelContent />}
    </aside>
  )
}

function PanelContent() {
  return (
    <>
      <div className="border-b border-slate-700 p-3">
        <SimulationControls />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <ResultsContent />
      </div>
    </>
  )
}
