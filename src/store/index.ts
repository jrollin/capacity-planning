import { createWithEqualityFn } from 'zustand/traditional'
import { createCanvasSlice, type CanvasSlice } from './slices/canvas'
import { createSimulationSlice, type SimulationSlice } from './slices/simulation'
import { createUISlice, type UISlice } from './slices/ui'

export type StoreState = CanvasSlice & SimulationSlice & UISlice

export const useStore = createWithEqualityFn<StoreState>()((...args) => ({
  ...createCanvasSlice(...args),
  ...createSimulationSlice(...args),
  ...createUISlice(...args),
}))
