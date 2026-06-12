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

// Отложенный fallback для App-Link приложений: если приложение запустилось — вкладка
// уходит в фон (visibilitychange/pagehide/blur), и мы отменяем переход. Если за ~1.4с
// ничего не произошло (приложение не установлено / ссылка не поддержана) — открываем сайт.
function scheduleFallback(url) {
  let cancelled = false
  const cancel = () => {
    cancelled = true
  }
  const onVis = () => {
    if (document.hidden) cancel()
  }
  document.addEventListener('visibilitychange', onVis, {once: true})
  window.addEventListener('pagehide', cancel, {once: true})
  window.addEventListener('blur', cancel, {once: true})

  setTimeout(() => {
    if (!cancelled && !document.hidden) window.location.href = url
  }, 1400)
}

function tryOpenDeeplink(scheme, path, packageName, fallbackUrl) {
  const normalizedPath = (path || '').replace(/^\/+/, '')
  const hasScheme = Boolean(scheme)
  const hasPackage = Boolean(packageName)

  if (hasPackage) {
    // Определяем схему и host/path для intent-ссылки.
    //   • Есть кастомная схема (scheme) — используем её: scheme://<path>.
    //     Так работают приложения, регистрирующие browsable-схему (tg, spotify, fb, weixin…).
    //   • Схемы нет, но есть fallbackUrl — собираем intent на основе App Link (https://<домен>).
    //     Android App Links имеют в манифесте category=BROWSABLE, поэтому Chrome МОЖЕТ запустить
    //     приложение, если в intent явно указан package. Если приложение не установлено или
    //     не регистрирует этот домен — Chrome просто откроет сайт (тот же S.browser_fallback_url).
    //     Именно так запускаются ChatGPT, Claude, Gemini, Instagram и пр., у которых нет custom-схемы.
    let intentScheme = scheme
    let intentHostPath = normalizedPath
    let isAppLink = false

    if (!hasScheme && fallbackUrl) {
      try {
        const u = new URL(fallbackUrl)
        intentScheme = u.protocol.replace(/:$/, '') // https
        // host + путь. ВАЖНО: сохраняем хотя бы корневой "/", т.к. многие App-Link
        // фильтры объявлены через pathPrefix="/" и НЕ матчат пустой путь
        // (intent://chatgpt.com → не открывает, intent://chatgpt.com/ → открывает).
        intentHostPath = (u.host + (u.pathname || '/') + u.search).replace(/\/{2,}$/, '/')
        isAppLink = true
      } catch (_) {
        // невалидный URL — оставляем как есть (intent без схемы → откроется fallback)
      }
    }

    const intentParts = [
      `intent://${intentHostPath}#Intent`,
      intentScheme ? `scheme=${intentScheme}` : null,
      `package=${packageName}`,
      // S.browser_fallback_url добавляем ТОЛЬКО для кастомных схем (data — не http(s)).
      // Для App Link (data=https) встроенный fallback заставляет Chrome открыть сайт во
      // вкладке ПОВЕРХ уже запущенного приложения («приложение открылось, и тут же браузер»).
      // Поэтому для App Link используем отложенный JS-fallback ниже.
      fallbackUrl && !isAppLink ? `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)}` : null,
      'end',
    ]
    const intentUri = intentParts.filter(Boolean).join(';')

    if (isAppLink && fallbackUrl) scheduleFallback(fallbackUrl)
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
  // Через сколько простоя/зависания перезагружать страницу.
  const RELOAD_AFTER_SEC = 30 * 60

  // Ключевая идея: используем НАТИВНЫЙ <meta http-equiv="refresh">, а не JS-таймеры.
  // Браузер выполняет meta-refresh силами движка рендеринга, поэтому он сработает
  // ДАЖЕ если JS-поток завис (а именно это и есть причина «застывшей» страницы,
  // которую раньше приходилось обновлять вручную). На любое действие пользователя
  // мы пересоздаём meta-тег и тем самым сбрасываем нативный таймер — так что
  // во время активного использования перезагрузки не происходит.

  let metaEl = null

  const armMetaRefresh = () => {
    if (metaEl && metaEl.parentNode) metaEl.parentNode.removeChild(metaEl)
    metaEl = document.createElement('meta')
    metaEl.httpEquiv = 'refresh'
    // content="<сек>; url=..." — перезагрузка текущего адреса
    metaEl.content = `${RELOAD_AFTER_SEC}; url=${location.href}`
    document.head.appendChild(metaEl)
  }

  // Троттлим сброс, чтобы не дёргать DOM на каждое движение мыши.
  let lastArm = 0
  const resetActivity = () => {
    const now = Date.now()
    if (now - lastArm < 5_000) return
    lastArm = now
    armMetaRefresh()
  }

  ;['click', 'mousemove', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(eventName =>
    document.addEventListener(eventName, resetActivity, {passive: true}),
  )

  // При возврате к вкладке / восстановлении из BFCache переоружаем таймер.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) armMetaRefresh()
  })
  window.addEventListener('pageshow', armMetaRefresh)

  // Первичная установка таймера.
  armMetaRefresh()
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
