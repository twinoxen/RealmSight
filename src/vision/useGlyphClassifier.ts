import { useEffect, useRef, useState } from 'react'
import { GlyphClassifier } from './GlyphClassifier'
import type { ClassificationResult } from './GlyphClassifier'

/**
 * Manages GlyphClassifier lifecycle.
 * modelUrl can be undefined during development — classifier runs in mock mode.
 */
export function useGlyphClassifier(modelUrl?: string) {
  const classifierRef = useRef<GlyphClassifier | null>(null)
  const [classifierReady, setClassifierReady] = useState(false)
  const [lastResult, setLastResult] = useState<ClassificationResult | null>(null)

  useEffect(() => {
    const classifier = new GlyphClassifier()
    classifierRef.current = classifier

    classifier.load(modelUrl).then(() => setClassifierReady(true))

    return () => {
      classifier.dispose()
      classifierRef.current = null
      setClassifierReady(false)
    }
  }, [modelUrl])

  async function classifyContour(imageData: ImageData): Promise<ClassificationResult | null> {
    const result = (await classifierRef.current?.classify(imageData)) ?? null
    if (result) setLastResult(result)
    return result
  }

  return { classifierRef, classifierReady, lastResult, classifyContour }
}
