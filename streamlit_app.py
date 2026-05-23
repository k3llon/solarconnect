"""
SolarConnect — Streamlit wrapper

This file bundles the HTML/CSS/JS app into a single component so it can be
deployed to Streamlit Community Cloud (or any Streamlit host) without
touching the original sources.

Design and behaviour stay identical — the app runs inside a Streamlit
iframe. The service worker registration is stripped because it cannot
reliably control the iframe scope on streamlit.app; everything else
(IndexedDB, camera capture, vision analysis) continues to work.
"""

from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# ---------------------------------------------------------------------------
# Page config — full-bleed mobile-first
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="SolarConnect — India",
    page_icon="☀️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Strip Streamlit chrome so the embedded app fills the viewport
st.markdown(
    """
    <style>
      #MainMenu, header, footer { visibility: hidden; height: 0 !important; }
      .stDeployButton, [data-testid="stToolbar"] { display: none !important; }
      .block-container {
          padding: 0 !important;
          max-width: 100% !important;
          margin: 0 !important;
      }
      [data-testid="stAppViewContainer"] { background: #f6f8f6; }
      [data-testid="stMain"] > .block-container { padding-top: 0 !important; }
      iframe { border: 0 !important; display: block; }
      html, body, [data-testid="stAppViewContainer"] {
          height: 100vh; overflow: hidden;
      }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Bundle the app — inline css + js into one HTML payload
# ---------------------------------------------------------------------------
BASE = Path(__file__).parent

def read(rel: str) -> str:
    return (BASE / rel).read_text(encoding="utf-8")

html = read("index.html")
css = read("css/style.css")

scripts = {
    "js/content.js": read("js/content.js"),
    "js/charts.js":  read("js/charts.js"),
    "js/ai.js":      read("js/ai.js"),
    "js/db.js":      read("js/db.js"),
    "js/app.js":     read("js/app.js"),
}

# Inline the stylesheet
html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    f"<style>\n{css}\n</style>",
)

# Drop favicon / manifest references that don't resolve inside the iframe
for stale in (
    '<link rel="manifest" href="manifest.json">',
    '<link rel="icon" type="image/svg+xml" href="icons/favicon.svg">',
    '<link rel="apple-touch-icon" href="icons/icon-192.png">',
):
    html = html.replace(stale, "")

# Inline scripts in the original order
for path, source in scripts.items():
    tag = f'<script src="{path}"></script>'
    html = html.replace(tag, f"<script>\n{source}\n</script>")

# Service worker registration is not useful inside a Streamlit iframe — strip it.
sw_block = """<script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  </script>"""
html = html.replace(sw_block, "")

# Small viewport tweak so the iframe behaves like a normal mobile webview
html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">'
    '<style>html,body{height:100%;}body{overscroll-behavior:none;}</style>',
)

# ---------------------------------------------------------------------------
# Render the bundled app inside a tall iframe
# ---------------------------------------------------------------------------
components.html(html, height=920, scrolling=True)
