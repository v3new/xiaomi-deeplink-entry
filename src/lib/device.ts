import {debugLog} from './debug'

export type LocationState = {lat: number; lon: number; speed: number}
export type BatteryState = {
  pct: number
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

type LocationCb = (state: LocationState) => void
type BatteryCb = (state: BatteryState) => void

const fallbackCoords = {lat: 55.7558, lon: 37.6176}

let lastData: LocationState = {...fallbackCoords, speed: 0}
const subscribers: LocationCb[] = []
let watchId: number | null = null
let hasLocationData = false
let watching = false

const batterySubscribers: BatteryCb[] = []
let batteryLast: BatteryState | null = null
let batteryWatching = false

function notify(state: LocationState): void {
  lastData = state
  hasLocationData = true
  debugLog('geo', 'position packet accepted', 'ok', {
    lat: Number(state.lat.toFixed(5)),
    lon: Number(state.lon.toFixed(5)),
    speed: Math.round(state.speed),
  })
  for (const cb of subscribers) {
    try {
      cb(state)
    } catch (e) {
      console.error('Device subscriber error', e)
    }
  }
}

function notifyBattery(state: BatteryState): void {
  batteryLast = state
  for (const cb of batterySubscribers) {
    try {
      cb(state)
    } catch (e) {
      console.error('Device battery subscriber error', e)
    }
  }
}

function startFallback(): void {
  debugLog('geo', 'fallback coordinates engaged', 'warn', fallbackCoords)
  if (watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  notify({...fallbackCoords, speed: 0})
}

function startNativeWatch(): void {
  if (!navigator.geolocation) {
    debugLog('geo', 'navigator.geolocation missing', 'warn')
    startFallback()
    return
  }

  try {
    debugLog('geo', 'native watch armed')
    watchId = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const s = pos.coords.speed
        const speed = s && !Number.isNaN(s) ? s * 3.6 : 0
        notify({lat, lon, speed})
      },
      err => {
        console.warn('Geolocation error', err)
        debugLog('geo', 'native watch rejected', 'warn', {code: err.code, message: err.message})
        startFallback()
      },
      {enableHighAccuracy: true, maximumAge: 10000, timeout: 60000},
    )
  } catch (e) {
    console.warn('Geolocation watch failed', e)
    debugLog('geo', 'native watch exploded', 'error', e)
    startFallback()
  }
}

function watchLocation(cb: LocationCb): void {
  subscribers.push(cb)
  debugLog('geo', 'subscriber attached', 'info', {count: subscribers.length, hasLocationData})
  if (hasLocationData) cb(lastData)
  if (!watching) {
    watching = true
    startNativeWatch()
  }
}

function hasBatterySupport(): boolean {
  return 'getBattery' in navigator
}

function startBatteryWatch(): void {
  if (!hasBatterySupport()) return // getBattery is non-standard in TS lib types.
  ;(navigator as unknown as {getBattery: () => Promise<BatteryManagerLike>})
    .getBattery()
    .then(b => {
      const emit = () => {
        notifyBattery({
          pct: Math.round(b.level * 100),
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

function watchBattery(cb: BatteryCb): () => void {
  batterySubscribers.push(cb)
  if (batteryLast) cb(batteryLast)
  if (!batteryWatching) {
    batteryWatching = true
    startBatteryWatch()
  }

  return () => {
    const index = batterySubscribers.indexOf(cb)
    if (index !== -1) batterySubscribers.splice(index, 1)
  }
}

type BatteryManagerLike = {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
  addEventListener: (type: string, listener: () => void) => void
}

export const Device = {watchLocation, watchBattery, hasBatterySupport}
