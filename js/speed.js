function updateSpeed(speedKmh) {
  const root = document.documentElement
  const stars = document.querySelector('.stars')
  const containerWidth = stars.parentElement.clientWidth

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

  // 4. Вычисляем долю ширины (0…1 при 0…100 км/ч)
  const normilizeSpeed = Math.max(speedKmh, 10) - 10
  const pWidth = Math.min(normilizeSpeed, 100) / 100
  const widthPx = 211 + (containerWidth - 211) * pWidth
  stars.style.width = `${widthPx.toFixed(2)}px`
}

if (window.Device && Device.watchLocation) {
  Device.watchLocation(data => {
    const kmh = data.speed
    updateSpeed(kmh)
  })
} else {
  console.warn('Device API not available')
  updateSpeed(0)
}
