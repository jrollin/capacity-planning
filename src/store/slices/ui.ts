import type { StateCreator } from 'zustand'
import type { StoreState } from '../index'

export type RightPanelTab = 'results' | 'config'
export type MobilePanel = 'none' | 'sidebar' | 'results'

export interface UISlice {
  selectedNodeId: string | null
  configDrawerOpen: boolean
  resultsPanelCollapsed: boolean
  sidebarCollapsed: boolean
  activeRightTab: RightPanelTab
  sequenceOverlayVisible: boolean
  mobilePanel: MobilePanel
  selectNode: (nodeId: string | null) => void
  openConfigDrawer: (nodeId: string) => void
  closeConfigDrawer: () => void
  toggleResultsPanel: () => void
  toggleSidebar: () => void
  setActiveRightTab: (tab: RightPanelTab) => void
  toggleSequenceOverlay: () => void
  setMobilePanel: (panel: MobilePanel) => void
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (
  set,
) => ({
  selectedNodeId: null,
  configDrawerOpen: false,
  resultsPanelCollapsed: false,
  sidebarCollapsed: false,
  activeRightTab: 'results',
  sequenceOverlayVisible: false,
  mobilePanel: 'none',

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  openConfigDrawer: (nodeId) =>
    set({
      selectedNodeId: nodeId,
      configDrawerOpen: true,
      sidebarCollapsed: false,
    }),

  closeConfigDrawer: () =>
    set({ configDrawerOpen: false }),

  toggleResultsPanel: () =>
    set((state) => ({ resultsPanelCollapsed: !state.resultsPanelCollapsed })),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setActiveRightTab: (tab) => set({ activeRightTab: tab }),

  toggleSequenceOverlay: () =>
    set((state) => ({ sequenceOverlayVisible: !state.sequenceOverlayVisible })),

  setMobilePanel: (panel) => set({ mobilePanel: panel }),
})
