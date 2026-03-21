import { create } from 'zustand'
import type { Capabilities } from '@platform/capabilities'
import type { ClassificationResult } from '@vision/GlyphClassifier'
import type { ARStatus } from '@ui/StatusChip'

export type LoadingStage = 'app' | 'camera' | 'vision' | 'classifier' | 'done'

interface AppState {
  capabilities: Capabilities | null
  setCapabilities: (caps: Capabilities) => void
  isARActive: boolean
  setARActive: (active: boolean) => void
  // Loading
  loadingStage: LoadingStage
  setLoadingStage: (stage: LoadingStage) => void
  // AR status
  arStatus: ARStatus
  setArStatus: (status: ARStatus) => void
  // Vision
  visionReady: boolean
  setVisionReady: (ready: boolean) => void
  classifierReady: boolean
  setClassifierReady: (ready: boolean) => void
  lastDetection: ClassificationResult | null
  setLastDetection: (result: ClassificationResult | null) => void
}

export const useAppStore = create<AppState>(set => ({
  capabilities: null,
  setCapabilities: capabilities => set({ capabilities }),
  isARActive: false,
  setARActive: isARActive => set({ isARActive }),
  loadingStage: 'app',
  setLoadingStage: loadingStage => set({ loadingStage }),
  arStatus: 'idle',
  setArStatus: arStatus => set({ arStatus }),
  visionReady: false,
  setVisionReady: visionReady => set({ visionReady }),
  classifierReady: false,
  setClassifierReady: classifierReady => set({ classifierReady }),
  lastDetection: null,
  setLastDetection: lastDetection => set({ lastDetection }),
}))
