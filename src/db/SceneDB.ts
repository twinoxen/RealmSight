import Dexie, { type Table } from 'dexie'

export interface PlacedModel {
  glyphType: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number; w: number }
  scale: number
}

export interface Scene {
  id?: number
  name: string
  createdAt: number
  updatedAt: number
  models: PlacedModel[]
  thumbnail?: string // base64 PNG
}

class RealmSightDB extends Dexie {
  scenes!: Table<Scene>

  constructor() {
    super('RealmSightDB')
    this.version(1).stores({
      scenes: '++id, name, updatedAt',
    })
  }
}

export const db = new RealmSightDB()
