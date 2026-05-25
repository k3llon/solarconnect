// SolarConnect — Live Sensor Integration (ThingSpeak)
// Photo-resistor reads brightness, mapped to a virtual solar panel:
//   30  = very bright → max power
//   900 = very dark   → 0 power
//   < 30 → sensor fault

const SENSOR = {
  channel: 3393403,
  readKey: 'VXF11H3Z3KTRFLM8',
  endpoint: 'https://api.thingspeak.com/channels/3393403/feeds.json',

  // Mapping bounds — defines the "solar" semantics
  BRIGHT: 30,           // anything <= this is full power
  DARK: 900,            // anything >= this is zero power
  FAULT: 30,            // strictly less than this → sensor fault
  PEAK_WATTS: 1000,     // virtual peak panel rating
  POLL_MS: 20000,       // 20 s refresh

  _timer: null,
  last: null,           // { value, status, watts, kwh, percent, timestamp, history }

  // ---- Fetch ----
  async fetchLatest(n = 20) {
    const url = `${this.endpoint}?api_key=${this.readKey}&results=${n}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('ThingSpeak HTTP ' + res.status);
    const json = await res.json();
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
