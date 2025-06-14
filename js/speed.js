// 1) Парсеры и LERP
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const to2 = x => x.toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t)
  };
}

// 2) Основная функция обновления
function updateSpeed(speedKmh) {
  const root = document.documentElement;
  root.style.setProperty('--speed', speedKmh);

  const originals = ['#eec32d', '#ec4b4b', '#709ab9', '#4dffbf'].map(hexToRgb);
  const greenTarget  = hexToRgb('#4dffbf');
  const yellowTarget = hexToRgb('#eec32d');
  const redTarget    = hexToRgb('#ec4b4b');

  let t, target;

  if (speedKmh <= 5) {
    target = originals;
  } else if (speedKmh <= 60) {
    t = (speedKmh - 5) / (60 - 5);
    target = originals.map(c => lerpColor(c, greenTarget, t));
  } else if (speedKmh <= 80) {
    t = (speedKmh - 60) / (80 - 60);
    target = originals.map(c => lerpColor(greenTarget, yellowTarget, t));
  } else {
    t = Math.min((speedKmh - 80) / 20, 1);
    target = originals.map(c => lerpColor(yellowTarget, redTarget, t));
  }

  target.forEach((rgb, i) => {
    root.style.setProperty(`--stop${i+1}`, rgbToHex(rgb));
  });
}

// 3) Геолокация
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    position => {
      // position.coords.speed — в м/с, может быть null
      let speedMps = position.coords.speed;
      if (speedMps === null) {
        // если скорость недоступна, можно оставить прежний или сбросить до 0
        speedMps = 0;
      }
      const speedKmh = speedMps * 3.6;  // m/s → km/h
      updateSpeed(speedKmh);
    },
    err => {
      console.error('Geolocation error:', err.message);
      // при ошибке можно обновить скорость в 0
      updateSpeed(0);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
} else {
  console.warn('Geolocation API not supported, setting speed = 0');
  updateSpeed(0);
}
