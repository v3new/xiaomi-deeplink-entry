export function fmtTime(secs: number): string {
  if (!Number.isFinite(secs) || secs <= 0) return ''
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// Отложенный fallback для App-Link приложений: если приложение запустилось — вкладка
// уходит в фон (visibilitychange/pagehide/blur), и мы отменяем переход. Если за ~1.4с
// ничего не произошло (приложение не установлено / ссылка не поддержана) — открываем сайт.
function scheduleFallback(url: string): void {
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

export function tryOpenDeeplink(scheme?: string, path?: string, packageName?: string, fallbackUrl?: string): void {
  const normalizedPath = (path || '').replace(/^\/+/, '')
  const hasScheme = Boolean(scheme)
  const hasPackage = Boolean(packageName)

  if (hasPackage) {
    // Определяем схему и host/path для intent-ссылки.
    //   • Есть кастомная схема (scheme) — используем её: scheme://<path>.
    //   • Схемы нет, но есть fallbackUrl — собираем intent на основе App Link (https://<домен>).
    let intentScheme = scheme
    let intentHostPath = normalizedPath
    let isAppLink = false

    if (!hasScheme && fallbackUrl) {
      try {
        const u = new URL(fallbackUrl)
        intentScheme = u.protocol.replace(/:$/, '') // https
        // host + путь. ВАЖНО: сохраняем хотя бы корневой "/", т.к. многие App-Link
        // фильтры объявлены через pathPrefix="/" и НЕ матчат пустой путь.
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
