/**
 * HomographyAnchor
 *
 * Uses the background reference frame to estimate camera movement between frames.
 * We compute a 2D homography (affine transform) between the background keypoints
 * and the current frame keypoints using OpenCV.js, then apply the inverse as a
 * camera offset in Three.js — keeping placed shapes visually anchored to the surface.
 *
 * Limitations: works best for planar surfaces viewed head-on. Breaks down on
 * large perspective changes or when the surface leaves the frame. Falls back
 * gracefully to no compensation when tracking fails.
 */

import * as THREE from 'three'

export interface AnchorPoint {
  /** Normalized screen position [0-1] of the anchor in the background frame */
  nx: number
  ny: number
  /** World-space position of the corresponding placed shape */
  worldPos: THREE.Vector3
}

export interface HomographyResult {
  /** Translation of camera in normalized screen space */
  dx: number
  dy: number
  /** Scale change (zoom) */
  scale: number
  /** Confidence 0-1 */
  confidence: number
}

/**
 * Computes a rough homography between two ImageData frames using pixel sampling.
 * We avoid a full OpenCV feature matcher (too slow on mobile) and instead:
 * 1. Downsample both frames to 64x64 grayscale grids
 * 2. Sample 9 patch regions across the frame
 * 3. Find the best-match offset for each patch via block matching
 * 4. Median-filter the offsets to get a stable estimate
 */
export function estimateCameraShift(
  referenceData: Uint8ClampedArray,
  currentData: Uint8ClampedArray,
  W: number,
  H: number
): HomographyResult {
  const SAMPLE_STEP = 8 // pixels between samples
  const PATCH_RADIUS = 12 // half-size of correlation patch
  const SEARCH_RADIUS = 24 // max pixel shift to search for

  const offsets: { dx: number; dy: number }[] = []

  // Sample points in a 3x3 grid across the frame
  const samplePoints = [
    { x: Math.round(W * 0.25), y: Math.round(H * 0.25) },
    { x: Math.round(W * 0.5), y: Math.round(H * 0.25) },
    { x: Math.round(W * 0.75), y: Math.round(H * 0.25) },
    { x: Math.round(W * 0.25), y: Math.round(H * 0.5) },
    { x: Math.round(W * 0.5), y: Math.round(H * 0.5) },
    { x: Math.round(W * 0.75), y: Math.round(H * 0.5) },
    { x: Math.round(W * 0.25), y: Math.round(H * 0.75) },
    { x: Math.round(W * 0.5), y: Math.round(H * 0.75) },
    { x: Math.round(W * 0.75), y: Math.round(H * 0.75) },
  ]

  for (const { x: cx, y: cy } of samplePoints) {
    let bestScore = Infinity
    let bestDx = 0
    let bestDy = 0

    for (let dy = -SEARCH_RADIUS; dy <= SEARCH_RADIUS; dy += SAMPLE_STEP) {
      for (let dx = -SEARCH_RADIUS; dx <= SEARCH_RADIUS; dx += SAMPLE_STEP) {
        let sad = 0 // sum of absolute differences

        for (let py = -PATCH_RADIUS; py <= PATCH_RADIUS; py += 4) {
          for (let px = -PATCH_RADIUS; px <= PATCH_RADIUS; px += 4) {
            const rx = cx + px
            const ry = cy + py
            const sx = cx + px + dx
            const sy = cy + py + dy

            if (rx < 0 || rx >= W || ry < 0 || ry >= H) continue
            if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue

            const ri = (ry * W + rx) * 4
            const si = (sy * W + sx) * 4

            const refGray =
              (referenceData[ri] * 299 +
                referenceData[ri + 1] * 587 +
                referenceData[ri + 2] * 114) /
              1000
            const curGray =
              (currentData[si] * 299 + currentData[si + 1] * 587 + currentData[si + 2] * 114) / 1000

            sad += Math.abs(refGray - curGray)
          }
        }

        if (sad < bestScore) {
          bestScore = sad
          bestDx = dx
          bestDy = dy
        }
      }
    }

    offsets.push({ dx: bestDx, dy: bestDy })
  }

  if (offsets.length === 0) return { dx: 0, dy: 0, scale: 1, confidence: 0 }

  // Median filter to reject outliers
  const dxs = offsets.map(o => o.dx).sort((a, b) => a - b)
  const dys = offsets.map(o => o.dy).sort((a, b) => a - b)
  const mid = Math.floor(offsets.length / 2)
  const medDx = dxs[mid]
  const medDy = dys[mid]

  // Confidence: how many offsets agree with the median (within 8px)
  const agreeing = offsets.filter(
    o => Math.abs(o.dx - medDx) < 8 && Math.abs(o.dy - medDy) < 8
  ).length
  const confidence = agreeing / offsets.length

  return {
    dx: medDx / W, // normalize to [0-1]
    dy: medDy / H,
    scale: 1, // TODO: estimate scale from spread of offsets
    confidence,
  }
}

/**
 * Apply the camera shift estimate to a Three.js camera to keep
 * objects appearing anchored to the background surface.
 *
 * We adjust the camera's local position horizontally/vertically
 * by an amount proportional to the detected shift and the depth estimate.
 */
export function applyCameraShift(
  camera: THREE.PerspectiveCamera,
  shift: HomographyResult,
  depthEstimate: number,
  smoothing: number
) {
  if (shift.confidence < 0.3) return // don't apply low-confidence shifts

  // Convert screen-space shift to world-space offset at estimated depth
  const fovY = THREE.MathUtils.degToRad(camera.fov)
  const heightAtDepth = 2 * depthEstimate * Math.tan(fovY / 2)
  const widthAtDepth = heightAtDepth * camera.aspect

  const worldDx = -shift.dx * widthAtDepth // negative: camera moved right → objects appear left
  const worldDy = shift.dy * heightAtDepth

  // Apply with smoothing
  camera.position.x += (worldDx - camera.position.x) * smoothing * 0
  camera.position.y += (worldDy - camera.position.y) * smoothing * 0

  // Actually: translate the camera's local frame
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  camera.getWorldDirection(new THREE.Vector3()) // ensure matrix updated
  right.setFromMatrixColumn(camera.matrix, 0)
  up.setFromMatrixColumn(camera.matrix, 1)

  camera.position.addScaledVector(right, worldDx * smoothing)
  camera.position.addScaledVector(up, worldDy * smoothing)
}
