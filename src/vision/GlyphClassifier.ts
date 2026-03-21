/**
 * GlyphClassifier
 *
 * Loads and runs the TF.js glyph recognition CNN.
 * Designed to run in the main thread (TF.js WebGL backend) and receive
 * cropped contour ImageData from the OpenCV Web Worker.
 *
 * Architecture: MobileNetV2-derived lightweight CNN
 *   Input:  64×64 grayscale → [1, 64, 64, 1]
 *   Output: softmax over 8 glyph classes
 *   Size:   ~2MB (full), ~500KB (INT8 quantized)
 *
 * During development (no trained model yet) this returns a mock result
 * so the integration plumbing can be tested end-to-end before training data exists.
 */

import * as tf from '@tensorflow/tfjs'
import { GLYPH_LABELS, INPUT_SIZE, CONFIDENCE_THRESHOLD, NUM_CLASSES } from './glyphs'
import type { GlyphLabel } from './glyphs'

export interface ClassificationResult {
  label: GlyphLabel
  confidence: number
  /** All class scores, sorted descending */
  scores: { label: GlyphLabel; score: number }[]
}

export class GlyphClassifier {
  private model: tf.LayersModel | null = null
  private ready = false
  private useMock = false

  async load(modelUrl?: string): Promise<void> {
    // If no trained model URL provided, use mock mode for development
    if (!modelUrl) {
      console.warn('[GlyphClassifier] No model URL provided — using mock classifier')
      this.useMock = true
      this.ready = true
      return
    }

    try {
      this.model = await tf.loadLayersModel(modelUrl)
      // Warm up with a dummy inference to avoid cold-start latency on first real frame
      const dummy = tf.zeros([1, INPUT_SIZE, INPUT_SIZE, 1])
      const warmup = this.model.predict(dummy) as tf.Tensor
      warmup.dispose()
      dummy.dispose()
      this.ready = true
      console.log('[GlyphClassifier] Model loaded and warmed up')
    } catch (err) {
      console.warn('[GlyphClassifier] Model load failed, falling back to mock:', err)
      this.useMock = true
      this.ready = true
    }
  }

  get isReady() {
    return this.ready
  }

  /**
   * Classify a contour crop.
   * @param imageData - cropped region around the contour (any size, will be resized)
   * @returns classification result if confidence ≥ threshold, null otherwise
   */
  async classify(imageData: ImageData): Promise<ClassificationResult | null> {
    if (!this.ready) return null

    if (this.useMock) return this.mockClassify()

    // Run inference outside tf.tidy so we can return non-Tensor data
    const tensor = tf.browser
      .fromPixels(imageData, 1)
      .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
      .toFloat()
      .div(255.0)
      .expandDims(0) as tf.Tensor4D

    const output = this.model!.predict(tensor) as tf.Tensor2D
    const scoreData = (await output.data()) as Float32Array
    tensor.dispose()
    output.dispose()

    const results = GLYPH_LABELS.map((label, i) => ({ label, score: scoreData[i] })).sort(
      (a, b) => b.score - a.score
    )

    const top = results[0]
    if (top.score < CONFIDENCE_THRESHOLD) return null

    return {
      label: top.label,
      confidence: top.score,
      scores: results,
    }
  }

  /** Returns a random mock result for development/testing */
  private mockClassify(): ClassificationResult {
    const idx = Math.floor(Math.random() * NUM_CLASSES)
    const scores = GLYPH_LABELS.map((label, i) => ({
      label,
      score: i === idx ? 0.92 : Math.random() * 0.05,
    })).sort((a, b) => b.score - a.score)

    return { label: scores[0].label, confidence: scores[0].score, scores }
  }

  dispose() {
    this.model?.dispose()
  }
}
