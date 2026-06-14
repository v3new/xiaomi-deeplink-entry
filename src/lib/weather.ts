import {writable} from 'svelte/store'
import {Device} from './device'

const LOCATION_KEY = 'weather_location'
const WEATHER_KEY = 'weather_data'

const ICON_BASE = 'https://raw.githubusercontent.com/engperini/open-meteo-icons/main/icons'

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
  temperature: string
}

export const weatherState = writable<WeatherState>({
  forecast: [],
  iconUrl: '',
  locationColor: 'orange',
  locationName: '',
  temperature: '',
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
  if (!isRecord(value) || !isRecord(value.current_weather) || !isRecord(value.hourly)) return null

  const current = value.current_weather
  const hourly = value.hourly
  const isDay = current.is_day
  const hourlyIsDay = hourly.is_day

  if (
    typeof current.temperature !== 'number' ||
    typeof current.weathercode !== 'number' ||
    typeof current.time !== 'string' ||
    (isDay !== undefined && typeof isDay !== 'number' && typeof isDay !== 'boolean') ||
    !isStringArray(hourly.time) ||
    !isNumberArray(hourly.temperature_2m) ||
    !isNumberArray(hourly.weathercode) ||
    (hourlyIsDay !== undefined && !isNumberArray(hourlyIsDay))
  ) {
    return null
  }

  return {
    current_weather: {
      temperature: current.temperature,
      weathercode: current.weathercode,
      is_day: isDay,
      time: current.time,
    },
    hourly: {
      time: hourly.time,
      temperature_2m: hourly.temperature_2m,
      weathercode: hourly.weathercode,
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

function iconName(code: number, isDay: boolean): string {
  const icon = ICON_MAP[code]
  if (!icon) return '0d'
  return isDay ? icon.day : icon.night
}

function iconUrl(name: string): string {
  return `${ICON_BASE}/${name}.png`
}

function buildWeatherState(data: WeatherData): Pick<WeatherState, 'forecast' | 'iconUrl' | 'temperature'> {
  const current = data.current_weather
  const hourlyTimes = data.hourly.time
  const tempArr = data.hourly.temperature_2m
  const codeArr = data.hourly.weathercode
  const dayArr = data.hourly.is_day ?? []
  const currentIsDay = typeof current.is_day === 'boolean' ? current.is_day : current.is_day === 1

  const forecast: ForecastHour[] = []
  const nowIndex = hourlyTimes.indexOf(current.time)
  for (const hrs of [3, 6, 12, 24]) {
    const idx = nowIndex + hrs
    if (idx < 0 || idx >= hourlyTimes.length || idx >= tempArr.length || idx >= codeArr.length) continue

    const date = new Date(hourlyTimes[idx])
    if (Number.isNaN(date.getTime())) continue

    const isDay = dayArr[idx] !== undefined ? dayArr[idx] === 1 : date.getHours() >= 7 && date.getHours() <= 20
    forecast.push({
      iconUrl: iconUrl(iconName(codeArr[idx], isDay)),
      temp: `${Math.floor(tempArr[idx])}°`,
      time: date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    })
  }

  return {
    forecast,
    iconUrl: iconUrl(iconName(current.weathercode, currentIsDay)),
    temperature: `${Math.round(current.temperature)}°`,
  }
}

function updateWeather(data: WeatherData, store: boolean): void {
  weatherState.update(state => ({...state, ...buildWeatherState(data)}))
  if (store) writeStorage(WEATHER_KEY, JSON.stringify({ts: Date.now(), data}))
}

async function fetchWeather(lat: number, lon: number, store = true): Promise<void> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,is_day&forecast_days=2&timezone=auto`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Weather request failed: ${response.status}`)

    const data = parseWeatherData(await response.json())
    if (!data) throw new Error('Weather response has unexpected shape')
    updateWeather(data, store)
  } catch (e) {
    console.error('Weather error', e)
  }
}

function updateLocation(name: string, color: string): void {
  weatherState.update(state => ({...state, locationColor: color, locationName: name}))
}

async function fetchLocationName(lat: number, lon: number): Promise<string> {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`)
    if (!resp.ok) throw new Error(`Reverse geocode request failed: ${resp.status}`)

    const data: unknown = await resp.json()
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

function distKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function initWeather(): void {
  const storedWeather = parseJson(readStorage(WEATHER_KEY), parseStoredWeather)
  if (storedWeather) updateWeather(storedWeather.data, false)

  const savedLoc = parseJson(readStorage(LOCATION_KEY), parseStoredLocation)
  const loc = savedLoc ?? {lat: 55.7558, lon: 37.6176, name: 'Moscow'}

  updateLocation(loc.name, 'orange')
  void fetchWeather(loc.lat, loc.lon, !savedLoc)

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

    const name = await fetchLocationName(lat, lon)
    updateLocation(name, 'green')
    writeStorage(LOCATION_KEY, JSON.stringify({lat, lon, name}))

    void fetchWeather(lat, lon, true)
  })
}
