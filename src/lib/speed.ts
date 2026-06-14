import {hexToRgb, lerpColor, rgbToHex} from './color'

// Not wired up by default (mirrors the original speed.js, where the Device watcher
// stays commented out). Exposed so a speed source can drive the background later.
export function updateSpeed(speedKmh: number): void {
  const root = document.documentElement
  const stars = document.querySelector('.stars') as HTMLElement | null
  if (!stars?.parentElement) return
  const containerWidth = stars.parentElement.clientWidth

  const originals = ['#eec32d', '#ec4b4b', '#709ab9', '#4dffbf'].map(hexToRgb)
  const greenTarget = hexToRgb('#4dffbf')
  const yellowTarget = hexToRgb('#eec32d')
  const redTarget = hexToRgb('#ec4b4b')

  let t: number
  let target = originals
  if (speedKmh <= 5) {
    target = originals
  } else if (speedKmh <= 60) {
    t = (speedKmh - 5) / (60 - 5)
    target = originals.map(c => lerpColor(c, greenTarget, t))
  } else if (speedKmh <= 80) {
    t = (speedKmh - 60) / (80 - 60)
    target = originals.map(() => lerpColor(greenTarget, yellowTarget, t))
  } else {
    t = Math.min((speedKmh - 80) / 20, 1)
    target = originals.map(() => lerpColor(yellowTarget, redTarget, t))
  }
  target.forEach((rgb, i) => {
    root.style.setProperty(`--stop${i + 1}`, rgbToHex(rgb))
  })

  const pSize = Math.min(speedKmh, 120) / 120
  const sizePx = 18 - 11 * pSize
  root.style.setProperty('--size', `${sizePx.toFixed(2)}px`)

  const duration = 35 - 23 * pSize
  root.style.setProperty('--speed', `${duration.toFixed(2)}s`)

  const normalizeSpeed = Math.max(speedKmh, 10) - 10
  const pWidth = Math.min(normalizeSpeed, 100) / 100
  const widthPx = 211 + (containerWidth - 211) * pWidth
  stars.style.width = `${widthPx.toFixed(2)}px`
}
