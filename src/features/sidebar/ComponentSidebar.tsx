import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { CATEGORIES, getComponentsByCategory } from '../../domain/component-catalog'
import { CategoryGroup } from './CategoryGroup'
import { ConfigContent } from '../config/ConfigContent'
import { useIsMobile } from '../../shared/hooks/useMediaQuery'

export function ComponentSidebar() {
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const toggle = useStore((s) => s.toggleSidebar)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const mobilePanel = useStore((s) => s.mobilePanel)
  const setMobilePanel = useStore((s) => s.setMobilePanel)
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('')
  const [catalogOpen, setCatalogOpen] = useState(true)

  const query = filter.toLowerCase()
  const hasSelection = selectedNodeId !== null

  // Close mobile panel on escape
  useEffect(() => {
    if (!isMobile || mobilePanel !== 'sidebar') return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobilePanel('none')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isMobile, mobilePanel, setMobilePanel])

  // On mobile, render as an overlay
  if (isMobile) {
    if (mobilePanel !== 'sidebar') return null
    return (
      <div className="mobile-overlay" role="dialog" aria-modal="true" aria-label="Components panel">
        <div
          className="mobile-overlay-backdrop"
          onClick={() => setMobilePanel('none')}
          aria-hidden="true"
        />
        <aside className="mobile-overlay-panel mobile-overlay-panel--left">
          <div className="flex h-12 items-center justify-between border-b border-slate-700 px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Components
            </span>
            <button
              onClick={() => setMobilePanel('none')}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              aria-label="Close components panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <SidebarContent
            hasSelection={hasSelection}
            filter={filter}
            setFilter={setFilter}
            query={query}
            catalogOpen={catalogOpen}
            setCatalogOpen={setCatalogOpen}
          />
        </aside>
      </div>
    )
  }

  // Desktop: original sidebar behavior
  return (
    <aside
      className={`hidden h-full flex-col border-r border-slate-700 bg-slate-850 transition-all md:flex ${
        collapsed ? 'w-10' : 'w-72'
      }`}
      aria-label="Components sidebar"
    >
      <button
        onClick={toggle}
        className="flex h-10 items-center justify-start border-b border-slate-700 px-3 text-slate-400 hover:text-slate-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {!collapsed && (
        <SidebarContent
          hasSelection={hasSelection}
          filter={filter}
          setFilter={setFilter}
          query={query}
          catalogOpen={catalogOpen}
          setCatalogOpen={setCatalogOpen}
        />
      )}
    </aside>
  )
}

function SidebarContent({
  hasSelection,
  filter,
  setFilter,
  query,
  catalogOpen,
  setCatalogOpen,
}: {
  hasSelection: boolean
  filter: string
  setFilter: (f: string) => void
  query: string
  catalogOpen: boolean
  setCatalogOpen: (o: boolean) => void
}) {
  return (
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
          aria-expanded={catalogOpen}
          aria-controls="component-catalog"
        >
          <span>Components</span>
          <span className="text-[10px]" aria-hidden="true">{catalogOpen ? '▼' : '▶'}</span>
        </button>

        {catalogOpen && (
          <div
            id="component-catalog"
            className={`flex flex-col gap-4 overflow-y-auto px-3 pb-3 ${hasSelection ? 'max-h-48' : 'flex-1'}`}
            role="region"
            aria-label="Component catalog"
          >
            <div className="relative">
              <label htmlFor="component-search" className="sr-only">
                Search components
              </label>
              <input
                id="component-search"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search components…"
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 pr-7 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                aria-label="Search components"
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
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
  )
}
