import {Hono} from 'hono'
import {serveStatic} from 'hono/bun'

const PORT = Number(process.env.PORT || 80)
const DIST_ROOT = './dist'
const INDEX_HTML = `${DIST_ROOT}/index.html`
const WEATHER_CACHE_MS = 5 * 60 * 1000
const WEATHER_TIMEOUT_MS = 12000

const weatherCache = new Map()

function jsonError(message, status) {
  return new Response(JSON.stringify({error: message}), {
    headers: {'content-type': 'application/json; charset=utf-8'},
    status,
  })
}

function parseCoord(value, min, max) {
  if (typeof value !== 'string' || value.trim() === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) return null
  return number
}

function weatherCacheKey(lat, lon) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

function weatherUrl(lat, lon) {
  const params = new URLSearchParams({
    current: 'temperature_2m,weather_code,is_day',
    forecast_days: '2',
    hourly: 'temperature_2m,weather_code,is_day',
    latitude: lat.toFixed(5),
    longitude: lon.toFixed(5),
    timezone: 'auto',
  })

  return `https://api.open-meteo.com/v1/forecast?${params}`
}

async function fetchWeather(lat, lon) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS)

  try {
    const response = await fetch(weatherUrl(lat, lon), {
      headers: {'user-agent': 'xiaomi-deeplink-entry/1.0'},
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`Open-Meteo failed: ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timeout)
  }
}

const app = new Hono()

app.get('/api/weather', async c => {
  const lat = parseCoord(c.req.query('lat') ?? c.req.query('latitude'), -90, 90)
  const lon = parseCoord(c.req.query('lon') ?? c.req.query('longitude'), -180, 180)

  if (lat === null || lon === null) return jsonError('Invalid lat/lon', 400)

  const key = weatherCacheKey(lat, lon)
  const cached = weatherCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return new Response(cached.body, {
      headers: {
        'cache-control': 'public, max-age=300',
        'content-type': 'application/json; charset=utf-8',
        'x-weather-cache': 'hit',
      },
    })
  }

  try {
    const body = await fetchWeather(lat, lon)
    weatherCache.set(key, {body, expiresAt: Date.now() + WEATHER_CACHE_MS})

    return new Response(body, {
      headers: {
        'cache-control': 'public, max-age=300',
        'content-type': 'application/json; charset=utf-8',
        'x-weather-cache': 'miss',
      },
    })
  } catch (error) {
    console.error('Weather proxy failed', error)
    return jsonError('Weather upstream failed', 502)
  }
})

app.use('*', serveStatic({root: DIST_ROOT}))

app.get('*', async c => {
  const file = Bun.file(INDEX_HTML)
  if (!(await file.exists())) return c.text('Build output not found. Run `bun run build` first.', 500)
  return new Response(file, {headers: {'content-type': 'text/html; charset=utf-8'}})
})

Bun.serve({
  fetch: app.fetch,
  hostname: '0.0.0.0',
  port: PORT,
})

console.log(`Server listening on :${PORT}`)
