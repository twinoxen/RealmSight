import { useEffect, useRef } from 'react'
import { SceneManager } from './SceneManager'
import { useAppStore } from '@store/appStore'

/**
 * Initializes and manages the SceneManager lifecycle tied to a DOM element.
 * Returns the SceneManager instance for use by AR and vision layers.
 */
export function useScene(mountId: string) {
  const managerRef = useRef<SceneManager | null>(null)
  const { capabilities } = useAppStore()

  useEffect(() => {
    const el = document.getElementById(mountId)
    if (!el || !capabilities) return

    const manager = new SceneManager({
      canvas: el,
      quality: capabilities.qualityTier,
    })
    manager.start()
    managerRef.current = manager

    return () => {
      manager.dispose()
      managerRef.current = null
    }
  }, [mountId, capabilities])

  return managerRef
}
