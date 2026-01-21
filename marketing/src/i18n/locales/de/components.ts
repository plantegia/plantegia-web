export default {
  hero: {
    headline: 'Perpetual Harvest Planer',
    taglinePrefix: 'Wissen, wann man',
    seed: 'säen',
    flip: 'umstellen',
    harvest: 'ernten',
    taglineSuffix: 'und wieder',
    seedAgain: 'säen',
    taglineEnd: 'muss.',
    cta: 'Mit Google anmelden',
    ctaSignedIn: 'Zur App',
    price: 'Kostenlos für Early Adopters',
    guarantee: 'dann 29 € einmalig',
  },
  problem: {
    headline: 'Zwei Zelte.',
    headlineAccent: 'Endlose Fragen.',
    q1: 'Wann starte ich <span class="hl-seed">neue Seeds</span> wenn mein Blütezelt noch <span class="hl-time">9 Wochen</span> voll ist?',
    k1: 'Aussaatdaten · Zeltkapazität',
    q2: 'Welche Pflanze geht als nächstes <span class="hl-flip">in die Blüte</span> — und wo passt sie hin?',
    k2: 'Veg zu Blüte · Rotationsplan',
    q3: 'Wie <span class="hl-harvest">ernte</span> ich alle paar Wochen ohne Lücken?',
    k3: 'Ernte-Timing',
    solutionHeadline: 'Plantegia löst das',
    solution: 'Ein visueller Planer der hilft, mehrere Wachstumszyklen im begrenzten Raum zu koordinieren.',
  },
  features: {
    headline: 'Organisiere deinen Grow über Zeit und Raum',
    headlineParts: {
      prefix: 'Organisiere deinen Grow über',
      and: 'und',
    },
    space: {
      title: 'Raum',
      subtitle: 'XY',
      desc: 'Plane deine Zelte und Räume. Ziehe Pflanzen zwischen Zellen. Sieh dein ganzes Setup — Veg-Zelt, Blütezelt, Klon-Ecke.',
      alt: 'Plantegia Growraum Layout Planer zeigt Pflanzenpositionen in mehreren Zelten mit Drag-and-Drop',
    },
    time: {
      title: 'Zeit',
      subtitle: 'XT',
      desc: 'Gantt-Zeitplan für deinen Grow. Sieh Keimung bis Ernte. Ziehe um Timing zu ändern. Plane Wochen voraus.',
      alt: 'Perpetual Harvest Timeline zeigt Pflanzenwachstumsphasen von Keimung bis Ernte im Gantt-Diagramm Stil',
    },
    toolbox: {
      label: 'Toolbox',
      cursor: { name: 'Cursor', desc: 'Wähle und inspiziere Pflanzen, Spaces und Sorten. Tippe für Details.' },
      space: { name: 'Space', desc: 'Erstelle neue Grow-Bereiche. Definiere Grid-Größen und Lichtpläne.' },
      split: { name: 'Split', desc: 'Teile Pflanzen-Timeline an jedem Datum. Plane Rotation zwischen Spaces.' },
      erase: { name: 'Erase', desc: 'Entferne Pflanzen vom Canvas. Räume dein Layout auf.' },
    },
    seeds: {
      label: 'Seeds',
      desc: 'Dein Samen-Inventar. Tippe zum Auswählen, dann auf Canvas zum Pflanzen. Tracke Samen und Klone separat.',
    },
    viewSwitch: {
      label: 'Ansicht',
      desc: 'Wechsle zwischen Space (XY) und Timeline (XT) Ansichten. Verschiedene Perspektiven, gleiche Daten.',
    },
    featuresList: [
      {
        title: 'Perpetual Harvest',
        desc: 'Staffele Pflanzen für kontinuierliche Ernten. Immer etwas bereit.',
      },
      {
        title: 'Sorten-Katalog',
        desc: 'Eigene Sorten mit Veg/Blüte-Tagen. Auto-generierte Pflanzencodes.',
      },
      {
        title: 'Lebenszyklus',
        desc: 'GRM → SDL → VEG → FLW → HRV. Dauer pro Sorte anpassbar.',
      },
      {
        title: 'JSON Export/Import',
        desc: 'Exportiere deine Plantagen-Daten. Perfekt für KI-Agenten und Automatisierungen.',
      },
    ],
  },
  whoItsFor: {
    sectionTitle: 'Gebaut für',
    audiences: [
      {
        title: 'Multi-Zelt Grower',
        description: 'Veg und Blüte getrennt. Müssen tracken was wohin wann wechselt.',
      },
      {
        title: 'Perpetual Harvester',
        description: 'Staffeln Pflanzen für kontinuierliche Zyklen. Wollen Lücken sehen bevor sie passieren.',
      },
      {
        title: 'Rotations-Planer',
        description: 'Mehrere Strains mit verschiedenen Timings. Brauchen das große Bild.',
      },
    ],
    notFor: 'Nicht für: Einzel-Pflanzen Hobbygärtner oder Grow-Diary Logging. Das ist ein Planer, kein Tagebuch.',
  },
  useCases: {
    sectionTitle: 'Funktioniert mit jeder einjährigen Kultur',
    intro: 'Plane Rotation für alles mit einem Lebenszyklus.',
    cases: [
      {
        name: 'Cannabis',
        detail: 'Photoperiode oder Auto. Veg zu Blüte Übergänge.',
      },
      {
        name: 'Microgreens',
        detail: 'Schnelle Zyklen. Gestaffelte Trays. Wöchentliche Ernten.',
      },
      {
        name: 'Gemüse',
        detail: 'Tomaten, Paprika, Kräuter. Indoor oder Gewächshaus.',
      },
      {
        name: 'Pilze',
        detail: 'Fruchtungsblöcke. Rotation zwischen Kammern.',
      },
    ],
    note: 'Wenn es in Phasen wächst und zwischen Spaces wechselt, kann Plantegia es tracken.',
  },
  alternatives: {
    sectionTitle: 'Warum nicht...',
    alternatives: [
      {
        name: 'Spreadsheets',
        problem: 'Daten brechen. Formeln werden chaotisch. Keine visuelle Timeline. Du verbringst mehr Zeit mit der Tabelle als mit Planung.',
      },
      {
        name: 'Grow Diaries',
        problem: 'Tracken was passiert ist, nicht was passieren wird. Super fürs Logging, nutzlos für Rotationsplanung.',
      },
      {
        name: 'Kalender Apps',
        problem: 'Pflanzen sind keine Events. Du musst Überlappung sehen, Bewegung zwischen Spaces, Phasen-Übergänge. Kalender können das nicht.',
      },
    ],
    conclusion: 'Plantegia ist gebaut für eine Sache: visuelle Rotationsplanung über Zeit und Raum.',
  },
  testimonials: {
    sectionTitle: 'Von Growern',
    testimonials: [
      {
        quote: 'Endlich keine Spreadsheets mehr. Ich sehe genau wann ich jede Pflanze umstellen muss und habe nie ein leeres Zelt.',
        name: 'Mike',
        detail: '2 Zelte, Photoperiode',
      },
      {
        quote: 'Die Timeline-Ansicht hat verändert wie ich über Rotation denke. Jetzt plane ich 3 Monate voraus statt zu raten.',
        name: 'Sarah',
        detail: '3 Zelte, Perpetual',
      },
      {
        quote: 'Einfach und macht eine Sache gut. Ziehen, ablegen, fertig. Kein Bloat.',
        name: 'Jay',
        detail: 'Microgreens',
      },
    ],
  },
  faq: {
    sectionTitle: 'Fragen',
    faqs: [
      {
        q: 'Wie viele Pflanzen brauche ich für Perpetual Harvest?',
        a: 'Hängt von deiner Blütezeit und Erntefrequenz ab. Mit 8-Wochen Strains und zwei Zelten halten 4-8 Pflanzen in Rotation dich alle 2-4 Wochen am Ernten. Probiere unseren <a href="/de/tools/perpetual-calculator">Dauerernte-Rechner</a> um deine ideale Anzahl zu finden.',
      },
      {
        q: 'Kann ich ein Zwei-Zelt-Setup mit Veg und Blüte planen?',
        a: 'Ja — genau dafür ist Plantegia gebaut. Mappe beide Zelte, plane wann Pflanzen von Veg zu Blüte wechseln, und sieh deine ganze Rotation auf einer Timeline. Nutze unseren <a href="/de/tools/tent-spacing">Zelt-Platzierungs-Rechner</a> für die Kapazität.',
      },
      {
        q: 'Wie berechne ich wann ich neue Seeds starten soll?',
        a: 'Zähle rückwärts von wann du einen Platz im Blütezelt brauchst. Die Timeline zeigt dir Lücken in deinem Zeitplan.',
      },
      {
        q: 'Funktioniert es mit Autoflowers?',
        a: 'Ja. Autoflowers haben feste Lebenszyklen, was die Planung einfacher macht. Setze dein Strain-Timing und Plantegia trackt den ganzen Zyklus.',
      },
      {
        q: 'Was ist mit 8-Wochen vs 10-Wochen Blüte-Strains?',
        a: 'Verschiedene Blütezeiten ändern deinen ganzen Rotations-Rhythmus. Plantegia lässt dich eigene Phasendauern pro Pflanze setzen.',
      },
      {
        q: 'Ist das eine Grow-Diary App?',
        a: 'Nein. Grow Diaries tracken was passiert ist. Plantegia plant was passieren wird. Ein visueller Scheduler für Grower die vorausdenken.',
      },
    ],
  },
  cta: {
    price: 'Kostenlos starten',
    note: 'Erstelle dein Konto und plane deinen ersten Grow noch heute.',
    guarantee: 'Die App ist kostenlos für Early Adopters, dann 29 € einmalig.',
    cta: 'Eintreten',
    ctaSignedIn: 'Zur App',
  },
  comingSoon: {
    sectionTitle: 'Demnächst',
    features: [
      {
        title: 'Smarte Empfehlungen',
        description: 'DLI, PPE, pH Vorschläge basierend auf deinem Setup und Lichtplan.',
      },
      {
        title: 'Druckvorlagen',
        description: 'Pflanzenetiketten, Pflanzkalender, empfohlene Bedingungen. Drucken und kleben.',
      },
      {
        title: 'JSON Export/Import',
        description: 'Exportiere deine Plantagen-Daten. Perfekt für KI-Agenten und Automatisierungen.',
      },
    ],
  },
} as const;
