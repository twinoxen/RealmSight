/**
 * Background subtraction utilities.
 *
 * When the user locks a background frame, we compute pixel-level diffs on
 * subsequent frames. Only "new marks" that weren't in the background survive
 * into the glyph classifier — making the system work on concrete, dirt, sand,
 * whiteboard, or any textured surface.
 */

export interface BackgroundFrame {
  data: Uint8ClampedArray
  width: number
  height: number
}

/** Subtract background from current frame, return a diff ImageData */
export function subtractBackground(
  current: ImageData,
  bg: BackgroundFrame,
  threshold = 30
): ImageData {
  const W = current.width
  const H = current.height

  // If sizes differ (e.g. user rotated phone) return current unchanged
  if (bg.width !== W || bg.height !== H) return current

  const output = new Uint8ClampedArray(W * H * 4)
  const cur = current.data
  const back = bg.data

  for (let i = 0; i < W * H; i++) {
    const ri = i * 4
    // Grayscale diff
    const curGray = (cur[ri] * 299 + cur[ri + 1] * 587 + cur[ri + 2] * 114) / 1000
    const bgGray = (back[ri] * 299 + back[ri + 1] * 587 + back[ri + 2] * 114) / 1000
    const diff = Math.abs(curGray - bgGray)

    // Threshold: pixels that changed more than `threshold` are "new marks"
    const v = diff > threshold ? 0 : 255 // black = new mark, white = unchanged
    output[ri] = v
    output[ri + 1] = v
    output[ri + 2] = v
    output[ri + 3] = 255
  }

  return new ImageData(output, W, H)
}
