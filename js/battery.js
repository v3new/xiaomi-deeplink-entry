;(function () {
  function initBattery() {
    const area = document.getElementById('batteryArea')
    if (!area) return

    if (!window.Device || !Device.hasBatterySupport()) {
      area.style.display = 'none'
      return
    }

    const fill = document.getElementById('batteryLevelFill')
    const bolt = document.getElementById('bolt')
    const textSvg = document.getElementById('batteryPercentText')
    const badge = document.getElementById('batteryBadge')

    const setBatteryColor = pct => {
      let color = '#26c281'
      if (pct >= 60) color = '#26c281'
      else if (pct >= 40) color = '#ffd166'
      else if (pct >= 15) color = '#ff8c42'
      else color = '#ff3b30'
      badge.style.setProperty('--battery-color', color)
    }

    Device.watchBattery(b => {
      const {pct, charging, chargingTime, dischargingTime} = b

      const maxWidth = 22
      const w = Math.max(0, Math.min(maxWidth, Math.round((pct / 100) * maxWidth)))
      fill.setAttribute('width', String(w))

      bolt.style.display = charging ? 'block' : 'none'
      textSvg.textContent = `${pct}`

      const tail = charging
        ? isFinite(chargingTime) && chargingTime > 0
          ? ` • to 100%: ${fmtTime(chargingTime)}`
          : ''
        : isFinite(dischargingTime) && dischargingTime > 0
          ? ` • remaining: ${fmtTime(dischargingTime)}`
          : ''
      badge.title = charging ? `${pct}% charging${tail}` : `${pct}%${tail}`

      setBatteryColor(pct)
      badge.classList.toggle('blink', pct < 15 && !charging)
    })
  }

  window.initBattery = initBattery
})()
