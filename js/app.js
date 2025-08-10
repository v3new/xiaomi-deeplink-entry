;(function () {
  const {
    loadVisibility,
    saveVisibility,
    loadOrder,
    saveOrder,
    isAppVisible,
    sortApps,
    tryOpenDeeplink,
    setupAutoReload,
    updateClock,
  } = window

  // Safe access to SERVICES regardless of whether it is bound to window
  const getServices = () => (typeof SERVICES !== 'undefined' ? SERVICES : window.SERVICES || {})

  // Toggle the settings panel display
  const toggleSettings = () => {
    const panel = document.getElementById('settingsPanel')
    const overlay = document.getElementById('settingsOverlay')
    const isOpen = panel.classList.contains('open')
    panel.classList.toggle('open')
    overlay.classList.toggle('active', !isOpen)
  }

  // Close the settings panel
  const closeSettings = () => {
    document.getElementById('settingsPanel').classList.remove('open')
    document.getElementById('settingsOverlay').classList.remove('active')
  }

  // Render a single application as a clickable button
  const renderApp = app => `
    <a class="app-button" data-action="open-app" data-id="${app.id}">
      <img src="${app.icon}" alt="${app.name}" class="app-icon" />
      ${app.name}
    </a>
  `

  // Render sections with services (main user interface)
  const renderSections = () => {
    const visibility = loadVisibility()
    const container = document.getElementById('sections')
    container.innerHTML = ''

    Object.entries(getServices()).forEach(([sectionName, apps]) => {
      let visibleApps = apps.filter(app => isAppVisible(app, visibility))
      visibleApps = sortApps(visibleApps)
      if (visibleApps.length === 0) return

      const appsHTML = visibleApps.map(renderApp).join('')
      container.innerHTML += `
        <div class="section">
          <h2 class="section-title">${sectionName}</h2>
          <div class="container">${appsHTML}</div>
        </div>
      `
    })
  }

  // Render the settings panel – a list of checkboxes with buttons for changing order
  const renderSettings = () => {
    const visibility = loadVisibility()
    const panel = document.getElementById('settingsPanel')
    panel.innerHTML = ''

    // Gather all services into a single array and sort them by the saved order
    let allApps = Object.values(getServices()).flat()
    allApps = sortApps(allApps)

    // Retrieve the saved order to determine positions
    const order = loadOrder()

    allApps.forEach((app, index) => {
      // If the application is not present in the order, add it to the end
      if (order.indexOf(app.id) === -1) order.push(app.id)

      // Disable the up/down buttons if the element is at the beginning or at the end
      const upDisabled = index === 0 ? 'disabled' : ''
      const downDisabled = index === allApps.length - 1 ? 'disabled' : ''

      panel.innerHTML += `
        <div class="setting-item" data-id="${app.id}">
          <label>
            <input type="checkbox" data-id="${app.id}" ${isAppVisible(app, visibility) ? 'checked' : ''}>
            ${app.name}
          </label>
          <div class="order-controls">
            <button ${upDisabled} data-action="move-up" data-id="${app.id}">↑</button>
            <button ${downDisabled} data-action="move-down" data-id="${app.id}">↓</button>
          </div>
        </div>
      `
    })

    // Save the updated order if new elements have been added
    saveOrder(order)
  }

  // Handler for toggling a service's visibility
  const onToggleService = input => {
    const visibility = loadVisibility()
    visibility[input.dataset.id] = input.checked
    saveVisibility(visibility)
    renderSections()
  }

  // Change the order of services by moving an element up or down
  const moveService = (id, direction) => {
    let order = loadOrder()
    const index = order.indexOf(id)
    if (index === -1) return // Safeguard

    if (direction === 'up' && index > 0) {
      ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
    } else if (direction === 'down' && index < order.length - 1) {
      ;[order[index], order[index + 1]] = [order[index + 1], order[index]]
    }
    saveOrder(order)
    renderSettings()
    renderSections()
  }

  // Initialize the interface
  const initializeInterface = () => {
    updateClock()
    renderSections()
    renderSettings()
    window.initWeather && window.initWeather()
    window.initBattery && window.initBattery()

    setInterval(updateClock, 5000)
    setupAutoReload && setupAutoReload()

    // Events & delegation
    const overlay = document.getElementById('settingsOverlay')
    if (overlay) overlay.addEventListener('click', closeSettings)

    const settingsToggle = document.querySelector('.settings-toggle')
    if (settingsToggle) settingsToggle.addEventListener('click', toggleSettings)

    const sectionsEl = document.getElementById('sections')
    if (sectionsEl) {
      sectionsEl.addEventListener('click', e => {
        const target = e.target.closest('[data-action="open-app"]')
        if (!target) return
        const id = target.getAttribute('data-id')
        const allApps = Object.values(getServices()).flat()
        const app = allApps.find(a => a.id === id)
        if (app) tryOpenDeeplink(app.scheme, app.path, app.package, app.fallbackUrl)
      })
    }

    const settingsPanel = document.getElementById('settingsPanel')
    if (settingsPanel) {
      settingsPanel.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]')
        if (!btn) return
        const action = btn.getAttribute('data-action')
        const id = btn.getAttribute('data-id')
        if (action === 'move-up') moveService(id, 'up')
        if (action === 'move-down') moveService(id, 'down')
      })

      settingsPanel.addEventListener('change', e => {
        const input = e.target
        if (input && input.matches('input[type="checkbox"][data-id]')) onToggleService(input)
      })
    }
  }

  window.initializeInterface = initializeInterface
})()
