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

const VISIBILITY_STORAGE_KEY = 'visible_services'
const STORAGE_ORDER_KEY = 'services_order'

function loadVisibility() {
  const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
  if (!saved) return {}
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('Error parsing visibility data', error)
    return {}
  }
}

function saveVisibility(state) {
  localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(state))
}

function loadOrder() {
  const saved = localStorage.getItem(STORAGE_ORDER_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error('Error parsing order data', error)
    return []
  }
}

function saveOrder(order) {
  localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(order))
}

function isAppVisible(app, visibility) {
  return app.id in visibility ? visibility[app.id] : Boolean(app.showOnLaunch)
}

function sortApps(apps) {
  const order = loadOrder()
  return apps.slice().sort((a, b) => {
    const idxA = order.indexOf(a.id)
    const idxB = order.indexOf(b.id)
    if (idxA === -1 && idxB === -1) return 0
    if (idxA === -1) return 1
    if (idxB === -1) return -1
    return idxA - idxB
  })
}

function fmtTime(secs) {
  if (!isFinite(secs) || secs <= 0) return ''
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h > 0 ? `${h}ч ${m}м` : `${m}м`
}

function tryOpenDeeplink(scheme, path, packageName, fallbackUrl) {
  const normalizedPath = (path || '').replace(/^\/+/, '')
  const hasScheme = Boolean(scheme)
  const hasPackage = Boolean(packageName)

  if (hasPackage) {
    const intentParts = [
      `intent://${normalizedPath}#Intent`,
      hasScheme ? `scheme=${scheme}` : null,
      `package=${packageName}`,
      fallbackUrl ? `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)}` : null,
      'end',
    ]
    const intentUri = intentParts.filter(Boolean).join(';')
    window.location.href = intentUri
    return
  }

  if (hasScheme) {
    const deepLinkUrl = normalizedPath ? `${scheme}://${normalizedPath}` : `${scheme}://`
    window.location.href = deepLinkUrl
    return
  }

  if (fallbackUrl) window.location.href = fallbackUrl
}

function setupAutoReload() {
  const RELOAD_AFTER_MS = 20 * 60 * 1000
  const STORAGE_KEY_LAST_ACTIVE = 'auto_reload_last_active_ts'

  let timeoutId = null
  let intervalId = null

  const getLastActiveTs = () => {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE)
    const parsed = raw ? parseInt(raw, 10) : NaN
    return Number.isFinite(parsed) ? parsed : Date.now()
  }

  const setLastActiveTs = (ts = Date.now()) => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, String(ts))
    } catch (_) {
      // ignore storage errors
    }
    return ts
  }

  const shouldReload = () => Date.now() - getLastActiveTs() >= RELOAD_AFTER_MS

  const scheduleCheck = () => {
    clearTimeout(timeoutId)
    // Планируем следующий тик не реже, чем раз в минуту, чтобы обойти жёсткое троттлинг таймеров в фоне
    const remaining = RELOAD_AFTER_MS - (Date.now() - getLastActiveTs())
    const delay = Math.max(0, Math.min(60_000, remaining))
    timeoutId = setTimeout(() => {
      if (shouldReload()) {
        location.reload()
      } else {
        scheduleCheck()
      }
    }, delay)
  }

  const resetActivity = () => {
    setLastActiveTs()
    scheduleCheck()
  }

  ;['click', 'mousemove', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(eventName =>
    document.addEventListener(eventName, resetActivity, {passive: true}),
  )

  // При возвращении к вкладке или восстановлении из BFCache — сразу проверяем и при необходимости перезагружаем
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (shouldReload()) {
        location.reload()
      } else {
        scheduleCheck()
      }
    }
  })

  window.addEventListener('pageshow', () => {
    if (shouldReload()) {
      location.reload()
    } else {
      scheduleCheck()
    }
  })

  // Доп. страховка: раз в минуту проверяем по реальному времени
  intervalId = setInterval(() => {
    if (shouldReload()) location.reload()
  }, 60_000)

  // Отчистка при уходе со страницы
  window.addEventListener('pagehide', () => {
    clearTimeout(timeoutId)
    clearInterval(intervalId)
  })

  resetActivity()
}

window.loadVisibility = loadVisibility
window.saveVisibility = saveVisibility
window.loadOrder = loadOrder
window.saveOrder = saveOrder
window.isAppVisible = isAppVisible
window.sortApps = sortApps
window.fmtTime = fmtTime
window.tryOpenDeeplink = tryOpenDeeplink
window.setupAutoReload = setupAutoReload
