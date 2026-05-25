// Vercel Serverless Function — ThingSpeak proxy
// GET /api/sensor?results=20
// Returns raw ThingSpeak JSON (hides the read-key from the client).

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const channel = process.env.THINGSPEAK_CHANNEL || '3393403';
  const key     = process.env.THINGSPEAK_READ_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'Server is missing THINGSPEAK_READ_KEY environment variable.'
    });
  }

  const results = Math.min(parseInt(req.query.results || '20', 10) || 20, 200);
  const url = `https://api.thingspeak.com/channels/${channel}/feeds.json?api_key=${key}&results=${results}`;

  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    const text = await upstream.text();
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store, max-age=0');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[api/sensor]', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
