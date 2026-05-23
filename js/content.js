// SolarConnect — Content library (India context)
// Self-help diagnostic trees, knowledge base, learning modules, demo data

const CONTENT = {

  // ===== TROUBLESHOOTING WIZARDS (decision trees) =====
  // Each step: { id, title, body, options:[{label, next}] OR action:{type, payload} }
  wizards: {
    power_outage: {
      title: 'Kein Strom im Haus',
      icon: 'bolt',
      estMinutes: 5,
      root: 'start',
      steps: {
        start: {
          title: 'Erster Check',
          body: 'Schaue auf den Wechselrichter (Inverter). Welche LED leuchtet?',
          options: [
            { label: 'Grüne LED', next: 'green' },
            { label: 'Rote LED',  next: 'red' },
            { label: 'Keine LED an', next: 'none' }
          ]
        },
        green: {
          title: 'Inverter läuft',
          body: 'Der Inverter ist in Ordnung. Prüfe nun den Hauptschalter (MCB) im Sicherungskasten. Steht er auf "ON"?',
          options: [
            { label: 'Ja, ist ON', next: 'check_socket' },
            { label: 'Nein, ist OFF', next: 'flip_mcb' }
          ]
        },
        flip_mcb: {
          title: 'MCB einschalten',
          body: 'Schiebe den Hebel langsam nach oben auf "ON". Warte 10 Sekunden. Hast du jetzt Strom?',
          options: [
            { label: 'Ja, alles geht!', action: { type: 'resolved' } },
            { label: 'Nein, MCB fällt sofort wieder', next: 'short_circuit' }
          ]
        },
        short_circuit: {
          title: 'Möglicher Kurzschluss',
          body: 'Trenne alle Geräte vom Stromnetz (besonders Geräte mit Wasser). Versuche dann erneut. Falls MCB wieder auslöst → Techniker rufen.',
          options: [
            { label: 'Jetzt geht es', action: { type: 'resolved' } },
            { label: 'MCB fällt weiter', action: { type: 'escalate', severity: 'high', type_: 'wiring_issue' } }
          ]
        },
        check_socket: {
          title: 'Steckdose testen',
          body: 'Teste eine andere Steckdose mit einer Lampe. Geht das Licht?',
          options: [
            { label: 'Ja', action: { type: 'tip', text: 'Die ursprüngliche Steckdose oder das Gerät ist defekt. Markiere die Dose und nutze sie nicht.' } },
            { label: 'Nein, keine Dose geht', action: { type: 'escalate', severity: 'high', type_: 'power_outage' } }
          ]
        },
        red: {
          title: 'Fehler am Inverter',
          body: 'Rote LED bedeutet Fehler. Notiere den Fehlercode am Display (falls vorhanden). Schalte den Inverter aus, warte 30 Sekunden, und schalte ihn wieder ein.',
          options: [
            { label: 'Rot bleibt', action: { type: 'escalate', severity: 'high', type_: 'inverter_issue' } },
            { label: 'Wieder grün!', action: { type: 'resolved' } }
          ]
        },
        none: {
          title: 'Inverter aus',
          body: 'Prüfe die Hauptsicherung am Inverter (DC-Switch). Ist sie auf "ON"?',
          options: [
            { label: 'Ja', next: 'battery_low' },
            { label: 'Nein → einschalten', next: 'flip_dc' }
          ]
        },
        flip_dc: {
          title: 'DC einschalten',
          body: 'Schalte den DC-Schalter auf ON. Warte 1 Minute, bis der Inverter startet.',
          options: [
            { label: 'LED leuchtet jetzt', action: { type: 'resolved' } },
            { label: 'Bleibt aus', next: 'battery_low' }
          ]
        },
        battery_low: {
          title: 'Batteriestand prüfen',
          body: 'Wenn die Batterie tief entladen ist, schaltet der Inverter sich ab. Zeigt das Batterie-Display unter 20%?',
          options: [
            { label: 'Ja, Batterie leer', action: { type: 'tip', text: 'Warte bis zur nächsten Sonnenstunde. Falls bewölkt, reduziere Verbrauch (Licht, Lüfter aus).' } },
            { label: 'Nein, Batterie OK', action: { type: 'escalate', severity: 'high', type_: 'inverter_issue' } }
          ]
        }
      }
    },

    battery_issue: {
      title: 'Batterie-Problem',
      icon: 'battery',
      estMinutes: 4,
      root: 'start',
      steps: {
        start: {
          title: 'Was ist das Problem?',
          body: 'Wähle aus:',
          options: [
            { label: 'Lädt nicht voll', next: 'not_full' },
            { label: 'Entlädt zu schnell', next: 'fast_drain' },
            { label: 'Batterie ist heiß / Geruch', next: 'hot' }
          ]
        },
        not_full: {
          title: 'Sonneneinstrahlung prüfen',
          body: 'Wann hast du das letzte Mal die Panels gereinigt? Staub und Vogelkot reduzieren die Leistung um bis zu 30%.',
          options: [
            { label: 'Vor mehr als 1 Monat', action: { type: 'tip', text: 'Reinige die Panels morgens mit weichem Tuch und sauberem Wasser. Niemals heiße Panels reinigen!' } },
            { label: 'Erst vor Kurzem', next: 'check_shading' }
          ]
        },
        check_shading: {
          title: 'Verschattung?',
          body: 'Sind die Panels durch Bäume, Antennen oder neue Gebäude verschattet?',
          options: [
            { label: 'Ja, Schatten', action: { type: 'tip', text: 'Schon ein kleiner Schatten kann eine ganze Reihe lahmlegen. Äste schneiden falls möglich, sonst Techniker konsultieren.' } },
            { label: 'Nein', action: { type: 'escalate', severity: 'medium', type_: 'panel_damage' } }
          ]
        },
        fast_drain: {
          title: 'Verbrauch prüfen',
          body: 'Sind neue Geräte angeschlossen (Kühlschrank, Pumpe, Fernseher)? Diese ziehen viel Strom.',
          options: [
            { label: 'Ja', action: { type: 'tip', text: 'Berechne die Wattzahl aller Geräte. Eventuell Inverter zu klein dimensioniert.' } },
            { label: 'Nein, gleiche Geräte', next: 'battery_age' }
          ]
        },
        battery_age: {
          title: 'Alter der Batterie',
          body: 'Wie alt ist die Batterie?',
          options: [
            { label: 'Unter 3 Jahre', action: { type: 'escalate', severity: 'medium', type_: 'battery_issue' } },
            { label: 'Über 5 Jahre', action: { type: 'tip', text: 'Bleibatterien halten 5-7 Jahre, Lithium 8-10. Plane Austausch ein. Sprich mit dem Techniker.' } }
          ]
        },
        hot: {
          title: 'STOPP – Gefahr!',
          body: 'Schalte sofort den Hauptschalter aus. Verlasse den Raum. Heiße Batterien können explodieren oder giftige Gase freisetzen.',
          options: [
            { label: 'Erledigt, jetzt Notfall melden', action: { type: 'escalate', severity: 'high', type_: 'battery_issue', emergency: true } }
          ]
        }
      }
    },

    panel_damage: {
      title: 'Panel beschädigt',
      icon: 'panel',
      estMinutes: 3,
      root: 'start',
      steps: {
        start: {
          title: 'Was siehst du?',
          body: '',
          options: [
            { label: 'Glas zerbrochen', next: 'glass' },
            { label: 'Verfärbung / Flecken', next: 'discolor' },
            { label: 'Lose Verkabelung', next: 'cable' }
          ]
        },
        glass: {
          title: 'Gefahr durch Stromschlag',
          body: 'Nicht berühren! Gebrochenes Solarpanel führt Strom auch ohne Sonne. Decke es ab mit Stoff oder Karton, um Stromproduktion zu stoppen.',
          options: [
            { label: 'Abgedeckt → Techniker', action: { type: 'escalate', severity: 'high', type_: 'panel_damage' } }
          ]
        },
        discolor: {
          title: 'Hot-Spot oder Alterung',
          body: 'Braune Flecken oder Verfärbungen können Hot-Spots sein. Das Panel produziert weiter, aber mit weniger Leistung. Fotografiere es für den Techniker.',
          options: [
            { label: 'OK, melden', action: { type: 'escalate', severity: 'medium', type_: 'panel_damage' } }
          ]
        },
        cable: {
          title: 'Sichern, nicht reparieren',
          body: 'Lose Kabel niemals selbst anfassen. Klebe sie provisorisch mit Isolierband ab, ohne die Kontakte zu berühren.',
          options: [
            { label: 'Erledigt, Techniker rufen', action: { type: 'escalate', severity: 'high', type_: 'wiring_issue' } }
          ]
        }
      }
    }
  },

  // ===== KNOWLEDGE BASE =====
  articles: [
    { id: 'art_clean',     category: 'maintenance', title: 'Solarpanels richtig reinigen',
      summary: 'Staub kostet bis zu 30% Leistung. So reinigst du sicher.', readMin: 4,
      body: [
        { type: 'p', text: 'Im Monsun-Staub und in den trockenen Monaten ist regelmäßige Reinigung Pflicht. Schon dünner Staub reduziert die Energie deutlich.' },
        { type: 'h', text: 'Wann reinigen?' },
        { type: 'p', text: 'Alle 2-4 Wochen, oder nach Staubstürmen. Immer früh morgens (Panels kühl).' },
        { type: 'h', text: 'Wie reinigen?' },
        { type: 'li', text: 'Weiches Tuch oder Mikrofaser-Wischer' },
        { type: 'li', text: 'Sauberes Wasser (kein Salzwasser!)' },
        { type: 'li', text: 'Niemals harte Bürsten oder Hochdruckreiniger' },
        { type: 'li', text: 'Vogelkot: einweichen, dann sanft wischen' },
        { type: 'h', text: 'Sicherheit' },
        { type: 'p', text: 'Schalte den DC-Schalter aus. Trage rutschfeste Schuhe. Arbeite niemals allein auf dem Dach.' }
      ]
    },
    { id: 'art_battery',   category: 'maintenance', title: 'Batterie-Lebensdauer verlängern',
      summary: 'Praktische Tipps für 2-3 Jahre mehr Nutzung.', readMin: 5,
      body: [
        { type: 'h', text: '1. Tiefentladung vermeiden' },
        { type: 'p', text: 'Lass die Batterie nie unter 20% fallen. Plane den Verbrauch.' },
        { type: 'h', text: '2. Hitze ist der Feind' },
        { type: 'p', text: 'Batterieraum kühl und belüftet halten. Bei 35°C verdoppelt sich die Alterung.' },
        { type: 'h', text: '3. Anschlüsse pflegen' },
        { type: 'p', text: 'Monatlich auf Korrosion prüfen. Bei Bleibatterien: Polfett auftragen.' },
        { type: 'h', text: '4. Vollladung nicht überspringen' },
        { type: 'p', text: 'Alle 2 Wochen die Batterie ganz vollladen lassen — verhindert Sulfatierung.' }
      ]
    },
    { id: 'art_safety',    category: 'safety', title: 'Sicherheit bei Solaranlagen',
      summary: 'Stromschlag, Brand, Verätzung — was du wissen musst.', readMin: 6,
      body: [
        { type: 'h', text: 'Solarpanels stehen IMMER unter Spannung' },
        { type: 'p', text: 'Auch nachts und bei Bewölkung. Niemals offene Kabel anfassen.' },
        { type: 'h', text: 'Im Notfall' },
        { type: 'li', text: 'DC-Schalter sofort ausschalten' },
        { type: 'li', text: 'Bei Brand: Wasser meidet, da Strom — Sand oder CO2-Löscher' },
        { type: 'li', text: 'Bei Batteriesäure auf Haut: 15 Minuten mit Wasser spülen, Arzt' },
        { type: 'h', text: 'Kinder fernhalten' },
        { type: 'p', text: 'Batterieraum immer abschließen.' }
      ]
    },
    { id: 'art_monsoon',   category: 'weather',  title: 'Monsun-Vorbereitung',
      summary: 'Vor der Regenzeit: Was du tun musst.', readMin: 4,
      body: [
        { type: 'p', text: 'Der Monsun bringt Wind, Hagel und Blitze. Bereite die Anlage vor:' },
        { type: 'li', text: 'Halterungen und Schrauben prüfen — alle fest?' },
        { type: 'li', text: 'Erdung überprüfen lassen (Schutz vor Blitzschlag)' },
        { type: 'li', text: 'Kabel-Verbindungen mit Silikon abdichten' },
        { type: 'li', text: 'Wechselrichter vor Wasser schützen — Schutzdach?' },
        { type: 'li', text: 'Notfallplan: Wer ruft den Techniker?' }
      ]
    },
    { id: 'art_dimension', category: 'planning',  title: 'Wie viel Strom brauche ich?',
      summary: 'Verbrauch berechnen — Beispielrechnung für Haushalt.', readMin: 5,
      body: [
        { type: 'h', text: 'Faustregel' },
        { type: 'p', text: 'Ein typischer Dorfhaushalt mit Licht, Lüfter und TV braucht 2-4 kWh pro Tag.' },
        { type: 'h', text: 'Beispiel' },
        { type: 'li', text: '4 LED-Lampen (10W) × 6 Std = 240 Wh' },
        { type: 'li', text: '2 Lüfter (50W) × 8 Std = 800 Wh' },
        { type: 'li', text: 'TV (80W) × 4 Std = 320 Wh' },
        { type: 'li', text: 'Handy laden + Sonstiges = 200 Wh' },
        { type: 'p', text: 'Summe: ~1.5 kWh/Tag. Plane 30% Reserve = 2 kWh.' },
        { type: 'h', text: 'Empfohlene Anlage' },
        { type: 'p', text: '500W Panel + 200Ah Batterie + 1000W Inverter.' }
      ]
    },
    { id: 'art_subsidy',   category: 'finance', title: 'Förderungen in Indien',
      summary: 'PM Surya Ghar Yojana und regionale Programme.', readMin: 4,
      body: [
        { type: 'h', text: 'PM Surya Ghar Muft Bijli Yojana' },
        { type: 'p', text: 'Bis zu ₹78,000 Subvention für 3 kW Dachsolaranlage für Privathaushalte. Antrag online über pmsuryaghar.gov.in.' },
        { type: 'h', text: 'Saubhagya Scheme' },
        { type: 'p', text: 'Kostenlose Solaranlage für Off-Grid-Haushalte ohne Stromanschluss.' },
        { type: 'h', text: 'State-Schemes' },
        { type: 'p', text: 'Viele Bundesstaaten (Gujarat, Maharashtra, Tamil Nadu) bieten zusätzliche Förderung. Frage beim Panchayat-Büro nach.' }
      ]
    }
  ],

  // ===== LEARNING MODULES =====
  lessons: [
    {
      id: 'l_basics',  title: 'Solarstrom Basics',  level: 'Anfänger', durationMin: 8,
      slides: [
        { title: 'Was ist Solarstrom?', body: 'Solarpanels wandeln Sonnenlicht direkt in Strom (DC) um. Der Inverter macht daraus Haushaltsstrom (AC, 230V).' },
        { title: 'Die 4 Komponenten', body: '1) Panels auf dem Dach\n2) Charge-Controller\n3) Batterie für Speicherung\n4) Inverter für Geräte' },
        { title: 'Tag und Nacht', body: 'Tagsüber produzieren Panels Strom und laden die Batterie. Nachts liefert die Batterie den Strom.' }
      ],
      quiz: [
        { q: 'Was wandelt Sonnenlicht in Strom um?',
          a: ['Inverter','Solarpanel','Batterie'], correct: 1 },
        { q: 'Wozu dient die Batterie?',
          a: ['Strom speichern','Spannung erhöhen','Sicherheit'], correct: 0 }
      ]
    },
    {
      id: 'l_care',    title: 'Pflege & Wartung', level: 'Anfänger', durationMin: 10,
      slides: [
        { title: 'Reinigung', body: 'Alle 2-4 Wochen mit Wasser und weichem Tuch. Niemals harte Bürsten.' },
        { title: 'Sichtprüfung', body: 'Monatlich: Sind alle Kabel fest? Sind die Panels beschädigt? Funktioniert die LED am Inverter?' },
        { title: 'Batteriepflege', body: 'Wasserstand prüfen (bei Bleibatterien). Pole sauber halten.' }
      ],
      quiz: [
        { q: 'Wie oft Panels reinigen?',
          a: ['1x pro Jahr','alle 2-4 Wochen','täglich'], correct: 1 },
        { q: 'Was darf NICHT zur Reinigung?',
          a: ['Wasser','weiches Tuch','Drahtbürste'], correct: 2 }
      ]
    },
    {
      id: 'l_safety',  title: 'Sicherheit im Notfall', level: 'Fortgeschritten', durationMin: 12,
      slides: [
        { title: 'Stromschlag', body: 'Panels stehen IMMER unter Spannung. Niemals offene Kabel anfassen.' },
        { title: 'Brandgefahr', body: 'Bei Rauch: DC-Schalter aus, mit Sand oder CO2 löschen — niemals Wasser.' },
        { title: 'Batterieproblem', body: 'Bei Hitze oder Geruch: sofort raus, Hauptschalter aus, Notfall melden.' }
      ],
      quiz: [
        { q: 'Stehen Panels nachts unter Strom?',
          a: ['Nein','Ja','Nur bei Vollmond'], correct: 1 },
        { q: 'Womit Solarbrand löschen?',
          a: ['Wasser','Sand','Schaum'], correct: 1 }
      ]
    },
    {
      id: 'l_diagnose',title: 'Probleme selbst diagnostizieren', level: 'Fortgeschritten', durationMin: 15,
      slides: [
        { title: 'Erst LED prüfen', body: 'Die Inverter-LED zeigt den Zustand: grün = OK, rot = Fehler, aus = stromlos.' },
        { title: 'Dann Batterie', body: 'Spannung am Batterie-Display ablesen. Unter 11V (12V-System) ist tief.' },
        { title: 'Wann Techniker rufen?', body: 'Bei Rauch, gebrochenem Glas, MCB löst wiederholt aus, oder rote LED bleibt.' }
      ],
      quiz: [
        { q: 'Was bedeutet rote Inverter-LED?',
          a: ['Alles OK','Fehler','Vollladung'], correct: 1 },
        { q: 'Wann sofort Techniker rufen?',
          a: ['Bei Wolken','Bei Rauch','Bei Sonnenuntergang'], correct: 1 }
      ]
    }
  ],

  // ===== DEMO TECHNICIANS (India) =====
  technicians: [
    { id: 'tech_1', name: 'Rajesh Kumar',      phone: '+91 98765 43210', specialty: 'Wechselrichter & Verkabelung', district: 'Pune, Maharashtra', rating: 4.8, jobs: 142, languages: ['Hindi','English','Marathi'] },
    { id: 'tech_2', name: 'Priya Sharma',      phone: '+91 87654 32109', specialty: 'Batterien & Speichersysteme',  district: 'Jaipur, Rajasthan',  rating: 4.9, jobs: 98,  languages: ['Hindi','English'] },
    { id: 'tech_3', name: 'Arjun Reddy',       phone: '+91 76543 21098', specialty: 'Solarpanels & Montage',         district: 'Hyderabad, Telangana', rating: 4.7, jobs: 211, languages: ['Telugu','Hindi','English'] },
    { id: 'tech_4', name: 'Lakshmi Iyer',      phone: '+91 65432 10987', specialty: 'Allgemein & Schulung',          district: 'Madurai, Tamil Nadu', rating: 5.0, jobs: 76,  languages: ['Tamil','English'] }
  ],

  // ===== DEMO DEVICES =====
  devices: [
    { id: 'dev_p1', type: 'panel',    name: 'Tata Power Solar 330W', serial: 'TPS-2023-A4421',  installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 25, status: 'good',    health: 96 },
    { id: 'dev_p2', type: 'panel',    name: 'Tata Power Solar 330W', serial: 'TPS-2023-A4422',  installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 25, status: 'good',    health: 94 },
    { id: 'dev_p3', type: 'panel',    name: 'Tata Power Solar 330W', serial: 'TPS-2023-A4423',  installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 25, status: 'warning', health: 78, note: 'Verschmutzung erkannt' },
    { id: 'dev_b1', type: 'battery',  name: 'Luminous Li-ion 200Ah', serial: 'LUM-LIB-77821',  installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 5,  status: 'good',    health: 92, cycles: 412 },
    { id: 'dev_i1', type: 'inverter', name: 'Su-Kam Falcon 2.5 kVA', serial: 'SK-FAL-30019',   installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 3,  status: 'good',    health: 99 },
    { id: 'dev_c1', type: 'controller', name: 'MPPT 40A Charge Controller', serial: 'MPPT-40-118', installedAt: Date.now() - 1000*60*60*24*420, warrantyYears: 3, status: 'good', health: 98 }
  ],

  // ===== COMMUNITY POSTS =====
  posts: [
    { id: 'post_1', author: 'Anita (Ward 4)', avatar: 'A', createdAt: Date.now() - 1000*60*60*3,  body: 'Nach der Reinigung produzieren unsere Panels wieder volle Leistung. Danke für die Anleitung in der App!', likes: 12 },
    { id: 'post_2', author: 'Vikram (Ward 2)',avatar: 'V', createdAt: Date.now() - 1000*60*60*22, body: 'Heute Abend um 18:00 Schulung zum Thema "Wann Techniker rufen" im Gemeindezentrum.', likes: 8, pinned: true },
    { id: 'post_3', author: 'Sunita (Ward 1)',avatar: 'S', createdAt: Date.now() - 1000*60*60*48, body: 'Wer hat einen Spannungsmesser den ich ausleihen kann? Brauche ihn morgen früh.', likes: 3 },
    { id: 'post_4', author: 'Ramesh (Ward 3)',avatar: 'R', createdAt: Date.now() - 1000*60*60*96, body: 'Monsunvorbereitung erledigt — alle Halterungen nachgezogen. Empfehle das vor Juni allen!', likes: 19 }
  ],

  // ===== APPOINTMENTS =====
  appointments: [
    { id: 'app_1', title: 'Halbjährliche Wartung', techId: 'tech_3', scheduledFor: Date.now() + 1000*60*60*24*4,  status: 'confirmed', notes: 'Panels reinigen, Verkabelung prüfen' },
    { id: 'app_2', title: 'Batterietausch Bewertung', techId: 'tech_2', scheduledFor: Date.now() + 1000*60*60*24*18, status: 'pending', notes: 'Inspektion vor möglichem Tausch in Q3' }
  ],

  // ===== SAMPLE ENERGY LOGS (last 14 days) =====
  generateEnergyHistory(days = 14) {
    const logs = [];
    const day = 1000 * 60 * 60 * 24;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * day);
      date.setHours(0,0,0,0);
      // Simulate: 4.5-6.8 kWh production, weather variation
      const weather = Math.sin(i / 2.3) * 0.5 + Math.random() * 0.4;
      const produced = +(5.8 + weather).toFixed(2);
      const consumed = +(3.5 + Math.random() * 1.5).toFixed(2);
      const battery  = Math.round(60 + Math.random() * 35);
      logs.push({
        date: date.toISOString().slice(0,10),
        produced, consumed, battery,
        peakWatts: Math.round(produced * 180 + Math.random() * 100),
        sunHours: +(5.5 + Math.random() * 1.5).toFixed(1)
      });
    }
    return logs;
  },

  // ===== LOCALE STRINGS (subset; UI defaults to German for thesis) =====
  i18n: {
    de: { home: 'Start', selfhelp: 'Selbsthilfe', support: 'Support', system: 'System', more: 'Mehr' },
    en: { home: 'Home', selfhelp: 'Self-Help', support: 'Support', system: 'System', more: 'More' },
    hi: { home: 'होम', selfhelp: 'स्व-सहायता', support: 'सहायता', system: 'सिस्टम', more: 'और' },
    ta: { home: 'முகப்பு', selfhelp: 'சுய உதவி', support: 'ஆதரவு', system: 'அமைப்பு', more: 'மேலும்' },
    bn: { home: 'হোম', selfhelp: 'স্ব-সহায়তা', support: 'সহায়তা', system: 'সিস্টেম', more: 'আরও' }
  },

  // ===== WEATHER (mocked, daily forecast) =====
  weather: {
    today: { temp: 32, condition: 'sunny', wind: 8, humidity: 54, solarPotential: 'Hoch' },
    forecast: [
      { day: 'Heute',    condition: 'sunny',         high: 32, low: 24, solar: 95 },
      { day: 'Morgen',   condition: 'partly_cloudy', high: 30, low: 23, solar: 78 },
      { day: 'Mittwoch', condition: 'cloudy',        high: 28, low: 22, solar: 52 },
      { day: 'Donners.', condition: 'rain',          high: 26, low: 22, solar: 28 },
      { day: 'Freitag',  condition: 'sunny',         high: 31, low: 23, solar: 90 }
    ]
  }
};
