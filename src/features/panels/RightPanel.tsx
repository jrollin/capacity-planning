import { shallow } from 'zustand/shallow'
import { useStore } from '../../store'
import { ResultsContent } from '../results/ResultsContent'
import { SimulationControls } from '../simulation/SimulationControls'

export function RightPanel() {
  const { collapsed, toggle } = useStore(
    (s) => ({
      collapsed: s.resultsPanelCollapsed,
      toggle: s.toggleResultsPanel,
    }),
    shallow,
  )

  return (
    <aside
      className={`flex flex-col border-l border-slate-700 bg-slate-850 transition-all ${
        collapsed ? 'w-10' : 'w-80'
      }`}
    >
      <button
        onClick={toggle}
        className="flex h-10 items-center justify-end border-b border-slate-700 px-3 text-slate-400 hover:text-slate-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {!collapsed && (
        <>
          <div className="border-b border-slate-700 p-3">
            <SimulationControls />
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
            <ResultsContent />
          </div>
        </>
      )}
    </aside>
  )
}
