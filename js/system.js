(function () {
  const state = {
    speed: null,
    coords: null,
    orientation: { alpha: null, beta: null, gamma: null },
    motion: { acceleration: null, accelerationIncludingGravity: null, rotationRate: null },
    battery: null,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection || null,
    lastUpdated: null,
  };

  const statusBar = () => document.getElementById('statusBar');
  const debugContent = () => document.getElementById('debugContent');
  const debugTimestamp = () => document.getElementById('debugTimestamp');

  const toCardinal = (deg) => {
    if (deg == null || isNaN(deg)) return '--';
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const signalBars = (downlink) => {
    if (downlink == null) return '';
    const v = parseFloat(downlink);
    const bars = v >= 20 ? 4 : v >= 10 ? 3 : v >= 2 ? 2 : v >= 0.5 ? 1 : 0;
    return '📶'.repeat(bars);
  };

  const updateStatusBar = () => {
    const spd = state.speed;
    const speedKmh = spd == null || isNaN(spd) ? '--' : Math.round(spd * 3.6);
    const dir = toCardinal(state.orientation.alpha);
    const bat = state.battery ? Math.round(state.battery.level * 100) + '%' : '--%';
    const charge = state.battery && state.battery.charging ? '⚡️' : '';
    const connType = state.connection && state.connection.effectiveType ? state.connection.effectiveType : '--';
    const signal = signalBars(state.connection && state.connection.downlink);
    const el = statusBar();
    if (el)
      el.innerHTML = `<span>${speedKmh} km/h</span><span>${dir}</span><span>${bat}</span><span>${charge}</span><span>${connType}</span><span>${signal}</span>`;
  };

  const refreshDebug = () => {
    const c = state.coords || {};
    const b = state.battery || {};
    const n = state.connection || {};
    const o = state.orientation || {};
    const m = state.motion || {};
    const lines = [];
    lines.push('<div class="debug-section"><strong>Geolocation</strong><br>' +
      `Lat: ${c.latitude ?? '--'}<br>`+
      `Lon: ${c.longitude ?? '--'}<br>`+
      `Speed: ${c.speed ? (c.speed*3.6).toFixed(1) : '--'} km/h<br>`+
      `Accuracy: ${c.accuracy ?? '--'}<br>`+
      `Altitude: ${c.altitude ?? '--'}<br>`+
      `Heading: ${c.heading ?? '--'}`+
      '</div>');
    lines.push('<div class="debug-section"><strong>Battery</strong><br>'+
      `level: ${b.level ?? '--'}<br>`+
      `charging: ${b.charging ?? '--'}<br>`+
      `chargingTime: ${b.chargingTime ?? '--'}<br>`+
      `dischargingTime: ${b.dischargingTime ?? '--'}`+
      '</div>');
    lines.push('<div class="debug-section"><strong>Network</strong><br>'+
      `effectiveType: ${n.effectiveType ?? '--'}<br>`+
      `downlink: ${n.downlink ?? '--'}<br>`+
      `rtt: ${n.rtt ?? '--'}<br>`+
      `saveData: ${n.saveData ?? '--'}`+
      '</div>');
    lines.push('<div class="debug-section"><strong>Orientation</strong><br>'+
      `alpha: ${o.alpha ?? '--'}<br>`+
      `beta: ${o.beta ?? '--'}<br>`+
      `gamma: ${o.gamma ?? '--'}`+
      '</div>');
    lines.push('<div class="debug-section"><strong>Motion</strong><br>'+
      `acceleration: ${JSON.stringify(m.acceleration) ?? '--'}<br>`+
      `accel+grav: ${JSON.stringify(m.accelerationIncludingGravity) ?? '--'}<br>`+
      `rotationRate: ${JSON.stringify(m.rotationRate) ?? '--'}`+
      '</div>');
    if (debugContent()) debugContent().innerHTML = lines.join('\n');
    const ts = new Date().toLocaleTimeString();
    state.lastUpdated = ts;
    if (debugTimestamp()) debugTimestamp().textContent = `Updated: ${ts}`;
  };

  const openDebug = () => {
    document.getElementById('debugPanel').classList.add('open');
    document.getElementById('debugOverlay').classList.add('active');
    refreshDebug();
  };

  const closeDebug = () => {
    document.getElementById('debugPanel').classList.remove('open');
    document.getElementById('debugOverlay').classList.remove('active');
  };

  const toggleDebug = () => {
    const panel = document.getElementById('debugPanel');
    panel.classList.contains('open') ? closeDebug() : openDebug();
  };

  const init = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        state.speed = pos.coords.speed;
        state.coords = pos.coords;
        updateStatusBar();
      }, () => {}, { enableHighAccuracy: true });
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        state.orientation = { alpha: e.alpha, beta: e.beta, gamma: e.gamma };
      });
    }
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (e) => {
        state.motion = {
          acceleration: e.acceleration,
          accelerationIncludingGravity: e.accelerationIncludingGravity,
          rotationRate: e.rotationRate,
        };
      });
    }
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        state.battery = b;
        ['levelchange','chargingchange','chargingtimechange','dischargingtimechange'].forEach(ev => b.addEventListener(ev, updateStatusBar));
        updateStatusBar();
      });
    }
    if (state.connection && state.connection.addEventListener) {
      state.connection.addEventListener('change', updateStatusBar);
    }
    updateStatusBar();
    setInterval(updateStatusBar, 3000);
  };

  document.addEventListener('DOMContentLoaded', init);
  window.toggleDebug = toggleDebug;
  window.refreshDebug = refreshDebug;
})();
