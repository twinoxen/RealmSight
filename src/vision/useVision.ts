import { useEffect, useRef, useState } from 'react'
import { VisionWorkerClient } from './VisionWorkerClient'
import type { ContourResult } from './opencv.worker'

/**
 * Manages the OpenCV Web Worker lifecycle.
 * Returns the client and current contour results.
 */
export function useVision() {
  const clientRef = useRef<VisionWorkerClient | null>(null)
  const [workerReady, setWorkerReady] = useState(false)
  const [contours, setContours] = useState<ContourResult[]>([])

  useEffect(() => {
    const client = new VisionWorkerClient()
    client.onReady = () => setWorkerReady(true)
    clientRef.current = client

    return () => {
      client.dispose()
      clientRef.current = null
      setWorkerReady(false)
    }
  }, [])

  /**
   * Process a video/canvas frame through the OpenCV pipeline.
   * Call this on a requestAnimationFrame loop when AR is active.
   */
  async function processFrame(imageData: ImageData) {
    const client = clientRef.current
    if (!client?.isReady) return
    try {
      const results = await client.processFrame(imageData)
      setContours(results)
    } catch (err) {
      // Worker busy or error — skip frame
    }
  }

  return { clientRef, workerReady, contours, processFrame }
}
