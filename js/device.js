const Device = (() => {
  const fallbackCoords = {lat: 55.7558, lon: 37.6176}
  let lastData = {...fallbackCoords, speed: 0}
  const subscribers = []
  let watchId = null
  let fakeInterval = null
  let watching = false
  let fakeSpeed = 0
  let accelerating = true

  // battery
  const batterySubscribers = []
  let batteryLast = null
  let batteryWatching = false

  function notify(state) {
    lastData = state
    subscribers.forEach(cb => {
      try {
        cb(state)
      } catch (e) {
        console.error('Device subscriber error', e)
      }
    })
  }

  function notifyBattery(state) {
    batteryLast = state
    batterySubscribers.forEach(cb => {
      try {
        cb(state)
      } catch (e) {
        console.error('Device battery subscriber error', e)
      }
    })
  }

  // function stepFake() {
  //   if (accelerating) {
  //     fakeSpeed += Math.random() * 4
  //     if (fakeSpeed >= 60 || Math.random() < 0.05) accelerating = false
  //   } else {
  //     fakeSpeed -= Math.random() * 8
  //     if (fakeSpeed <= 5) accelerating = true
  //   }
  //   if (fakeSpeed < 0) fakeSpeed = 0
  //   notify({ ...fallbackCoords, speed: fakeSpeed })
  // }

  function startFallback() {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    notify({...fallbackCoords, speed: 0})
    // if (!fakeInterval) {
    //   fakeInterval = setInterval(stepFake, 500)
    //   // send first data immediately
    //   notify({ ...fallbackCoords, speed: fakeSpeed })
    // }
  }

  function startNativeWatch() {
    watchId = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const s = pos.coords.speed
        const speed = s && !isNaN(s) ? s * 3.6 : 0
        notify({lat, lon, speed})
      },
      err => {
        console.warn('Geolocation error', err)
        startFallback()
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 60000,
      },
    )
  }

  function watchLocation(cb) {
    subscribers.push(cb)
    cb(lastData)
    if (!watching) {
      watching = true
      startNativeWatch()
    }
  }

  function hasBatterySupport() {
    return 'getBattery' in navigator
  }

  function startBatteryWatch() {
    if (!hasBatterySupport()) return
    navigator
      .getBattery()
      .then(b => {
        const emit = () => {
          const pct = Math.round(b.level * 100)
          notifyBattery({
            pct,
            level: b.level,
            charging: b.charging,
            chargingTime: b.chargingTime,
            dischargingTime: b.dischargingTime,
          })
        }
        emit()
        b.addEventListener('levelchange', emit)
        b.addEventListener('chargingchange', emit)
        b.addEventListener('chargingtimechange', emit)
        b.addEventListener('dischargingtimechange', emit)
      })
      .catch(() => {
        // ignore
      })
  }

  function watchBattery(cb) {
    batterySubscribers.push(cb)
    if (batteryLast) cb(batteryLast)
    if (!batteryWatching) {
      batteryWatching = true
      startBatteryWatch()
    }
  }

  return {
    watchLocation,
    watchBattery,
    hasBatterySupport,
    // placeholders for future extensions
  }
})()

window.Device = Device
