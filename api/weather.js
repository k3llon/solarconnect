// Vercel Serverless Function — OpenWeatherMap proxy
// GET /api/weather?community=Khandala&state=Maharashtra
// Returns: { today, forecast, city, fetchedAt }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing OWM_API_KEY environment variable.'
    });
  }

  const community = (req.query.community || 'Khandala').toString();
  const state     = (req.query.state     || 'Maharashtra').toString();

  try {
    // 1. Geocode
    const geoQ = encodeURIComponent(`${community},${state},IN`);
    const geoR = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${geoQ}&limit=1&appid=${apiKey}`
    );
    if (!geoR.ok) {
      const t = await geoR.text();
      return res.status(geoR.status).json({ error: `Geocoding failed: ${t}` });
    }
    const geo = await geoR.json();
    if (!geo.length) {
      return res.status(404).json({ error: `Location "${community}, ${state}" not found.` });
    }
    const { lat, lon, name } = geo[0];

    // 2. Parallel: current + forecast
    const base = `lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;
    const [curR, fcR] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${base}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${base}`)
    ]);
    if (!curR.ok || !fcR.ok) {
      return res.status(502).json({ error: `Upstream error ${curR.status}/${fcR.status}` });
    }
    const cur = await curR.json();
    const fc  = await fcR.json();

    const today = {
      temp:        Math.round(cur.main.temp),
      condition:   mapCondition(cur.weather[0].main, cur.weather[0].id),
      description: cur.weather[0].description,
      wind:        Math.round((cur.wind?.speed || 0) * 3.6),
      humidity:    cur.main.humidity,
      clouds:      cur.clouds?.all || 0,
      solarPotential: solarPotential(cur.clouds?.all || 0),
      city:        cur.name,
      sunrise:     cur.sys?.sunrise,
      sunset:      cur.sys?.sunset
    };

    const forecast = aggregateForecast(fc.list);

    res.setHeader('cache-control', 's-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json({
      today, forecast,
      city: name,
      fetchedAt: Date.now()
    });
  } catch (err) {
    console.error('[api/weather]', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

function mapCondition(main, id) {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'cloudy';
  if (id === 800) return 'sunny';
  if (id === 801) return 'partly_cloudy';
  if (id >= 802) return 'cloudy';
  return (main || 'sunny').toLowerCase();
}

function solarPotential(cloudsPct) {
  if (cloudsPct < 20) return 'Hoch';
  if (cloudsPct < 60) return 'Mittel';
  return 'Niedrig';
}

function germanDay(date) {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Heute';
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
  return days[date.getDay()];
}

function aggregateForecast(list) {
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
      day: germanDay(d.date),
      condition: mapCondition(noon.main, noon.id),
      high: Math.round(Math.max(...d.temps)),
      low:  Math.round(Math.min(...d.temps)),
      solar: Math.max(15, Math.round(100 - avgClouds * 0.85))
    };
  });
}
