;(function () {
  function updateClock() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const dateStr = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
    })
    const timeEl = document.getElementById('clockTime')
    const dateEl = document.getElementById('clockDate')
    if (timeEl) timeEl.textContent = timeStr
    if (dateEl) dateEl.textContent = dateStr
  }

  window.updateClock = updateClock
})()
