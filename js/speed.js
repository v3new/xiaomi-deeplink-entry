// 1) Парсеры и LERP (без изменений)
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3)
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  const num = parseInt(hex, 16)
  return {r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255}
}

function rgbToHex({r, g, b}) {
  const to2 = x => x.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  }
}

// 2) Основная функция обновления
function updateSpeed(speedKmh) {
  const root = document.documentElement

  // — Цветовые стопы (как было)
  const originals = ['#eec32d', '#ec4b4b', '#709ab9', '#4dffbf'].map(hexToRgb)
  const greenTarget = hexToRgb('#4dffbf')
  const yellowTarget = hexToRgb('#eec32d')
  const redTarget = hexToRgb('#ec4b4b')

  let t, target
  if (speedKmh <= 5) {
    target = originals
  } else if (speedKmh <= 60) {
    t = (speedKmh - 5) / (60 - 5)
    target = originals.map(c => lerpColor(c, greenTarget, t))
  } else if (speedKmh <= 80) {
    t = (speedKmh - 60) / (80 - 60)
    target = originals.map(c => lerpColor(greenTarget, yellowTarget, t))
  } else {
    t = Math.min((speedKmh - 80) / 20, 1)
    target = originals.map(c => lerpColor(yellowTarget, redTarget, t))
  }
  target.forEach((rgb, i) => {
    root.style.setProperty(`--stop${i + 1}`, rgbToHex(rgb))
  })

  // — Размер тайлинга (от 18px до 7px на скорости 0…120km/h)
  const pSize = Math.min(speedKmh, 120) / 120
  const sizePx = 18 - 11 * pSize
  root.style.setProperty('--size', `${sizePx.toFixed(2)}px`)

  // — Длительность анимации (от 35s до 12s на скорости 0…120km/h)
  const pSpeed = pSize
  const duration = 35 - 23 * pSpeed
  root.style.setProperty('--speed', `${duration.toFixed(2)}s`)
}

// 3) Следим за геолокацией через обёртку Device
if (window.Device && Device.watchLocation) {
  Device.watchLocation(data => {
    const kmh = data.speed
    updateSpeed(kmh)
  })
} else {
  console.warn('Device API not available')
  updateSpeed(0)
}
