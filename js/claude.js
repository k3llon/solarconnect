// SolarConnect — Claude Chat (Anthropic API direct from browser)
// WARNUNG: Der API-Key liegt im localStorage und ist für jeden zugänglich,
// der diese Browser-Instanz hat. Nur für persönliche Nutzung / Demo geeignet.
// Für Produktion: Backend-Proxy nutzen, der den Key serverseitig hält.

const Claude = {
  MODEL: 'claude-sonnet-4-6',
  MAX_TOKENS: 2048,
  HISTORY_KEY: 'claude_history',
  MAX_IMAGE_BYTES: 5 * 1024 * 1024,
  IMAGE_MAX_DIM: 1568,  // Anthropic-Empfehlung — kleiner = schneller

  SYSTEM_PROMPT:
    'Du bist ein hilfsbereiter Assistent in der SolarConnect-App — einer Offline-fähigen App ' +
    'für Solaranlagen-Management in ländlichen Gemeinden Indiens. Antworte freundlich auf Deutsch. ' +
    'Wenn der Nutzer ein Foto seiner Anlage (Panel, Inverter, Batterie, Verkabelung) zeigt, ' +
    'beschreibe was du siehst und nenne sicherheitsrelevante Auffälligkeiten zuerst. ' +
    'Bei akuten Gefahren (Rauch, Hitze, gebrochenes Glas) sage klar: Hauptschalter aus, Techniker rufen. ' +
    'Halte Antworten kurz und konkret — die Nutzer haben oft langsames Internet und kleine Bildschirme.',

  pending: [],     // angehängte Bilder vor dem nächsten Send
  history: [],     // [{ role, content: string|array, ts }]
  busy: false,

  apiKey() { return localStorage.getItem('claude_api_key') || ''; },

  // ===== INIT / RENDER =====
  init() {
    try { this.history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]'); }
    catch { this.history = []; }
    this.render();
    this.setupDropZone();
  },

  saveHistory() {
    // Bilder im Verlauf können groß sein → Limit
    try { localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history)); }
    catch (e) {
      console.warn('History zu groß, kürze auf letzte 10 Nachrichten');
      this.history = this.history.slice(-10);
      try { localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history)); } catch {}
    }
  },

  clear() {
    if (!confirm('Den gesamten Chat-Verlauf löschen?')) return;
    this.history = [];
    this.pending = [];
    localStorage.removeItem(this.HISTORY_KEY);
    this.render();
    this.renderPending();
  },

  escape(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  // einfaches Markdown: **bold**, *italic*, `code`, Zeilenumbrüche, Listen
  formatMarkdown(text) {
    let html = this.escape(text);
    html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/^[\-•] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
    html = html.replace(/\n/g, '<br>');
    return html;
  },

  render() {
    const list = document.getElementById('claude-messages');
    if (!list) return;
    if (!this.history.length) {
      list.innerHTML = `
        <div class="chat-empty">
          <div class="chat-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>Chat mit Claude</h3>
          <p>Frage alles rund um deine Solaranlage — oder lade ein Foto hoch (z.B. von einem defekten Panel, einem Inverter-Display oder einer Verkabelung).</p>
          <div class="chat-suggestions">
            <button onclick="Claude.useSuggestion('Was bedeutet ein roter LED am Inverter?')">Roter LED am Inverter</button>
            <button onclick="Claude.useSuggestion('Wie reinige ich Solarpanels richtig?')">Panels reinigen</button>
            <button onclick="Claude.useSuggestion('Welche Förderung gibt es 2026 für Solar in Indien?')">Förderung 2026</button>
            <button onclick="Claude.useSuggestion('Wie groß sollte meine Batterie für einen 4-Personen-Haushalt sein?')">Batterie-Größe</button>
          </div>
        </div>`;
      return;
    }
    list.innerHTML = this.history.map((m, i) => this.renderMessage(m, i)).join('');
    list.scrollTop = list.scrollHeight;
  },

  renderMessage(m, idx) {
    const role = m.role === 'user' ? 'user' : 'assistant';
    let body;
    if (typeof m.content === 'string') {
      body = `<div class="msg-text">${this.formatMarkdown(m.content)}</div>`;
    } else {
      const parts = m.content.map(b => {
        if (b.type === 'text')  return `<div class="msg-text">${this.formatMarkdown(b.text)}</div>`;
        if (b.type === 'image') return `<img class="msg-image" src="data:${b.source.media_type};base64,${b.source.data}" alt="Anhang">`;
        return '';
      }).join('');
      body = parts;
    }
    const ts = m.ts ? new Date(m.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="msg msg-${role}">${body}<div class="msg-meta">${ts}</div></div>`;
  },

  renderPending() {
    const boxes = [document.getElementById('claude-pending'), document.getElementById('home-claude-pending')];
    for (const box of boxes) {
      if (!box) continue;
      if (!this.pending.length) { box.innerHTML = ''; box.classList.add('hidden'); continue; }
      box.classList.remove('hidden');
      box.innerHTML = this.pending.map((p, i) => `
        <div class="pending-img">
          <img src="data:${p.media_type};base64,${p.data}" alt="Vorschau">
          <button onclick="Claude.removePending(${i})" aria-label="Entfernen">×</button>
        </div>`).join('');
    }
  },

  useSuggestion(text) {
    const input = document.getElementById('claude-input');
    if (input) { input.value = text; input.focus(); this.autoResize(input); }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  },

  // ===== IMAGE-HANDLING =====
  async handleFiles(files) {
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > this.MAX_IMAGE_BYTES) {
        alert(`Bild "${f.name}" ist zu groß (max. 5 MB).`);
        continue;
      }
      try {
        const processed = await this.processImage(f);
        this.pending.push(processed);
      } catch (err) {
        console.error(err);
        alert('Bild konnte nicht verarbeitet werden: ' + err.message);
      }
    }
    this.renderPending();
  },

  // Skaliert + komprimiert auf max. IMAGE_MAX_DIM, JPEG q=0.85, base64
  processImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const ratio = Math.min(1, this.IMAGE_MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = mime === 'image/jpeg' ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(mime, quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ media_type: mime, data: base64 });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild ungültig')); };
      img.src = url;
    });
  },

  removePending(idx) {
    this.pending.splice(idx, 1);
    this.renderPending();
  },

  setupDropZone() {
    const view = document.getElementById('view-claude');
    if (!view || view.dataset.dropSetup) return;
    view.dataset.dropSetup = '1';
    const prevent = e => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover'].forEach(ev => view.addEventListener(ev, e => {
      prevent(e); view.classList.add('dropping');
    }));
    ['dragleave', 'drop'].forEach(ev => view.addEventListener(ev, e => {
      prevent(e); view.classList.remove('dropping');
    }));
    view.addEventListener('drop', e => {
      if (e.dataTransfer?.files?.length) this.handleFiles([...e.dataTransfer.files]);
    });

    // Aus Zwischenablage einfügen
    document.addEventListener('paste', e => {
      if (app.currentView !== 'claude') return;
      const items = [...(e.clipboardData?.items || [])];
      const files = items.filter(i => i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean);
      if (files.length) this.handleFiles(files);
    });
  },

  // Von der Home-Quick-Chat-Karte: übernehme Text, wechsle zur Vollansicht, sende
  sendFromHome() {
    const input = document.getElementById('home-claude-input');
    const text = (input?.value || '').trim();
    if (!text && !this.pending.length) return;

    if (!this.apiKey()) {
      alert('Bitte zuerst in den Einstellungen einen Anthropic API-Key hinterlegen.');
      app.showView('settings');
      return;
    }

    // Wechsel zur Vollansicht — Claude.init() rendert dort + setzt Dropzone
    app.showView('claude');

    // Eingabe von Home in Vollansicht übernehmen
    setTimeout(() => {
      const target = document.getElementById('claude-input');
      if (target) { target.value = text; this.autoResize(target); }
      if (input) { input.value = ''; this.autoResize(input); }
      // Pending wird intern geteilt — wird beim send() automatisch verwendet
      this.send();
    }, 50);
  },

  // ===== SEND =====
  async send() {
    if (this.busy) return;
    const input = document.getElementById('claude-input');
    const text = (input.value || '').trim();
    if (!text && !this.pending.length) return;

    if (!this.apiKey()) {
      alert('Bitte zuerst in den Einstellungen einen Anthropic API-Key hinterlegen.');
      app.showView('settings');
      return;
    }

    // Nachricht zusammenbauen
    const content = [];
    for (const img of this.pending) content.push({ type: 'image', source: { type: 'base64', ...img } });
    if (text) content.push({ type: 'text', text });
    const userMsg = { role: 'user', content: content.length === 1 && content[0].type === 'text' ? text : content, ts: Date.now() };

    this.history.push(userMsg);
    this.pending = [];
    input.value = '';
    this.autoResize(input);
    this.renderPending();
    this.render();

    this.busy = true;
    this.showTyping(true);

    try {
      const reply = await this.callApi();
      this.history.push({ role: 'assistant', content: reply, ts: Date.now() });
      this.saveHistory();
      this.render();
    } catch (err) {
      console.error('[claude]', err);
      this.history.push({
        role: 'assistant',
        content: `⚠️ Fehler: ${err.message}\n\n*Tipp:* Prüfe deinen API-Key in den Einstellungen und ob du online bist.`,
        ts: Date.now(), error: true
      });
      this.saveHistory();
      this.render();
    } finally {
      this.busy = false;
      this.showTyping(false);
    }
  },

  showTyping(on) {
    const t = document.getElementById('claude-typing');
    if (t) t.classList.toggle('hidden', !on);
    const send = document.getElementById('claude-send');
    if (send) send.disabled = on;
  },

  // API-Aufruf — direkt von Browser (mit dangerous-direct-browser-Header)
  async callApi() {
    // Verlauf in Anthropic-Format konvertieren
    const messages = this.history.map(m => ({
      role: m.role,
      content: typeof m.content === 'string'
        ? [{ type: 'text', text: m.content }]
        : m.content
    }));

    const body = {
      model: this.MODEL,
      max_tokens: this.MAX_TOKENS,
      system: this.SYSTEM_PROMPT,
      messages
    };

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      let detail = `HTTP ${r.status}`;
      try {
        const j = await r.json();
        detail = j.error?.message || JSON.stringify(j);
      } catch {}
      throw new Error(detail);
    }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return text || '(leere Antwort)';
  }
};
