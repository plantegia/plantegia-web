export default {
  home: {
    title: 'Cannabis Anbau Planer für Growbox & Multi-Zelt Setups | Plantegia',
    description: 'Cannabis Anbau Planer für Dauerernte. Visuelle Timeline für Veg-zu-Blüte Übergänge in mehreren Zelten. Rotation planen, Lücken vermeiden. Kostenlos für Early Adopters.',
    keywords: ['Cannabis Anbau Planer', 'Growbox Planung', 'Perpetual Harvest Anleitung', 'zwei Zelte Cannabis', 'Dauerernte Cannabis', 'Veg und Blüte Zelt', 'Cannabis Ernte Planung', 'Indoor Growing Planer'],
  },
  blog: {
    title: 'Blog | Plantegia',
    description: 'Tipps, Anleitungen und Strategien für die Planung deines Indoor-Grows. Lerne über Dauerernte, Multi-Zelt-Setups und Rotationsplanung.',
    keywords: ['Grow Planung Blog', 'Perpetual Harvest Anleitung', 'Multi Zelt Tipps', 'Indoor Growing'],
    headerTitle: 'Blog',
    headerSubtitle: 'Tipps, Anleitungen und Strategien für die Planung deines Indoor-Grows.',
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
    title: 'Zelt-Platzierungs-Rechner',
    description: 'Berechne wie viele Pflanzen in dein Grow-Zelt passen. Finde den optimalen Pflanzenabstand für deine Zeltgröße.',
    keywords: ['Growzelt Rechner', 'Pflanzenabstand', 'wie viele Pflanzen', 'Zeltgröße Pflanzen'],
    guide: {
      title: 'Pflanzabstand-Guide',
      intro: 'Der richtige Pflanzabstand stellt sicher, dass jede Pflanze genug Licht und Luftzirkulation bekommt. Zu viele Pflanzen führt zu Überfüllung, schlechter Luftzirkulation und niedrigeren Erträgen pro Pflanze.',
      plantSizes: {
        title: 'Pflanzengrößen-Richtlinien',
        items: [
          { size: 'Klein (1 sq ft)', description: 'Sea of Green (SOG) oder kurze Veg. Viele kleine Pflanzen mit kurzer Veg-Zeit.' },
          { size: 'Mittel (2 sq ft)', description: 'Standard-Training (LST, Topping). Am häufigsten für Home-Grower.' },
          { size: 'Groß (4 sq ft)', description: 'Lange Veg, intensives Training (SCROG, Mainlining). Weniger Pflanzen aber größere Erträge pro Pflanze.' },
        ],
      },
      commonTentSizes: {
        title: 'Gängige Zeltgrößen',
        headers: ['Zeltgröße', 'Klein', 'Mittel', 'Groß'],
        rows: [
          ['60x60 cm', '4', '2', '1'],
          ['80x80 cm', '9', '4', '2'],
          ['120x120 cm', '16', '8', '4'],
          ['150x150 cm', '25', '12', '6'],
          ['120x240 cm', '32', '16', '8'],
        ],
      },
      tips: {
        title: 'Tipps für bessere Erträge',
        items: [
          'Weniger größere Pflanzen produzieren oft mehr als viele kleine Pflanzen',
          'Trainingstechniken (LST, Topping) maximieren die Canopy-Abdeckung',
          'Lass Platz für Luftzirkulation um Schimmel und Schädlinge zu verhindern',
          'Bedenke Topfgrößen — größere Töpfe brauchen mehr Bodenfläche',
        ],
      },
    },
  },
} as const;
