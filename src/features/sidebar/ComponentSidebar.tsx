import { useState } from 'react'
import { useStore } from '../../store'
import { CATEGORIES, getComponentsByCategory } from '../../domain/component-catalog'
import { CategoryGroup } from './CategoryGroup'
import { ConfigContent } from '../config/ConfigContent'

export function ComponentSidebar() {
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const toggle = useStore((s) => s.toggleSidebar)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const [filter, setFilter] = useState('')
  const [catalogOpen, setCatalogOpen] = useState(true)

  const query = filter.toLowerCase()
  const hasSelection = selectedNodeId !== null

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-700 bg-slate-850 transition-all ${
        collapsed ? 'w-10' : 'w-72'
      }`}
    >
      <button
        onClick={toggle}
        className="flex h-10 items-center justify-start border-b border-slate-700 px-3 text-slate-400 hover:text-slate-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {!collapsed && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {hasSelection && (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
              <ConfigContent />
            </div>
          )}

          <div className={`flex flex-col border-t border-slate-700 ${hasSelection ? '' : 'flex-1'}`}>
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              <span>Components</span>
              <span className="text-[10px]">{catalogOpen ? '▼' : '▶'}</span>
            </button>

            {catalogOpen && (
              <div className={`flex flex-col gap-4 overflow-y-auto px-3 pb-3 ${hasSelection ? 'max-h-48' : 'flex-1'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search components…"
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 pr-7 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                  {filter && (
                    <button
                      onClick={() => setFilter('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                {CATEGORIES.map((cat) => {
                  const components = getComponentsByCategory(cat.id).filter(
                    (c) => !query || c.name.toLowerCase().includes(query),
                  )
                  if (components.length === 0) return null
                  return (
                    <CategoryGroup
                      key={cat.id}
                      label={cat.label}
                      components={components}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
