export default {
  home: {
    title: 'Cannabis Anbau Planer für Growbox & Multi-Zelt Setups | Plantegia',
    description: 'Cannabis Anbau Planer für Dauerernte. Visuelle Timeline für Veg-zu-Blüte Übergänge in mehreren Zelten. Rotation planen, Lücken vermeiden. Kostenlos für Early Adopters.',
    keywords: ['Cannabis Anbau Planer', 'Growbox Planung', 'Perpetual Harvest Anleitung', 'zwei Zelte Cannabis', 'Dauerernte Cannabis', 'Veg und Blüte Zelt', 'Cannabis Ernte Planung', 'Indoor Growing Planer'],
  },
  guides: {
    title: 'Grow-Anleitungen | Plantegia',
    description: 'Ausführliche Anleitungen für die Planung deines Indoor-Grows. Lerne über Dauerernte, Multi-Zelt-Setups und Rotationsplanung.',
    keywords: ['Grow Anleitungen', 'Perpetual Harvest Anleitung', 'Multi Zelt Guide', 'Indoor Growing Guide'],
    headerTitle: 'Anleitungen',
    headerSubtitle: 'Ausführliche Anleitungen für die Planung und Optimierung deines Indoor-Grows.',
  },
  tools: {
    title: 'Kostenlose Grow-Tools | Plantegia',
    description: 'Kostenlose Rechner und Tools für die Planung deines Indoor-Grows. Dauerernte-Rechner, Zelt-Platzierung und mehr.',
    keywords: ['Grow Rechner', 'Perpetual Harvest Rechner', 'Zelt Platzierung', 'Grow Tools'],
    headerTitle: 'Kostenlose Grow-Tools',
    headerSubtitle: 'Rechner und Tools für die Planung deines Indoor-Grows.',
    toolsList: [
      {
        slug: 'perpetual-calculator',
        title: 'Dauerernte Rechner',
        description: 'Berechne wie viele Pflanzen du für kontinuierliche Ernten brauchst basierend auf Blütezeit und Erntefrequenz.',
        icon: '🔄',
      },
      {
        slug: 'tent-spacing',
        title: 'Zelt-Platzierungs-Rechner',
        description: 'Finde heraus wie viele Pflanzen in dein Grow-Zelt passen basierend auf Zeltgröße und Pflanzenabstand.',
        icon: '📐',
      },
      {
        slug: 'perpetual-vs-sequential',
        title: 'Perpetual vs Sequentiell Rechner',
        description: 'Vergleiche Jahresertrag zwischen Perpetual-Rotation und sequentiellem Batch-Growing.',
        icon: '⚖️',
      },
    ],
  },
  perpetualCalculator: {
    title: 'Dauerernte Rechner',
    description: 'Berechne wie viele Pflanzen du für kontinuierliche Ernten brauchst. Plane dein Veg- und Blüte-Zelt-Setup für Dauerernte.',
    keywords: ['Dauerernte Rechner', 'Perpetual Harvest', 'kontinuierliche Ernte', 'Ernte Zeitplan'],
    howItWorks: {
      title: 'Wie Dauerernte funktioniert',
      intro: 'Ein Dauerernte-Setup bedeutet, dass du immer frische Pflanzen erntest, indem du versetzt neue startest. Statt alles auf einmal zu ernten, erntest du eine Pflanze (oder Charge) alle paar Wochen während neue Pflanzen immer nachwachsen.',
      keyConcepts: {
        title: 'Wichtige Konzepte',
        items: [
          { term: 'Blütezeit', definition: 'Wie lange deine Sorte zum Blühen braucht (typischerweise 8-10 Wochen).' },
          { term: 'Veg-Zeit', definition: 'Wie lange du Pflanzen im vegetativen Wachstum hältst bevor du auf Blüte umstellst. Längere Veg = größere Pflanzen.' },
          { term: 'Erntefrequenz', definition: 'Wie oft du ernten möchtest. Alle 2 Wochen ist üblich.' },
        ],
      },
      exampleSetup: {
        title: 'Beispiel-Setup',
        content: 'Mit einer 8-Wochen-Blüte-Sorte und Ernte alle 2 Wochen brauchst du 4 Pflanzen in Blüte in verschiedenen Stadien. Dazu 2 Pflanzen in Veg (4-Wochen Veg-Zeit), und du brauchst insgesamt 6 Pflanzen die ständig laufen.',
      },
      twoTentSetup: {
        title: 'Zwei-Zelt-Setup',
        content: 'Die meisten Dauerernte-Grower nutzen zwei Zelte: eines für Veg (18/6 Lichtzeitplan) und eines für Blüte (12/12). Pflanzen wechseln von Veg zu Blüte wenn sie bereit sind, was eine kontinuierliche Pipeline von Pflanzen in verschiedenen Stadien erhält.',
      },
    },
  },
  tentSpacing: {
    title: 'Growzelt Rechner — Kostenloser Pflanzen-Kapazitäts-Rechner | Plantegia',
    description: 'Berechne sofort wie viele Pflanzen in dein Growzelt passen. Kostenloser Zelt-Rechner für jede Größe. Zeigt Equipment-Kosten. Keine Anmeldung.',
    keywords: ['Growzelt Rechner', 'wie viele Pflanzen Growzelt', 'Zeltgröße berechnen', 'Pflanzen pro Quadratmeter', 'Growzelt Kapazität', 'Zelt Pflanzenabstand'],
    subtitle: 'Ermittle deine Zelt-Kapazität und geschätzte Setup-Kosten',
    whatIs: {
      title: 'Was ist Zelt-Spacing?',
      content: 'Zelt-Spacing bezeichnet wie viel Bodenfläche jede Pflanze in deinem Growzelt braucht. Der richtige Abstand gewährleistet ausreichende Lichtdurchdringung, Luftzirkulation und Platz für die Entwicklung des Pflanzendachs. Der ideale Abstand hängt von deiner Trainingsmethode ab — SOG-Setups packen viele kleine Pflanzen, während SCROG weniger große Pflanzen nutzt.',
    },
    howItWorks: {
      title: 'Wie du diesen Rechner nutzt',
      intro: 'Gib deine Zeltmaße in Zentimetern mit den Schiebereglern ein. Der Rechner zeigt sofort wie viele Pflanzen basierend auf drei Spacing-Strategien passen.',
      keyConcepts: {
        title: 'Pflanzengrößen-Optionen',
        items: [
          { term: 'Klein (1 sq ft / Pflanze)', definition: 'Sea of Green (SOG) Stil. Viele kleine Pflanzen mit minimaler Veg-Zeit. Ideal für schnelle Zyklen und Autoflower.' },
          { term: 'Mittel (2 sq ft / Pflanze)', definition: 'Standard-Grow mit LST oder Topping. Die beliebteste Wahl für Home-Grower die Ertrag und Handhabung balancieren.' },
          { term: 'Groß (4 sq ft / Pflanze)', definition: 'SCROG oder Mainlining mit verlängerter Veg. Weniger Pflanzen aber maximaler Ertrag pro Pflanze.' },
        ],
      },
    },
    referenceTable: {
      title: 'Schnellübersicht: Gängige Zeltgrößen',
      headers: ['Zeltgröße', 'Fläche', 'Klein', 'Mittel', 'Groß'],
      rows: [
        ['60×60 cm', '~0.36 m²', '4', '2', '1'],
        ['80×80 cm', '~0.64 m²', '6', '3', '1-2'],
        ['100×100 cm', '~1 m²', '9', '5', '2-3'],
        ['120×120 cm', '~1.4 m²', '13', '6-7', '3-4'],
        ['150×150 cm', '~2.2 m²', '20', '10', '5'],
        ['240×120 cm', '~2.9 m²', '26', '13', '6-7'],
      ],
      footnote: 'Basierend auf 1, 2 und 4 sq ft pro Pflanze. Tatsächliche Kapazität abhängig von Topfgröße und Trainingsmethode.',
    },
    tips: {
      title: 'Tipps für optimales Zelt-Setup',
      items: [
        'Lass 10-15 cm Rand für Luftzirkulation und Zugang zu den Pflanzen',
        'Größere Töpfe (11-20L) brauchen mehr Bodenfläche als das Pflanzendach vermuten lässt',
        'Trainingstechniken wie LST und SCROG maximieren die Lichtnutzung bei jedem Abstand',
        'Für Dauerernte berücksichtige sowohl Veg- als auch Flower-Zelt-Kapazität',
      ],
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      items: [
        {
          question: 'Wie viele Pflanzen passen in ein 120×120 Growzelt?',
          answer: 'Ein 120×120 cm Zelt (~1.4 m²) fasst 4-13 Pflanzen je nach Grow-Stil. SOG mit kleinen Pflanzen: 12-13. Standard-Grows mit mittleren Pflanzen: 6-7. SCROG mit großen Pflanzen: 3-4. Der Rechner oben gibt genaue Zahlen für deine Maße.',
        },
        {
          question: 'Welchen Abstand brauche ich pro Cannabis-Pflanze?',
          answer: 'Standard-Abstand ist 2 Square Feet (ca. 45×45 cm) pro Pflanze für mittelgroße Pflanzen mit einfachem Training. SOG-Grower nutzen 1 sq ft, während SCROG-Grower 4 sq ft pro Pflanze brauchen.',
        },
        {
          question: 'Ist es besser viele kleine oder wenige große Pflanzen zu growen?',
          answer: 'Beide können ähnliche Erträge erzielen. Mehr kleine Pflanzen (SOG) ernten schneller, brauchen aber mehr Starts. Weniger große Pflanzen dauern länger, sind aber einfacher zu managen. Viele Home-Grower bevorzugen 4-8 mittlere Pflanzen als Balance.',
        },
        {
          question: 'Beeinflusst die Zelthöhe die Pflanzenkapazität?',
          answer: 'Die Höhe beeinflusst wie hoch Pflanzen wachsen können, aber nicht die Bodenkapazität. Standard 180-200 cm Zelte funktionieren für die meisten Grows. Niedrigere Zelte (120-150 cm) erfordern aggressiveres Training um Pflanzen niedrig zu halten.',
        },
      ],
    },
    cta: {
      title: 'Plane dein komplettes Grow-Setup',
      content: 'Die Pflanzenanzahl zu kennen ist nur der Anfang. Plantegia hilft dir die komplette Timeline zu planen — wann Seeds starten, wann auf Blüte umstellen, und wann du erntest — über mehrere Zelte hinweg.',
      button: 'Plantegia kostenlos testen',
    },
  },
  perpetualVsSequential: {
    title: 'Perpetual vs Sequentiell Ernte Rechner — Ertragsvergleich',
    description: 'Vergleiche Perpetual vs sequentielle Ernte Ertrag. Sieh wie viel mehr du mit Rotation ernten kannst. Kostenloser Rechner, keine Anmeldung.',
    keywords: ['Perpetual vs sequentielle Ernte', 'Perpetual Harvest Ertrag', 'Ernte Vergleich Rechner', 'Perpetual vs Batch', 'Grow Ertragsrechner'],
    subtitle: 'Sieh wie Rotation-Growing deinen Jahresertrag maximiert',
    whatIs: {
      title: 'Perpetual vs Sequentiell: Zwei Ansätze',
      content: 'Sequentielles (Batch) Growing bedeutet alle Pflanzen vegetieren zusammen, blühen zusammen und werden zusammen geerntet — dann räumst du auf und startest neu. Perpetual Harvest staffelt Pflanzen so dass du kontinuierlich erntest. Beide Methoden haben Trade-offs: Sequentiell ist einfacher zu managen aber lässt deine Blüte-Zone während Veg und Aufräumen leer. Perpetual ist komplexer aber maximiert die Zeit in der deine Blüte-Zone produziert.',
    },
    howItWorks: {
      title: 'Wie dieser Rechner funktioniert',
      intro: 'Dieser Rechner vergleicht den Jahresertrag beider Methoden bei gleicher Blüte-Zone Kapazität. Perpetual braucht eine zusätzliche Veg-Zone, nutzt aber deinen Blüte-Raum effizienter.',
      keyConcepts: {
        title: 'Wichtige Unterschiede',
        items: [
          { term: 'Sequentiell', definition: 'Ein Batch nach dem anderen. Einfacheres Management, aber Blüte-Zone steht während Veg und Aufräumphasen leer.' },
          { term: 'Perpetual', definition: 'Kontinuierliche Rotation. Blüte-Zone immer voll. Erfordert separate Veg-Zone und mehr Planung.' },
          { term: 'Aufräumzeit', definition: 'Zeit zwischen Ernte und nächstem Zyklus für Trocknen, Curen und Resetten des Raums. Betrifft nur Sequentiell.' },
        ],
      },
    },
    referenceTable: {
      title: 'Ertragsvergleich: 4-Slot Blüte-Zone',
      headers: ['Methode', 'Pflanzen/Jahr', 'Ernten/Jahr', 'Notizen'],
      rows: [
        ['Sequentiell', '~15', '3-4', 'Alles auf einmal, dann Reset'],
        ['Perpetual', '~26', '26', 'Eine alle 2 Wochen'],
      ],
      footnote: 'Basierend auf 8-Wochen Blüte, 4-Wochen Veg, 2-Wochen Aufräumen. Tatsächliche Ergebnisse variieren.',
    },
    tips: {
      title: 'Die richtige Methode wählen',
      items: [
        'Starte mit sequentiell wenn du neu bist — einfacher die Basics zu lernen',
        'Wechsle zu Perpetual wenn du den Grow-Zyklus beherrschst',
        'Perpetual erfordert zwei separate Lichtzeitpläne (Veg 18/6, Blüte 12/12)',
        'Bedenke deinen Verbrauch: Perpetual liefert konstanten Nachschub, sequentiell gibt Bulk-Ernten',
      ],
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      items: [
        {
          question: 'Ist Perpetual Harvest wirklich so viel effizienter?',
          answer: 'Ja — typischerweise 50-80% mehr Jahresertrag aus der gleichen Blüte-Zone. Die Effizienz kommt durch eliminierte Ausfallzeit: deine Blüte-Zone ist immer voll statt während Veg und Aufräumen leer zu stehen.',
        },
        {
          question: 'Was brauche ich für Perpetual Harvest?',
          answer: 'Eine separate Veg-Zone (kann kleiner als Blüte sein), die Möglichkeit zwei Lichtzeitpläne zu fahren, und ein System um Pflanzenstadien zu tracken. Der Rechner zeigt wie viele Veg-Slots du brauchst.',
        },
        {
          question: 'Kann ich Perpetual mit Autoflowers machen?',
          answer: 'Ja — Autoflowers vereinfachen Perpetual weil sie keine separaten Lichtzeitpläne brauchen. Allerdings verlierst du Kontrolle über Veg-Dauer und Pflanzengröße.',
        },
        {
          question: 'Wie beeinflusst Aufräumzeit sequentielle Erträge?',
          answer: 'Erheblich. Jede Woche Aufräumen/Reset zwischen Zyklen bedeutet weniger Gesamtzyklen pro Jahr. Diese Ausfallzeit zu minimieren ist der Schlüssel zu sequentieller Effizienz.',
        },
      ],
    },
    cta: {
      title: 'Plane deine Perpetual-Rotation',
      content: 'Dieser Rechner zeigt den Ertragsvorteil. Plantegia hilft dir es tatsächlich zu planen — visualisiere wann jede Pflanze startet, in Blüte wechselt und geerntet wird.',
      button: 'Plantegia kostenlos testen',
    },
  },
} as const;
