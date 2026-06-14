export function setupAutoReload(): void {
  // Через сколько простоя/зависания перезагружать страницу.
  const RELOAD_AFTER_SEC = 30 * 60

  // Используем НАТИВНЫЙ <meta http-equiv="refresh">, а не JS-таймеры. Браузер выполняет
  // meta-refresh силами движка рендеринга, поэтому он сработает ДАЖЕ если JS-поток завис.
  // На любое действие пользователя пересоздаём meta-тег и сбрасываем нативный таймер.
  let metaEl: HTMLMetaElement | null = null

  const armMetaRefresh = () => {
    if (metaEl?.parentNode) metaEl.parentNode.removeChild(metaEl)
    metaEl = document.createElement('meta')
    metaEl.httpEquiv = 'refresh'
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

  for (const eventName of ['click', 'mousemove', 'keydown', 'touchstart', 'wheel', 'scroll']) {
    document.addEventListener(eventName, resetActivity, {passive: true})
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) armMetaRefresh()
  })
  window.addEventListener('pageshow', armMetaRefresh)

  armMetaRefresh()
}
