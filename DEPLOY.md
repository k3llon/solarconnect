# SolarConnect — Streamlit Deployment

Die App läuft auch ohne Änderungen unverändert als Streamlit-App.
Streamlit dient nur als Wrapper: `streamlit_app.py` packt die bestehenden
HTML/CSS/JS-Dateien in eine einzelne `components.html()`-Komponente.

Design, Funktionalität, KI-Chat, Foto-Upload und IndexedDB bleiben
identisch.

---

## 1. Lokal testen

```bash
# Im Projekt-Verzeichnis
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Streamlit öffnet automatisch `http://localhost:8501`.

> **Hinweis:** Beim ersten Aufruf führt die App das Onboarding aus,
> seedet indische Demo-Daten und legt eine eigene IndexedDB im Browser
> an. Beim Neustart bleiben die Daten erhalten.

---

## 2. Streamlit Community Cloud (kostenlos)

### Voraussetzungen
- GitHub-Account
- Projekt liegt in einem GitHub-Repo

### Schritte

1. **Repo zu GitHub pushen** (falls noch nicht geschehen)
   ```bash
   git init
   git add .
   git commit -m "Initial SolarConnect"
   git branch -M main
   git remote add origin https://github.com/<dein-user>/solarconnect.git
   git push -u origin main
   ```

2. **Streamlit Cloud öffnen**: <https://share.streamlit.io>
   - Mit GitHub einloggen
   - Klick auf **„New app"**

3. **Konfiguration**
   - Repository: `<dein-user>/solarconnect`
   - Branch: `main`
   - **Main file path**: `streamlit_app.py`
   - (Optional) eigene URL wählen, z.B. `solarconnect.streamlit.app`

4. **Deploy klicken** — der Build dauert ca. 1 Minute.

Die App ist anschließend unter deiner Streamlit-URL erreichbar.
Automatischer Re-Deploy bei jedem `git push` auf `main`.

---

## 3. Was sich im Streamlit-Kontext unterscheidet

| Feature             | Status        | Hinweis |
|---------------------|---------------|---------|
| Layout & Design     | ✅ Identisch  | Inline-CSS, gleicher Look |
| Bottom-Navigation   | ✅ Identisch  | `position: fixed` im iframe |
| IndexedDB-Storage   | ✅ Funktioniert | Per Browser-Origin persistiert |
| KI-Chat (Surya AI)  | ✅ Funktioniert | Lokale Knowledge-Engine |
| Foto-Upload + Vision| ✅ Funktioniert | Canvas-Analyse läuft im iframe |
| Offline-Modus       | ⚠ Teilweise   | Service Worker im iframe deaktiviert — IndexedDB bleibt aber persistent |
| PWA-Installation    | ❌            | Browser kann iframe-App nicht als PWA installieren |

Die App nutzt im normalen statischen Hosting weiterhin den Service Worker.
Nur in der Streamlit-Variante wird er übersprungen.

---

## 4. Alternative Hosts

Da die App reines HTML/CSS/JS ist, läuft sie ohne Modifikation auch auf:
- **GitHub Pages** (einfach Repo zu Pages aktivieren — `index.html` ist Entry)
- **Vercel** / **Netlify** / **Cloudflare Pages** (Drag & Drop)
- **Jeder beliebige Static-File-Host**

Bei diesen funktioniert auch der Service Worker und die PWA-Installation.

---

## 5. Troubleshooting

**App-Höhe wirkt zu klein**
Passe in `streamlit_app.py` den Wert `height=920` an die gewünschte
iframe-Höhe an (z.B. `height=1100`).

**Kamera funktioniert nicht**
Browser benötigt HTTPS für Kamera-Zugriff. Streamlit Cloud liefert
automatisch HTTPS aus. Lokal über `localhost` funktioniert es ebenfalls.

**Daten weg nach Reload**
Das passiert nur, wenn der Browser den Speicher für die Origin gelöscht
hat. IndexedDB ist normalerweise persistent.
