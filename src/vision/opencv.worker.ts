/**
 * OpenCV.js Web Worker
 *
 * Runs adaptive thresholding + contour extraction entirely off the main thread.
 * The main thread posts raw ImageData, this worker posts back an array of contours.
 *
 * Message protocol:
 *   IN:  { type: 'process', imageData: ImageData }
 *   OUT: { type: 'contours', contours: ContourResult[] }
 *       { type: 'ready' }
 *       { type: 'error', message: string }
 */

export interface ContourResult {
  /** Bounding box in image space */
  x: number
  y: number
  width: number
  height: number
  /** Approximate area in pixels^2 */
  area: number
  /** Centroid */
  cx: number
  cy: number
  /** Contour complexity (perimeter^2 / area) — higher = more complex shape */
  complexity: number
}

// OpenCV.js loaded via importScripts — typed loosely
declare const cv: Record<string, unknown> & {
  Mat: new () => CVMat
  MatVector: new () => CVMatVector
  Size: new (w: number, h: number) => unknown
  matFromImageData: (imageData: ImageData) => CVMat
  cvtColor: (src: CVMat, dst: CVMat, code: number) => void
  adaptiveThreshold: (
    src: CVMat, dst: CVMat,
    maxVal: number, adaptiveMethod: number,
    thresholdType: number, blockSize: number, C: number
  ) => void
  GaussianBlur: (src: CVMat, dst: CVMat, ksize: unknown, sigmaX: number) => void
  morphologyEx: (src: CVMat, dst: CVMat, op: number, kernel: CVMat) => void
  getStructuringElement: (shape: number, ksize: unknown) => CVMat
  findContours: (image: CVMat, contours: CVMatVector, hierarchy: CVMat, mode: number, method: number) => void
  contourArea: (contour: CVMat) => number
  arcLength: (contour: CVMat, closed: boolean) => number
  boundingRect: (contour: CVMat) => { x: number; y: number; width: number; height: number }
  moments: (contour: CVMat) => { m00: number; m10: number; m01: number }
  COLOR_RGBA2GRAY: number
  ADAPTIVE_THRESH_GAUSSIAN_C: number
  THRESH_BINARY_INV: number
  RETR_EXTERNAL: number
  CHAIN_APPROX_SIMPLE: number
  MORPH_CLOSE: number
  MORPH_RECT: number
}

interface CVMat {
  delete: () => void
  rows: number
  cols: number
  data32S: Int32Array
  size: () => { width: number; height: number }
}

interface CVMatVector {
  delete: () => void
  size: () => number
  get: (i: number) => CVMat
}

let cvReady = false

// Load OpenCV.js from CDN
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(self as unknown as { importScripts: (...urls: string[]) => void }).importScripts(
  'https://docs.opencv.org/4.9.0/opencv.js'
)

// OpenCV fires Module.onRuntimeInitialized when WASM is ready
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(self as unknown as { Module: { onRuntimeInitialized: () => void } }).Module = {
  onRuntimeInitialized() {
    cvReady = true
    self.postMessage({ type: 'ready' })
  }
}

self.onmessage = (e: MessageEvent) => {
  const { type, imageData } = e.data as { type: string; imageData: ImageData }

  if (type !== 'process') return
  if (!cvReady) {
    self.postMessage({ type: 'error', message: 'OpenCV not ready yet' })
    return
  }

  const contours = extractContours(imageData)
  self.postMessage({ type: 'contours', contours })
}

function extractContours(imageData: ImageData): ContourResult[] {
  // Mats we need to clean up
  const mats: CVMat[] = []
  const vecs: CVMatVector[] = []

  try {
    const src = cv.matFromImageData(imageData)
    mats.push(src)

    // 1. Grayscale
    const gray = new cv.Mat()
    mats.push(gray)
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)

    // 2. Gaussian blur to reduce noise
    const blurred = new cv.Mat()
    mats.push(blurred)
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)

    // 3. Adaptive threshold — works in varying lighting
    const thresh = new cv.Mat()
    mats.push(thresh)
    cv.adaptiveThreshold(
      blurred, thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,  // blockSize — larger = more context
      2    // C — constant subtracted from mean
    )

    // 4. Morphological close — fills small gaps in drawn lines
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3))
    mats.push(kernel)
    const closed = new cv.Mat()
    mats.push(closed)
    cv.morphologyEx(thresh, closed, cv.MORPH_CLOSE, kernel)

    // 5. Find contours
    const contourVec = new cv.MatVector()
    vecs.push(contourVec)
    const hierarchy = new cv.Mat()
    mats.push(hierarchy)
    cv.findContours(closed, contourVec, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    const results: ContourResult[] = []
    const imageArea = imageData.width * imageData.height

    for (let i = 0; i < contourVec.size(); i++) {
      const contour = contourVec.get(i)
      const area = cv.contourArea(contour)

      // Filter out noise (too small) and the whole-image contour (too large)
      if (area < 500 || area > imageArea * 0.5) continue

      const rect = cv.boundingRect(contour)
      const perimeter = cv.arcLength(contour, true)
      const m = cv.moments(contour)
      const cx = m.m00 > 0 ? m.m10 / m.m00 : rect.x + rect.width / 2
      const cy = m.m00 > 0 ? m.m01 / m.m00 : rect.y + rect.height / 2
      const complexity = perimeter * perimeter / (area + 1)

      results.push({ ...rect, area, cx, cy, complexity })
    }

    return results
  } finally {
    mats.forEach(m => m.delete())
    vecs.forEach(v => v.delete())
  }
}
