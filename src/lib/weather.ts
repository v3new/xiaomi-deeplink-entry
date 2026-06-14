import {writable} from 'svelte/store'
import {Device} from './device'

const LOCATION_KEY = 'weather_location'
const WEATHER_KEY = 'weather_data'

const WEATHER_TIMEOUT_MS = 15000
const GEOCODE_TIMEOUT_MS = 5000
const WEATHER_RETRY_DELAY_MS = 1500

const ICON_BASE = '/weather-icons'

const ICON_MAP: Record<number, {day: string; night: string}> = {
  0: {day: '0d', night: '0n'},
  1: {day: '1d', night: '1n'},
  2: {day: '2d', night: '2n'},
  3: {day: '3d', night: '3n'},
  45: {day: '45d', night: '45n'},
  48: {day: '48d', night: '48n'},
  51: {day: '51d', night: '51n'},
  53: {day: '53d', night: '53n'},
  55: {day: '55d', night: '55n'},
  56: {day: '56d', night: '56n'},
  57: {day: '57d', night: '57n'},
  61: {day: '61d', night: '61n'},
  63: {day: '63d', night: '63n'},
  65: {day: '65d', night: '65n'},
  66: {day: '66d', night: '66n'},
  67: {day: '67d', night: '67n'},
  71: {day: '71d', night: '71n'},
  73: {day: '73d', night: '73n'},
  75: {day: '75d', night: '75n'},
  77: {day: '77d', night: '77n'},
  80: {day: '80d', night: '80n'},
  81: {day: '81d', night: '81n'},
  82: {day: '82d', night: '82n'},
  85: {day: '85d', night: '85n'},
  86: {day: '86d', night: '86n'},
  95: {day: '95d', night: '95n'},
  96: {day: '96d', night: '96n'},
  99: {day: '99d', night: '99n'},
}

type CurrentWeather = {
  temperature: number
  weathercode: number
  is_day?: number | boolean
  time: string
}

type HourlyWeather = {
  time: string[]
  temperature_2m: number[]
  weathercode: number[]
  is_day?: number[]
}

type WeatherData = {
  current_weather: CurrentWeather
  hourly: HourlyWeather
}

type StoredWeather = {data: WeatherData}
type StoredLocation = {lat: number; lon: number; name: string}

export type ForecastHour = {
  iconUrl: string
  temp: string
  time: string
}

export type WeatherState = {
  forecast: ForecastHour[]
  iconUrl: string
  locationColor: string
  locationName: string
  statusText: string
  temperature: string
}

export const weatherState = writable<WeatherState>({
  forecast: [],
  iconUrl: weatherIconUrl(2, true),
  locationColor: 'orange',
  locationName: '',
  statusText: 'Loading',
  temperature: '--°',
})

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn('Weather storage read failed', e)
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.warn('Weather storage write failed', e)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(item => typeof item === 'number')
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function parseWeatherData(value: unknown): WeatherData | null {
  if (!isRecord(value) || !isRecord(value.hourly)) return null

  const current = isRecord(value.current)
    ? value.current
    : isRecord(value.current_weather)
      ? value.current_weather
      : null
  if (!current) return null

  const currentTemperature = current.temperature_2m ?? current.temperature
  const currentWeatherCode = current.weather_code ?? current.weathercode
  const hourly = value.hourly
  const isDay = current.is_day
  const hourlyWeatherCode = hourly.weather_code ?? hourly.weathercode
  const hourlyIsDay = hourly.is_day

  if (
    typeof currentTemperature !== 'number' ||
    typeof currentWeatherCode !== 'number' ||
    typeof current.time !== 'string' ||
    (isDay !== undefined && typeof isDay !== 'number' && typeof isDay !== 'boolean') ||
    !isStringArray(hourly.time) ||
    !isNumberArray(hourly.temperature_2m) ||
    !isNumberArray(hourlyWeatherCode) ||
    (hourlyIsDay !== undefined && !isNumberArray(hourlyIsDay))
  ) {
    return null
  }

  return {
    current_weather: {
      temperature: currentTemperature,
      weathercode: currentWeatherCode,
      is_day: isDay,
      time: current.time,
    },
    hourly: {
      time: hourly.time,
      temperature_2m: hourly.temperature_2m,
      weathercode: hourlyWeatherCode,
      is_day: hourlyIsDay,
    },
  }
}

function parseStoredWeather(value: unknown): StoredWeather | null {
  if (!isRecord(value)) return null
  const data = parseWeatherData(value.data)
  return data ? {data} : null
}

function parseStoredLocation(value: unknown): StoredLocation | null {
  if (!isRecord(value)) return null
  const {lat, lon, name} = value
  if (typeof lat !== 'number' || typeof lon !== 'number' || typeof name !== 'string') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return {lat, lon, name}
}

function parseJson<T>(raw: string | null, parse: (value: unknown) => T | null): T | null {
  if (!raw) return null
  try {
    return parse(JSON.parse(raw))
  } catch (_e) {
    return null
  }
}

