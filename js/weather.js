// SolarConnect — Live Weather (OpenWeatherMap)
// Lädt aktuelles Wetter + 5-Tage-Vorhersage und übersetzt es ins App-Format.
// Fällt bei fehlendem Key / Offline auf CONTENT.weather (mock) zurück.

const Weather = {
  CACHE_KEY: 'owm_cache',
  CACHE_TTL: 30 * 60 * 1000,  // 30 Minuten
  GEO_KEY: 'owm_geo',

  apiKey() { return localStorage.getItem('owm_api_key') || ''; },

  // OWM-condition → interne Symbole (passend zu charts.weatherIcon)
  mapCondition(main, id) {
    if (id >= 200 && id < 300) return 'storm';
    if (id >= 300 && id < 600) return 'rain';
    if (id >= 600 && id < 700) return 'snow';
    if (id >= 700 && id < 800) return 'cloudy';
    if (id === 800) return 'sunny';
    if (id === 801) return 'partly_cloudy';
    if (id >= 802) return 'cloudy';
    return (main || 'sunny').toLowerCase();
  },

  solarPotentialFromClouds(cloudsPct) {
    if (cloudsPct < 20) return 'Hoch';
    if (cloudsPct < 60) return 'Mittel';
    return 'Niedrig';
  },

  solarPercentFromClouds(cloudsPct) {
    return Math.max(15, Math.round(100 - cloudsPct * 0.85));
  },

  germanDay(date) {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Heute';
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    return days[date.getDay()];
  },

  async geocode(community, state) {
    const cached = JSON.parse(localStorage.getItem(this.GEO_KEY) || 'null');
    const cacheKey = `${community}|${state}`;
    if (cached && cached.key === cacheKey) return cached.coords;

    const q = encodeURIComponent(`${community},${state},IN`);
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${this.apiKey()}`;
    const r = await fetch(url);
    if (!r.ok) throw this.humanError(r.status, 'Geocoding');
    const data = await r.json();
    if (!data.length) throw new Error(`Ort "${community}, ${state}" nicht gefunden. Prüfe die Schreibweise in den Einstellungen.`);
    const coords = { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
    localStorage.setItem(this.GEO_KEY, JSON.stringify({ key: cacheKey, coords }));
    return coords;
  },

  humanError(status, context = 'Wetter-API') {
    if (status === 401) return new Error('API-Key ungültig oder noch nicht aktiv. Neue OpenWeatherMap-Keys brauchen 1–2 Stunden bis sie funktionieren. Bitte später erneut versuchen.');
    if (status === 404) return new Error('Ort nicht gefunden. Bitte Dorf/Stadt in den Einstellungen prüfen.');
    if (status === 429) return new Error('Zu viele Anfragen — kostenloses Limit überschritten. Bitte später erneut versuchen.');
    if (status >= 500)  return new Error('OpenWeatherMap-Server hat ein Problem. Bitte später erneut versuchen.');
    return new Error(`${context} fehlgeschlagen (HTTP ${status})`);
  },

  // Aggregiert 3h-Schritte (OWM Free Forecast) zu Tagesvorhersage
  aggregateForecast(list) {
    const byDay = {};
    for (const item of list) {
      const d = new Date(item.dt * 1000);
      const key = d.toDateString();
      if (!byDay[key]) byDay[key] = { date: d, temps: [], clouds: [], conditions: [] };
      byDay[key].temps.push(item.main.temp);
      byDay[key].clouds.push(item.clouds.all);
      byDay[key].conditions.push({ main: item.weather[0].main, id: item.weather[0].id, hour: d.getHours() });
    }
    return Object.values(byDay).slice(0, 5).map(d => {
      const noon = d.conditions.reduce((best, c) =>
        Math.abs(c.hour - 12) < Math.abs(best.hour - 12) ? c : best, d.conditions[0]);
      const avgClouds = d.clouds.reduce((s, c) => s + c, 0) / d.clouds.length;
      return {
        day: this.germanDay(d.date),
        condition: this.mapCondition(noon.main, noon.id),
        high: Math.round(Math.max(...d.temps)),
        low: Math.round(Math.min(...d.temps)),
        solar: this.solarPercentFromClouds(avgClouds)
      };
    });
  },

  async fetchLive() {
    if (!this.apiKey()) throw new Error('Kein API-Key — bitte in Einstellungen speichern');
    if (!navigator.onLine) throw new Error('Offline');

    const community = (await db.getSetting('community_name')) || 'Khandala';
    const state = (await db.getSetting('state')) || 'Maharashtra';
    const coords = await this.geocode(community, state);

    const base = `lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey()}&units=metric&lang=de`;
    const [curR, fcR] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${base}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${base}`)
    ]);
    if (!curR.ok) throw this.humanError(curR.status, 'Wetter');
    if (!fcR.ok)  throw this.humanError(fcR.status, 'Vorhersage');
    const cur = await curR.json();
    const fc  = await fcR.json();

    const today = {
      temp: Math.round(cur.main.temp),
      condition: this.mapCondition(cur.weather[0].main, cur.weather[0].id),
      description: cur.weather[0].description,
      wind: Math.round((cur.wind?.speed || 0) * 3.6),
      humidity: cur.main.humidity,
      clouds: cur.clouds?.all || 0,
      solarPotential: this.solarPotentialFromClouds(cur.clouds?.all || 0),
      city: cur.name,
      sunrise: cur.sys?.sunrise,
      sunset: cur.sys?.sunset
    };
    const forecast = this.aggregateForecast(fc.list);

    const payload = { today, forecast, fetchedAt: Date.now(), city: coords.name };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(payload));
    return payload;
  },

  // Liefert immer verwendbare Daten: live → cache → mock
  async get() {
    try {
      const cached = JSON.parse(localStorage.getItem(this.CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.fetchedAt) < this.CACHE_TTL) {
        return { ...cached, source: 'cache' };
      }
      const fresh = await this.fetchLive();
      return { ...fresh, source: 'live' };
    } catch (err) {
      console.warn('[weather] Live-Daten nicht verfügbar:', err.message);
      const cached = JSON.parse(localStorage.getItem(this.CACHE_KEY) || 'null');
      if (cached) return { ...cached, source: 'cache-stale', error: err.message };
      return { today: CONTENT.weather.today, forecast: CONTENT.weather.forecast, source: 'mock', error: err.message };
    }
  },

  // Erzwingt eine Aktualisierung (z.B. nach Speichern eines neuen Keys)
  async refresh() {
    localStorage.removeItem(this.CACHE_KEY);
    return this.get();
  }
};
