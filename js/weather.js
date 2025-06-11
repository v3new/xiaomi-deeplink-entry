(function () {
  const LOCATION_KEY = 'weather_location';
  const WEATHER_KEY = 'weather_data';

  const ICON_MAP = {
    0: { day: '0d', night: '0n' },
    1: { day: '1d', night: '1n' },
    2: { day: '2d', night: '2n' },
    3: { day: '3d', night: '3n' },
    45: { day: '45d', night: '45n' },
    48: { day: '48d', night: '48n' },
    51: { day: '51d', night: '51n' },
    53: { day: '53d', night: '53n' },
    55: { day: '55d', night: '55n' },
    56: { day: '56d', night: '56n' },
    57: { day: '57d', night: '57n' },
    61: { day: '61d', night: '61n' },
    63: { day: '63d', night: '63n' },
    65: { day: '65d', night: '65n' },
    66: { day: '66d', night: '66n' },
    67: { day: '67d', night: '67n' },
    71: { day: '71d', night: '71n' },
    73: { day: '73d', night: '73n' },
    75: { day: '75d', night: '75n' },
    77: { day: '77d', night: '77n' },
    80: { day: '80d', night: '80n' },
    81: { day: '81d', night: '81n' },
    82: { day: '82d', night: '82n' },
    85: { day: '85d', night: '85n' },
    86: { day: '86d', night: '86n' },
    95: { day: '95d', night: '95n' },
    96: { day: '96d', night: '96n' },
    99: { day: '99d', night: '99n' },
  };

  const updateWeather = (data, store) => {
    const current = data.current_weather;
    const hourlyTimes = data.hourly.time;
    const tempArr = data.hourly.temperature_2m;
    const codeArr = data.hourly.weathercode;

    document.getElementById('weatherTemp').textContent =
      Math.round(current.temperature) + '°';
    const curIcon = ICON_MAP[current.weathercode];
    const curName = curIcon ? (current.is_day ? curIcon.day : curIcon.night) : '0d';
    document.getElementById('weatherIcon').src =
      `https://raw.githubusercontent.com/engperini/open-meteo-icons/main/icons/${curName}.png`;
    document.getElementById('weatherIcon').style.display = 'block';

    const nowIndex = hourlyTimes.indexOf(current.time);
    let forecastHTML = '';
    const OFFSETS = [3, 6, 12, 24];
    OFFSETS.forEach((hrs) => {
      const idx = nowIndex + hrs;
      if (idx >= hourlyTimes.length) return;
      const date = new Date(hourlyTimes[idx]);
      const time = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const t = Math.floor(tempArr[idx]);
      const code = codeArr[idx];
      const icon = ICON_MAP[code];
      const name = icon ? icon.day : '0d';
      forecastHTML += `<div class="hour"><img src="https://raw.githubusercontent.com/engperini/open-meteo-icons/main/icons/${name}.png" alt=""/><span>${time}</span><span>${t}°</span></div>`;
    });
    document.getElementById('weatherForecast').innerHTML = forecastHTML;
    if (store) {
      localStorage.setItem(WEATHER_KEY, JSON.stringify({ ts: Date.now(), data }));
    }
  };

  const fetchWeather = (lat, lon, store = true) => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&forecast_days=2&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => updateWeather(d, store))
      .catch((e) => console.error('Weather error', e));
  };

  const updateLocation = (name, color) => {
    document.getElementById('weatherPlace').textContent = name;
    document.getElementById('locationDot').style.backgroundColor = color;
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`
      );
      const data = await resp.json();
      const addr = data.address || {};
      return addr.city || addr.town || addr.village || addr.county || '';
    } catch (e) {
      console.error('Reverse geocode error', e);
      return '';
    }
  };

  const initWeather = () => {
    // Show stored weather data first
    const storedW = localStorage.getItem(WEATHER_KEY);
    if (storedW) {
      try {
        const w = JSON.parse(storedW);
        if (w && w.data) updateWeather(w.data, false);
      } catch (e) {}
    }

    let loc = null;
    const savedLoc = localStorage.getItem(LOCATION_KEY);
    if (savedLoc) {
      try {
        loc = JSON.parse(savedLoc);
      } catch (e) {
        loc = null;
      }
    }

    if (loc) {
      updateLocation(loc.name, 'orange');
      fetchWeather(loc.lat, loc.lon, false);
    } else {
      loc = { lat: 55.7558, lon: 37.6176, name: 'Moscow' };
      updateLocation(loc.name, 'orange');
      fetchWeather(loc.lat, loc.lon, false);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const name = await fetchLocationName(lat, lon);
          updateLocation(name, 'green');
          fetchWeather(lat, lon, true);
          localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lon, name }));
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  window.initWeather = initWeather;
})();
