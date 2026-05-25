// SolarConnect — Content library (multilingual)
// All user-visible strings are { de, en, hi, ta, bn, te } objects.
// The app helper L(obj) picks the right language at render time.

const CONTENT = {

  // ===== TROUBLESHOOTING WIZARDS =====
  wizards: {
    power_outage: {
      title: { de: 'Kein Strom im Haus', en: 'No power at home', hi: 'घर में बिजली नहीं', ta: 'வீட்டில் மின்சாரம் இல்லை', bn: 'বাড়িতে বিদ্যুৎ নেই', te: 'ఇంట్లో విద్యుత్ లేదు' },
      icon: 'bolt', estMinutes: 5, root: 'start',
      steps: {
        start: {
          title: { de: 'Erster Check', en: 'First check', hi: 'पहली जाँच', ta: 'முதல் சோதனை', bn: 'প্রথম পরীক্ষা', te: 'మొదటి తనిఖీ' },
          body:  { de: 'Schaue auf den Wechselrichter (Inverter). Welche LED leuchtet?', en: 'Look at the inverter. Which LED is on?', hi: 'इन्वर्टर देखें। कौन सी LED जल रही है?', ta: 'இன்வெர்ட்டரைப் பாருங்கள். எந்த LED எரிகிறது?', bn: 'ইনভার্টার দেখুন। কোন LED জ্বলছে?', te: 'ఇన్వర్టర్ చూడండి. ఏ LED వెలుగుతుంది?' },
          options: [
            { label: { de: 'Grüne LED',     en: 'Green LED',  hi: 'हरी LED',   ta: 'பச்சை LED', bn: 'সবুজ LED', te: 'ఆకుపచ్చ LED' }, next: 'green' },
            { label: { de: 'Rote LED',      en: 'Red LED',    hi: 'लाल LED',   ta: 'சிவப்பு LED',bn: 'লাল LED',  te: 'ఎరుపు LED' },  next: 'red' },
            { label: { de: 'Keine LED an',  en: 'No LED on',  hi: 'कोई LED नहीं', ta: 'LED இல்லை', bn: 'কোনো LED নেই', te: 'LED లేదు' }, next: 'none' }
          ]
        },
        green: {
          title: { de: 'Inverter läuft', en: 'Inverter is running', hi: 'इन्वर्टर चल रहा है', ta: 'இன்வெர்ட்டர் இயங்குகிறது', bn: 'ইনভার্টার চলছে', te: 'ఇన్వర్టర్ నడుస్తోంది' },
          body:  { de: 'Der Inverter ist OK. Prüfe nun den Hauptschalter (MCB). Steht er auf "ON"?', en: 'Inverter is OK. Now check the main breaker (MCB). Is it ON?', hi: 'इन्वर्टर ठीक है। मुख्य MCB जाँचें। क्या वह ON है?', ta: 'இன்வெர்ட்டர் சரி. முக்கிய MCB சரிபார். அது ON-ல் உள்ளதா?', bn: 'ইনভার্টার ঠিক। প্রধান MCB দেখুন। এটি কি ON?', te: 'ఇన్వర్టర్ సరి. ప్రధాన MCB తనిఖీ. ఇది ON ఉందా?' },
          options: [
            { label: { de: 'Ja, ist ON',          en: 'Yes, ON',          hi: 'हाँ, ON है',     ta: 'ஆம், ON', bn: 'হ্যাঁ, ON', te: 'అవును, ON' }, next: 'check_socket' },
            { label: { de: 'Nein, ist OFF',       en: 'No, OFF',          hi: 'नहीं, OFF है',   ta: 'இல்லை, OFF', bn: 'না, OFF', te: 'లేదు, OFF' }, next: 'flip_mcb' }
          ]
        },
        flip_mcb: {
          title: { de: 'MCB einschalten', en: 'Turn MCB on', hi: 'MCB चालू करें', ta: 'MCB-ஐ இயக்கு', bn: 'MCB চালু করুন', te: 'MCBని ఆన్ చేయండి' },
          body:  { de: 'Schiebe den Hebel langsam nach oben auf "ON". Warte 10 Sekunden. Hast du jetzt Strom?', en: 'Slowly push the lever to ON. Wait 10 seconds. Do you have power now?', hi: 'धीरे से लीवर को ऊपर ON करें। 10 सेकंड रुकें। क्या अब बिजली है?', ta: 'நிதானமாக நெம்புகோலை ON-க்கு உயர்த்து. 10 விநாடிகள் காத்திரு. இப்போது மின்சாரம் வந்ததா?', bn: 'ধীরে ধীরে লিভার ON-এ ঠেলুন। 10 সেকেন্ড অপেক্ষা। এখন বিদ্যুৎ আছে?', te: 'మెల్లగా లివర్‌ను ON-కి నెట్టండి. 10 సెకన్లు ఆగండి. ఇప్పుడు విద్యుత్ ఉందా?' },
          options: [
            { label: { de: 'Ja, alles geht!', en: 'Yes, works!', hi: 'हाँ, सब चल रहा है!', ta: 'ஆம், எல்லாம் இயங்குகிறது!', bn: 'হ্যাঁ, সব কাজ করছে!', te: 'అవును, పనిచేస్తోంది!' }, action: { type: 'resolved' } },
            { label: { de: 'Nein, MCB fällt sofort wieder', en: 'No, MCB trips again', hi: 'नहीं, MCB फिर गिर रहा है', ta: 'இல்லை, MCB மீண்டும் விழுகிறது', bn: 'না, MCB আবার পড়ছে', te: 'లేదు, MCB మళ్లీ పడుతోంది' }, next: 'short_circuit' }
          ]
        },
        short_circuit: {
          title: { de: 'Möglicher Kurzschluss', en: 'Possible short circuit', hi: 'संभावित शॉर्ट सर्किट', ta: 'குறுக்கு சுற்று சாத்தியம்', bn: 'সম্ভাব্য শর্ট সার্কিট', te: 'షార్ట్ సర్క్యూట్ సాధ్యత' },
          body:  { de: 'Trenne alle Geräte vom Stromnetz. Versuche dann erneut. Falls MCB wieder auslöst → Techniker rufen.', en: 'Unplug all devices, then try again. If MCB trips again → call technician.', hi: 'सभी उपकरण निकालें, फिर कोशिश करें। फिर भी गिरे → तकनीशियन बुलाएँ।', ta: 'அனைத்து சாதனங்களையும் கழற்று, பின் முயற்சி செய். MCB மீண்டும் விழுந்தால் → நிபுணரை அழை.', bn: 'সব ডিভাইস খুলুন, তারপর চেষ্টা। আবার পড়লে → টেকনিশিয়ান।', te: 'అన్ని పరికరాలను తీసివేయండి, మళ్లీ ప్రయత్నించండి. మళ్లీ పడితే → టెక్నీషియన్.' },
          options: [
            { label: { de: 'Jetzt geht es',         en: 'Works now',           hi: 'अब चल रहा है',     ta: 'இப்போது இயங்குகிறது', bn: 'এখন কাজ করছে', te: 'ఇప్పుడు పనిచేస్తోంది' }, action: { type: 'resolved' } },
            { label: { de: 'MCB fällt weiter',      en: 'MCB still tripping',  hi: 'MCB फिर गिर रहा',  ta: 'MCB தொடர்ந்து விழுகிறது', bn: 'MCB এখনও পড়ছে', te: 'MCB ఇంకా పడుతోంది' }, action: { type: 'escalate', severity: 'high', type_: 'wiring_issue' } }
          ]
        },
        check_socket: {
          title: { de: 'Steckdose testen', en: 'Test the socket', hi: 'सॉकेट जाँचें', ta: 'சாக்கெட் சரிபார்', bn: 'সকেট পরীক্ষা', te: 'సాకెట్ తనిఖీ' },
          body:  { de: 'Teste eine andere Steckdose mit einer Lampe. Geht das Licht?', en: 'Test another socket with a lamp. Does it light up?', hi: 'दूसरी सॉकेट को लैंप से जाँचें। क्या जलता है?', ta: 'மற்றொரு சாக்கெட்டை விளக்கால் சரிபார். எரிகிறதா?', bn: 'অন্য সকেট ল্যাম্প দিয়ে চেষ্টা। জ্বলে?', te: 'మరొక సాకెట్‌ను దీపంతో పరీక్షించండి. వెలుగుతుందా?' },
          options: [
            { label: { de: 'Ja',           en: 'Yes',  hi: 'हाँ',  ta: 'ஆம்',  bn: 'হ্যাঁ', te: 'అవును' }, action: { type: 'tip', text: { de: 'Die ursprüngliche Steckdose oder das Gerät ist defekt.', en: 'The original socket or device is faulty.', hi: 'मूल सॉकेट या उपकरण खराब है।', ta: 'அசல் சாக்கெட் அல்லது சாதனம் கெட்டுள்ளது.', bn: 'মূল সকেট বা ডিভাইস ত্রুটিপূর্ণ।', te: 'అసలు సాకెట్ లేదా పరికరం లోపభూయిష్టం.' } } },
            { label: { de: 'Nein, keine Dose geht', en: 'No, no socket works', hi: 'नहीं, कोई सॉकेट नहीं', ta: 'இல்லை, எதுவும் இயங்கவில்லை', bn: 'না, কোনোটি কাজ করছে না', te: 'లేదు, ఏదీ పనిచేయదు' }, action: { type: 'escalate', severity: 'high', type_: 'power_outage' } }
          ]
        },
        red: {
          title: { de: 'Fehler am Inverter', en: 'Inverter error', hi: 'इन्वर्टर त्रुटि', ta: 'இன்வெர்ட்டர் பிழை', bn: 'ইনভার্টার ত্রুটি', te: 'ఇన్వర్టర్ లోపం' },
          body:  { de: 'Rote LED = Fehler. Notiere Fehlercode. Schalte Inverter 30 Sek aus und wieder ein.', en: 'Red LED = error. Note the code. Turn inverter off for 30 sec, then on.', hi: 'लाल LED = त्रुटि। कोड नोट करें। इन्वर्टर 30 सेकंड बंद करें फिर ON।', ta: 'சிவப்பு LED = பிழை. குறியீட்டை குறிக்கவும். 30 விநாடிகள் ஆஃப் செய்து மீண்டும் ஆன்.', bn: 'লাল LED = ত্রুটি। কোড লিখুন। 30 সেকেন্ড অফ করে ON।', te: 'ఎరుపు LED = లోపం. కోడ్ గమనించండి. 30 సెకన్లు ఆఫ్ చేసి ఆన్.' },
          options: [
            { label: { de: 'Rot bleibt',  en: 'Stays red',  hi: 'लाल बना है',  ta: 'சிவப்பாகவே உள்ளது', bn: 'লাল থাকছে', te: 'ఎరుపే ఉంది' }, action: { type: 'escalate', severity: 'high', type_: 'inverter_issue' } },
            { label: { de: 'Wieder grün!',en: 'Green now!', hi: 'अब हरा!',     ta: 'இப்போது பச்சை!', bn: 'এখন সবুজ!', te: 'ఇప్పుడు ఆకుపచ్చ!' }, action: { type: 'resolved' } }
          ]
        },
        none: {
          title: { de: 'Inverter aus', en: 'Inverter off', hi: 'इन्वर्टर बंद', ta: 'இன்வெர்ட்டர் ஆஃப்', bn: 'ইনভার্টার বন্ধ', te: 'ఇన్వర్టర్ ఆఫ్' },
          body:  { de: 'Prüfe die DC-Hauptsicherung am Inverter. Ist sie auf "ON"?', en: 'Check the DC main switch on the inverter. Is it ON?', hi: 'इन्वर्टर पर DC मुख्य स्विच जाँचें। ON है?', ta: 'இன்வெர்ட்டரில் DC முக்கிய சுவிட்சை சரிபார். ON-ல் உள்ளதா?', bn: 'ইনভার্টারে DC প্রধান সুইচ দেখুন। ON?', te: 'ఇన్వర్టర్‌లో DC ప్రధాన స్విచ్ తనిఖీ. ON?' },
          options: [
            { label: { de: 'Ja', en: 'Yes', hi: 'हाँ', ta: 'ஆம்', bn: 'হ্যাঁ', te: 'అవును' }, next: 'battery_low' },
            { label: { de: 'Nein → einschalten', en: 'No → turn on', hi: 'नहीं → चालू करें', ta: 'இல்லை → ஆன் செய்', bn: 'না → চালু', te: 'లేదు → ఆన్' }, next: 'flip_dc' }
          ]
        },
        flip_dc: {
          title: { de: 'DC einschalten', en: 'Turn DC on', hi: 'DC चालू', ta: 'DC ஆன் செய்', bn: 'DC চালু', te: 'DC ఆన్' },
          body:  { de: 'DC-Schalter auf ON. Warte 1 Min.', en: 'Set DC switch to ON. Wait 1 min.', hi: 'DC स्विच ON करें। 1 मिनट रुकें।', ta: 'DC சுவிட்சை ON செய். 1 நிமி காத்திரு.', bn: 'DC সুইচ ON। 1 মিনিট অপেক্ষা।', te: 'DC స్విచ్‌ను ON. 1 నిమి ఆగండి.' },
          options: [
            { label: { de: 'LED leuchtet',  en: 'LED is on',     hi: 'LED जल रही',   ta: 'LED எரிகிறது',  bn: 'LED জ্বলছে', te: 'LED వెలుగుతోంది' }, action: { type: 'resolved' } },
            { label: { de: 'Bleibt aus',    en: 'Stays off',     hi: 'बंद ही है',    ta: 'ஆஃபாகவே உள்ளது', bn: 'বন্ধই থাকছে', te: 'ఆఫ్‌గానే ఉంది' }, next: 'battery_low' }
          ]
        },
        battery_low: {
          title: { de: 'Batteriestand prüfen', en: 'Check battery level', hi: 'बैटरी स्तर जाँचें', ta: 'பேட்டரி நிலை சரிபார்', bn: 'ব্যাটারি স্তর দেখুন', te: 'బ్యాటరీ స్థాయి తనిఖీ' },
          body:  { de: 'Bei Tiefentladung schaltet der Inverter ab. Zeigt das Display unter 20%?', en: 'Inverter shuts off on deep discharge. Below 20%?', hi: 'गहन निर्वहन पर इन्वर्टर बंद हो जाता है। 20% से कम?', ta: 'ஆழமான மின்விழும் போது இன்வெர்ட்டர் ஆஃப் ஆகிறது. 20%-க்கும் கீழே?', bn: 'গভীর ডিসচার্জে ইনভার্টার বন্ধ। 20% নিচে?', te: 'డీప్ డిశ్చార్జ్ వద్ద ఇన్వర్టర్ ఆఫ్. 20% కంటే తక్కువ?' },
          options: [
            { label: { de: 'Ja', en: 'Yes', hi: 'हाँ', ta: 'ஆம்', bn: 'হ্যাঁ', te: 'అవును' }, action: { type: 'tip', text: { de: 'Warte bis zur Sonne. Reduziere Verbrauch.', en: 'Wait for sun. Reduce usage.', hi: 'धूप का इंतजार करें। उपयोग कम करें।', ta: 'வெயிலுக்காக காத்திரு. பயன்பாட்டை குறை.', bn: 'সূর্যের অপেক্ষা। ব্যবহার কম।', te: 'సూర్యుని కోసం వేచి. వాడకం తగ్గించండి.' } } },
            { label: { de: 'Nein, Batterie OK', en: 'No, battery OK', hi: 'नहीं, बैटरी ठीक', ta: 'இல்லை, பேட்டரி சரி', bn: 'না, ব্যাটারি ঠিক', te: 'లేదు, బ్యాటరీ సరి' }, action: { type: 'escalate', severity: 'high', type_: 'inverter_issue' } }
          ]
        }
      }
    },

    battery_issue: {
      title: { de: 'Batterie-Problem', en: 'Battery issue', hi: 'बैटरी समस्या', ta: 'பேட்டரி பிரச்சினை', bn: 'ব্যাটারি সমস্যা', te: 'బ్యాటరీ సమస్య' },
      icon: 'battery', estMinutes: 4, root: 'start',
      steps: {
        start: {
          title: { de: 'Was ist das Problem?', en: 'What is the issue?', hi: 'समस्या क्या है?', ta: 'பிரச்சினை என்ன?', bn: 'সমস্যা কী?', te: 'సమస్య ఏమిటి?' },
          body:  { de: 'Wähle aus:', en: 'Choose:', hi: 'चुनें:', ta: 'தேர்ந்தெடு:', bn: 'বেছে নিন:', te: 'ఎంచుకోండి:' },
          options: [
            { label: { de: 'Lädt nicht voll',      en: 'Not charging fully', hi: 'पूरी चार्ज नहीं',     ta: 'முழுமையாக சார்ஜாகவில்லை', bn: 'পুরো চার্জ হয় না', te: 'పూర్తి ఛార్జ్ కాదు' }, next: 'not_full' },
            { label: { de: 'Entlädt zu schnell',   en: 'Drains too fast',    hi: 'जल्दी खाली',          ta: 'வேகமாக மின்விழும்', bn: 'দ্রুত নিঃশেষ', te: 'వేగంగా ఖాళీ' }, next: 'fast_drain' },
            { label: { de: 'Batterie ist heiß',    en: 'Battery hot/smell',  hi: 'बैटरी गरम/गंध',       ta: 'பேட்டரி வெப்பம்/வாசனை', bn: 'ব্যাটারি গরম/গন্ধ', te: 'బ్యాటరీ వేడి/వాసన' }, next: 'hot' }
          ]
        },
        not_full: {
          title: { de: 'Sonneneinstrahlung prüfen', en: 'Check sun exposure', hi: 'सूर्य प्रदर्शन जाँचें', ta: 'சூரிய வெளிப்பாடு', bn: 'সূর্যের এক্সপোজার', te: 'సూర్య బహిర్గతం' },
          body:  { de: 'Wann zuletzt gereinigt? Staub kostet bis 30% Leistung.', en: 'When last cleaned? Dust costs up to 30% power.', hi: 'अंतिम सफाई कब? धूल 30% कम करती है।', ta: 'கடைசியாக சுத்தம் செய்தது எப்போது? தூசி 30% குறைக்கும்.', bn: 'শেষ পরিষ্কার কবে? ধুলো 30% কমায়।', te: 'చివరిగా శుభ్రం ఎప్పుడు? ధూళి 30% తగ్గిస్తుంది.' },
          options: [
            { label: { de: 'Vor 1 Monat+',   en: '1+ months ago', hi: '1+ महीने पहले',  ta: '1+ மாதங்கள் முன்', bn: '1+ মাস আগে', te: '1+ నెలల క్రితం' }, action: { type: 'tip', text: { de: 'Reinige Panels morgens mit Tuch und Wasser.', en: 'Clean panels in the morning with cloth and water.', hi: 'सुबह कपड़े और पानी से पैनल साफ करें।', ta: 'காலையில் துணி & தண்ணீரால் சுத்தம் செய்.', bn: 'সকালে কাপড় ও জল দিয়ে পরিষ্কার।', te: 'ఉదయం వస్త్రం & నీటితో శుభ్రం.' } } },
            { label: { de: 'Erst kürzlich',  en: 'Recently',       hi: 'हाल ही में',     ta: 'சமீபத்தில்',     bn: 'সম্প্রতি',  te: 'ఇటీవల' }, next: 'check_shading' }
          ]
        },
        check_shading: {
          title: { de: 'Verschattung?', en: 'Shading?', hi: 'छाया?', ta: 'நிழல்?', bn: 'ছায়া?', te: 'నీడ?' },
          body:  { de: 'Bäume, Antennen oder neue Gebäude im Schatten?', en: 'Trees, antennas, new buildings shading?', hi: 'पेड़, एंटीना या नई इमारतें?', ta: 'மரம், ஆண்டெனா, புதிய கட்டிடம்?', bn: 'গাছ, অ্যান্টেনা, নতুন ভবন?', te: 'చెట్లు, ఆంటెన్నాలు, కొత్త భవనాలు?' },
          options: [
            { label: { de: 'Ja, Schatten',  en: 'Yes, shading', hi: 'हाँ, छाया',  ta: 'ஆம், நிழல்', bn: 'হ্যাঁ, ছায়া', te: 'అవును, నీడ' }, action: { type: 'tip', text: { de: 'Schon kleiner Schatten kann eine ganze Reihe lahmlegen.', en: 'Even small shading can disable a whole string.', hi: 'थोड़ी छाया भी पूरी पंक्ति बंद कर देती है।', ta: 'சிறு நிழலும் முழு வரிசையை நிறுத்தும்.', bn: 'সামান্য ছায়াও পুরো সারি বন্ধ।', te: 'చిన్న నీడ కూడా మొత్తం వరుసను ఆపగలదు.' } } },
            { label: { de: 'Nein', en: 'No', hi: 'नहीं', ta: 'இல்லை', bn: 'না', te: 'లేదు' }, action: { type: 'escalate', severity: 'medium', type_: 'panel_damage' } }
          ]
        },
        fast_drain: {
          title: { de: 'Verbrauch prüfen', en: 'Check usage', hi: 'खपत जाँचें', ta: 'பயன்பாட்டை சரிபார்', bn: 'ব্যবহার দেখুন', te: 'వాడకం తనిఖీ' },
          body:  { de: 'Neue Geräte angeschlossen (Kühlschrank, Pumpe)?', en: 'New devices connected (fridge, pump)?', hi: 'नए उपकरण (फ्रिज, पंप)?', ta: 'புதிய சாதனங்கள் (குளிர்சாதனம், பம்ப்)?', bn: 'নতুন ডিভাইস (ফ্রিজ, পাম্প)?', te: 'కొత్త పరికరాలు (ఫ్రిజ్, పంప్)?' },
          options: [
            { label: { de: 'Ja', en: 'Yes', hi: 'हाँ', ta: 'ஆம்', bn: 'হ্যাঁ', te: 'అవును' }, action: { type: 'tip', text: { de: 'Berechne Watt-Summe. Inverter evtl. zu klein.', en: 'Calculate total watts. Inverter may be too small.', hi: 'कुल वाट जोड़ें। इन्वर्टर छोटा हो सकता है।', ta: 'மொத்த வாட் கணக்கிடு. இன்வெர்ட்டர் சிறியதாக இருக்கலாம்.', bn: 'মোট ওয়াট গণনা। ইনভার্টার ছোট হতে পারে।', te: 'మొత్తం వాట్‌లు లెక్కించండి. ఇన్వర్టర్ చిన్నది కావచ్చు.' } } },
            { label: { de: 'Nein',en: 'No',  hi: 'नहीं', ta: 'இல்லை', bn: 'না', te: 'లేదు' }, next: 'battery_age' }
          ]
        },
        battery_age: {
          title: { de: 'Alter der Batterie', en: 'Battery age', hi: 'बैटरी की उम्र', ta: 'பேட்டரி வயது', bn: 'ব্যাটারির বয়স', te: 'బ్యాటరీ వయసు' },
          body:  { de: 'Wie alt ist die Batterie?', en: 'How old is the battery?', hi: 'बैटरी कितनी पुरानी?', ta: 'பேட்டரி எத்தனை வயது?', bn: 'ব্যাটারি কত বয়স?', te: 'బ్యాటరీ ఎంత వయసు?' },
          options: [
            { label: { de: '< 3 Jahre', en: '< 3 years', hi: '< 3 साल', ta: '< 3 ஆண்டு', bn: '< 3 বছর', te: '< 3 సంవత్సరాలు' }, action: { type: 'escalate', severity: 'medium', type_: 'battery_issue' } },
            { label: { de: '> 5 Jahre', en: '> 5 years', hi: '> 5 साल', ta: '> 5 ஆண்டு', bn: '> 5 বছর', te: '> 5 సంవత్సరాలు' }, action: { type: 'tip', text: { de: 'Plane Austausch. Sprich mit Techniker.', en: 'Plan replacement. Talk to a technician.', hi: 'बदलने की योजना। तकनीशियन से बात।', ta: 'மாற்று திட்டம். நிபுணரிடம் பேசு.', bn: 'প্রতিস্থাপন পরিকল্পনা। টেকনিশিয়ান।', te: 'మార్చడం ప్రణాళిక. టెక్నీషియన్‌తో మాట్లాడండి.' } } }
          ]
        },
        hot: {
          title: { de: 'STOPP – Gefahr!', en: 'STOP – Danger!', hi: 'रुकें – खतरा!', ta: 'நில் – ஆபத்து!', bn: 'থামুন – বিপদ!', te: 'ఆగండి – ప్రమాదం!' },
          body:  { de: 'Hauptschalter SOFORT aus. Raum verlassen. Heiße Batterien können explodieren.', en: 'Main switch OFF immediately. Leave room. Hot batteries can explode.', hi: 'मुख्य स्विच तुरंत बंद। कमरा छोड़ें। गरम बैटरी फट सकती है।', ta: 'முக்கிய சுவிட்சை உடனே ஆஃப். அறையை விட்டு வெளியேறு.', bn: 'প্রধান সুইচ অবিলম্বে অফ। ঘর ছাড়ুন। গরম ব্যাটারি বিস্ফোরিত হতে পারে।', te: 'ప్రధాన స్విచ్ వెంటనే ఆఫ్. గది వదిలి వెళ్లండి. వేడి బ్యాటరీలు పేలగలవు.' },
          options: [
            { label: { de: 'Erledigt, Notfall melden', en: 'Done, report emergency', hi: 'हो गया, आपातकाल', ta: 'முடிந்தது, அவசர அறிக்கை', bn: 'হয়েছে, জরুরি রিপোর্ট', te: 'అయింది, అత్యవసర నివేదిక' }, action: { type: 'escalate', severity: 'high', type_: 'battery_issue', emergency: true } }
          ]
        }
      }
    },

    panel_damage: {
      title: { de: 'Panel beschädigt', en: 'Panel damaged', hi: 'पैनल क्षतिग्रस्त', ta: 'பேனல் சேதம்', bn: 'প্যানেল ক্ষতিগ্রস্ত', te: 'ప్యానెల్ నష్టం' },
      icon: 'panel', estMinutes: 3, root: 'start',
      steps: {
        start: {
          title: { de: 'Was siehst du?', en: 'What do you see?', hi: 'क्या दिख रहा है?', ta: 'என்ன பார்க்கிறாய்?', bn: 'কী দেখছেন?', te: 'ఏమి కనిపిస్తోంది?' },
          body:  { de: '', en: '', hi: '', ta: '', bn: '', te: '' },
          options: [
            { label: { de: 'Glas zerbrochen', en: 'Glass broken', hi: 'काँच टूटा', ta: 'கண்ணாடி உடைந்தது', bn: 'কাঁচ ভাঙা', te: 'గాజు పగిలింది' }, next: 'glass' },
            { label: { de: 'Verfärbung',      en: 'Discoloration', hi: 'विवर्णन',  ta: 'நிற மாற்றம்',    bn: 'বিবর্ণতা',  te: 'రంగు మారడం' }, next: 'discolor' },
            { label: { de: 'Lose Verkabelung',en: 'Loose wiring', hi: 'ढीली तार',  ta: 'தளர்ந்த கம்பி', bn: 'আলগা তার', te: 'వదులైన వైరింగ్' }, next: 'cable' }
          ]
        },
        glass: {
          title: { de: 'Stromschlag-Gefahr', en: 'Electric shock risk', hi: 'बिजली का झटका जोखिम', ta: 'மின் அதிர்ச்சி அபாயம்', bn: 'বিদ্যুৎ শক ঝুঁকি', te: 'విద్యుత్ షాక్ ప్రమాదం' },
          body:  { de: 'Nicht berühren! Decke das Panel ab.', en: 'Do not touch! Cover the panel.', hi: 'न छुएँ! पैनल को ढकें।', ta: 'தொடாதே! பேனலை மூடு.', bn: 'স্পর্শ করবেন না! প্যানেল ঢাকুন।', te: 'తాకవద్దు! ప్యానెల్‌ను కప్పండి.' },
          options: [
            { label: { de: 'Abgedeckt → Techniker', en: 'Covered → technician', hi: 'ढका → तकनीशियन', ta: 'மூடப்பட்டது → நிபுணர்', bn: 'ঢাকা → টেকনিশিয়ান', te: 'కప్పబడింది → టెక్నీషియన్' }, action: { type: 'escalate', severity: 'high', type_: 'panel_damage' } }
          ]
        },
        discolor: {
          title: { de: 'Hot-Spot oder Alterung', en: 'Hot spot or aging', hi: 'हॉट-स्पॉट / आयु', ta: 'ஹாட்-ஸ்பாட் / வயது', bn: 'হট-স্পট / বয়স', te: 'హాట్-స్పాట్ / వయసు' },
          body:  { de: 'Fotografiere für Techniker.', en: 'Photo for technician.', hi: 'तकनीशियन के लिए फोटो।', ta: 'நிபுணருக்கு புகைப்படம்.', bn: 'টেকনিশিয়ানের জন্য ছবি।', te: 'టెక్నీషియన్ కోసం ఫోటో.' },
          options: [
            { label: { de: 'OK, melden', en: 'OK, report', hi: 'ठीक, रिपोर्ट', ta: 'சரி, அறிக்கை', bn: 'ঠিক, রিপোর্ট', te: 'సరి, నివేదిక' }, action: { type: 'escalate', severity: 'medium', type_: 'panel_damage' } }
          ]
        },
        cable: {
          title: { de: 'Sichern, nicht reparieren', en: 'Secure, do not repair', hi: 'सुरक्षित करें', ta: 'பாதுகாப்பு', bn: 'সুরক্ষিত করুন', te: 'భద్రపరచండి' },
          body:  { de: 'Mit Isolierband umkleben, ohne Kontakte zu berühren.', en: 'Wrap with insulating tape; do not touch contacts.', hi: 'इंसुलेशन टेप से लपेटें।', ta: 'காப்பீட்டு டேப்பால் சுற்று.', bn: 'ইনসুলেটিং টেপ মুড়ুন।', te: 'ఇన్సులేటింగ్ టేప్‌తో చుట్టండి.' },
          options: [
            { label: { de: 'Erledigt, Techniker rufen', en: 'Done, call technician', hi: 'हो गया, तकनीशियन', ta: 'முடிந்தது, நிபுணர்', bn: 'হয়েছে, টেকনিশিয়ান', te: 'అయింది, టెక్నీషియన్' }, action: { type: 'escalate', severity: 'high', type_: 'wiring_issue' } }
          ]
        }
      }
    }
  },

  // ===== KNOWLEDGE ARTICLES (titles + summaries multilingual; bodies kept as short multilingual paragraphs) =====
  articles: [
    {
      id: 'art_clean', category: 'maintenance', readMin: 4,
      title:   { de: 'Solarpanels richtig reinigen', en: 'Cleaning solar panels properly', hi: 'सोलर पैनल सही से साफ करें', ta: 'சோலார் பேனல்களை சரியாக சுத்தம் செய்', bn: 'সোলার প্যানেল সঠিকভাবে পরিষ্কার', te: 'సోలార్ ప్యానెల్‌లను సరిగ్గా శుభ్రం' },
      summary: { de: 'Staub kostet bis zu 30% Leistung.', en: 'Dust costs up to 30% power.', hi: 'धूल 30% तक बिजली खाती है।', ta: 'தூசி 30% வரை மின்சாரம் இழக்கும்.', bn: 'ধুলো ৩০% পর্যন্ত শক্তি কমায়।', te: 'ధూళి 30% వరకు శక్తిని కోల్పోతుంది.' },
      body: [
        { type: 'p',  text: { de: 'Regelmäßige Reinigung ist Pflicht — schon dünner Staub reduziert die Energie deutlich.', en: 'Regular cleaning is essential — even thin dust significantly reduces output.', hi: 'नियमित सफाई जरूरी है — पतली धूल भी ऊर्जा कम कर देती है।', ta: 'வழக்கமான சுத்தம் அவசியம் — மெல்லிய தூசியும் ஆற்றலை குறைக்கும்.', bn: 'নিয়মিত পরিষ্কার অপরিহার্য — পাতলা ধুলোও শক্তি কমায়।', te: 'క్రమం తప్పకుండా శుభ్రపరచడం అవసరం — సన్నని ధూళి కూడా శక్తిని తగ్గిస్తుంది.' } },
        { type: 'h',  text: { de: 'Wie reinigen?', en: 'How to clean?', hi: 'कैसे साफ करें?', ta: 'எப்படி சுத்தம் செய்வது?', bn: 'কীভাবে পরিষ্কার?', te: 'ఎలా శుభ్రం?' } },
        { type: 'li', text: { de: 'Weiches Tuch oder Mikrofaser', en: 'Soft cloth or microfiber', hi: 'मुलायम कपड़ा / माइक्रोफाइबर', ta: 'மென்மையான துணி', bn: 'নরম কাপড়', te: 'మృదువైన వస్త్రం' } },
        { type: 'li', text: { de: 'Sauberes Wasser, kein Salzwasser', en: 'Clean water, no salt water', hi: 'साफ पानी, खारा नहीं', ta: 'சுத்தமான தண்ணீர்', bn: 'পরিষ্কার জল', te: 'శుభ్రమైన నీరు' } },
        { type: 'li', text: { de: 'Keine harten Bürsten / Hochdruck', en: 'No hard brushes or pressure washers', hi: 'कठोर ब्रश नहीं', ta: 'கடினமான தூரிகை வேண்டாம்', bn: 'শক্ত ব্রাশ নয়', te: 'గట్టి బ్రష్‌లు వద్దు' } }
      ]
    },
    {
      id: 'art_battery', category: 'maintenance', readMin: 5,
      title:   { de: 'Batterie-Lebensdauer verlängern', en: 'Extend battery life', hi: 'बैटरी जीवन बढ़ाएँ', ta: 'பேட்டரி வாழ்க்காலம் நீட்டிக்க', bn: 'ব্যাটারির আয়ু বাড়ান', te: 'బ్యాటరీ జీవితకాలం పెంచండి' },
      summary: { de: '2-3 Jahre mehr Nutzung mit praktischen Tipps.', en: '2-3 more years with practical tips.', hi: '2-3 साल अधिक उपयोग।', ta: '2-3 ஆண்டுகள் கூடுதலாக.', bn: '2-3 বছর বেশি ব্যবহার।', te: '2-3 సంవత్సరాలు ఎక్కువగా.' },
      body: [
        { type: 'h', text: { de: 'Tiefentladung vermeiden', en: 'Avoid deep discharge', hi: 'गहन निर्वहन से बचें', ta: 'ஆழமான மின்விழுவதைத் தவிர்', bn: 'গভীর ডিসচার্জ এড়ান', te: 'డీప్ డిశ్చార్జ్ నివారించండి' } },
        { type: 'p', text: { de: 'Lass nie unter 20% fallen.', en: 'Never let it drop below 20%.', hi: '20% से कम कभी नहीं।', ta: '20%-க்கு கீழ் விடாதே.', bn: '20% নিচে নয়।', te: '20% కంటే తక్కువ ఎప్పుడూ లేదు.' } },
        { type: 'h', text: { de: 'Hitze ist der Feind', en: 'Heat is the enemy', hi: 'गर्मी दुश्मन है', ta: 'வெப்பம் எதிரி', bn: 'গরম শত্রু', te: 'వేడి శత్రువు' } },
        { type: 'p', text: { de: 'Batterieraum kühl & belüftet.', en: 'Keep battery room cool & ventilated.', hi: 'बैटरी कमरा ठंडा रखें।', ta: 'பேட்டரி அறை குளிர்.', bn: 'ব্যাটারি ঘর ঠান্ডা।', te: 'బ్యాటరీ గది చల్లగా.' } }
      ]
    },
    {
      id: 'art_safety', category: 'safety', readMin: 6,
      title:   { de: 'Sicherheit bei Solaranlagen', en: 'Solar safety', hi: 'सौर सुरक्षा', ta: 'சோலார் பாதுகாப்பு', bn: 'সৌর নিরাপত্তা', te: 'సోలార్ భద్రత' },
      summary: { de: 'Stromschlag, Brand, Verätzung — was du wissen musst.', en: 'Shock, fire, burns — what to know.', hi: 'झटका, आग, जलना — जानें।', ta: 'அதிர்ச்சி, தீ, எரிதல்', bn: 'শক, আগুন, পোড়া', te: 'షాక్, అగ్ని, కాలిన గాయాలు' },
      body: [
        { type: 'h', text: { de: 'Solarpanels stehen IMMER unter Spannung', en: 'Panels are ALWAYS live', hi: 'पैनल हमेशा सक्रिय', ta: 'பேனல்கள் எப்போதும் சக்தியில்', bn: 'প্যানেল সর্বদা সক্রিয়', te: 'ప్యానెల్‌లు ఎల్లప్పుడూ ప్రత్యక్షంగా' } },
        { type: 'p', text: { de: 'Auch nachts. Niemals offene Kabel anfassen.', en: 'Even at night. Never touch exposed cables.', hi: 'रात में भी। नंगे तार न छुएँ।', ta: 'இரவிலும். வெளிப்படையான கம்பிகளைத் தொடாதே.', bn: 'রাতেও। খোলা তার নয়।', te: 'రాత్రి కూడా. తెరిచిన వైర్లను తాకవద్దు.' } }
      ]
    },
    {
      id: 'art_monsoon', category: 'weather', readMin: 4,
      title:   { de: 'Monsun-Vorbereitung', en: 'Monsoon preparation', hi: 'मानसून तैयारी', ta: 'பருவமழை தயாரிப்பு', bn: 'বর্ষা প্রস্তুতি', te: 'వర్ష ఋతువు సన్నాహాలు' },
      summary: { de: 'Vor der Regenzeit checken.', en: 'Check before the rains.', hi: 'बारिश से पहले जाँचें।', ta: 'மழைக்கு முன் சரிபார்.', bn: 'বৃষ্টির আগে চেক।', te: 'వర్షాల ముందు తనిఖీ.' },
      body: [
        { type: 'li', text: { de: 'Halterungen & Schrauben prüfen', en: 'Check mounts & screws', hi: 'माउंट और स्क्रू जाँचें', ta: 'பொருத்துதல்கள் சரிபார்', bn: 'মাউন্ট ও স্ক্রু চেক', te: 'మౌంట్లు తనిఖీ' } },
        { type: 'li', text: { de: 'Erdung kontrollieren', en: 'Check grounding', hi: 'ग्राउंडिंग जाँचें', ta: 'நிலத்தடி சரிபார்', bn: 'গ্রাউন্ডিং চেক', te: 'గ్రౌండింగ్ తనిఖీ' } },
        { type: 'li', text: { de: 'Inverter wassergeschützt?', en: 'Inverter water-protected?', hi: 'इन्वर्टर पानी से बचाव?', ta: 'இன்வெர்ட்டர் நீர் பாதுகாப்பு?', bn: 'ইনভার্টার জলরোধী?', te: 'ఇన్వర్టర్ నీటి రక్షణ?' } }
      ]
    },
    {
      id: 'art_dimension', category: 'planning', readMin: 5,
      title:   { de: 'Wie viel Strom brauche ich?', en: 'How much power do I need?', hi: 'कितनी बिजली चाहिए?', ta: 'எவ்வளவு மின்சாரம் தேவை?', bn: 'কত বিদ্যুৎ লাগে?', te: 'ఎంత విద్యుత్ కావాలి?' },
      summary: { de: 'Beispielrechnung für Haushalt.', en: 'Example calc for a household.', hi: 'घर के लिए गणना।', ta: 'வீட்டிற்கான கணக்கு.', bn: 'বাড়ির জন্য গণনা।', te: 'ఇంటి కోసం లెక్క.' },
      body: [
        { type: 'p', text: { de: 'Dorfhaushalt: 2-4 kWh/Tag.', en: 'Village household: 2-4 kWh/day.', hi: 'गाँव परिवार: 2-4 kWh/दिन।', ta: 'கிராம வீடு: 2-4 kWh/நாள்.', bn: 'গ্রামের পরিবার: 2-4 kWh/দিন।', te: 'గ్రామ గృహం: 2-4 kWh/రోజు.' } },
        { type: 'p', text: { de: 'Empfehlung: 500W Panel + 200Ah Batterie + 1000W Inverter.', en: 'Recommendation: 500W panel + 200Ah battery + 1000W inverter.', hi: '500W पैनल + 200Ah बैटरी + 1000W इन्वर्टर।', ta: '500W பேனல் + 200Ah பேட்டரி + 1000W இன்வெர்ட்டர்.', bn: '500W প্যানেল + 200Ah ব্যাটারি + 1000W ইনভার্টার।', te: '500W ప్యానెల్ + 200Ah బ్యాటరీ + 1000W ఇన్వర్టర్.' } }
      ]
    },
    {
      id: 'art_subsidy', category: 'finance', readMin: 4,
      title:   { de: 'Förderungen in Indien', en: 'Subsidies in India', hi: 'भारत में सब्सिडी', ta: 'இந்தியாவில் மானியங்கள்', bn: 'ভারতে ভর্তুকি', te: 'భారతదేశంలో సబ్సిడీలు' },
      summary: { de: 'PM Surya Ghar und regionale Programme.', en: 'PM Surya Ghar and state programs.', hi: 'PM सूर्य घर और राज्य कार्यक्रम।', ta: 'PM சூர்யா கர் & மாநில திட்டங்கள்.', bn: 'PM সূর্য ঘর ও রাজ্য প্রকল্প।', te: 'PM సూర్య ఘర్ & రాష్ట్ర పథకాలు.' },
      body: [
        { type: 'h', text: { de: 'PM Surya Ghar Muft Bijli Yojana', en: 'PM Surya Ghar Muft Bijli Yojana', hi: 'PM सूर्य घर मुफ्त बिजली योजना', ta: 'PM சூர்யா கர் முஃப்த் பிஜ்லி யோஜனா', bn: 'PM সূর্য ঘর মুফত বিজলি যোজনা', te: 'PM సూర్య ఘర్ ముఫ్త్ బిజ్లీ యోజన' } },
        { type: 'p', text: { de: 'Bis zu ₹78.000 für 3 kW. Antrag: pmsuryaghar.gov.in', en: 'Up to ₹78,000 for 3 kW. Apply at pmsuryaghar.gov.in', hi: '3 kW के लिए ₹78,000 तक। pmsuryaghar.gov.in', ta: '3 kW க்கு ₹78,000 வரை. pmsuryaghar.gov.in', bn: '3 kW-এর জন্য ₹78,000 পর্যন্ত। pmsuryaghar.gov.in', te: '3 kW కోసం ₹78,000 వరకు. pmsuryaghar.gov.in' } }
      ]
    }
  ],

  // ===== LEARNING MODULES (titles+slides+quiz multilingual) =====
  lessons: [
    {
      id: 'l_basics', level: 'Anfänger', durationMin: 8,
      title: { de: 'Solarstrom Basics', en: 'Solar basics', hi: 'सौर ऊर्जा बेसिक्स', ta: 'சோலார் அடிப்படை', bn: 'সৌর বেসিকস', te: 'సోలార్ ప్రాథమికాలు' },
      slides: [
        { title: { de: 'Was ist Solarstrom?', en: 'What is solar power?', hi: 'सौर ऊर्जा क्या है?', ta: 'சோலார் சக்தி என்ன?', bn: 'সৌর বিদ্যুৎ কী?', te: 'సోలార్ పవర్ ఏమిటి?' },
          body:  { de: 'Panels wandeln Sonnenlicht in DC-Strom. Der Inverter macht daraus 230V AC.', en: 'Panels convert sunlight to DC. The inverter makes 230V AC.', hi: 'पैनल सूर्य प्रकाश को DC में बदलते हैं। इन्वर्टर 230V AC बनाता है।', ta: 'பேனல்கள் சூரிய ஒளியை DC ஆக மாற்றுகின்றன. இன்வெர்ட்டர் 230V AC ஆக்குகிறது.', bn: 'প্যানেল সূর্যালোককে DC-তে রূপান্তর। ইনভার্টার 230V AC।', te: 'ప్యానెల్‌లు సూర్యకాంతిని DCగా మారుస్తాయి. ఇన్వర్టర్ 230V AC చేస్తుంది.' } },
        { title: { de: 'Die 4 Komponenten', en: 'The 4 components', hi: '4 घटक', ta: '4 கூறுகள்', bn: '4 উপাদান', te: '4 భాగాలు' },
          body:  { de: '1) Panels\n2) Charge-Controller\n3) Batterie\n4) Inverter', en: '1) Panels\n2) Charge controller\n3) Battery\n4) Inverter', hi: '1) पैनल\n2) चार्ज कंट्रोलर\n3) बैटरी\n4) इन्वर्टर', ta: '1) பேனல்\n2) சார்ஜ் கட்டுப்படுத்தி\n3) பேட்டரி\n4) இன்வெர்ட்டர்', bn: '1) প্যানেল\n2) চার্জ কন্ট্রোলার\n3) ব্যাটারি\n4) ইনভার্টার', te: '1) ప్యానెల్‌లు\n2) ఛార్జ్ కంట్రోలర్\n3) బ్యాటరీ\n4) ఇన్వర్టర్' } },
        { title: { de: 'Tag und Nacht', en: 'Day and night', hi: 'दिन और रात', ta: 'பகல் & இரவு', bn: 'দিন ও রাত', te: 'పగలు & రాత్రి' },
          body:  { de: 'Tag: Panels laden Batterie. Nacht: Batterie liefert Strom.', en: 'Day: panels charge battery. Night: battery supplies power.', hi: 'दिन: पैनल बैटरी चार्ज। रात: बैटरी बिजली।', ta: 'பகல்: பேனல்கள் சார்ஜ். இரவு: பேட்டரி.', bn: 'দিন: প্যানেল চার্জ। রাত: ব্যাটারি।', te: 'పగలు: ప్యానెల్‌లు ఛార్జ్. రాత్రి: బ్యాటరీ.' } }
      ],
      quiz: [
        { q: { de: 'Was wandelt Sonnenlicht in Strom?', en: 'What converts sunlight to power?', hi: 'सूर्य प्रकाश को बिजली में?', ta: 'சூரிய ஒளியை மின்சாரமாக?', bn: 'সূর্যালোককে বিদ্যুৎ?', te: 'సూర్యకాంతిని విద్యుత్‌గా?' },
          a: [
            { de: 'Inverter',  en: 'Inverter',   hi: 'इन्वर्टर', ta: 'இன்வெர்ட்டர்', bn: 'ইনভার্টার', te: 'ఇన్వర్టర్' },
            { de: 'Solarpanel',en: 'Solar panel', hi: 'सोलर पैनल', ta: 'சோலார் பேனல்', bn: 'সোলার প্যানেল', te: 'సోలార్ ప్యానెల్' },
            { de: 'Batterie',  en: 'Battery',     hi: 'बैटरी',    ta: 'பேட்டரி', bn: 'ব্যাটারি', te: 'బ్యాటరీ' }
          ], correct: 1 },
        { q: { de: 'Wozu dient die Batterie?', en: 'What is the battery for?', hi: 'बैटरी किसलिए?', ta: 'பேட்டரி எதற்கு?', bn: 'ব্যাটারি কেন?', te: 'బ్యాటరీ ఎందుకు?' },
          a: [
            { de: 'Strom speichern', en: 'Store power',     hi: 'बिजली संग्रहण', ta: 'மின்சாரம் சேமிக்க', bn: 'বিদ্যুৎ সংরক্ষণ', te: 'విద్యుత్ నిల్వ' },
            { de: 'Spannung erhöhen',en: 'Boost voltage',    hi: 'वोल्टेज बढ़ाना', ta: 'மின்னழுத்தம் அதிகரிக்க', bn: 'ভোল্টেজ বাড়ানো', te: 'వోల్టేజ్ పెంచు' },
            { de: 'Sicherheit',      en: 'Safety',           hi: 'सुरक्षा',       ta: 'பாதுகாப்பு', bn: 'নিরাপত্তা', te: 'భద్రత' }
          ], correct: 0 }
      ]
    },
    {
      id: 'l_care', level: 'Anfänger', durationMin: 10,
      title: { de: 'Pflege & Wartung', en: 'Care & maintenance', hi: 'देखभाल और रखरखाव', ta: 'பராமரிப்பு', bn: 'যত্ন ও রক্ষণাবেক্ষণ', te: 'సంరక్షణ & నిర్వహణ' },
      slides: [
        { title: { de: 'Reinigung', en: 'Cleaning', hi: 'सफाई', ta: 'சுத்தம்', bn: 'পরিষ্কার', te: 'శుభ్రపరచడం' },
          body:  { de: 'Alle 2-4 Wochen mit Wasser und weichem Tuch.', en: 'Every 2-4 weeks with water and soft cloth.', hi: 'हर 2-4 सप्ताह।', ta: '2-4 வாரத்துக்கு ஒருமுறை.', bn: '2-4 সপ্তাহে।', te: '2-4 వారాలకు ఒకసారి.' } },
        { title: { de: 'Sichtprüfung', en: 'Visual check', hi: 'दृश्य निरीक्षण', ta: 'காட்சி சோதனை', bn: 'দৃশ্য পরীক্ষা', te: 'దృశ్య పరిశీలన' },
          body:  { de: 'Monatlich Kabel, Panels und Inverter-LED prüfen.', en: 'Monthly check cables, panels, inverter LED.', hi: 'मासिक जाँच।', ta: 'மாதாந்திர சரிபார்.', bn: 'মাসিক চেক।', te: 'నెలవారీ తనిఖీ.' } },
        { title: { de: 'Batteriepflege', en: 'Battery care', hi: 'बैटरी देखभाल', ta: 'பேட்டரி பராமரிப்பு', bn: 'ব্যাটারি যত্ন', te: 'బ్యాటరీ సంరక్షణ' },
          body:  { de: 'Pole sauber, Wasserstand prüfen (Blei).', en: 'Clean terminals, check water level (lead).', hi: 'टर्मिनल साफ।', ta: 'முனைகள் சுத்தம்.', bn: 'টার্মিনাল পরিষ্কার।', te: 'టెర్మినల్‌లు శుభ్రం.' } }
      ],
      quiz: [
        { q: { de: 'Wie oft Panels reinigen?', en: 'How often clean panels?', hi: 'कितनी बार पैनल साफ?', ta: 'எத்தனை அடிக்கடி?', bn: 'কত প্রায়ই?', te: 'ఎంత తరచుగా?' },
          a: [
            { de: '1× pro Jahr',    en: 'Once a year',  hi: 'साल में 1 बार', ta: 'ஆண்டுக்கு ஒருமுறை', bn: 'বছরে একবার', te: 'సంవత్సరానికి ఒకసారి' },
            { de: 'Alle 2-4 Wochen',en: 'Every 2-4 weeks', hi: 'हर 2-4 सप्ताह', ta: '2-4 வாரம்', bn: '2-4 সপ্তাহে', te: '2-4 వారాలు' },
            { de: 'Täglich',        en: 'Daily',          hi: 'दैनिक',        ta: 'தினமும்', bn: 'দৈনিক', te: 'రోజూ' }
          ], correct: 1 },
        { q: { de: 'Was darf NICHT?', en: 'What is NOT allowed?', hi: 'क्या नहीं?', ta: 'எது வேண்டாம்?', bn: 'কী নয়?', te: 'ఏది వద్దు?' },
          a: [
            { de: 'Wasser',        en: 'Water',         hi: 'पानी',     ta: 'நீர்',      bn: 'জল',     te: 'నీరు' },
            { de: 'Weiches Tuch',  en: 'Soft cloth',    hi: 'मुलायम कपड़ा', ta: 'மென்மை',   bn: 'নরম কাপড়', te: 'మృదు వస్త్రం' },
            { de: 'Drahtbürste',   en: 'Wire brush',    hi: 'तार ब्रश',  ta: 'கம்பி தூரிகை', bn: 'তার ব্রাশ', te: 'వైర్ బ్రష్' }
          ], correct: 2 }
      ]
    },
    {
      id: 'l_safety', level: 'Fortgeschritten', durationMin: 12,
      title: { de: 'Sicherheit im Notfall', en: 'Emergency safety', hi: 'आपातकाल सुरक्षा', ta: 'அவசர பாதுகாப்பு', bn: 'জরুরি নিরাপত্তা', te: 'అత్యవసర భద్రత' },
      slides: [
        { title: { de: 'Stromschlag', en: 'Electric shock', hi: 'बिजली का झटका', ta: 'மின் அதிர்ச்சி', bn: 'বিদ্যুৎ শক', te: 'విద్యుత్ షాక్' },
          body:  { de: 'Panels stehen IMMER unter Spannung — niemals offene Kabel anfassen.', en: 'Panels are ALWAYS live — never touch exposed cables.', hi: 'पैनल हमेशा सक्रिय।', ta: 'பேனல்கள் எப்போதும் சக்தியில்.', bn: 'প্যানেল সর্বদা সক্রিয়।', te: 'ప్యానెల్‌లు ఎల్లప్పుడూ ప్రత్యక్షంగా.' } },
        { title: { de: 'Brandgefahr', en: 'Fire risk', hi: 'आग का जोखिम', ta: 'தீ ஆபத்து', bn: 'আগুনের ঝুঁকি', te: 'అగ్ని ప్రమాదం' },
          body:  { de: 'Bei Rauch DC aus, mit Sand löschen — nie Wasser.', en: 'If smoke: DC off, sand only — never water.', hi: 'धुएँ पर DC बंद, रेत।', ta: 'புகை: DC ஆஃப், மணல்.', bn: 'ধোঁয়া: DC বন্ধ, বালি।', te: 'పొగ: DC ఆఫ్, ఇసుక.' } },
        { title: { de: 'Batterieproblem', en: 'Battery issue', hi: 'बैटरी समस्या', ta: 'பேட்டரி பிரச்சினை', bn: 'ব্যাটারি সমস্যা', te: 'బ్యాటరీ సమస్య' },
          body:  { de: 'Hitze/Geruch → sofort raus, Hauptschalter aus.', en: 'Heat/smell → leave room, main off.', hi: 'गर्मी/गंध → बाहर निकलें।', ta: 'வெப்பம்/வாசனை → வெளியேறு.', bn: 'গরম/গন্ধ → বেরিয়ে যান।', te: 'వేడి/వాసన → బయటకు.' } }
      ],
      quiz: [
        { q: { de: 'Stehen Panels nachts unter Strom?', en: 'Are panels live at night?', hi: 'रात में पैनल सक्रिय?', ta: 'இரவில் சக்தியில்?', bn: 'রাতে সক্রিয়?', te: 'రాత్రి ప్రత్యక్షంగా?' },
          a: [
            { de: 'Nein',           en: 'No',          hi: 'नहीं',       ta: 'இல்லை',  bn: 'না',  te: 'లేదు' },
            { de: 'Ja',             en: 'Yes',         hi: 'हाँ',        ta: 'ஆம்',    bn: 'হ্যাঁ', te: 'అవును' },
            { de: 'Nur bei Vollmond',en: 'Only full moon', hi: 'केवल पूर्णिमा', ta: 'பௌர்ணமி மட்டும்', bn: 'শুধু পূর্ণিমা', te: 'పూర్ణ చంద్రుడు మాత్రమే' }
          ], correct: 1 },
        { q: { de: 'Womit Solarbrand löschen?', en: 'What to use on solar fire?', hi: 'सौर आग किससे?', ta: 'சோலார் தீ?', bn: 'সৌর আগুন?', te: 'సోలార్ అగ్ని?' },
          a: [
            { de: 'Wasser',  en: 'Water',  hi: 'पानी',  ta: 'நீர்',   bn: 'জল',     te: 'నీరు' },
            { de: 'Sand',    en: 'Sand',   hi: 'रेत',   ta: 'மணல்',   bn: 'বালি',   te: 'ఇసుక' },
            { de: 'Schaum',  en: 'Foam',   hi: 'झाग',   ta: 'நுரை',   bn: 'ফোম',    te: 'ఫోమ్' }
          ], correct: 1 }
      ]
    },
    {
      id: 'l_diagnose', level: 'Fortgeschritten', durationMin: 15,
      title: { de: 'Probleme selbst diagnostizieren', en: 'Diagnose problems', hi: 'खुद निदान करें', ta: 'நீங்களே நோய் கண்டறிய', bn: 'নিজে নির্ণয়', te: 'మీరే నిర్ధారణ' },
      slides: [
        { title: { de: 'Erst LED prüfen', en: 'Check LED first', hi: 'पहले LED', ta: 'முதலில் LED', bn: 'প্রথমে LED', te: 'మొదట LED' },
          body:  { de: 'Grün = OK, Rot = Fehler, Aus = stromlos.', en: 'Green = OK, Red = error, Off = no power.', hi: 'हरा = ठीक, लाल = त्रुटि।', ta: 'பச்சை = சரி, சிவப்பு = பிழை.', bn: 'সবুজ = ঠিক, লাল = ত্রুটি।', te: 'ఆకుపచ్చ = సరి, ఎరుపు = లోపం.' } },
        { title: { de: 'Dann Batterie', en: 'Then battery', hi: 'फिर बैटरी', ta: 'பின் பேட்டரி', bn: 'তারপর ব্যাটারি', te: 'తర్వాత బ్యాటరీ' },
          body:  { de: 'Unter 11V (12V-System) ist tief.', en: 'Below 11V (12V system) is deep.', hi: '11V से कम गहरा।', ta: '11V கீழ் ஆழம்.', bn: '11V নিচে গভীর।', te: '11V కంటే తక్కువ లోతుగా.' } },
        { title: { de: 'Wann Techniker?', en: 'When call technician?', hi: 'तकनीशियन कब?', ta: 'எப்போது நிபுணர்?', bn: 'কখন টেকনিশিয়ান?', te: 'ఎప్పుడు టెక్నీషియన్?' },
          body:  { de: 'Rauch, Glasbruch, wiederholtes MCB-Auslösen.', en: 'Smoke, broken glass, repeated MCB trips.', hi: 'धुआँ, टूटा काँच।', ta: 'புகை, உடைந்த கண்ணாடி.', bn: 'ধোঁয়া, ভাঙা কাঁচ।', te: 'పొగ, పగిలిన గాజు.' } }
      ],
      quiz: [
        { q: { de: 'Rote LED bedeutet?', en: 'Red LED means?', hi: 'लाल LED?', ta: 'சிவப்பு LED?', bn: 'লাল LED?', te: 'ఎరుపు LED?' },
          a: [
            { de: 'Alles OK', en: 'All OK', hi: 'सब ठीक', ta: 'எல்லாம் சரி', bn: 'সব ঠিক', te: 'అంతా సరి' },
            { de: 'Fehler',   en: 'Error',  hi: 'त्रुटि', ta: 'பிழை',     bn: 'ত্রুটি',  te: 'లోపం' },
            { de: 'Vollladung',en:'Full charge', hi: 'पूर्ण चार्ज', ta: 'முழு சார்ஜ்', bn: 'পূর্ণ চার্জ', te: 'పూర్తి ఛార్జ్' }
          ], correct: 1 },
        { q: { de: 'Wann sofort Techniker?', en: 'When immediately call?', hi: 'तुरंत कब?', ta: 'எப்போது உடனே?', bn: 'কখন তখনই?', te: 'ఎప్పుడు వెంటనే?' },
          a: [
            { de: 'Bei Wolken',       en: 'On cloudy day', hi: 'बादल पर', ta: 'மேகம்', bn: 'মেঘে', te: 'మేఘం' },
            { de: 'Bei Rauch',        en: 'On smoke',      hi: 'धुएँ पर', ta: 'புகை', bn: 'ধোঁয়ায়', te: 'పొగ' },
            { de: 'Bei Sonnenuntergang', en: 'At sunset',  hi: 'सूर्यास्त पर', ta: 'சூரிய மறைவு', bn: 'সূর্যাস্ত', te: 'సూర్యాస్తమయం' }
          ], correct: 1 }
      ]
    }
  ],

  // ===== TECHNICIANS (Indian) =====
  technicians: [
    { id: 'tech_1', name: 'Rajesh Kumar',      phone: '+91 98765 43210', specialty: 'Wechselrichter & Verkabelung', district: 'Pune, Maharashtra',  rating: 4.8, jobs: 142, languages: ['Hindi','English','Marathi'] },
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

  // ===== COMMUNITY POSTS (Multi-lang authors & bodies) =====
  posts: [
    { id: 'post_1', avatar: 'A', createdAt: Date.now() - 1000*60*60*3, likes: 12,
      author: { de: 'Anita (Ward 4)', en: 'Anita (Ward 4)', hi: 'अनीता (वार्ड 4)', ta: 'அனிதா (வார்டு 4)', bn: 'অনিতা (ওয়ার্ড 4)', te: 'అనిత (వార్డ్ 4)' },
      body:   { de: 'Nach der Reinigung produzieren unsere Panels wieder volle Leistung!', en: 'After cleaning, our panels produce full power again!', hi: 'सफाई के बाद पैनल पूरी बिजली दे रहे हैं!', ta: 'சுத்தம் செய்த பிறகு பேனல்கள் முழு சக்தி!', bn: 'পরিষ্কারের পর প্যানেল পূর্ণ শক্তি!', te: 'శుభ్రం తర్వాత ప్యానెల్‌లు పూర్తి శక్తి!' } },
    { id: 'post_2', avatar: 'V', createdAt: Date.now() - 1000*60*60*22, likes: 8, pinned: true,
      author: { de: 'Vikram (Ward 2)', en: 'Vikram (Ward 2)', hi: 'विक्रम (वार्ड 2)', ta: 'விக்ரம் (வார்டு 2)', bn: 'বিক্রম (ওয়ার্ড 2)', te: 'విక్రమ్ (వార్డ్ 2)' },
      body:   { de: 'Heute 18:00 Schulung "Wann Techniker rufen" im Gemeindezentrum.', en: 'Today 6 PM training "When to call a technician" at the community center.', hi: 'आज 6 बजे प्रशिक्षण।', ta: 'இன்று மா 6:00 பயிற்சி.', bn: 'আজ 6টা প্রশিক্ষণ।', te: 'ఈ రోజు సా 6 శిక్షణ.' } },
    { id: 'post_3', avatar: 'S', createdAt: Date.now() - 1000*60*60*48, likes: 3,
      author: { de: 'Sunita (Ward 1)', en: 'Sunita (Ward 1)', hi: 'सुनीता (वार्ड 1)', ta: 'சுனிதா (வார்டு 1)', bn: 'সুনিতা (ওয়ার্ড 1)', te: 'సునిత (వార్డ్ 1)' },
      body:   { de: 'Wer hat einen Spannungsmesser zum Ausleihen?', en: 'Who has a voltmeter to lend?', hi: 'किसके पास वोल्टमीटर है?', ta: 'வோல்ட்மீட்டர் இருக்கா?', bn: 'কারো কাছে ভোল্টমিটার আছে?', te: 'వోల్ట్‌మీటర్ ఎవరికైనా ఉందా?' } },
    { id: 'post_4', avatar: 'R', createdAt: Date.now() - 1000*60*60*96, likes: 19,
      author: { de: 'Ramesh (Ward 3)', en: 'Ramesh (Ward 3)', hi: 'रमेश (वार्ड 3)', ta: 'ரமேஷ் (வார்டு 3)', bn: 'রমেশ (ওয়ার্ড 3)', te: 'రమేష్ (వార్డ్ 3)' },
      body:   { de: 'Monsunvorbereitung erledigt — alle Halterungen nachgezogen.', en: 'Monsoon prep done — all mounts tightened.', hi: 'मानसून तैयारी पूरी।', ta: 'பருவமழை தயாரிப்பு முடிந்தது.', bn: 'বর্ষা প্রস্তুতি শেষ।', te: 'వర్ష ఋతువు సన్నాహాలు పూర్తి.' } }
  ],

  // ===== COMMUNITY TICKETS (open issues from villagers) =====
  // Pre-seeded so technicians have something to work on in the demo.
  // Users see them as "community tickets" alongside their own.
  communityTickets: [
    { id: 'tk_c1', type: 'inverter_issue', severity: 'high',   status: 'open',
      timestamp: Date.now() - 1000*60*15,
      reporter: { name: 'Anita Patel',    ward: 'Ward 4', phone: '+91 99887 12340', avatar: 'A' },
      note: { de: 'Inverter zeigt rote LED, Display blinkt mit Code F03. Kein Strom im Haus.',
              en: 'Inverter shows red LED, display blinks F03. No power.',
              hi: 'इन्वर्टर लाल LED, F03 कोड। बिजली नहीं।',
              ta: 'இன்வெர்ட்டர் சிவப்பு LED, F03. மின்சாரம் இல்லை.',
              bn: 'ইনভার্টার লাল LED, F03। বিদ্যুৎ নেই।',
              te: 'ఇన్వర్టర్ ఎరుపు LED, F03. విద్యుత్ లేదు.' },
      synced: true, source: 'community' },
    { id: 'tk_c2', type: 'battery_issue', severity: 'high',   status: 'open',
      timestamp: Date.now() - 1000*60*60*2,
      reporter: { name: 'Vikram Joshi',   ward: 'Ward 2', phone: '+91 99887 12341', avatar: 'V' },
      note: { de: 'Batterie wird heiß, leichter Geruch. Hauptschalter ausgeschaltet.',
              en: 'Battery getting hot, slight smell. Main switch off.',
              hi: 'बैटरी गरम, हल्की गंध। मुख्य स्विच बंद।',
              ta: 'பேட்டரி வெப்பம், மணம். முக்கிய சுவிட்ச் ஆஃப்.',
              bn: 'ব্যাটারি গরম, গন্ধ। প্রধান সুইচ বন্ধ।',
              te: 'బ్యాటరీ వేడిగా, వాసన. ప్రధాన స్విచ్ ఆఫ్.' },
      synced: true, source: 'community' },
    { id: 'tk_c3', type: 'panel_damage', severity: 'medium', status: 'progress',
      timestamp: Date.now() - 1000*60*60*5,
      reporter: { name: 'Sunita Reddy',   ward: 'Ward 1', phone: '+91 99887 12342', avatar: 'S' },
      note: { de: 'Eines der Panels hat braune Flecken in der Mitte.',
              en: 'One panel has brown spots in the middle.',
              hi: 'एक पैनल पर भूरे धब्बे।',
              ta: 'ஒரு பேனலில் பழுப்பு புள்ளிகள்.',
              bn: 'একটি প্যানেলে বাদামী দাগ।',
              te: 'ఒక ప్యానెల్‌పై గోధుమ మచ్చలు.' },
      assignedTo: 'tech_3',
      synced: true, source: 'community' },
    { id: 'tk_c4', type: 'wiring_issue', severity: 'medium', status: 'open',
      timestamp: Date.now() - 1000*60*60*8,
      reporter: { name: 'Ramesh Kumar',   ward: 'Ward 3', phone: '+91 99887 12343', avatar: 'R' },
      note: { de: 'Kabel an der Hauswand ist verrutscht, hängt locker.',
              en: 'Cable on the house wall is loose.',
              hi: 'घर की दीवार पर तार ढीला।',
              ta: 'வீட்டு சுவரில் கம்பி தளர்வாக.',
              bn: 'বাড়ির দেয়ালে তার আলগা।',
              te: 'ఇంటి గోడపై వైరు వదులుగా.' },
      synced: true, source: 'community' },
    { id: 'tk_c5', type: 'power_outage', severity: 'low', status: 'resolved',
      timestamp: Date.now() - 1000*60*60*24*2,
      reporter: { name: 'Lakshmi Gupta',  ward: 'Ward 5', phone: '+91 99887 12344', avatar: 'L' },
      note: { de: 'Strom war kurz weg — MCB ausgelöst durch Pumpe.',
              en: 'Brief outage — MCB tripped by pump.',
              hi: 'थोड़ी देर बिजली नहीं।',
              ta: 'சிறிய நேரம் மின்சாரம் இல்லை.',
              bn: 'অল্প সময় বিদ্যুৎ নেই।',
              te: 'కొద్దిసేపు విద్యుత్ లేదు.' },
      assignedTo: 'tech_1',
      synced: true, source: 'community' }
  ],

  // ===== APPOINTMENTS =====
  appointments: [
    { id: 'app_1', techId: 'tech_3', scheduledFor: Date.now() + 1000*60*60*24*4,  status: 'confirmed',
      title: { de: 'Halbjährliche Wartung', en: 'Half-yearly maintenance', hi: 'अर्ध-वार्षिक रखरखाव', ta: 'அரையாண்டு பராமரிப்பு', bn: 'অর্ধ-বার্ষিক', te: 'అర్ధ-సంవత్సర నిర్వహణ' },
      notes: { de: 'Panels reinigen, Verkabelung prüfen', en: 'Clean panels, check wiring', hi: 'पैनल साफ, तार जाँचें', ta: 'பேனல்கள் சுத்தம், கம்பி சரிபார்', bn: 'প্যানেল পরিষ্কার, তার চেক', te: 'ప్యానెల్‌లు శుభ్రం, వైరింగ్ తనిఖీ' } },
    { id: 'app_2', techId: 'tech_2', scheduledFor: Date.now() + 1000*60*60*24*18, status: 'pending',
      title: { de: 'Batterietausch Bewertung', en: 'Battery replacement assessment', hi: 'बैटरी मूल्यांकन', ta: 'பேட்டரி மதிப்பீடு', bn: 'ব্যাটারি মূল্যায়ন', te: 'బ్యాటరీ అంచనా' },
      notes: { de: 'Inspektion vor möglichem Tausch', en: 'Inspection before possible replacement', hi: 'निरीक्षण', ta: 'ஆய்வு', bn: 'পরিদর్শন', te: 'తనిఖీ' } }
  ],

  generateEnergyHistory(days = 14) {
    const logs = [];
    const day = 1000 * 60 * 60 * 24;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * day);
      date.setHours(0,0,0,0);
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

  // ===== WEATHER =====
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