async function fetchJson(url: string, label: string, timeoutMs: number): Promise<unknown> {
  if (typeof AbortController === 'undefined') {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${label} failed: ${response.status}`)
    return response.json()
  }

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {signal: controller.signal})
    if (!response.ok) throw new Error(`${label} failed: ${response.status}`)
    return response.json()
  } finally {
    window.clearTimeout(timer)
  }
}

function weatherIconUrl(code: number, isDay: boolean): string {
  const icon = ICON_MAP[code]
  const name = icon ? (isDay ? icon.day : icon.night) : '0d'
  return `${ICON_BASE}/${name}.png`
}

function findCurrentHourIndex(hourlyTimes: string[], currentTime: string): number {
  const exactIndex = hourlyTimes.indexOf(currentTime)
  if (exactIndex !== -1) return exactIndex

  const currentDate = new Date(currentTime)
  const currentMs = currentDate.getTime()
  if (Number.isNaN(currentMs)) return -1

  let closestPastIndex = -1
  let closestPastMs = Number.NEGATIVE_INFINITY

  for (let i = 0; i < hourlyTimes.length; i += 1) {
    const hourlyMs = new Date(hourlyTimes[i]).getTime()
    if (Number.isNaN(hourlyMs)) continue
    if (hourlyMs <= currentMs && hourlyMs > closestPastMs) {
      closestPastIndex = i
      closestPastMs = hourlyMs
    }
  }

  return closestPastIndex
}

function buildWeatherState(data: WeatherData): Pick<WeatherState, 'forecast' | 'iconUrl' | 'temperature'> {
  const current = data.current_weather
  const hourlyTimes = data.hourly.time
  const tempArr = data.hourly.temperature_2m
  const codeArr = data.hourly.weathercode
  const dayArr = data.hourly.is_day ?? []
  const currentDate = new Date(current.time)
  const currentHour = currentDate.getHours()
  const currentIsDay =
    typeof current.is_day === 'boolean'
      ? current.is_day
      : typeof current.is_day === 'number'
        ? current.is_day === 1
        : !Number.isNaN(currentDate.getTime()) && currentHour >= 7 && currentHour <= 20

  const forecast: ForecastHour[] = []
  const nowIndex = findCurrentHourIndex(hourlyTimes, current.time)
  for (const hrs of [3, 6, 12, 24]) {
    const idx = nowIndex + hrs
    if (idx < 0 || idx >= hourlyTimes.length || idx >= tempArr.length || idx >= codeArr.length) continue

    const date = new Date(hourlyTimes[idx])
    if (Number.isNaN(date.getTime())) continue

    const isDay = dayArr[idx] !== undefined ? dayArr[idx] === 1 : date.getHours() >= 7 && date.getHours() <= 20
    forecast.push({
      iconUrl: weatherIconUrl(codeArr[idx], isDay),
      temp: `${Math.floor(tempArr[idx])}°`,
      time: date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    })
  }

  return {
    forecast,
    iconUrl: weatherIconUrl(current.weathercode, currentIsDay),
    temperature: `${Math.round(current.temperature)}°`,
  }
}

function updateWeather(data: WeatherData, store: boolean): void {
  weatherState.update(state => ({...state, ...buildWeatherState(data), statusText: ''}))
  if (store) writeStorage(WEATHER_KEY, JSON.stringify({ts: Date.now(), data}))
}

async function fetchWeather(lat: number, lon: number, store = true): Promise<void> {
  const requestId = ++weatherRequestId
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&forecast_days=2&timezone=auto`

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await new Promise(resolve => window.setTimeout(resolve, WEATHER_RETRY_DELAY_MS))
    if (requestId !== weatherRequestId) return

    try {
      const data = parseWeatherData(await fetchJson(url, 'Weather request', WEATHER_TIMEOUT_MS))
      if (!data) throw new Error('Weather response has unexpected shape')
      if (requestId !== weatherRequestId) return
      updateWeather(data, store)
      return
    } catch (e) {
      console.error('Weather error', e)
    }
  }

  if (requestId !== weatherRequestId) return
  weatherState.update(state => (state.statusText ? {...state, statusText: 'No data'} : state))
}

function updateLocation(name: string, color: string): void {
  weatherState.update(state => ({...state, locationColor: color, locationName: name}))
}

async function fetchLocationName(lat: number, lon: number): Promise<string> {
  try {
    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`,
      'Reverse geocode request',
      GEOCODE_TIMEOUT_MS,
    )
    const addr = isRecord(data) && isRecord(data.address) ? data.address : {}
    const name = addr.suburb ?? addr.city ?? addr.town ?? addr.village ?? addr.county
    return typeof name === 'string' ? name : ''
  } catch (e) {
    console.error('Reverse geocode error', e)
    return ''
  }
}

const EARTH_RADIUS_KM = 6371
const DIST_THRESHOLD_KM = 1
const MAX_UPDATES = 10
const WINDOW_MS = 10 * 60 * 1000

let initialized = false
let weatherRequestId = 0

function distKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function initWeather(): void {
  if (initialized) return
  initialized = true

  const storedWeather = parseJson(readStorage(WEATHER_KEY), parseStoredWeather)
  if (storedWeather) updateWeather(storedWeather.data, false)

  const savedLoc = parseJson(readStorage(LOCATION_KEY), parseStoredLocation)
  const loc = savedLoc ?? {lat: 55.7558, lon: 37.6176, name: 'Moscow'}

  updateLocation(loc.name, 'orange')
  void fetchWeather(loc.lat, loc.lon, true)

  let lastCoords = {lat: loc.lat, lon: loc.lon}
  let updateTimes: number[] = []

  Device.watchLocation(async pos => {
    const now = Date.now()
    const {lat, lon} = pos
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
    if (lat === lastCoords.lat && lon === lastCoords.lon) return

    const distance = distKm(lastCoords.lat, lastCoords.lon, lat, lon)
    if (distance < DIST_THRESHOLD_KM) return

    updateTimes = updateTimes.filter(ts => now - ts < WINDOW_MS)
    if (updateTimes.length >= MAX_UPDATES) return

    updateTimes.push(now)
    lastCoords = {lat, lon}

    void fetchWeather(lat, lon, true)

    const name = await fetchLocationName(lat, lon)
    const locationName = name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    updateLocation(locationName, 'green')
    writeStorage(LOCATION_KEY, JSON.stringify({lat, lon, name: locationName}))
  })
}
