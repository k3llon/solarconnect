# SolarConnect — Deployment auf Vercel

Die App ist eine reine statische PWA (HTML/CSS/JS) — kein Backend, kein
Build-Step nötig. Vercel deployt sie out-of-the-box.

Funktioniert nach dem Deploy:
- ✅ Vollbild wie eine echte Smartphone-App
- ✅ Service Worker → echter Offline-Modus
- ✅ PWA installierbar („Zum Home-Bildschirm hinzufügen")
- ✅ HTTPS automatisch (nötig für Kamera-Zugriff)
- ✅ Custom Domain möglich
- ✅ Auto-Deploy bei jedem `git push`

---

## Variante A — Vercel CLI (schnell, ohne GitHub)

```bash
npm install -g vercel        # falls noch nicht installiert
cd /Users/fabianhubner/Documents/IT/Claude/solarconnect
vercel                       # einmalig: Login + Projekt anlegen
vercel --prod                # Production-Deploy
```

Vercel druckt am Ende die URL, z.B. `https://solarconnect.vercel.app`.

> Beim ersten `vercel`-Aufruf fragt das CLI:
> - „Set up and deploy?" → **Y**
> - „Which scope?" → dein Account
> - „Link to existing project?" → **N**
> - „What's your project's name?" → `solarconnect`
> - „In which directory is your code located?" → `./` (Enter)
> - „Want to modify settings?" → **N**

---

## Variante B — Via GitHub (empfohlen für Master-Projekt)

Vorteile: Auto-Deploy, Preview-URLs pro Branch, sichtbare Commit-Historie.

1. **Repo zu GitHub pushen**
   ```bash
   cd /Users/fabianhubner/Documents/IT/Claude/solarconnect
   git init
   git add .
   git commit -m "SolarConnect v2 — India Edition mit Surya AI"
   git branch -M main
   git remote add origin https://github.com/<dein-user>/solarconnect.git
   git push -u origin main
   ```

2. **Vercel öffnen**: <https://vercel.com/new>
   - Mit GitHub einloggen
   - „Import Git Repository" → das `solarconnect`-Repo wählen

3. **Configure Project**
   - Framework Preset: **Other** (Vercel erkennt es als statische Site)
   - Root Directory: `./`
   - Build Command: *(leer lassen)*
   - Output Directory: *(leer lassen)*

4. **Deploy** klicken — Build dauert ~30 Sekunden.

Ergebnis: URL wie `https://solarconnect.vercel.app`.
Jeder weitere `git push` deployt automatisch.

---

## Eigene Domain (optional)

Im Vercel-Dashboard → Project → Settings → Domains → Domain hinzufügen.
DNS-Records werden angezeigt — bei deinem Domain-Provider eintragen.
HTTPS wird automatisch über Let's Encrypt eingerichtet.

---

## Konfiguration

In `vercel.json` ist bereits eingestellt:
- **Service Worker** wird nicht gecached (`sw.js` mit `max-age=0`) — verhindert eingefrorene App-Version
- **Statische Assets** (JS/CSS/SVG) werden 1 Jahr immutable gecached
- **index.html** und `manifest.json` ebenfalls always-fresh

---

## Lokal testen (vor dem Deploy)

```bash
cd /Users/fabianhubner/Documents/IT/Claude/solarconnect
python3 -m http.server 8000
# → http://localhost:8000
```

Oder mit Vercel CLI:
```bash
vercel dev
# → http://localhost:3000
```

---

## Troubleshooting

**Service Worker zeigt alte Version**
→ Im Browser DevTools → Application → Service Workers → „Unregister"
und einmal Hard-Reload (Cmd+Shift+R).

**Kamera funktioniert nicht**
→ Geht nur über HTTPS oder `localhost`. Vercel liefert immer HTTPS.

**Daten weg nach Reload**
→ IndexedDB ist normalerweise persistent pro Origin. Inkognito-Tabs
löschen alles beim Schließen.

**404 auf bestimmten Routen**
→ `cleanUrls: true` in `vercel.json` schaltet die `.html`-Extension ab.
Falls Probleme: das Flag entfernen.
