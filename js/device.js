const Device = (() => {
  const fallbackCoords = { lat: 55.7558, lon: 37.6176 }
  let lastData = { ...fallbackCoords, speed: 0 }
  const subscribers = []
  let watchId = null
  let fakeInterval = null
  let watching = false
  let fakeSpeed = 0
  let accelerating = true

  function notify(data) {
    lastData = data
    subscribers.forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error('Device subscriber error', e)
      }
    })
  }

  function stepFake() {
    if (accelerating) {
      fakeSpeed += Math.random() * 4
      if (fakeSpeed >= 60 || Math.random() < 0.05) accelerating = false
    } else {
      fakeSpeed -= Math.random() * 8
      if (fakeSpeed <= 5) accelerating = true
    }
    if (fakeSpeed < 0) fakeSpeed = 0
    notify({ ...fallbackCoords, speed: fakeSpeed })
  }

  function startFallback() {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    if (!fakeInterval) {
      fakeInterval = setInterval(stepFake, 1000)
      // send first data immediately
      notify({ ...fallbackCoords, speed: fakeSpeed })
    }
  }

  function startNativeWatch() {
    if (!('geolocation' in navigator)) {
      startFallback()
      return
    }
    watchId = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const s = pos.coords.speed
        const speed = s && !isNaN(s) ? s * 3.6 : 0
        notify({ lat, lon, speed })
      },
      err => {
        console.warn('Geolocation error', err)
        startFallback()
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      },
    )
  }

  function watchLocation(cb) {
    subscribers.push(cb)
    cb(lastData)
    if (!watching) {
      watching = true
      if ('geolocation' in navigator) {
        startNativeWatch()
      } else {
        startFallback()
      }
    }
  }

  return {
    watchLocation,
    // placeholders for future extensions
  }
})()

window.Device = Device
