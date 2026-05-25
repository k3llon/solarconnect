// SolarConnect — Local AI Assistant
// Offline knowledge engine: keyword + synonym matching, scored against a Q&A pack.
// Designed for India: handles English/German/Hindi keywords for common solar issues.

const AI = {
  name: 'Surya AI',
  greeting: {
    de: 'Namaste! 🙏 Ich bin Surya, deine KI-Assistentin für Solar-Probleme. Beschreibe dein Problem in einfachen Worten.',
    en: 'Namaste! 🙏 I am Surya, your AI assistant for solar issues. Describe your problem in simple words.',
    hi: 'नमस्ते! 🙏 मैं सूर्या हूँ, सौर समस्याओं के लिए आपकी AI सहायक। अपनी समस्या सरल शब्दों में बताएँ।',
    ta: 'வணக்கம்! 🙏 நான் சூர்யா, சூரிய பிரச்சினைகளுக்கான AI உதவியாளர். உங்கள் பிரச்சினையை விவரிக்கவும்.',
    bn: 'নমস্কার! 🙏 আমি সূর্য, সৌর সমস্যার জন্য আপনার AI সহায়ক। আপনার সমস্যা সহজ ভাষায় বলুন।',
    te: 'నమస్తే! 🙏 నేను సూర్య, సౌర సమస్యల కోసం మీ AI సహాయకుడిని. మీ సమస్యను సరళమైన మాటల్లో వివరించండి.'
  },

  // Translations for the AI's own answer phrases — used to localize generic responses
  i18n: {
    fallback: {
      de: 'Hmm, ich bin nicht ganz sicher. Versuch es mit konkreteren Worten — z.B. "Inverter zeigt rote LED", "Batterie schnell leer", "Panel verschmutzt".',
      en: 'Hmm, I am not sure. Try concrete words — e.g. "inverter shows red LED", "battery drains fast", "panel is dirty".',
      hi: 'मुझे यकीन नहीं है। कुछ ठोस शब्द आज़माएँ — जैसे "इन्वर्टर लाल LED", "बैटरी जल्दी खाली", "पैनल गंदा"।',
      ta: 'எனக்கு உறுதியில்லை. குறிப்பிட்ட சொற்களை முயற்சி செய் — "சிவப்பு LED", "பேட்டரி வேகமாக", "பேனல் அழுக்கு".',
      bn: 'নিশ্চিত নই। স্পষ্ট শব্দ ব্যবহার করুন — "ইনভার্টার লাল LED", "ব্যাটারি দ্রুত", "প্যানেল নোংরা"।',
      te: 'నాకు ఖచ్చితంగా తెలియదు. స్పష్టమైన పదాలు ప్రయత్నించండి — "ఎరుపు LED", "బ్యాటరీ వేగంగా", "ప్యానెల్ మురికి".'
    }
  },

  // Synonyms: maps surface words to canonical concepts
  synonyms: {
    power:    ['strom','power','bijli','बिजली','current','electricity','elektrizität','elektrik'],
    out:      ['kein','keine','no','nicht','aus','tot','dead','off','gone','away','nahin','नहीं','funktioniert nicht','ausgefallen','ausfall'],
    battery:  ['batterie','battery','akku','battri','बैटरी'],
    panel:    ['panel','panels','panele','solarpanel','module','modul','modules','solaranlage'],
    inverter: ['inverter','wechselrichter','umrichter','wr'],
    led:      ['led','lampe','licht','light','leuchte','anzeige'],
    red:      ['rot','red','laal','लाल'],
    green:    ['grün','gruen','green','hara','हरा'],
    broken:   ['kaputt','broken','tut','tutela','टूटा','beschädigt','damaged','crack','crack','glass','riss','bruch','split'],
    not_charging: ['lädt nicht','laedt nicht','not charging','load','laden','charging'],
    drain:    ['entlädt','entlaedt','schnell leer','drains','drain','quick','sofort leer'],
    hot:      ['heiß','heiss','hot','warm','garam','गरम','overheat','hitze','temperatur'],
    smoke:    ['rauch','smoke','smell','geruch','dhuan','धुआँ','dampf','brennt','feuer','fire','ag','आग'],
    dirty:    ['schmutzig','dirty','staub','dust','dreck','vogelkot','sand','salz'],
    wiring:   ['kabel','wire','wiring','tar','cable','leitung','verkabelung','draht'],
    rain:     ['regen','rain','monsoon','monsun','baarish','बारिश','storm','sturm','wind'],
    night:    ['nacht','night','abend','evening','dark','dunkel'],
    cloudy:   ['wolken','cloud','bewölkt','bewoelkt','bedeckt'],
    cost:     ['kosten','cost','price','preis','geld','money','rupee','rupien','₹','daam','दाम'],
    subsidy:  ['förderung','foerderung','subsidy','subvention','government','staat','yojana','योजना','pmsg','surya ghar'],
    install:  ['installieren','install','aufbau','setup','planen','plan','dimension','grösse','groesse','size'],
    clean:    ['reinigen','clean','wischen','wash','saaf','साफ','säubern'],
    safe:     ['sicher','safe','gefahr','danger','schock','shock'],
    flicker:  ['flackert','flicker','blinkt','blink','unstable','unstabil','spannung'],
    mcb:      ['mcb','sicherung','fuse','breaker','schalter','switch'],
    technician:['techniker','technician','help','hilfe','support','jemand','someone','komm','call']
  },

  // Knowledge base: each entry has required concepts + answer
  knowledge: [
    // ========== EMERGENCY ==========
    { req: ['smoke'], emergency: true, weight: 100,
      answer: '⚠️ **SOFORT HANDELN**: Rauch oder Brandgeruch ist gefährlich!\n\n1. **Hauptschalter (MCB) sofort AUS**\n2. **Alle Personen aus dem Raum**\n3. Bei Flammen: niemals Wasser — nur Sand oder CO₂-Löscher\n4. **Notruf 112** wenn nötig\n\nIch habe automatisch ein dringendes Ticket angelegt. Möchtest du sofort einen Techniker anrufen?',
      sources: [{ type: 'wizard', id: 'battery_issue', label: 'Sicherheits-Check' }],
      escalate: { severity: 'high', type: 'battery_issue', emergency: true }
    },
    { req: ['hot', 'battery'], emergency: true, weight: 90,
      answer: '⚠️ **Heiße Batterie ist gefährlich**. Batterien können bei Überhitzung Gase freisetzen oder explodieren.\n\n**Sofort:**\n• Hauptschalter ausschalten\n• Raum verlassen, gut belüften\n• Nicht löschen versuchen, falls Brand entsteht\n\nIch lege ein dringendes Ticket an.',
      sources: [{ type: 'wizard', id: 'battery_issue', label: 'Batterie-Wizard' }],
      escalate: { severity: 'high', type: 'battery_issue', emergency: true }
    },
    { req: ['broken', 'panel'], weight: 80,
      answer: '🛑 **Vorsicht — Stromschlag-Gefahr!**\n\nGebrochenes Glas an Solarpanels leitet weiter Strom, auch bei Wolken oder nachts.\n\n**Schritte:**\n1. Panel **nicht berühren**\n2. DC-Schalter ausschalten\n3. Panel mit Tuch oder Karton abdecken (stoppt Stromproduktion)\n4. Fotos machen\n5. Techniker rufen — niemals selbst tauschen\n\nIch erstelle gerne ein Ticket für dich.',
      sources: [{ type: 'wizard', id: 'panel_damage', label: 'Panel-Wizard' }, { type: 'article', id: 'art_safety', label: 'Sicherheits-Artikel' }],
      escalate: { severity: 'high', type: 'panel_damage' }
    },

    // ========== POWER ISSUES ==========
    { req: ['power', 'out'], weight: 60,
      answer: {
        de: 'Kein Strom — lass uns das systematisch lösen:\n\n**Schritt 1: Inverter-LED prüfen**\n• **Grün** → MCB checken\n• **Rot** → Fehlercode notieren\n• **Aus** → DC-Schalter prüfen\n\nDer Wizard führt dich Schritt für Schritt.',
        en: 'No power — let us solve this step by step:\n\n**Step 1: Check inverter LED**\n• **Green** → Check MCB\n• **Red** → Note error code\n• **Off** → Check DC switch\n\nThe wizard guides you.',
        hi: 'बिजली नहीं — कदम-दर-कदम:\n\n**1: इन्वर्टर LED जाँचें**\n• **हरी** → MCB जाँचें\n• **लाल** → कोड नोट करें\n• **बंद** → DC स्विच\n\nविज़ार्ड मार्गदर्शन करेगा।',
        ta: 'மின்சாரம் இல்லை — படிப்படியாக:\n\n**1: இன்வெர்ட்டர் LED**\n• **பச்சை** → MCB\n• **சிவப்பு** → குறியீடு\n• **ஆஃப்** → DC சுவிட்ச்\n\nவிஸார்ட் வழிகாட்டும்.',
        bn: 'বিদ্যুৎ নেই — ধাপে ধাপে:\n\n**1: ইনভার্টার LED**\n• **সবুজ** → MCB\n• **লাল** → কোড\n• **বন্ধ** → DC সুইচ\n\nউইজার্ড সাহায্য করবে।',
        te: 'విద్యుత్ లేదు — దశలవారీగా:\n\n**1: ఇన్వర్టర్ LED**\n• **ఆకుపచ్చ** → MCB\n• **ఎరుపు** → కోడ్\n• **ఆఫ్** → DC స్విచ్\n\nవిజార్డ్ మార్గనిర్దేశం.'
      },
      sources: [{ type: 'wizard', id: 'power_outage', label: { de: 'Strom-Wizard starten', en: 'Start power wizard', hi: 'विज़ार्ड शुरू', ta: 'விஸார்ட் தொடங்கு', bn: 'উইজার্ড শুরু', te: 'విజార్డ్ ప్రారంభం' } }]
    },
    { req: ['inverter', 'red'], weight: 75,
      answer: 'Rote LED am Inverter = **Fehlerzustand**.\n\n1. Schau auf das Display — gibt es einen Fehlercode (z.B. F01, E07)?\n2. **Notiere den Code** — der Techniker braucht ihn\n3. **Reset versuchen**: Inverter ausschalten, 30 Sekunden warten, wieder einschalten\n4. Bleibt rot → Techniker rufen\n\nHäufige Codes: F01 (Überlast), F03 (Batterie tief), F06 (Überhitzung).',
      sources: [{ type: 'wizard', id: 'power_outage', label: 'Inverter-Diagnose' }]
    },
    { req: ['mcb'], weight: 65,
      answer: 'MCB (Hauptschalter) Probleme:\n\n**Fällt sofort wieder aus?** → Wahrscheinlich Kurzschluss\n→ Alle Geräte vom Netz trennen, dann einzeln zuschalten — finde den Schuldigen\n\n**Bleibt OFF, schaltet nicht ein?** → MCB könnte defekt sein\n\n**Nie zwingen** — niemals MCB mit Klebeband fixieren! Brandgefahr.',
      sources: [{ type: 'wizard', id: 'power_outage', label: 'Wizard' }]
    },
    { req: ['flicker'], weight: 55,
      answer: 'Licht flackert oder Spannung schwankt? Mögliche Ursachen:\n\n• **Inverter zu klein** für aktuelle Last (zu viele Geräte gleichzeitig)\n• **Batterie schwach** — kann Spitzenlasten nicht halten\n• **Lose Verbindung** im Sicherungskasten\n• **Defekter Wechselrichter**\n\nReduziere die Last und beobachte — bessert es sich, ist es Überlast.'
    },

    // ========== BATTERY ==========
    { req: ['battery', 'not_charging'], weight: 75,
      answer: {
        de: 'Batterie lädt nicht voll? Häufige Ursachen:\n\n1. **Verschmutzte Panels** (häufigste!) — 30% Verlust durch Staub\n2. **Verschattung** durch Bäume/Antennen\n3. **Defekter Charge-Controller** (MPPT)\n4. **Sulfatierung** bei alten Bleibatterien\n\nStart mit Reinigung — kostet nichts, hilft oft.',
        en: 'Battery not charging fully? Common reasons:\n\n1. **Dirty panels** — 30% loss from dust\n2. **Shading** by trees/antennas\n3. **Faulty MPPT controller**\n4. **Sulfation** in old lead batteries\n\nStart with cleaning.',
        hi: 'बैटरी पूरी चार्ज नहीं? कारण:\n\n1. **गंदे पैनल** (30% नुकसान)\n2. **छाया** (पेड़, एंटीना)\n3. **खराब MPPT**\n4. **सल्फेशन** पुरानी बैटरी\n\nसफाई से शुरुआत।',
        ta: 'பேட்டரி முழுமையாக சார்ஜாகவில்லை?\n\n1. **அழுக்கு பேனல்** (30% இழப்பு)\n2. **நிழல்** (மரம், ஆண்டெனா)\n3. **MPPT கோளாறு**\n4. **பழைய பேட்டரி**\n\nசுத்தம் தொடங்கு.',
        bn: 'ব্যাটারি পুরো চার্জ হয় না?\n\n1. **নোংরা প্যানেল** (30% ক্ষতি)\n2. **ছায়া** (গাছ, অ্যান্টেনা)\n3. **MPPT ত্রুটি**\n4. **পুরানো ব্যাটারি**\n\nপরিষ্কার দিয়ে শুরু।',
        te: 'బ్యాటరీ పూర్తి ఛార్జ్ కాదా?\n\n1. **మురికి ప్యానెల్‌లు** (30% నష్టం)\n2. **నీడ** (చెట్లు, యాంటెన్నాలు)\n3. **MPPT లోపం**\n4. **పాత బ్యాటరీ**\n\nశుభ్రంతో ప్రారంభం.'
      },
      sources: [
        { type: 'wizard', id: 'battery_issue', label: { de: 'Batterie-Wizard', en: 'Battery wizard', hi: 'बैटरी विज़ार्ड', ta: 'பேட்டரி விஸார்ட்', bn: 'ব্যাটারি উইজার্ড', te: 'బ్యాటరీ విజార్డ్' } },
        { type: 'article', id: 'art_clean', label: { de: 'Reinigungs-Anleitung', en: 'Cleaning guide', hi: 'सफाई गाइड', ta: 'சுத்தம் வழிகாட்டி', bn: 'পরিষ্কার গাইড', te: 'శుభ్రపరిచే గైడ్' } }
      ]
    },
    { req: ['battery', 'drain'], weight: 70,
      answer: 'Batterie entlädt zu schnell? Prüfe:\n\n**Neue Verbraucher?**\n• Kühlschrank, Pumpe, Klimaanlage ziehen sehr viel\n• Berechne den Gesamt-Wattbedarf\n\n**Alter der Batterie?**\n• Blei-Säure: 5-7 Jahre\n• Lithium: 8-10 Jahre\n• Danach sinkt die Kapazität deutlich\n\n**Standby-Verbrauch?**\n• Geräte im Standby ziehen auch nachts Strom\n• Steckdosen-Leisten mit Schalter helfen.',
      sources: [{ type: 'article', id: 'art_battery', label: 'Batterie-Pflege' }]
    },
    { req: ['battery'], weight: 30,  // generic fallback for battery
      answer: 'Was ist mit deiner Batterie?\n\n• **Lädt nicht voll** → Panels reinigen, Verschattung prüfen\n• **Entlädt schnell** → Verbrauch zu hoch oder Batterie alt\n• **Heiß / Geruch** → SOFORT abschalten, Notfall!\n• **Spannung niedrig** → Nicht unter 11V (12V-System) entladen lassen\n\nSag mir mehr Details — was genau ist los?'
    },

    // ========== PANELS ==========
    { req: ['panel', 'dirty'], weight: 70,
      answer: {
        de: '**Staub kostet bis zu 30%!** Reinigung:\n\n**Wann:** Morgens, Panels kühl. Nicht in praller Sonne.\n\n**Wie:**\n1. DC-Schalter aus\n2. Weiches Tuch\n3. Sauberes Wasser\n4. Keine Bürsten / Hochdruck\n5. Vogelkot einweichen\n\n**Sicherheit:** Rutschfeste Schuhe.',
        en: '**Dust costs up to 30%!** Cleaning:\n\n**When:** Morning, panels cool. Not in hot sun.\n\n**How:**\n1. DC switch off\n2. Soft cloth\n3. Clean water\n4. No brushes / pressure\n5. Soak bird droppings\n\n**Safety:** Non-slip shoes.',
        hi: '**धूल 30% कम करती है!** सफाई:\n\n**कब:** सुबह, ठंडे पैनल।\n\n**कैसे:**\n1. DC बंद\n2. नरम कपड़ा\n3. साफ पानी\n4. ब्रश नहीं\n5. पक्षी विष्ठा भिगोएँ\n\n**सुरक्षा:** फिसलन रहित जूते।',
        ta: '**தூசி 30% இழப்பு!** சுத்தம்:\n\n**எப்போது:** காலை, பேனல்கள் குளிர்.\n\n**எப்படி:**\n1. DC ஆஃப்\n2. மென் துணி\n3. சுத்த நீர்\n4. தூரிகை வேண்டாம்\n5. பறவை எச்சம் ஊறவை\n\n**பாதுகாப்பு:** வழுக்காத காலணி.',
        bn: '**ধুলো 30% ক্ষতি!** পরিষ্কার:\n\n**কখন:** সকালে, ঠান্ডা প্যানেল।\n\n**কীভাবে:**\n1. DC বন্ধ\n2. নরম কাপড়\n3. পরিষ্কার জল\n4. ব্রাশ নয়\n5. পাখির বিষ্ঠা ভেজান\n\n**নিরাপত্তা:** স্লিপ-প্রতিরোধী জুতা।',
        te: '**ధూళి 30% నష్టం!** శుభ్రం:\n\n**ఎప్పుడు:** ఉదయం, చల్లని ప్యానెల్‌లు.\n\n**ఎలా:**\n1. DC ఆఫ్\n2. మృదు వస్త్రం\n3. శుభ్రమైన నీరు\n4. బ్రష్ వద్దు\n5. పక్షి రెట్టలు\n\n**భద్రత:** స్లిప్-రెసిస్టెంట్ షూస్.'
      },
      sources: [{ type: 'article', id: 'art_clean', label: { de: 'Voller Artikel', en: 'Full article', hi: 'पूरा लेख', ta: 'முழு கட்டுரை', bn: 'পূর্ণ নিবন্ধ', te: 'పూర్తి వ్యాసం' } }]
    },
    { req: ['panel'], weight: 30,
      answer: 'Was ist mit dem Panel?\n\n• **Verschmutzt** → Reinigung (großer Effekt!)\n• **Verfärbt / Flecken** → Hot-Spot, Techniker schauen lassen\n• **Glas gebrochen** → ⚠ Stromschlag-Gefahr — nicht berühren!\n• **Loses Kabel** → Mit Isolierband sichern, Techniker rufen\n\nWas siehst du genau?',
      sources: [{ type: 'wizard', id: 'panel_damage', label: 'Panel-Wizard' }]
    },

    // ========== MAINTENANCE & PLANNING ==========
    { req: ['clean'], weight: 50,
      answer: '**Reinigungs-Tipps:**\n\n• **Häufigkeit:** Alle 2-4 Wochen, öfter im Trockensommer\n• **Werkzeug:** Wasser + weiches Tuch — fertig\n• **Verboten:** Harte Bürsten, Hochdruckreiniger, Spülmittel\n• **Zeitpunkt:** Frühmorgens (Panels kühl)\n• **Sicherheit:** Immer zu zweit, rutschfeste Schuhe\n\nDie Investition in 30 Min Reinigung bringt 20-30% mehr Strom!',
      sources: [{ type: 'article', id: 'art_clean', label: 'Detail-Anleitung' }]
    },
    { req: ['rain'], weight: 50,
      answer: '**Monsun-Vorbereitung** ist wichtig:\n\n✓ Halterungen und Schrauben prüfen — alle fest?\n✓ Erdung kontrollieren lassen (Blitzschutz!)\n✓ Kabel-Verbindungen abdichten\n✓ Inverter wassergeschützt? Schutzdach?\n✓ Notfallplan — wer wird gerufen?\n\nAm besten 4-6 Wochen vor Beginn der Regenzeit erledigen.',
      sources: [{ type: 'article', id: 'art_monsoon', label: 'Monsun-Artikel' }]
    },
    { req: ['install'], weight: 40,
      answer: '**Dimensionierung — Faustregel:**\n\nEin typischer Dorfhaushalt braucht 2-4 kWh/Tag.\n\n**Beispielrechnung:**\n• 4 LED-Lampen × 6h = 240 Wh\n• 2 Lüfter × 8h = 800 Wh\n• TV × 4h = 320 Wh\n• Handys + Sonstiges = 200 Wh\n→ **Summe: ~1,5 kWh** + 30% Reserve\n\n**Empfehlung:** 500W Panel + 200Ah Batterie + 1000W Inverter.',
      sources: [{ type: 'article', id: 'art_dimension', label: 'Detaillierte Berechnung' }]
    },
    { req: ['cost'], weight: 40,
      answer: '**Kosten in Indien (Richtwerte 2025):**\n\n• 1 kW System: ₹50.000 – ₹70.000\n• 3 kW (Haushalt): ₹150.000 – ₹200.000\n• Batterie (Lithium 5 kWh): ₹75.000 – ₹100.000\n\n**Mit Förderung deutlich günstiger!**'
    },
    { req: ['subsidy'], weight: 60,
      answer: '**PM Surya Ghar Muft Bijli Yojana:**\n\n• Bis zu **₹78.000 Subvention** für 3 kW Dachanlage\n• Antrag online: pmsuryaghar.gov.in\n• Plus: viele Bundesstaaten bieten zusätzliche Förderung\n\n**Saubhagya Scheme:** Kostenlose Anlage für Off-Grid-Haushalte ohne Netzanschluss.\n\nFrag im Panchayat-Büro nach State-spezifischen Programmen.',
      sources: [{ type: 'article', id: 'art_subsidy', label: 'Förder-Übersicht' }]
    },

    // ========== SAFETY ==========
    { req: ['safe'], weight: 40,
      answer: '**Sicherheits-Grundregeln:**\n\n⚡ Solarpanels stehen **immer** unter Spannung — auch nachts!\n⚡ Niemals offene Kabel anfassen\n⚡ Vor jeder Wartung: DC-Schalter aus\n⚡ Bei Brand: nie Wasser, nur Sand oder CO₂\n⚡ Kinder vom Batterieraum fernhalten\n\nIm Zweifel: Techniker rufen, nicht selbst experimentieren.',
      sources: [{ type: 'article', id: 'art_safety', label: 'Voller Sicherheits-Artikel' }]
    },

    // ========== WIRING ==========
    { req: ['wiring'], weight: 50,
      answer: '**Kabel-Probleme** sind selten harmlos:\n\n• **Loses Kabel:** Niemals selbst anfassen. Mit Isolierband umwickeln (ohne Kontakte zu berühren) und Techniker rufen.\n• **Schmorgeruch:** SOFORT Hauptschalter aus — Brandgefahr!\n• **Korrodierte Anschlüsse:** Bei Bleibatterien normal — vorsichtig reinigen, Polfett auftragen.\n\nKabelprobleme nicht ignorieren — sie werden schlimmer.',
      escalate: { severity: 'high', type: 'wiring_issue' }
    },

    // ========== TIME-BASED ==========
    { req: ['night'], weight: 30,
      answer: 'Kein Strom **nachts**? Das ist normalerweise die Batterie:\n\n• Batterie zu niedrig → Inverter schaltet zum Schutz ab\n• Tagsüber zu wenig produziert (Wolken? Verschmutzung?)\n• Verbrauch zu hoch → Batterie kommt nicht durch die Nacht\n\nPrüfe Batterie-Spannung. Reduziere Nacht-Verbrauch (Licht, Lüfter).'
    },
    { req: ['cloudy'], weight: 30,
      answer: 'Bei **bewölktem Wetter** produzieren Panels weniger:\n\n• Leichte Wolken: 30-50% Leistung\n• Starke Wolken / Regen: 10-25%\n• Das ist **normal**\n\n**Tipps:**\n• Batterie als Puffer nutzen\n• Energie-intensive Geräte morgens/mittags nutzen\n• Über 2-3 Tage Schlechtwetter: Verbrauch reduzieren'
    },

    // ========== GENERAL ==========
    { req: ['technician'], weight: 40,
      answer: 'Ich kann dir helfen, einen Techniker zu finden! Im Bereich **Support → Techniker** siehst du alle verfügbaren Profis in deiner Region mit Bewertungen und Sprachen.\n\nFür dringende Probleme nutze den **Notfall-Modus** auf der Startseite.',
      sources: [{ type: 'view', id: 'technicians', label: 'Techniker anzeigen' }]
    }
  ],

  // Quick-start suggestions per language
  suggestionsI18n: {
    de: ['Mein Inverter zeigt rote LED', 'Batterie lädt nicht voll', 'Panels reinigen — wie geht das?', 'Wie viel kostet eine 3kW Anlage?', 'Welche Förderungen gibt es?', 'Anlage vorbereiten für Monsun'],
    en: ['My inverter shows red LED', 'Battery not charging fully', 'How to clean panels?', 'How much does a 3kW system cost?', 'What subsidies are available?', 'Prepare system for monsoon'],
    hi: ['मेरा इन्वर्टर लाल LED दिखा रहा है', 'बैटरी पूरी चार्ज नहीं हो रही', 'पैनल कैसे साफ करें?', '3kW सिस्टम की कीमत?', 'कौन सी सब्सिडी है?', 'मानसून की तैयारी'],
    ta: ['இன்வெர்ட்டர் சிவப்பு LED', 'பேட்டரி முழுமையாக ஏற்றவில்லை', 'பேனல்களை எப்படி சுத்தம்?', '3kW விலை?', 'மானியங்கள் என்ன?', 'பருவமழைக்கு தயாரிப்பு'],
    bn: ['ইনভার্টার লাল LED', 'ব্যাটারি পুরো চার্জ হয় না', 'প্যানেল কীভাবে পরিষ্কার?', '3kW মূল্য?', 'কোন ভর্তুকি?', 'বর্ষার প্রস্তুতি'],
    te: ['ఇన్వర్టర్ ఎరుపు LED', 'బ్యాటరీ పూర్తి ఛార్జ్ కావడం లేదు', 'ప్యానెల్‌లను ఎలా శుభ్రం?', '3kW ధర?', 'ఏ సబ్సిడీలు?', 'వర్ష ఋతువు సన్నాహాలు']
  },

  suggestionsFor(lang) {
    return this.suggestionsI18n[lang] || this.suggestionsI18n.de;
  },

  // Backwards-compat alias
  get suggestions() { return this.suggestionsI18n.de; },

  // ===== ENGINE =====
  normalize(text) {
    return (text || '').toLowerCase()
      .replace(/[.,!?;:()\[\]'"„"–—]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  },

  // Extract canonical concepts present in user text
  extractConcepts(text) {
    const norm = ' ' + this.normalize(text) + ' ';
    const found = new Set();
    for (const [concept, words] of Object.entries(this.synonyms)) {
      for (const w of words) {
        if (norm.includes(' ' + w.toLowerCase() + ' ') || norm.includes(w.toLowerCase())) {
          found.add(concept);
          break;
        }
      }
    }
    return found;
  },

  // Find best matching knowledge entry
  match(text) {
    const concepts = this.extractConcepts(text);
    if (!concepts.size) return null;

    let best = null;
    let bestScore = 0;
    for (const k of this.knowledge) {
      // every required concept must be present
      const allMatch = k.req.every(c => concepts.has(c));
      if (!allMatch) continue;
      // score: weight + bonus for more required concepts (specificity)
      const score = (k.weight || 0) + k.req.length * 10;
      if (score > bestScore) { bestScore = score; best = k; }
    }
    return best ? { entry: best, concepts: [...concepts], score: bestScore } : null;
  },

  // Helper: pick localized string from {de,en,...} or plain string
  _L(obj, lang) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.de || obj.en || Object.values(obj)[0] || '';
  },

  // Main: generate response (returns { text, sources, escalate, emergency, quickReplies })
  respond(userText, lang) {
    const L = (typeof app !== 'undefined' && app.lang) ? app.lang : (lang || 'de');
    const match = this.match(userText);
    if (match) {
      return {
        text: this._L(match.entry.answer, L),
        sources: (match.entry.sources || []).map(s => ({ ...s, label: this._L(s.label, L) })),
        escalate: match.entry.escalate || null,
        emergency: match.entry.emergency || false,
        quickReplies: this.followUp(match.entry, match.concepts, L)
      };
    }
    // Fallback
    return {
      text: this._L(this.i18n.fallback, L),
      sources: [
        { type: 'view', id: 'selfhelp',    label: { de: 'Selbsthilfe',   en: 'Self-Help',     hi: 'स्व-सहायता',  ta: 'சுய உதவி', bn: 'স্ব-সহায়তা', te: 'స్వీయ సహాయం' }[L] || 'Selbsthilfe' },
        { type: 'view', id: 'technicians', label: { de: 'Techniker rufen', en: 'Call technician', hi: 'तकनीशियन',  ta: 'நிபுணர்',   bn: 'টেকনিশিয়ান', te: 'టెక్నీషియన్' }[L] || 'Techniker rufen' }
      ],
      escalate: null,
      emergency: false,
      quickReplies: this.suggestionsFor(L).slice(0, 3)
    };
  },

  // Suggest follow-ups; uses generic suggestion list per language
  followUp(entry, concepts, lang) {
    const suggs = this.suggestionsFor(lang);
    if (entry.emergency) return [suggs[0], { de: 'Notfall-Modus öffnen', en: 'Open emergency mode', hi: 'आपातकालीन मोड', ta: 'அவசர பயன்முறை', bn: 'জরুরি মোড', te: 'అత్యవసర మోడ్' }[lang] || 'Notfall-Modus öffnen'];
    return suggs.slice(0, 3);
  },

  // ============================================================
  // VISION — Canvas-basierte lokale Bildanalyse
  // Funktioniert offline, keine externe API.
  // ============================================================

  // Lädt Bild, sampelt Pixel und erzeugt eine Feature-Beschreibung
  analyzeImage(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = 120;  // Downsample für schnelle Analyse
        const h = Math.round(img.height * (w / img.width));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h).data;

        const stats = this._extractStats(pixels, w, h);
        const features = this._classifyFeatures(stats);
        resolve({ stats, features, dimensions: { width: img.width, height: img.height } });
      };
      img.onerror = () => resolve({ stats: null, features: ['unreadable'], dimensions: null });
      img.src = imageDataUrl;
    });
  },

  _extractStats(pixels, w, h) {
    let rSum = 0, gSum = 0, bSum = 0;
    let brightSum = 0, satSum = 0;
    let darkCount = 0, brightCount = 0;
    let redCount = 0, greenCount = 0, blueCount = 0, yellowCount = 0;
    let varSum = 0;
    let total = 0;

    // Sample every pixel (120 wide is small enough)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      rSum += r; gSum += g; bSum += b;
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      const brightness = (r + g + b) / 3;
      const sat = max === 0 ? 0 : (max - min) / max;
      brightSum += brightness;
      satSum += sat;
      if (brightness < 50) darkCount++;
      if (brightness > 220) brightCount++;
      // Color buckets: only count "saturated enough" pixels
      if (sat > 0.35 && max > 80) {
        if (r > g + 30 && r > b + 30) redCount++;
        else if (g > r + 25 && g > b + 25) greenCount++;
        else if (b > r + 25 && b > g + 25) blueCount++;
        else if (r > 150 && g > 130 && b < 100) yellowCount++;
      }
      total++;
    }

    // Variance (rough texture / contrast indicator)
    const avgBright = brightSum / total;
    for (let i = 0; i < pixels.length; i += 4) {
      const b = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
      varSum += (b - avgBright) ** 2;
    }
    const variance = varSum / total;

    return {
      avgR: rSum / total, avgG: gSum / total, avgB: bSum / total,
      brightness: avgBright,
      saturation: satSum / total,
      darkRatio: darkCount / total,
      brightRatio: brightCount / total,
      redRatio: redCount / total,
      greenRatio: greenCount / total,
      blueRatio: blueCount / total,
      yellowRatio: yellowCount / total,
      contrast: Math.sqrt(variance)
    };
  },

  _classifyFeatures(s) {
    if (!s) return ['unreadable'];
    const features = [];

    // Quality
    if (s.brightness < 40)  features.push('too_dark');
    if (s.brightness > 230) features.push('overexposed');
    if (s.contrast  < 12)   features.push('low_contrast');

    // Solar-relevante Erkennungen
    if (s.redRatio > 0.012)    features.push('red_indicator');   // Rote LED / Warnung
    if (s.greenRatio > 0.015)  features.push('green_indicator'); // Grüne LED / OK
    if (s.yellowRatio > 0.02)  features.push('yellow_indicator');// Gelb / Warnung

    // Panel-Detektion: dunkle Fläche mit metallischen Reflexen
    if (s.brightness < 80 && s.contrast > 30 && s.saturation < 0.25) features.push('panel_like');
    // Verschmutzung: dunkler, niedriger Kontrast, leicht bräunlich
    if (s.brightness < 100 && s.contrast < 25 && s.avgR > s.avgB && s.saturation < 0.2) features.push('possibly_dirty');
    // Inverter / Gehäuse: heller Grauton, niedrige Sättigung, mittlere Helligkeit
    if (s.brightness > 100 && s.brightness < 200 && s.saturation < 0.15) features.push('device_housing');
    // Verkabelung: viele dunkle Linien — proxy: hoher Kontrast, mittlere Helligkeit
    if (s.contrast > 50 && s.brightness > 60 && s.brightness < 180 && s.saturation < 0.3) features.push('cable_like');
    // Outdoor / Himmel: viel Blau und hell
    if (s.blueRatio > 0.03 && s.brightness > 150) features.push('outdoor_sky');
    // Rauch / Nebel: weiß-grau, geringe Sättigung, hohe Helligkeit
    if (s.brightness > 180 && s.saturation < 0.1 && s.contrast < 30) features.push('hazy');
    // Glasbruch-Verdacht: sehr hoher Kontrast + helle Bereiche
    if (s.contrast > 80 && s.brightRatio > 0.1) features.push('high_contrast_spots');

    if (!features.length) features.push('generic');
    return features;
  },

  // Erzeugt eine Beschreibung der Bildanalyse + Diagnose (locale-aware)
  describeImage(analysis, userText = '') {
    const lang = (typeof app !== 'undefined' && app.lang) ? app.lang : 'de';
    const f = analysis.features;
    const stats = analysis.stats;

    if (f.includes('unreadable')) {
      const unread = {
        de: '📷 Ich konnte das Bild leider nicht lesen.',
        en: '📷 I could not read the image.',
        hi: '📷 छवि नहीं पढ़ सकी।',
        ta: '📷 படத்தைப் படிக்க முடியவில்லை.',
        bn: '📷 ছবি পড়তে পারিনি।',
        te: '📷 చిత్రాన్ని చదవలేకపోయాను.'
      };
      return {
        text: unread[lang] || unread.de,
        sources: [], emergency: false, escalate: null,
        quickReplies: this.suggestionsFor(lang).slice(0, 2)
      };
    }

    // Quality warnings first
    const qualityWarns = [];
    if (f.includes('too_dark'))     qualityWarns.push('🔦 Das Bild ist sehr dunkel. Mach gerne ein neues mit besserem Licht — dann sehe ich mehr Details.');
    if (f.includes('overexposed'))  qualityWarns.push('☀ Das Bild ist überbelichtet. Versuche es ohne direktes Sonnenlicht.');
    if (f.includes('low_contrast')) qualityWarns.push('📷 Wenig Kontrast — vielleicht nochmal näher heran.');

    // Build observation
    const observations = [];
    if (f.includes('red_indicator'))    observations.push('🔴 **Rote Indikatoren/LEDs** sichtbar — typisches Zeichen für einen **Fehlerzustand**.');
    if (f.includes('green_indicator'))  observations.push('🟢 **Grüne Anzeigen** — System scheint in Betrieb zu sein.');
    if (f.includes('yellow_indicator')) observations.push('🟡 **Gelbe/Orange Anzeigen** — meist Warnung oder Ladevorgang.');
    if (f.includes('panel_like'))       observations.push('🔋 Ich erkenne eine **dunkle reflektive Oberfläche** — wirkt wie ein Solarpanel.');
    if (f.includes('possibly_dirty'))   observations.push('🟤 Die Oberfläche wirkt **verschmutzt oder staubig** — das reduziert die Leistung.');
    if (f.includes('device_housing'))   observations.push('📦 Sieht aus wie ein **Gerätegehäuse** (Inverter, Charge-Controller o.ä.).');
    if (f.includes('cable_like'))       observations.push('🔌 Ich sehe **Strukturen die wie Verkabelung** aussehen.');
    if (f.includes('outdoor_sky'))      observations.push('🌤 Aufnahme **im Freien** — guter Blick auf die Installation.');
    if (f.includes('hazy'))             observations.push('💨 Diffuse helle Bereiche — könnte **Rauch, Nebel oder Reflexionen** sein.');
    if (f.includes('high_contrast_spots')) observations.push('⚡ **Stark kontrastreiche Stellen** — möglicherweise Glasbruch, Lichtreflexe oder Beschädigung.');

    // Diagnose ableiten
    let diagnosis = '';
    let escalate = null;
    let emergency = false;
    let sources = [];

    // Notfall-Heuristik
    if (f.includes('hazy') && (userText.toLowerCase().includes('rauch') || userText.toLowerCase().includes('brennt') || userText.toLowerCase().includes('smoke'))) {
      diagnosis = '\n\n⚠ **NOTFALL!** Bei sichtbarem Rauch sofort handeln:\n1. Hauptschalter aus\n2. Raum verlassen\n3. Notruf 112';
      emergency = true;
      escalate = { severity: 'high', type: 'battery_issue', emergency: true };
    }
    else if (f.includes('red_indicator')) {
      diagnosis = '\n\n💡 **Diagnose**: Rote LED bedeutet meist Fehlerzustand. Notiere den Fehlercode am Display, mache einen Reset (30 Sekunden aus, dann ein). Bleibt rot → Techniker rufen.';
      sources.push({ type: 'wizard', id: 'power_outage', label: 'Strom-Wizard' });
      escalate = { severity: 'medium', type: 'inverter_issue' };
    }
    else if (f.includes('high_contrast_spots') && f.includes('panel_like')) {
      diagnosis = '\n\n💡 **Verdacht auf Glasbruch oder Beschädigung** am Panel. **Nicht berühren** — Panel führt weiter Strom! Panel mit Tuch abdecken und Techniker rufen.';
      sources.push({ type: 'wizard', id: 'panel_damage', label: 'Panel-Wizard' });
      escalate = { severity: 'high', type: 'panel_damage' };
    }
    else if (f.includes('possibly_dirty') && f.includes('panel_like')) {
      diagnosis = '\n\n💡 **Empfehlung**: Reinige die Panels — Staub kostet bis zu 30% Leistung. Anleitung im Reinigungs-Artikel.';
      sources.push({ type: 'article', id: 'art_clean', label: 'Reinigungs-Anleitung' });
    }
    else if (f.includes('cable_like')) {
      diagnosis = '\n\n💡 Wenn Kabel beschädigt oder lose aussehen: **nicht selbst anfassen**. Provisorisch mit Isolierband sichern, Techniker rufen.';
      sources.push({ type: 'wizard', id: 'power_outage', label: 'Diagnose-Wizard' });
    }
    else if (f.includes('green_indicator')) {
      diagnosis = '\n\n💡 Grüne LEDs sind ein gutes Zeichen — System läuft normal. Wenn du trotzdem ein Problem hast, beschreibe mir bitte was nicht funktioniert.';
    }
    else {
      diagnosis = '\n\n💡 Beschreibe mir noch in Worten, was genau das Problem ist — dann kann ich dir gezielter helfen.';
    }

    // Wenn User auch Text geschickt hat: kombiniere mit Standard-Matching
    let textResponse = null;
    if (userText && userText.trim().length > 2) {
      const m = this.match(userText);
      if (m) {
        textResponse = m.entry;
        if (!escalate) escalate = m.entry.escalate || null;
        if (!sources.length) sources = m.entry.sources || [];
      }
    }

    // Compose response
    let parts = ['📷 **Bildanalyse:**'];
    if (qualityWarns.length) parts.push(qualityWarns.join('\n'));
    if (observations.length) parts.push(observations.join('\n'));
    else if (!qualityWarns.length) parts.push('Ich erkenne ein Bild, kann aber keine eindeutigen Solar-Komponenten zuordnen.');
    parts.push(diagnosis);
    if (textResponse) parts.push('\n**Zu deiner Frage:**\n' + textResponse.answer);

    return {
      text: parts.filter(Boolean).join('\n'),
      sources,
      emergency,
      escalate,
      quickReplies: emergency
        ? ['Notfall-Modus öffnen', 'Techniker anrufen']
        : ['Anderes Foto', 'Techniker rufen', 'Mehr Details']
    };
  }
};
