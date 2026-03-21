import type { ContourResult } from './opencv.worker'

type WorkerMessage =
  | { type: 'ready' }
  | { type: 'contours'; contours: ContourResult[] }
  | { type: 'error'; message: string }

export class VisionWorkerClient {
  private worker: Worker
  private ready = false
  private pendingResolve: ((contours: ContourResult[]) => void) | null = null
  private pendingReject: ((err: Error) => void) | null = null
  onReady?: () => void

  constructor() {
    // Vite worker syntax — bundled as a separate chunk
    this.worker = new Worker(new URL('./opencv.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = this.handleMessage
    this.worker.onerror = (e) => console.error('[VisionWorker] Error:', e.message)
  }

  private handleMessage = (e: MessageEvent<WorkerMessage>) => {
    const msg = e.data
    switch (msg.type) {
      case 'ready':
        this.ready = true
        this.onReady?.()
        break
      case 'contours':
        this.pendingResolve?.(msg.contours)
        this.pendingResolve = null
        this.pendingReject = null
        break
      case 'error':
        this.pendingReject?.(new Error(msg.message))
        this.pendingResolve = null
        this.pendingReject = null
        break
    }
  }

  get isReady() { return this.ready }

  /** Process a video frame and return detected contours */
  async processFrame(imageData: ImageData): Promise<ContourResult[]> {
    if (!this.ready) throw new Error('Vision worker not ready')
    if (this.pendingResolve) throw new Error('Vision worker busy')

    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve
      this.pendingReject = reject
      this.worker.postMessage({ type: 'process', imageData })
    })
  }

  dispose() {
    this.worker.terminate()
  }
}
