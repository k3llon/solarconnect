// Vercel Serverless Function — Anthropic Claude proxy
// Hides the API key server-side and forwards the request.
// POST /api/claude  body: { model, messages, system, max_tokens }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY environment variable.'
    });
  }

  try {
    // Vercel parses JSON body automatically for POST when content-type is json
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');

    if (!Array.isArray(body.messages) || !body.messages.length) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    const payload = {
      model:      body.model      || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 2048,
      system:     body.system,
      messages:   body.messages
    };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[api/claude]', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
