# SolarConnect — Deployment auf Vercel

Die App ist eine statische PWA mit **drei serverlosen Functions** für die
Live-APIs (Claude, OpenWeatherMap, ThingSpeak). Vercel deployt automatisch
beides.

Nach dem Deploy funktioniert:
- ✅ Vollbild wie eine echte Smartphone-App
- ✅ Service Worker → echter Offline-Modus
- ✅ PWA installierbar
- ✅ HTTPS automatisch
- ✅ **Surya AI** (Claude) — API-Key sicher serverseitig
- ✅ **Live-Wetter** — OpenWeatherMap-Key serverseitig
- ✅ **Live-Sensor** — ThingSpeak via Server-Proxy

---

## 🔑 Schritt 1: API-Keys vorbereiten

Du brauchst drei Keys. Welche du davon **wirklich** brauchst:

| API | Key | Wofür | Pflicht? |
|---|---|---|---|
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | Surya AI Chat | für KI-Chat |
| **OpenWeatherMap** | `OWM_API_KEY` | Live-Wetter | für echtes Wetter |
| **ThingSpeak Read** | `THINGSPEAK_READ_KEY` | Sensor-Live-Daten | für Sensor |

**Wo bekommst du sie?**
- Claude: <https://console.anthropic.com> → Settings → API Keys → `sk-ant-...`
- OpenWeatherMap: <https://openweathermap.org/api> → kostenlos registrieren (Free Tier reicht völlig). **Achtung**: Neue Keys brauchen 1–2 Stunden bis aktiv.
- ThingSpeak: in deinem Channel oben rechts „API Keys" → `Read API Keys`. Dein bisheriger Key: `VXF11H3Z3KTRFLM8`.

---

## 🚀 Schritt 2: Auf Vercel deployen

### Variante A — über GitHub (empfohlen für Master-Projekt)

```bash
cd /Users/fabianhubner/Documents/IT/Claude/solarconnect
git add .
git commit -m "Add serverless API proxies for Claude / Weather / Sensor"
git push
```

Dann auf <https://vercel.com/new> → das Repo importieren → **Deploy**.
Build dauert ~30 Sekunden.

### Variante B — Vercel CLI

```bash
npm install -g vercel
cd /Users/fabianhubner/Documents/IT/Claude/solarconnect
vercel --prod
```

---

## ⚙️ Schritt 3: Environment Variables in Vercel setzen

**Das ist der entscheidende Schritt** — ohne die Vars antworten die Functions mit 500.

1. Vercel-Dashboard öffnen → dein Projekt → **Settings** → **Environment Variables**
2. Drei Variablen anlegen (jeweils für `Production` und `Preview`):

   | Name | Value | Beispiel |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | dein Anthropic-Key | `sk-ant-api03-...` |
   | `OWM_API_KEY` | dein OpenWeatherMap-Key | `abc123...` |
   | `THINGSPEAK_READ_KEY` | dein ThingSpeak Read-Key | `VXF11H3Z3KTRFLM8` |
   | `THINGSPEAK_CHANNEL` *(optional)* | Channel-ID | `3393403` (Default) |

3. Nach dem Setzen **einen neuen Deploy auslösen**, damit die Vars greifen:
   - Im Dashboard → Deployments → letzten Deploy → **Redeploy**
   - Oder einfach erneut `git push`

---

## 🧪 Schritt 4: Funktionalität testen

Nach dem Deploy in den Browser:

```
https://<dein-projekt>.vercel.app/api/sensor    → ThingSpeak JSON
https://<dein-projekt>.vercel.app/api/weather?community=Khandala&state=Maharashtra  → Wetter JSON
```

Wenn diese URLs JSON liefern, funktionieren die Functions. In der App siehst du dann:
- Live-Sensor-Karte mit aktuellem Wert
- Wetter-Karte mit echten Daten
- Surya AI Chat sendet erfolgreich

---

## 🔄 Lokal entwickeln

```bash
# Statisch (ohne Functions — Fallbacks aktiv)
python3 -m http.server 8000

# Oder: Vercel-CLI lokal mit Functions
vercel dev   # → http://localhost:3000 mit /api/*
```

Im Vercel-CLI-Modus brauchst du eine `.env`-Datei im Projektroot:

```bash
# .env (NICHT committen! Steht schon in .gitignore)
ANTHROPIC_API_KEY=sk-ant-...
OWM_API_KEY=...
THINGSPEAK_READ_KEY=VXF11H3Z3KTRFLM8
THINGSPEAK_CHANNEL=3393403
```

---

## 📦 Was die Functions tun

Dateien unter `/api/`:

- **`/api/claude.js`** — proxiet POST-Requests an `api.anthropic.com/v1/messages`.
  Key bleibt serverseitig. Akzeptiert `{ model, messages, system, max_tokens }`.
- **`/api/weather.js`** — geocoded Ort + lädt aktuelles Wetter + 5-Tage-Vorhersage von OpenWeatherMap. Liefert sauber aufbereitetes JSON.
- **`/api/sensor.js`** — liest Channel von ThingSpeak. Versteckt den Read-Key.

Alle drei haben `Cache-Control: no-store` — Daten bleiben live.

---

## 🐞 Troubleshooting

**Sensor zeigt nichts auf Vercel**
→ Prüfe `THINGSPEAK_READ_KEY` in den Vercel-Env-Vars und ob ein Redeploy gemacht wurde. Im Browser DevTools sollte `/api/sensor` 200 zurückgeben.

**KI-Chat sagt „Server is missing ANTHROPIC_API_KEY"**
→ Env-Var fehlt oder ist nicht für Production gesetzt. Setzen → redeployen.

**Wetter zeigt Mock-Daten**
→ `OWM_API_KEY` fehlt, oder der Key ist noch nicht aktiv (kostenlose Keys brauchen 1–2h). Mit `https://<projekt>.vercel.app/api/weather?community=X&state=Y` direkt testen.

**Service Worker zeigt alte Version**
→ DevTools → Application → Service Workers → „Unregister", dann Cmd+Shift+R. Beim normalen Reload installiert der neue SW sich automatisch.

**Kamera funktioniert nicht**
→ Geht nur via HTTPS oder `localhost`. Vercel liefert immer HTTPS.

**Daten weg nach Reload**
→ IndexedDB ist persistent pro Origin. Inkognito-Tabs leeren alles beim Schließen.
