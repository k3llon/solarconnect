// SolarConnect — Live Sensor Integration (ThingSpeak)
// Photo-resistor reads brightness, mapped to a virtual solar panel:
//   30  = very bright → max power
//   900 = very dark   → 0 power
//   < 30 → sensor fault

const SENSOR = {
  // Goes through the Vercel serverless proxy in production AND local dev
  // (locally falls back to direct ThingSpeak if /api/sensor is not available).
  PROXY: '/api/sensor',
  FALLBACK: 'https://api.thingspeak.com/channels/3393403/feeds.json?api_key=VXF11H3Z3KTRFLM8',

  // Mapping bounds — defines the "solar" semantics
  BRIGHT: 30,           // anything <= this is full power
  DARK: 900,            // anything >= this is zero power
  FAULT: 30,            // strictly less than this → sensor fault
  PEAK_WATTS: 1000,     // virtual peak panel rating
  POLL_MS: 20000,       // 20 s refresh

  _timer: null,
  _useFallback: false,
  last: null,

  // ---- Fetch ----
  async fetchLatest(n = 20) {
    let json;
    if (!this._useFallback) {
      try {
        const r = await fetch(`${this.PROXY}?results=${n}`, { cache: 'no-store' });
        if (r.ok) {
          json = await r.json();
        } else if (r.status === 404) {
          // No serverless function available (e.g. plain static server) → fallback
          this._useFallback = true;
        } else {
          throw new Error('Proxy HTTP ' + r.status);
        }
      } catch (err) {
        // network or other → try fallback once
        console.warn('[sensor] proxy failed, falling back:', err.message);
        this._useFallback = true;
      }
    }
    if (this._useFallback) {
      const r = await fetch(`${this.FALLBACK}&results=${n}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('ThingSpeak HTTP ' + r.status);
      json = await r.json();
    }
    const feeds = (json.feeds || []).filter(f => f.field1 != null);
    if (!feeds.length) throw new Error('No feed data');

    const latest = feeds[feeds.length - 1];
    const value = parseFloat(latest.field1);
    const data = this._classify(value, latest.created_at);

    // Lightweight history for sparkline (last 20 mapped values, in W)
    data.history = feeds.map(f => {
      const v = parseFloat(f.field1);
      if (isNaN(v)) return 0;
      if (v < this.FAULT) return 0;
      return this._toWatts(v);
    });

    // Per-feed timestamps so we can compute "today kWh" roughly
    data.feeds = feeds.map(f => ({
      ts: new Date(f.created_at).getTime(),
      value: parseFloat(f.field1),
      watts: parseFloat(f.field1) < this.FAULT ? 0 : this._toWatts(parseFloat(f.field1))
    }));

    this.last = data;
    return data;
  },

  _classify(value, createdAt) {
    const ts = createdAt ? new Date(createdAt).getTime() : Date.now();
    if (isNaN(value)) {
      return { value: null, status: 'fault', watts: 0, kwh: 0, percent: 0, timestamp: ts };
    }
    if (value < this.FAULT) {
      return { value, status: 'fault', watts: 0, kwh: 0, percent: 0, timestamp: ts };
    }
    const watts   = this._toWatts(value);
    const percent = Math.round((watts / this.PEAK_WATTS) * 100);
    const kwh     = +(watts / 1000).toFixed(3);  // momentary kW value reported as kWh tile
    return {
      value, status: this._tier(percent), watts, kwh, percent, timestamp: ts
    };
  },

  // Map raw brightness → watts. Inverse linear: BRIGHT → peak, DARK → 0.
  _toWatts(value) {
    const clamped = Math.max(this.BRIGHT, Math.min(this.DARK, value));
    const norm = 1 - (clamped - this.BRIGHT) / (this.DARK - this.BRIGHT);
    return Math.round(norm * this.PEAK_WATTS);
  },

  _tier(percent) {
    if (percent >= 70) return 'excellent';
    if (percent >= 35) return 'good';
    if (percent >= 10) return 'low';
    return 'idle';
  },

  // Derive a per-panel reading from the same raw sensor value.
  // Different transforms ensure a single physical sensor change produces
  // 6 visibly distinct UI reactions across the panel grid.
  derive(rawValue, panel) {
    if (rawValue == null || isNaN(rawValue)) {
      return { value: null, status: 'fault', watts: 0, percent: 0 };
    }
    // Random fault simulation
    if (panel.faultBias && Math.random() < panel.faultBias) {
      return { value: rawValue, status: 'fault', watts: 0, percent: 0 };
    }

    // 1. Apply shift to raw value (treats sensor as lighter/darker)
    let v = rawValue + (panel.shift || 0);
    // 2. Invert if requested (dark sensor → high panel output)
    if (panel.invert) {
      v = this.BRIGHT + this.DARK - v;
    }
    // 3. Clamp & map to watts
    v = Math.max(this.BRIGHT, Math.min(this.DARK, v));
    let watts = this._toWatts(v);

    // 4. Apply per-panel multiplier
    watts = watts * (panel.factor || 1.0);

    // 5. Add jitter (deterministic per panel id + minute, so it's stable across re-renders within ~30s)
    if (panel.jitter) {
      const seedBase = (panel.id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const minuteBucket = Math.floor(Date.now() / 30000);
      const noise = ((Math.sin(seedBase * 13 + minuteBucket) + 1) / 2) * 2 - 1;  // -1..1
      watts *= 1 + (noise * panel.jitter / 100);
    }

    watts = Math.max(0, Math.round(watts));
    // Each panel has its own peak (slight variations look more realistic)
    const peak = this.PEAK_WATTS * (panel.factor >= 1 ? panel.factor : 1);
    const percent = Math.round((watts / peak) * 100);

    // Faulted sensor still means panel is uncertain — for invert panels the opposite
    if (rawValue < this.FAULT && !panel.invert) {
      return { value: rawValue, status: 'fault', watts: 0, percent: 0 };
    }

    return { value: rawValue, status: this._tier(percent), watts, percent };
  },

  // ---- Polling ----
  start(onUpdate) {
    this.stop();
    const tick = async () => {
      try {
        const data = await this.fetchLatest();
        onUpdate && onUpdate(data, null);
      } catch (err) {
        console.warn('[sensor]', err);
        onUpdate && onUpdate(this.last, err);
      }
    };
    tick();                                             // immediate
    this._timer = setInterval(tick, this.POLL_MS);
  },

  stop() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
};
