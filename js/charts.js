// Lightweight SVG charts — no dependencies
const charts = {

  // Bar chart for energy production / consumption
  bars({ data, height = 140, width = 320, color = '#1a6b3c', secondColor = '#FB8C00', labels = true }) {
    if (!data.length) return '';
    const max = Math.max(...data.map(d => Math.max(d.produced || d.value || 0, d.consumed || 0))) * 1.15 || 1;
    const padding = { top: 10, right: 8, bottom: 24, left: 8 };
    const innerW = width  - padding.left - padding.right;
    const innerH = height - padding.top  - padding.bottom;
    const bw = innerW / data.length;
    const barW = Math.max(4, bw * 0.35);

    const bars = data.map((d, i) => {
      const x = padding.left + i * bw + bw / 2;
      const prod = d.produced ?? d.value ?? 0;
      const cons = d.consumed ?? null;
      const h1 = (prod / max) * innerH;
      let svg = `<rect x="${x - barW - 1}" y="${padding.top + innerH - h1}" width="${barW}" height="${h1}" rx="2" fill="${color}"/>`;
      if (cons !== null) {
        const h2 = (cons / max) * innerH;
        svg += `<rect x="${x + 1}" y="${padding.top + innerH - h2}" width="${barW}" height="${h2}" rx="2" fill="${secondColor}" opacity="0.85"/>`;
      }
      if (labels) {
        const label = d.label ?? (d.date ? new Date(d.date).getDate() : i + 1);
        svg += `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#888">${label}</text>`;
      }
      return svg;
    }).join('');

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <line x1="${padding.left}" y1="${padding.top + innerH}" x2="${padding.left + innerW}" y2="${padding.top + innerH}" stroke="#eee" stroke-width="1"/>
      ${bars}
    </svg>`;
  },

  // Line chart (battery / health over time)
  line({ data, height = 100, width = 320, color = '#2e9e5e', fill = true, max = 100, min = 0 }) {
    if (!data.length) return '';
    const padding = { top: 10, right: 8, bottom: 8, left: 8 };
    const innerW = width  - padding.left - padding.right;
    const innerH = height - padding.top  - padding.bottom;
    const stepX = innerW / Math.max(1, data.length - 1);
    const points = data.map((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + innerH - ((v - min) / (max - min)) * innerH;
      return [x, y];
    });
    const path  = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area  = path + ` L ${points[points.length-1][0].toFixed(1)},${padding.top + innerH} L ${padding.left},${padding.top + innerH} Z`;
    const dots  = points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="${color}"/>`).join('');
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${fill ? `<path d="${area}" fill="${color}" opacity="0.12"/>` : ''}
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  },

  // Circular progress (health %, battery %)
  ring({ value, size = 92, stroke = 8, color = '#1a6b3c', track = '#eef2ee', label = '' }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;
    const cx = size / 2;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cx}" r="${r}" stroke="${track}" stroke-width="${stroke}" fill="none"/>
      <circle cx="${cx}" cy="${cx}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none"
              stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
              stroke-linecap="round" transform="rotate(-90 ${cx} ${cx})"/>
      <text x="${cx}" y="${cx + 6}" text-anchor="middle" font-size="${size * 0.28}" font-weight="700" fill="#1a1a1a">${Math.round(value)}%</text>
      ${label ? `<text x="${cx}" y="${cx + size * 0.32}" text-anchor="middle" font-size="${size * 0.13}" fill="#666">${label}</text>` : ''}
    </svg>`;
  },

  // Weather icon
  weatherIcon(cond, size = 36) {
    const m = {
      sunny:         `<circle cx="12" cy="12" r="5" fill="#FFB300"/><g stroke="#FFB300" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="5" y1="19" x2="7" y2="17"/><line x1="17" y1="7" x2="19" y2="5"/></g>`,
      partly_cloudy: `<circle cx="9" cy="9" r="3.5" fill="#FFB300"/><path d="M7 17 a4 4 0 0 1 0 -8 a5 5 0 0 1 10 1 a3.5 3.5 0 0 1 -1 7 z" fill="#b0bec5"/>`,
      cloudy:        `<path d="M7 17 a4 4 0 0 1 0 -8 a5 5 0 0 1 10 1 a3.5 3.5 0 0 1 -1 7 z" fill="#90a4ae"/>`,
      rain:          `<path d="M7 14 a4 4 0 0 1 0 -8 a5 5 0 0 1 10 1 a3.5 3.5 0 0 1 -1 7 z" fill="#78909c"/><g stroke="#1976d2" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="17" x2="7" y2="20"/><line x1="12" y1="17" x2="11" y2="20"/><line x1="16" y1="17" x2="15" y2="20"/></g>`
    };
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}">${m[cond] || m.sunny}</svg>`;
  }
};
