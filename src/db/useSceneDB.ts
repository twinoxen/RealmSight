import { useCallback } from 'react'
import { db } from './SceneDB'
import type { Scene, PlacedModel } from './SceneDB'

export function useSceneDB() {
  const saveScene = useCallback(
    async (name: string, models: PlacedModel[], thumbnail?: string): Promise<number> => {
      const now = Date.now()
      const id = await db.scenes.add({ name, createdAt: now, updatedAt: now, models, thumbnail })
      return id as number
    },
    []
  )

  const updateScene = useCallback(async (id: number, models: PlacedModel[], thumbnail?: string) => {
    await db.scenes.update(id, { models, thumbnail, updatedAt: Date.now() })
  }, [])

  const listScenes = useCallback(async (): Promise<Scene[]> => {
    return db.scenes.orderBy('updatedAt').reverse().toArray()
  }, [])

  const loadScene = useCallback(async (id: number): Promise<Scene | undefined> => {
    return db.scenes.get(id)
  }, [])

  const deleteScene = useCallback(async (id: number) => {
    await db.scenes.delete(id)
  }, [])

  return { saveScene, updateScene, listScenes, loadScene, deleteScene }
}
