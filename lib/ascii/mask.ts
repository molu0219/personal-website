/** Per-cell coverage of rasterised text, plus a softened copy for shading normals. */
export interface TextMask {
  cols: number
  rows: number
  /** 0–1 ink coverage per cell. */
  cov: Float32Array
  /** Blurred coverage; its gradient gives a pseudo surface normal. */
  soft: Float32Array
}

const SUPERSAMPLE = 4

/**
 * Rasterise `lines` (one entry per line) to fill a `cols × rows` cell box.
 * `cellAspect` = cell width / cell height, so letters keep their proportions.
 * `family` is a CSS font-family list; `weight` a CSS font-weight.
 */
export function textMask(
  lines: string[],
  cols: number,
  rows: number,
  cellAspect: number,
  family: string,
  weight = 600,
): TextMask {
  const pxW = cols * SUPERSAMPLE
  const pxH = Math.round((rows * SUPERSAMPLE) / cellAspect)
  const canvas = document.createElement('canvas')
  canvas.width = pxW
  canvas.height = pxH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const cov = new Float32Array(cols * rows)
  if (!ctx) return { cols, rows, cov, soft: cov }

  // Size the font so the widest line fills the width and all lines fit the height.
  const lineGap = 0.92
  let size = pxH / (lines.length * lineGap)
  ctx.font = `${weight} ${size}px ${family}`
  const widest = Math.max(...lines.map(l => ctx.measureText(l).width))
  if (widest > pxW) size *= pxW / widest
  ctx.font = `${weight} ${size}px ${family}`
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'
  const blockH = size * lineGap * lines.length
  const top = (pxH - blockH) / 2
  lines.forEach((l, i) => ctx.fillText(l, 0, top + size * lineGap * (i + 0.82)))

  const { data } = ctx.getImageData(0, 0, pxW, pxH)
  const cellPxH = pxH / rows
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor(r * cellPxH)
    const y1 = Math.max(y0 + 1, Math.floor((r + 1) * cellPxH))
    for (let c = 0; c < cols; c++) {
      let sum = 0
      let n = 0
      for (let y = y0; y < y1; y++)
        for (let x = c * SUPERSAMPLE; x < (c + 1) * SUPERSAMPLE; x++) {
          sum += data[(y * pxW + x) * 4 + 3]
          n++
        }
      cov[r * cols + c] = sum / (n * 255)
    }
  }
  return { cols, rows, cov, soft: blur(cov, cols, rows, 2) }
}

function blur(src: Float32Array, cols: number, rows: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let s = 0
      let n = 0
      for (let d = -radius; d <= radius; d++) {
        const x = c + d
        if (x >= 0 && x < cols) {
          s += src[r * cols + x]
          n++
        }
      }
      tmp[r * cols + c] = s / n
    }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let s = 0
      let n = 0
      for (let d = -radius; d <= radius; d++) {
        const y = r + d
        if (y >= 0 && y < rows) {
          s += tmp[y * cols + c]
          n++
        }
      }
      out[r * cols + c] = s / n
    }
  return out
}
