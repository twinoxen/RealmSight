import { create } from 'zustand'
import type { Capabilities } from '@platform/capabilities'

interface AppState {
  capabilities: Capabilities | null
  setCapabilities: (caps: Capabilities) => void
  isARActive: boolean
  setARActive: (active: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  capabilities: null,
  setCapabilities: (capabilities) => set({ capabilities }),
  isARActive: false,
  setARActive: (isARActive) => set({ isARActive }),
}))
