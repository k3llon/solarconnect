// SolarConnect — Main App Logic
const app = {
  currentView: 'home',
  selectedProblem: null,
  selectedSeverity: null,
  selectedRole: 'user',
  selectedLang: 'de',
  kbFilter: 'all',
  wizardKey: null,
  wizardStepId: null,
  wizardSeen: 0,
  lessonId: null,
  lessonIndex: 0,
  onbStep: 1,

  problemLabels: {
    power_outage: 'Kein Strom', battery_issue: 'Batterie-Problem',
    panel_damage: 'Panel kaputt', inverter_issue: 'Wechselrichter',
    wiring_issue: 'Kabel / Leitung', other: 'Sonstiges'
  },
  severityLabels: { low: 'Nicht dringend', medium: 'Mittel', high: 'Dringend' },
  statusLabels:   { open: 'Offen', progress: 'In Arbeit', resolved: 'Behoben' },

  // ===== INIT =====
  async init() {
    await db.open();
    await this.loadSettings();
    await this.seedAll();
    this.applyTheme();
    this.checkOnboarding();
    this.setupOfflineDetection();
    this.setupSync();
    await this.loadHome();
  },

  async checkOnboarding() {
    const done = await db.getSetting('onboarded');
    if (!done) document.getElementById('onboarding').classList.remove('hidden');
  },

  onbNext() {
    const cur = document.querySelector(`.onb-page[data-page="${this.onbStep}"]`);
    cur.classList.add('hidden');
    this.onbStep++;
    const next = document.querySelector(`.onb-page[data-page="${this.onbStep}"]`);
    if (next) next.classList.remove('hidden');
  },

  onbLang(btn) {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.selectedLang = btn.dataset.lang;
  },

  async onbFinish() {
    const village = document.getElementById('onb-village').value.trim() || 'Khandala';
    const state = document.getElementById('onb-state').value;
    await db.setSetting('community_name', village);
    await db.setSetting('state', state);
    await db.setSetting('role', this.selectedRole);
    await db.setSetting('language', this.selectedLang);
    await db.setSetting('onboarded', true);
    document.getElementById('onboarding').classList.add('hidden');
    await this.loadSettings();
    await this.loadHome();
  },

  // ===== SEEDING =====
  async seedAll() {
    if (!(await db.getSetting('seeded'))) {
      for (const t of CONTENT.technicians) await db.addTechnician(t);
      for (const d of CONTENT.devices)     await db.addDevice(d);
      for (const p of CONTENT.posts)       await db.addPost(p);
      for (const a of CONTENT.appointments)await db.addAppointment(a);
      for (const log of CONTENT.generateEnergyHistory(14)) await db.addEnergyLog(log);
      // a few default alerts
      await db.addAlert({ id: 'a_1', type: 'info', title: 'Monsun-Saison naht',
        text: 'Plane die Vor-Monsun-Inspektion in den nächsten 2 Wochen.',
        timestamp: Date.now() - 1000*60*60*5, acknowledged: false });
      await db.addAlert({ id: 'a_2', type: 'warning', title: 'Panel-Verschmutzung',
        text: 'Panel TPS-2023-A4423 zeigt 22% Leistungsverlust. Reinigung empfohlen.',
        timestamp: Date.now() - 1000*60*60*30, acknowledged: false });
      await db.addAlert({ id: 'a_3', type: 'info', title: 'Neuer Artikel',
        text: '"Monsun-Vorbereitung" ist jetzt in der Wissensdatenbank verfügbar.',
        timestamp: Date.now() - 1000*60*60*72, acknowledged: false });
      await db.setSetting('seeded', true);
    }
  },

  async resetDemo() {
    if (!confirm('Alle lokalen Daten und Demo-Inhalte zurücksetzen?')) return;
    indexedDB.deleteDatabase('solarconnect');
    setTimeout(() => location.reload(), 300);
  },

  // ===== NAVIGATION =====
  navTo(btn) { this.showView(btn.dataset.view); },

  showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    if (view) { view.classList.add('active'); this.currentView = name; }

    // sync bottom nav
    document.querySelectorAll('.nav-btn').forEach(b => {
      const top5 = ['home','selfhelp','support','system','more'];
      b.classList.toggle('active', b.dataset.view === name);
    });
    // If sub-view, highlight parent tab
    const parentMap = {
      report: 'support', history: 'support', ticket: 'support', technicians: 'support', appointments: 'support',
      wizard: 'selfhelp', article: 'selfhelp',
      device: 'system', analytics: 'system',
      community: 'more', learning: 'more', lesson: 'more', alerts: 'more', settings: 'more', claude: 'more'
    };
    if (parentMap[name]) {
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === parentMap[name]);
      });
    }

    // route to loaders
    const loaders = {
      home: 'loadHome', selfhelp: 'loadSelfHelp', support: 'loadSupport',
      system: 'loadSystem', more: 'loadMore', history: 'loadHistory',
      technicians: 'loadTechnicians', community: 'loadCommunity',
      learning: 'loadLearning', alerts: 'loadAlerts',
      appointments: 'loadAllAppts', analytics: 'loadAnalytics',
      report: 'resetReportForm'
    };
    if (loaders[name] && this[loaders[name]]) this[loaders[name]]();
    if (name === 'claude' && typeof Claude !== 'undefined') Claude.init();
    window.scrollTo(0, 0);
  },

  // ===== HOME =====
  async loadHome() {
    const reports = await db.getReports();
    const alerts  = await db.getAlerts();
    const open = reports.filter(r => r.status !== 'resolved');
    const devices = await db.getDevices();
    const logs    = (await db.getEnergyLogs()).sort((a,b) => a.date.localeCompare(b.date));
    const appts   = (await db.getAppointments()).sort((a,b) => a.scheduledFor - b.scheduledFor);
    const posts   = (await db.getPosts()).sort((a,b) => b.createdAt - a.createdAt);

    // health score
    const avgHealth = devices.length ? devices.reduce((s,d) => s + (d.health||0), 0) / devices.length : 100;
    const healthScore = Math.round(avgHealth - open.length * 5);
    const score = Math.max(40, Math.min(100, healthScore));

    document.getElementById('hero-ring').innerHTML = charts.ring({ value: score, size: 96, stroke: 9, color: '#FFE082', track: 'rgba(255,255,255,0.2)' });
    const heroStatus = document.getElementById('hero-status');
    const heroSub    = document.getElementById('hero-sub');
    if (score >= 90)      { heroStatus.textContent = 'Alles in Ordnung'; heroSub.textContent = `${open.length} offene Meldungen`; }
    else if (score >= 70) { heroStatus.textContent = 'Aufmerksamkeit nötig'; heroSub.textContent = `${open.length} Meldungen prüfen`; }
    else                  { heroStatus.textContent = 'Eingriff erforderlich'; heroSub.textContent = `${open.length} Meldungen offen`; }

    // tags
    const power = open.some(r => r.type === 'power_outage');
    const batt  = open.some(r => r.type === 'battery_issue');
    const todayLog = logs[logs.length - 1];
    const tagP = document.getElementById('tag-power');
    const tagB = document.getElementById('tag-batt');
    tagP.textContent = power ? 'Strom: Störung' : 'Strom: OK';
    tagP.className = power ? 'tag tag-danger' : 'tag tag-success';
    tagB.textContent = `Batterie: ${todayLog ? todayLog.battery : 85}%`;
    tagB.className = batt ? 'tag tag-warn' : 'tag tag-success';

    // weather (live via OpenWeatherMap, mit Fallback)
    this.renderWeather();

    // energy chart
    document.getElementById('energy-chart').innerHTML = charts.bars({
      data: logs.map(l => ({ produced: l.produced, consumed: l.consumed, label: new Date(l.date).getDate() })),
      height: 130
    });
    const today = todayLog ? todayLog.produced : 0;
    const week  = logs.slice(-7).reduce((s,l) => s + l.produced, 0);
    const saved = Math.round(week * 8.5); // ₹8.5 / kWh (avg)
    document.getElementById('stat-today').textContent = today.toFixed(1);
    document.getElementById('stat-week').textContent  = week.toFixed(0);
    document.getElementById('stat-saved').textContent = '₹' + saved;

    // alerts badge
    const unack = alerts.filter(a => !a.acknowledged).length;
    document.getElementById('alert-count').textContent = unack;
    document.getElementById('alert-count').style.display = unack ? 'block' : 'none';

    // next appointment
    const nextAppt = appts.find(a => a.scheduledFor > Date.now());
    document.getElementById('next-appointment').innerHTML = nextAppt
      ? this.renderApptCard(nextAppt, await db.getTechnicians())
      : '<div class="empty-state"><p>Kein anstehender Termin</p></div>';

    // recent reports
    const recent = reports.sort((a,b) => b.timestamp - a.timestamp).slice(0,3);
    document.getElementById('recent-reports').innerHTML = recent.length
      ? recent.map(r => this.renderReportItem(r)).join('')
      : '<div class="empty-state"><p>Keine Meldungen — alles in Ordnung!</p></div>';

    // community ticker
    document.getElementById('community-ticker').innerHTML = posts.slice(0,2).map(p => `
      <div class="ticker-item">
        <div class="post-avatar" style="width:30px;height:30px;font-size:13px">${p.avatar}</div>
        <div style="flex:1;min-width:0"><strong>${this.escapeHtml(p.author)}</strong><br>
          <span class="muted">${this.escapeHtml(p.body.slice(0,80))}${p.body.length>80?'…':''}</span></div>
      </div>`).join('');
  },

  renderApptCard(a, techs) {
    const tech = techs.find(t => t.id === a.techId);
    const date = new Date(a.scheduledFor);
    const day = date.getDate();
    const mon = date.toLocaleDateString('de-DE', { month: 'short' });
    return `<div class="appt-card">
      <div class="appt-date">
        <div class="ad-day">${day}</div>
        <div class="ad-mon">${mon}</div>
      </div>
      <div class="appt-body">
        <div class="appt-title">${this.escapeHtml(a.title)}</div>
        <div class="appt-meta">${tech ? this.escapeHtml(tech.name) : 'Techniker offen'}</div>
        <div class="appt-meta">${this.escapeHtml(a.notes || '')}</div>
        <span class="appt-status ${a.status}">${a.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}</span>
      </div>
    </div>`;
  },

  renderReportItem(r) {
    const d = new Date(r.timestamp);
    const time = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `<div class="report-item" onclick="app.openTicket('${r.id}')">
      <div class="report-icon severity-${r.severity}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      <div class="report-details">
        <div class="report-type">${this.problemLabels[r.type] || r.type}</div>
        <div class="report-meta">${time}${r.note ? ' · ' + this.escapeHtml(r.note.slice(0,40)) : ''}</div>
      </div>
      <span class="report-status-badge badge-${r.status}">${this.statusLabels[r.status]}</span>
    </div>`;
  },

  // ===== SELF-HELP =====
  async loadSelfHelp() {
    // wizards
    const wizardIcons = {
      power_outage: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      battery_issue: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>',
      panel_damage: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
    };
    document.getElementById('wizard-grid').innerHTML = Object.entries(CONTENT.wizards).map(([key, w]) => `
      <div class="wizard-card" onclick="app.startWizard('${key}')">
        <div class="wc-icon">${wizardIcons[key] || ''}</div>
        <h4>${w.title}</h4>
        <div class="wc-meta">~${w.estMinutes} Min · Schritt für Schritt</div>
      </div>`).join('');

    // KB filters
    const cats = [...new Set(CONTENT.articles.map(a => a.category))];
    const catLabel = { maintenance: 'Wartung', safety: 'Sicherheit', weather: 'Wetter', planning: 'Planung', finance: 'Finanzierung' };
    document.getElementById('kb-filters').innerHTML =
      `<button class="kb-filter ${this.kbFilter==='all'?'active':''}" onclick="app.setKbFilter('all')">Alle</button>` +
      cats.map(c => `<button class="kb-filter ${this.kbFilter===c?'active':''}" onclick="app.setKbFilter('${c}')">${catLabel[c]||c}</button>`).join('');

    // KB list
    const filtered = this.kbFilter === 'all' ? CONTENT.articles : CONTENT.articles.filter(a => a.category === this.kbFilter);
    document.getElementById('kb-list').innerHTML = filtered.map(a => `
      <div class="kb-card" onclick="app.openArticle('${a.id}')">
        <span class="kb-cat">${catLabel[a.category] || a.category}</span>
        <h4>${this.escapeHtml(a.title)}</h4>
        <div class="kb-sum">${this.escapeHtml(a.summary)}</div>
        <div class="kb-meta">📖 ${a.readMin} Min Lesezeit</div>
      </div>`).join('');
  },

  setKbFilter(cat) { this.kbFilter = cat; this.loadSelfHelp(); },

  // ===== WIZARD =====
  startWizard(key) {
    const w = CONTENT.wizards[key];
    if (!w) return;
    this.wizardKey = key;
    this.wizardStepId = w.root;
    this.wizardSeen = 1;
    document.getElementById('wizard-title').textContent = w.title;
    this.showView('wizard');
    this.renderWizardStep();
  },

  renderWizardStep() {
    const w = CONTENT.wizards[this.wizardKey];
    const step = w.steps[this.wizardStepId];
    if (!step) return;
    const totalSteps = Object.keys(w.steps).length;
    document.getElementById('wp-bar').style.width = Math.min(100, (this.wizardSeen / totalSteps) * 100) + '%';

    document.getElementById('wizard-step').innerHTML = `
      <h3>${this.escapeHtml(step.title)}</h3>
      <div class="ws-body">${this.escapeHtml(step.body)}</div>
      <div class="ws-options">
        ${step.options.map((opt, i) => `
          <button class="ws-opt" onclick="app.wizardChoice(${i})">${this.escapeHtml(opt.label)}</button>
        `).join('')}
      </div>`;
    if (navigator.vibrate) navigator.vibrate(20);
  },

  async wizardChoice(i) {
    const w = CONTENT.wizards[this.wizardKey];
    const step = w.steps[this.wizardStepId];
    const opt = step.options[i];

    if (opt.next) {
      this.wizardStepId = opt.next;
      this.wizardSeen++;
      this.renderWizardStep();
      return;
    }

    // Terminal action
    if (opt.action.type === 'tip') {
      this.renderWizardResult('tip', '💡 Hinweis', opt.action.text);
    } else if (opt.action.type === 'resolved') {
      this.renderWizardResult('resolved', '✓ Gelöst!', 'Super! Das Problem ist behoben. Du brauchst keinen Techniker.');
    } else if (opt.action.type === 'escalate') {
      const sev = opt.action.severity || 'medium';
      const type = opt.action.type_ || this.wizardKey;
      const reportId = await this.autoCreateReport(type, sev, `Aus Wizard: ${w.title}`);
      const emergency = opt.action.emergency;
      this.renderWizardResult('escalate',
        emergency ? '⚠ Notfall!' : '🔧 Techniker erforderlich',
        emergency
          ? 'Ticket angelegt. Nutze den Notfall-Modus, um sofort einen Techniker zu erreichen.'
          : 'Ein Ticket wurde erstellt. Du kannst es im Support-Bereich verfolgen.',
        reportId, emergency
      );
    }
    document.getElementById('wp-bar').style.width = '100%';
  },

  async autoCreateReport(type, severity, note) {
    const report = {
      id: 'report_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      type, severity, note, status: 'open', timestamp: Date.now(), synced: false,
      source: 'wizard'
    };
    await db.addReport(report);
    return report.id;
  },

  renderWizardResult(kind, heading, text, reportId = null, emergency = false) {
    const actions = [];
    if (reportId) actions.push(`<button class="primary-btn" onclick="app.openTicket('${reportId}')" style="margin-top:14px">Ticket öffnen</button>`);
    if (emergency) actions.push(`<button class="submit-btn" onclick="app.emergency()" style="margin-top:8px">Notfall-Modus</button>`);
    actions.push(`<button class="ghost-btn" onclick="app.showView('selfhelp')" style="margin-top:8px">Zurück zur Selbsthilfe</button>`);

    document.getElementById('wizard-step').innerHTML = `
      <div class="ws-result ${kind}">
        <h3 style="margin-bottom:8px">${heading}</h3>
        <div>${this.escapeHtml(text)}</div>
      </div>
      ${actions.join('')}`;
    if (navigator.vibrate) navigator.vibrate(kind === 'resolved' ? [30, 20, 30] : 50);
  },

  // ===== ARTICLE =====
  openArticle(id) {
    const a = CONTENT.articles.find(x => x.id === id);
    if (!a) return;
    document.getElementById('article-title').textContent = a.title;
    document.getElementById('article-body').innerHTML =
      `<p style="color:var(--text-light);font-size:13px;margin-bottom:8px">📖 ${a.readMin} Min Lesezeit</p>` +
      a.body.map(b => {
        if (b.type === 'h')  return `<h3>${this.escapeHtml(b.text)}</h3>`;
        if (b.type === 'p')  return `<p>${this.escapeHtml(b.text)}</p>`;
        if (b.type === 'li') return `<ul><li>${this.escapeHtml(b.text)}</li></ul>`;
      }).join('');
    this.showView('article');
  },

  // ===== SUPPORT =====
  async loadSupport() {
    await this.loadTicketsTab();
    await this.loadTechsTab();
    await this.loadApptsTab();
  },

  switchSupportTab(btn) {
    document.querySelectorAll('#view-support .tab-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['tickets','techs','appts'].forEach(t => document.getElementById('support-' + t).classList.add('hidden'));
    document.getElementById('support-' + btn.dataset.tab).classList.remove('hidden');
  },

  async loadTicketsTab() {
    const reports = (await db.getReports()).sort((a,b) => b.timestamp - a.timestamp);
    document.getElementById('tic-open').textContent = reports.filter(r => r.status === 'open').length;
    document.getElementById('tic-prog').textContent = reports.filter(r => r.status === 'progress').length;
    document.getElementById('tic-done').textContent = reports.filter(r => r.status === 'resolved').length;
    document.getElementById('ticket-list').innerHTML = reports.length
      ? reports.map(r => this.renderReportItem(r)).join('')
      : '<div class="empty-state"><p>Keine Tickets vorhanden.</p></div>';
  },

  async loadTechsTab() {
    const techs = await db.getTechnicians();
    document.getElementById('technician-list').innerHTML = this.renderTechs(techs);
  },

  async loadApptsTab() {
    const techs = await db.getTechnicians();
    const appts = (await db.getAppointments()).sort((a,b) => a.scheduledFor - b.scheduledFor);
    document.getElementById('appointment-list').innerHTML = appts.length
      ? appts.map(a => this.renderApptCard(a, techs)).join('')
      : '<div class="empty-state"><p>Noch keine Termine vereinbart.</p></div>';
  },

  async loadAllAppts() {
    const techs = await db.getTechnicians();
    const appts = (await db.getAppointments()).sort((a,b) => a.scheduledFor - b.scheduledFor);
    document.getElementById('all-appts').innerHTML = appts.length
      ? appts.map(a => this.renderApptCard(a, techs)).join('')
      : '<div class="empty-state"><p>Keine Termine.</p></div>';
  },

  renderTechs(techs) {
    if (!techs.length) return '<div class="empty-state"><p>Noch keine Techniker registriert.</p></div>';
    return techs.map(t => `
      <div class="tech-card">
        <div class="tech-avatar">${(t.name || '?').charAt(0)}</div>
        <div class="tech-info">
          <div class="tech-name">${this.escapeHtml(t.name || '')}</div>
          <div class="tech-specialty">${this.escapeHtml(t.specialty || '')}</div>
          <div class="tech-phone">${this.escapeHtml(t.phone || '')}</div>
          <div class="tech-meta">
            ${t.rating ? `<span><span class="star">★</span> ${t.rating}</span>` : ''}
            ${t.jobs  ? `<span>${t.jobs} Einsätze</span>` : ''}
            ${t.district ? `<span>📍 ${this.escapeHtml(t.district)}</span>` : ''}
          </div>
        </div>
        <a href="tel:${this.escapeHtml(t.phone || '')}" class="tech-call-btn" aria-label="Anrufen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
      </div>`).join('');
  },

  async loadTechnicians() {
    const techs = await db.getTechnicians();
    document.getElementById('technician-list-full').innerHTML = this.renderTechs(techs);
  },

  showAddTechnician() {
    document.getElementById('modal-technician').classList.remove('hidden');
    ['tech-name','tech-phone','tech-specialty','tech-district'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tech-name').focus();
  },
  closeModal() { document.getElementById('modal-technician').classList.add('hidden'); },

  async addTechnician() {
    const name = document.getElementById('tech-name').value.trim();
    const phone = document.getElementById('tech-phone').value.trim();
    const specialty = document.getElementById('tech-specialty').value.trim();
    const district = document.getElementById('tech-district').value.trim();
    if (!name || !phone) { this.showToast('Name und Telefon nötig'); return; }
    await db.addTechnician({
      id: 'tech_' + Date.now(), name, phone,
      specialty: specialty || 'Allgemein', district: district || '—', rating: 0, jobs: 0
    });
    this.closeModal();
    await this.loadTechsTab();
    this.showToast('Techniker hinzugefügt!');
  },

  // ===== TICKET DETAIL =====
  async openTicket(reportId) {
    const reports = await db.getReports();
    const r = reports.find(x => x.id === reportId);
    if (!r) return;
    const techs = await db.getTechnicians();
    const d = new Date(r.timestamp);
    const time = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const timeline = [
      { time: time, text: `Ticket erstellt (${this.severityLabels[r.severity]})`, dot: r.severity === 'high' ? 'danger' : 'warn' }
    ];
    if (r.status === 'progress' || r.status === 'resolved') {
      timeline.push({ time: 'Folge', text: 'Techniker zugewiesen — Diagnose läuft', dot: '' });
    }
    if (r.status === 'resolved') {
      timeline.push({ time: 'Heute', text: 'Problem behoben — Ticket geschlossen', dot: '' });
    }

    document.getElementById('ticket-detail').innerHTML = `
      <div class="ticket-hero">
        <span class="report-status-badge badge-${r.status}">${this.statusLabels[r.status]}</span>
        <h3 style="margin-top:8px;font-size:18px">${this.problemLabels[r.type] || r.type}</h3>
        <div class="muted" style="margin-top:4px">${time} · ID ${r.id.slice(-6)}</div>
        ${r.note ? `<p style="margin-top:12px;font-size:14px;line-height:1.5">${this.escapeHtml(r.note)}</p>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><h3>Status ändern</h3></div>
        <div style="display:flex;gap:6px">
          ${['open','progress','resolved'].map(s => `
            <button class="tab-pill ${r.status===s?'active':''}" onclick="app.setTicketStatus('${r.id}','${s}')">${this.statusLabels[s]}</button>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Verlauf</h3></div>
        <div class="timeline">
          ${timeline.map(t => `
            <div class="tl-item">
              <div class="tl-dot ${t.dot}"></div>
              <div class="tl-time">${this.escapeHtml(t.time)}</div>
              <div class="tl-text">${this.escapeHtml(t.text)}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Empfohlene Techniker</h3></div>
        ${this.renderTechs(techs.slice(0,2))}
      </div>
    `;
    this.showView('ticket');
  },

  async setTicketStatus(id, status) {
    const reports = await db.getReports();
    const r = reports.find(x => x.id === id);
    if (!r) return;
    r.status = status;
    r.synced = false;
    await db.updateReport(r);
    this.openTicket(id);
    this.showToast('Status aktualisiert');
  },

  // ===== REPORT =====
  resetReportForm() {
    this.selectedProblem = null;
    this.selectedSeverity = null;
    document.querySelectorAll('#view-report .problem-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('#view-report .severity-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('severity-section').classList.add('hidden');
    document.getElementById('note-section').classList.add('hidden');
    const note = document.getElementById('report-note');
    if (note) note.value = '';
  },

  selectProblem(btn) {
    document.querySelectorAll('#view-report .problem-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedProblem = btn.dataset.type;
    document.getElementById('severity-section').classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate(25);
  },

  selectSeverity(btn) {
    document.querySelectorAll('#view-report .severity-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedSeverity = btn.dataset.severity;
    document.getElementById('note-section').classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate(25);
  },

  async submitReport() {
    if (!this.selectedProblem || !this.selectedSeverity) return;
    const report = {
      id: 'report_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      type: this.selectedProblem,
      severity: this.selectedSeverity,
      note: document.getElementById('report-note').value.trim(),
      status: 'open', timestamp: Date.now(), synced: false
    };
    await db.addReport(report);

    if (report.severity === 'high') {
      await db.addAlert({
        id: 'al_' + Date.now(), type: 'warning',
        title: 'Dringendes Ticket',
        text: `Neue Meldung: ${this.problemLabels[report.type]}. Techniker werden benachrichtigt.`,
        timestamp: Date.now(), acknowledged: false
      });
    }

    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    this.showToast('Ticket erstellt!');
    this.openTicket(report.id);
    this.trySync();
  },

  // ===== HISTORY =====
  async loadHistory() {
    const reports = (await db.getReports()).sort((a,b) => b.timestamp - a.timestamp);
    document.getElementById('history-list').innerHTML = reports.length
      ? reports.map(r => this.renderReportItem(r)).join('')
      : '<div class="empty-state"><p>Noch keine Meldungen.</p></div>';
  },

  // ===== SYSTEM =====
  async loadSystem() { await this.loadDevicesTab(); },

  switchSystemTab(btn) {
    document.querySelectorAll('#view-system .tab-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['devices','analytics','maint'].forEach(t => document.getElementById('system-' + t).classList.add('hidden'));
    document.getElementById('system-' + btn.dataset.tab).classList.remove('hidden');
    if (btn.dataset.tab === 'analytics') this.renderAnalyticsTab();
    if (btn.dataset.tab === 'maint')     this.renderMaintTab();
  },

  async loadDevicesTab() {
    const devices = await db.getDevices();
    const counts = { panel: 0, battery: 0, inverter: 0, controller: 0 };
    devices.forEach(d => counts[d.type] = (counts[d.type] || 0) + 1);
    const labels = { panel: 'Panels', battery: 'Batterien', inverter: 'Inverter', controller: 'Controller' };
    document.getElementById('device-summary').innerHTML = Object.entries(counts).map(([k, v]) => `
      <div class="ds-card">
        <div class="ds-icon ${k}">${this.deviceIcon(k)}</div>
        <div><div class="ds-val">${v}</div><div class="ds-lbl">${labels[k]}</div></div>
      </div>`).join('');

    document.getElementById('device-list').innerHTML = devices.map(d => `
      <div class="device-card" onclick="app.openDevice('${d.id}')">
        <div class="dc-icon">${this.deviceIcon(d.type)}</div>
        <div class="dc-info">
          <div class="dc-name">${this.escapeHtml(d.name)}</div>
          <div class="dc-sub">${this.escapeHtml(d.serial)}</div>
        </div>
        <span class="health-pill ${d.status}">${d.health}%</span>
      </div>`).join('');
  },

  deviceIcon(type) {
    const icons = {
      panel:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
      battery:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>',
      inverter: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9l3 3-3 3"/><path d="M16 9l-3 3 3 3"/></svg>',
      controller: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
    };
    return icons[type] || '';
  },

  openDevice(id) {
    db.getDevice(id).then(d => {
      if (!d) return;
      const yearsOld = ((Date.now() - d.installedAt) / (1000*60*60*24*365)).toFixed(1);
      const warrantyEnd = new Date(d.installedAt + d.warrantyYears * 365 * 24 * 60 * 60 * 1000);
      const warrantyValid = warrantyEnd > new Date();
      document.getElementById('device-title').textContent = d.name;
      document.getElementById('device-detail').innerHTML = `
        <div class="device-hero">
          ${charts.ring({ value: d.health, size: 100, stroke: 10, color: d.status === 'good' ? '#1a6b3c' : '#FB8C00', label: 'Gesundheit' })}
          <h3>${this.escapeHtml(d.name)}</h3>
          <div class="dh-serial">SN: ${this.escapeHtml(d.serial)}</div>
          ${d.note ? `<div style="margin-top:8px;color:var(--orange);font-size:13px">⚠ ${this.escapeHtml(d.note)}</div>` : ''}
          <div class="spec-list">
            <div class="spec-item"><div class="sl-lbl">Installiert</div><div class="sl-val">vor ${yearsOld} Jahren</div></div>
            <div class="spec-item"><div class="sl-lbl">Typ</div><div class="sl-val">${d.type}</div></div>
            <div class="spec-item"><div class="sl-lbl">Garantie</div><div class="sl-val">${warrantyValid ? 'Aktiv bis ' + warrantyEnd.getFullYear() : 'Abgelaufen'}</div></div>
            <div class="spec-item"><div class="sl-lbl">Status</div><div class="sl-val">${d.status === 'good' ? 'OK' : (d.status === 'warning' ? 'Achtung' : 'Fehler')}</div></div>
            ${d.cycles ? `<div class="spec-item"><div class="sl-lbl">Ladezyklen</div><div class="sl-val">${d.cycles}</div></div>` : ''}
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Aktionen</h3></div>
          <button class="primary-btn" style="margin-bottom:8px" onclick="app.showView('report')">Problem melden</button>
          <button class="ghost-btn" onclick="app.scheduleAppointment()">Wartung planen</button>
        </div>

        ${d.type === 'battery' ? `
        <div class="card">
          <div class="card-head"><h3>Batterie-Trend (14 Tage)</h3></div>
          <div id="batt-trend"></div>
        </div>` : ''}
      `;
      if (d.type === 'battery') {
        db.getEnergyLogs().then(logs => {
          const sorted = logs.sort((a,b) => a.date.localeCompare(b.date));
          document.getElementById('batt-trend').innerHTML = charts.line({
            data: sorted.map(l => l.battery), height: 110, color: '#1a6b3c'
          });
        });
      }
      this.showView('device');
    });
  },

  // ===== ANALYTICS =====
  async renderAnalyticsTab() {
    const logs = (await db.getEnergyLogs()).sort((a,b) => a.date.localeCompare(b.date));
    document.getElementById('ana-energy').innerHTML = charts.bars({
      data: logs.map(l => ({ produced: l.produced, consumed: l.consumed, label: new Date(l.date).getDate() })),
      height: 150
    });
    document.getElementById('ana-battery').innerHTML = charts.line({
      data: logs.map(l => l.battery), height: 120, color: '#2e9e5e'
    });
    this.renderImpact('impact-grid', logs);
  },

  async loadAnalytics() {
    const logs = (await db.getEnergyLogs()).sort((a,b) => a.date.localeCompare(b.date));
    document.getElementById('ana-energy2').innerHTML = charts.bars({
      data: logs.map(l => ({ produced: l.produced, consumed: l.consumed, label: new Date(l.date).getDate() })),
      height: 170
    });
    this.renderImpact('impact-grid2', logs);
  },

  renderImpact(targetId, logs) {
    const totalProd = logs.reduce((s,l) => s + l.produced, 0);
    const moneySaved = Math.round(totalProd * 8.5);     // ₹/kWh
    const yearProj   = Math.round((totalProd / logs.length) * 365 * 8.5);
    const co2        = (totalProd * 0.82).toFixed(1);   // kg CO2/kWh saved
    const dieselLit  = (totalProd * 0.27).toFixed(1);   // L diesel equivalent
    const trees      = Math.round(totalProd * 0.04);
    document.getElementById(targetId).innerHTML = `
      <div class="impact-card"><div class="ic-emoji">💰</div><div class="ic-val">₹${moneySaved}</div><div class="ic-lbl">In 14 Tagen gespart</div></div>
      <div class="impact-card"><div class="ic-emoji">📈</div><div class="ic-val">₹${yearProj}</div><div class="ic-lbl">Hochrechnung Jahr</div></div>
      <div class="impact-card"><div class="ic-emoji">🌍</div><div class="ic-val">${co2} kg</div><div class="ic-lbl">CO₂ vermieden</div></div>
      <div class="impact-card"><div class="ic-emoji">⛽</div><div class="ic-val">${dieselLit} L</div><div class="ic-lbl">Diesel ersetzt</div></div>
      <div class="impact-card"><div class="ic-emoji">🌳</div><div class="ic-val">${trees}</div><div class="ic-lbl">Baum-Äquivalente</div></div>
      <div class="impact-card"><div class="ic-emoji">⚡</div><div class="ic-val">${totalProd.toFixed(0)} kWh</div><div class="ic-lbl">Gesamt 14 Tage</div></div>
    `;
  },

  // ===== MAINTENANCE =====
  async renderMaintTab() {
    const nextDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 12);
    document.getElementById('next-maint').innerHTML = `
      <div class="appt-card">
        <div class="appt-date">
          <div class="ad-day">${nextDate.getDate()}</div>
          <div class="ad-mon">${nextDate.toLocaleDateString('de-DE', { month: 'short' })}</div>
        </div>
        <div class="appt-body">
          <div class="appt-title">Halbjährliche Wartung</div>
          <div class="appt-meta">Panels reinigen, Anschlüsse prüfen, Batterietest</div>
          <span class="appt-status confirmed">In 12 Tagen</span>
        </div>
      </div>`;

    const tasks = [
      { text: 'Panels reinigen', done: false },
      { text: 'Batterie-Spannung messen', done: true },
      { text: 'Kabel auf Korrosion prüfen', done: false },
      { text: 'Inverter-Lüfter entstauben', done: false },
      { text: 'Erdung kontrollieren', done: true },
      { text: 'MCB testen (Probeauslösung)', done: false }
    ];
    document.getElementById('maint-tasks').innerHTML = tasks.map((t,i) => `
      <li onclick="app.toggleMaintTask(${i})">
        <div class="maint-check ${t.done?'done':''}">${t.done ? '✓' : ''}</div>
        <span style="${t.done?'opacity:0.6;text-decoration:line-through':''}">${this.escapeHtml(t.text)}</span>
      </li>`).join('');
    this._maintTasks = tasks;

    document.getElementById('maint-history').innerHTML = `
      <div class="report-item">
        <div class="report-icon severity-low">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11l3 3L22 4l-2-2L12 10 11 9z"/></svg>
        </div>
        <div class="report-details">
          <div class="report-type">Wartung Q4 2025</div>
          <div class="report-meta">15.11.2025 · Rajesh Kumar · Alles OK</div>
        </div>
      </div>
      <div class="report-item">
        <div class="report-icon severity-low">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11l3 3L22 4l-2-2L12 10 11 9z"/></svg>
        </div>
        <div class="report-details">
          <div class="report-type">Panel-Reinigung</div>
          <div class="report-meta">02.10.2025 · Eigenleistung · 6 Panels</div>
        </div>
      </div>`;
  },

  toggleMaintTask(i) {
    if (!this._maintTasks) return;
    this._maintTasks[i].done = !this._maintTasks[i].done;
    this.renderMaintTab();
    if (navigator.vibrate) navigator.vibrate(20);
  },

  // ===== APPOINTMENTS MODAL =====
  async scheduleAppointment() {
    const techs = await db.getTechnicians();
    const sel = document.getElementById('appt-tech');
    sel.innerHTML = techs.map(t => `<option value="${t.id}">${this.escapeHtml(t.name)} — ${this.escapeHtml(t.specialty || '')}</option>`).join('');
    document.getElementById('appt-title').value = '';
    document.getElementById('appt-note').value = '';
    document.getElementById('appt-date').value = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10);
    document.getElementById('modal-appointment').classList.remove('hidden');
  },
  closeApptModal() { document.getElementById('modal-appointment').classList.add('hidden'); },

  async saveAppointment() {
    const title = document.getElementById('appt-title').value.trim() || 'Termin';
    const techId = document.getElementById('appt-tech').value;
    const date = document.getElementById('appt-date').value;
    const note = document.getElementById('appt-note').value.trim();
    if (!date) { this.showToast('Datum wählen'); return; }
    await db.addAppointment({
      id: 'app_' + Date.now(),
      title, techId,
      scheduledFor: new Date(date).getTime(),
      status: 'pending',
      notes: note
    });
    this.closeApptModal();
    this.showToast('Termin gespeichert');
    await this.loadApptsTab();
    if (this.currentView === 'home') this.loadHome();
  },

  // ===== COMMUNITY =====
  async loadCommunity() {
    const posts = (await db.getPosts()).sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || b.createdAt - a.createdAt);
    document.getElementById('post-list').innerHTML = posts.map(p => this.renderPost(p)).join('');
  },

  renderPost(p) {
    const ago = this.timeAgo(p.createdAt);
    return `<div class="post-card ${p.pinned?'pinned':''}">
      <div class="post-head">
        <div class="post-avatar">${p.avatar || (p.author||'?').charAt(0)}</div>
        <div style="flex:1;min-width:0">
          <div class="post-author">${this.escapeHtml(p.author)}</div>
          <div class="post-time">${ago}</div>
        </div>
        ${p.pinned ? '<span class="pinned-badge">📌 Angepinnt</span>' : ''}
      </div>
      <div class="post-body">${this.escapeHtml(p.body)}</div>
      <div class="post-actions">
        <button class="post-action" onclick="app.likePost('${p.id}')">♥ ${p.likes || 0}</button>
        <button class="post-action">💬 Kommentieren</button>
      </div>
    </div>`;
  },

  async likePost(id) {
    const posts = await db.getPosts();
    const p = posts.find(x => x.id === id);
    if (!p) return;
    p.likes = (p.likes || 0) + 1;
    await db.addPost(p);
    this.loadCommunity();
    if (navigator.vibrate) navigator.vibrate(15);
  },

  async addPost() {
    const text = document.getElementById('post-input').value.trim();
    if (!text) return;
    const name = await db.getSetting('community_name') || 'Du';
    await db.addPost({
      id: 'post_' + Date.now(),
      author: name + ' (Du)',
      avatar: name.charAt(0),
      body: text, createdAt: Date.now(), likes: 0
    });
    document.getElementById('post-input').value = '';
    this.loadCommunity();
    this.showToast('Beitrag gepostet');
  },

  // ===== LEARNING =====
  async loadLearning() {
    const all = await db.getAllProgress();
    const done = all.filter(p => p.completed).length;
    const total = CONTENT.lessons.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    document.getElementById('lp-ring').innerHTML = charts.ring({ value: pct, size: 76, stroke: 7, color: '#1a6b3c' });
    document.getElementById('lp-text').textContent = `${done} von ${total} Modulen abgeschlossen`;

    document.getElementById('lesson-list').innerHTML = CONTENT.lessons.map((l, i) => {
      const p = all.find(x => x.lessonId === l.id);
      const isDone = p && p.completed;
      return `<div class="lesson-card" onclick="app.startLesson('${l.id}')">
        <div class="lesson-num ${isDone?'done':''}">${isDone ? '✓' : (i+1)}</div>
        <div class="lesson-info">
          <div class="lesson-title-text">${this.escapeHtml(l.title)}</div>
          <div class="lesson-meta">${l.level} · ${l.durationMin} Min · ${l.slides.length} Folien + Quiz</div>
        </div>
        <span class="mi-arrow">›</span>
      </div>`;
    }).join('');
  },

  startLesson(id) {
    const l = CONTENT.lessons.find(x => x.id === id);
    if (!l) return;
    this.lessonId = id;
    this.lessonIndex = 0;
    document.getElementById('lesson-title').textContent = l.title;
    this.showView('lesson');
    this.renderLesson();
  },

  renderLesson() {
    const l = CONTENT.lessons.find(x => x.id === this.lessonId);
    const totalSteps = l.slides.length + l.quiz.length + 1; // +1 for completion
    const pct = Math.min(100, (this.lessonIndex / (totalSteps - 1)) * 100);
    document.getElementById('lp-bar').style.width = pct + '%';

    if (this.lessonIndex < l.slides.length) {
      const s = l.slides[this.lessonIndex];
      document.getElementById('lesson-content').innerHTML = `
        <div class="slide">
          <h3>${this.escapeHtml(s.title)}</h3>
          <p>${this.escapeHtml(s.body)}</p>
          <div class="slide-actions">
            ${this.lessonIndex > 0 ? `<button class="ghost-btn" style="margin-top:0" onclick="app.lessonPrev()">Zurück</button>` : ''}
            <button class="primary-btn" onclick="app.lessonNext()">Weiter</button>
          </div>
        </div>`;
    } else {
      const qIdx = this.lessonIndex - l.slides.length;
      if (qIdx < l.quiz.length) {
        const q = l.quiz[qIdx];
        document.getElementById('lesson-content').innerHTML = `
          <div class="slide">
            <h3>Quiz ${qIdx + 1} / ${l.quiz.length}</h3>
            <p style="margin-bottom:16px">${this.escapeHtml(q.q)}</p>
            ${q.a.map((opt, i) => `<button class="quiz-opt" onclick="app.answerQuiz(${i})">${this.escapeHtml(opt)}</button>`).join('')}
          </div>`;
      } else {
        // completion
        db.setProgress({ lessonId: this.lessonId, completed: true, completedAt: Date.now() });
        document.getElementById('lesson-content').innerHTML = `
          <div class="slide center">
            <div style="font-size:48px;margin-bottom:8px">🎓</div>
            <h3>Lektion abgeschlossen!</h3>
            <p>Großartig! Du hast das Modul "${this.escapeHtml(l.title)}" gemeistert.</p>
            <div class="slide-actions" style="justify-content:center">
              <button class="primary-btn" onclick="app.showView('learning')">Zurück zum Lernzentrum</button>
            </div>
          </div>`;
        if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);
      }
    }
  },

  lessonPrev() { if (this.lessonIndex > 0) { this.lessonIndex--; this.renderLesson(); } },
  lessonNext() { this.lessonIndex++; this.renderLesson(); },

  answerQuiz(i) {
    const l = CONTENT.lessons.find(x => x.id === this.lessonId);
    const qIdx = this.lessonIndex - l.slides.length;
    const q = l.quiz[qIdx];
    document.querySelectorAll('.quiz-opt').forEach((btn, idx) => {
      if (idx === q.correct) btn.classList.add('correct');
      else if (idx === i) btn.classList.add('wrong');
      btn.disabled = true;
    });
    if (navigator.vibrate) navigator.vibrate(i === q.correct ? 30 : [20, 30, 20]);
    setTimeout(() => { this.lessonIndex++; this.renderLesson(); }, 900);
  },

  // ===== ALERTS =====
  async loadAlerts() {
    const alerts = (await db.getAlerts()).sort((a,b) => b.timestamp - a.timestamp);
    if (!alerts.length) {
      document.getElementById('alert-list').innerHTML = '<div class="empty-state"><p>Keine Benachrichtigungen.</p></div>';
      return;
    }
    document.getElementById('alert-list').innerHTML = alerts.map(a => {
      const icon = a.type === 'warning' ? '⚠' : a.type === 'error' ? '🚨' : 'ℹ';
      const sev = a.type === 'warning' ? 'medium' : a.type === 'error' ? 'high' : 'low';
      return `<div class="report-item" onclick="app.ackAlert('${a.id}')">
        <div class="report-icon severity-${sev}" style="font-size:18px">${icon}</div>
        <div class="report-details">
          <div class="report-type">${this.escapeHtml(a.title)}</div>
          <div class="report-meta">${this.escapeHtml(a.text)}</div>
          <div class="report-meta">${this.timeAgo(a.timestamp)}</div>
        </div>
        ${!a.acknowledged ? '<span class="report-status-badge badge-open">Neu</span>' : ''}
      </div>`;
    }).join('');
  },

  async ackAlert(id) {
    const alerts = await db.getAlerts();
    const a = alerts.find(x => x.id === id);
    if (!a || a.acknowledged) return;
    a.acknowledged = true;
    await db.updateAlert(a);
    this.loadAlerts();
    this.loadHome();
  },

  showAlerts() { this.showView('alerts'); },

  // ===== EMERGENCY =====
  async emergency() {
    const techs = await db.getTechnicians();
    document.getElementById('emerg-tech-list').innerHTML = this.renderTechs(techs.slice(0,2));
    document.getElementById('modal-emergency').classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
  },
  closeEmergency() { document.getElementById('modal-emergency').classList.add('hidden'); },

  // ===== MORE =====
  async loadMore() { /* static menu — alerts badge already maintained */ },

  // ===== SETTINGS =====
  async loadSettings() {
    const community = await db.getSetting('community_name');
    const state = await db.getSetting('state');
    const role = await db.getSetting('role');
    const language = await db.getSetting('language');
    const theme = await db.getSetting('theme') || 'light';

    if (community) {
      document.getElementById('community-name').textContent = community + (state ? ', ' + state : '');
      const ci = document.getElementById('setting-community');
      if (ci) ci.value = community;
    }
    if (state) {
      const si = document.getElementById('setting-state');
      if (si) si.value = state;
    }
    if (role) {
      this.selectedRole = role;
      document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
    }
    if (language) {
      this.selectedLang = language;
      const li = document.getElementById('setting-language');
      if (li) li.value = language;
    }
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));

    const owmInput = document.getElementById('setting-owm-key');
    if (owmInput) owmInput.value = localStorage.getItem('owm_api_key') || '';
    const claudeInput = document.getElementById('setting-claude-key');
    if (claudeInput) claudeInput.value = localStorage.getItem('claude_api_key') || '';
  },

  selectRole(btn) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.selectedRole = btn.dataset.role;
  },

  async renderWeather() {
    if (typeof Weather === 'undefined') return;
    const data = await Weather.get();
    const today = data.today;
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    const potEl  = document.getElementById('weather-pot');
    const fcEl   = document.getElementById('weather-forecast');
    if (!iconEl || !tempEl || !potEl || !fcEl) return;

    iconEl.innerHTML = charts.weatherIcon(today.condition, 48);
    tempEl.textContent = today.temp;
    potEl.textContent = today.solarPotential;
    fcEl.innerHTML = data.forecast.map(d => `
      <div class="wf-day">
        <div class="wf-name">${d.day}</div>
        ${charts.weatherIcon(d.condition, 28)}
        <div class="wf-temp">${d.high}° / ${d.low}°</div>
        <div class="wf-solar">${d.solar}%</div>
      </div>`).join('');

    const meta = document.getElementById('weather-meta');
    if (meta) {
      const labels = { live: '● Live', cache: '◉ Cache', 'cache-stale': '⚠ Veraltet', mock: '○ Demo-Daten' };
      const subtitle = today.description ? today.description.charAt(0).toUpperCase() + today.description.slice(1) : '';
      meta.innerHTML = `
        <span class="w-meta-status w-${data.source}">${labels[data.source] || data.source}</span>
        ${data.city ? `<span class="w-meta-city">${data.city}</span>` : ''}
        ${subtitle ? `<span class="w-meta-desc">· ${subtitle}</span>` : ''}
        ${today.humidity != null ? `<span class="w-meta-desc">· 💧 ${today.humidity}%</span>` : ''}
        ${today.wind != null ? `<span class="w-meta-desc">· 💨 ${today.wind} km/h</span>` : ''}
      `;
    }

    // Fehler-Hinweis direkt in der Karte anzeigen
    const errEl = document.getElementById('weather-error');
    if (errEl) {
      if (data.error && (data.source === 'mock' || data.source === 'cache-stale')) {
        errEl.classList.remove('hidden');
        errEl.innerHTML = `
          <strong>⚠ Live-Wetter nicht verfügbar</strong>
          <div>${data.error}</div>
          <button class="link-btn" onclick="app.refreshWeather()" style="margin-top:6px;">Erneut versuchen</button>
        `;
      } else {
        errEl.classList.add('hidden');
        errEl.innerHTML = '';
      }
    }
  },

  async refreshWeather() {
    if (typeof Weather === 'undefined') return;
    const btn = document.getElementById('weather-refresh');
    if (btn) btn.classList.add('spinning');
    await Weather.refresh();
    await this.renderWeather();
    if (btn) setTimeout(() => btn.classList.remove('spinning'), 400);
  },

  setTheme(btn) {
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.dataset.theme;
    db.setSetting('theme', t);
    this.applyTheme(t);
  },

  async applyTheme(forced) {
    const t = forced || (await db.getSetting('theme')) || 'light';
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('theme-dark', dark);
  },

  async saveSettings() {
    const community = document.getElementById('setting-community').value.trim();
    const state = document.getElementById('setting-state').value;
    const language = document.getElementById('setting-language').value;
    const contrast = document.getElementById('set-contrast').checked;
    const large = document.getElementById('set-large').checked;

    if (community) await db.setSetting('community_name', community);
    await db.setSetting('state', state);
    await db.setSetting('role', this.selectedRole);
    await db.setSetting('language', language);
    await db.setSetting('contrast', contrast);
    await db.setSetting('large', large);

    const owmKey = document.getElementById('setting-owm-key').value.trim();
    const claudeKey = document.getElementById('setting-claude-key').value.trim();
    if (owmKey) localStorage.setItem('owm_api_key', owmKey);
    else localStorage.removeItem('owm_api_key');
    if (claudeKey) localStorage.setItem('claude_api_key', claudeKey);
    else localStorage.removeItem('claude_api_key');
    localStorage.removeItem('owm_cache');

    document.body.classList.toggle('contrast', contrast);
    document.body.classList.toggle('large', large);
    await this.loadSettings();

    this.showToast('Einstellungen gespeichert');
    if (navigator.vibrate) navigator.vibrate(30);

    if (owmKey && typeof Weather !== 'undefined') Weather.refresh().then(() => this.loadHome());
  },

  // ===== OFFLINE / SYNC =====
  setupOfflineDetection() {
    const banner = document.getElementById('offline-banner');
    const upd = () => banner.classList.toggle('hidden', navigator.onLine);
    window.addEventListener('online',  () => { upd(); this.showSyncBanner(); this.trySync(); });
    window.addEventListener('offline', upd);
    upd();
  },
  showSyncBanner() {
    const b = document.getElementById('sync-banner');
    b.classList.remove('hidden');
    setTimeout(() => b.classList.add('hidden'), 2500);
  },
  setupSync() { setInterval(() => this.trySync(), 5 * 60 * 1000); },
  async trySync() {
    if (!navigator.onLine) return;
    const unsynced = await db.getUnsyncedReports();
    if (!unsynced.length) return;
    for (const r of unsynced) { r.synced = true; await db.updateReport(r); }
    console.log(`[sync] ${unsynced.length} reports`);
  },

  // ===== UTIL =====
  showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-message').textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  },

  timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Gerade eben';
    if (m < 60) return `vor ${m} Min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `vor ${h} Std`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `vor ${d} Tg`;
    return new Date(ts).toLocaleDateString('de-DE');
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
