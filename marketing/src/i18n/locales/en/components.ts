export default {
  hero: {
    headline: 'Perpetual Harvest Planner',
    taglinePrefix: 'Know when to',
    seed: 'seed',
    flip: 'flip',
    harvest: 'harvest',
    taglineSuffix: 'and',
    seedAgain: 'seed',
    taglineEnd: 'again.',
    cta: 'Sign in with Google',
    ctaSignedIn: 'Go to App',
    price: 'Free & Open Source',
    guarantee: '<a href="https://github.com/plantegia/plantegia-web" target="_blank">View on GitHub</a>',
  },
  problem: {
    headline: 'Two tents.',
    headlineAccent: 'Endless questions.',
    q1: 'When do I <span class="hl-seed">start new seeds</span> if my flower tent is full for <span class="hl-time">9 more weeks</span>?',
    k1: 'seed start dates · tent capacity planning',
    q2: 'Which plant <span class="hl-flip">moves to flower</span> next — and where does it fit?',
    k2: 'veg to flower transition · rotation schedule',
    q3: 'How do I keep <span class="hl-harvest">harvesting</span> every few weeks without gaps?',
    k3: 'harvest timing',
    solutionHeadline: 'Plantegia solves this',
    solution: 'A visual planner that helps you align multiple growth cycles in limited space.',
  },
  features: {
    headline: 'Organize your grow across time and space',
    headlineParts: {
      prefix: 'Organize your grow across',
      and: 'and',
    },
    space: {
      title: 'Space',
      subtitle: 'XY',
      desc: 'Map your tents and rooms. Drag plants between cells. See your whole setup at a glance — veg tent, flower tent, clone corner.',
      alt: 'Plantegia grow room layout planner showing plant positions across multiple tents with drag and drop interface',
    },
    time: {
      title: 'Timeline',
      subtitle: 'XT',
      desc: 'Gantt-style schedule for your grow. See germination through harvest. Drag to shift timing. Plan weeks ahead.',
      alt: 'Perpetual harvest timeline view showing plant growth stages from germination to harvest in Gantt chart style',
    },
    toolbox: {
      label: 'Toolbox',
      cursor: { name: 'Cursor', desc: 'Select and inspect plants, spaces, and strains. Tap to view details.' },
      space: { name: 'Space', desc: 'Create new grow areas. Define custom grid sizes and light schedules.' },
      split: { name: 'Split', desc: 'Divide plant timeline at any date. Plan rotation between spaces.' },
      erase: { name: 'Erase', desc: 'Remove plants from the canvas. Clean up your layout.' },
    },
    seeds: {
      label: 'Seeds',
      desc: 'Your seed inventory. Tap to select, then tap on canvas to plant. Track seeds and clones separately.',
    },
    viewSwitch: {
      label: 'View',
      desc: 'Switch between Space (XY) and Timeline (XT) views. Different perspectives, same data.',
    },
    featuresList: [
      {
        title: 'Perpetual harvest',
        desc: 'Stagger plants for continuous harvests. Always something ready.',
      },
      {
        title: 'Strain catalog',
        desc: 'Custom strains with veg/flower days. Auto-generated plant codes.',
      },
      {
        title: 'Lifecycle stages',
        desc: 'GRM → SDL → VEG → FLW → HRV. Customize duration per strain.',
      },
      {
        title: 'JSON export/import',
        desc: 'Export your plantation data. Perfect for AI agents and automations.',
      },
    ],
  },
  whoItsFor: {
    sectionTitle: 'Built for',
    audiences: [
      {
        title: 'Multi-tent growers',
        description: 'Running veg and flower separately. Need to track what moves where and when.',
      },
      {
        title: 'Perpetual harvesters',
        description: 'Staggering plants for continuous cycles. Want to see gaps before they happen.',
      },
      {
        title: 'Rotation planners',
        description: 'Growing multiple strains with different timings. Need the big picture.',
      },
    ],
    notFor: 'Not for: single-plant hobbyists or grow diary logging. This is a planner, not a journal.',
  },
  useCases: {
    sectionTitle: 'Works with any annual crop',
    intro: 'Plan rotation for anything with a lifecycle.',
    cases: [
      {
        name: 'Cannabis',
        detail: 'Photoperiod or auto. Veg to flower transitions.',
      },
      {
        name: 'Microgreens',
        detail: 'Fast cycles. Staggered trays. Weekly harvests.',
      },
      {
        name: 'Vegetables',
        detail: 'Tomatoes, peppers, herbs. Indoor or greenhouse.',
      },
      {
        name: 'Mushrooms',
        detail: 'Fruiting blocks. Rotation between chambers.',
      },
    ],
    note: 'If it grows in stages and moves between spaces, Plantegia can track it.',
  },
  alternatives: {
    sectionTitle: 'Why not...',
    alternatives: [
      {
        name: 'Spreadsheets',
        problem: 'Dates break. Formulas get messy. No visual timeline. You spend more time maintaining the sheet than planning.',
      },
      {
        name: 'Grow diaries',
        problem: 'Track what happened, not what will happen. Great for logging, useless for planning rotation ahead.',
      },
      {
        name: 'Calendar apps',
        problem: 'Plants aren\'t events. You need to see overlap, movement between spaces, and stage transitions. Calendars can\'t do that.',
      },
    ],
    conclusion: 'Plantegia is purpose-built for one thing: visual rotation planning across time and space.',
  },
  testimonials: {
    sectionTitle: 'From growers',
    testimonials: [
      {
        quote: 'Finally stopped using spreadsheets. I can see exactly when to flip each plant and never have an empty tent.',
        name: 'Mike',
        detail: '2 tents, photoperiod',
      },
      {
        quote: 'The timeline view changed how I think about rotation. Now I plan 3 months ahead instead of guessing.',
        name: 'Sarah',
        detail: '3 tents, perpetual',
      },
      {
        quote: 'Simple and does one thing well. Drag, drop, done. No bloat.',
        name: 'Jay',
        detail: 'microgreens',
      },
    ],
  },
  faq: {
    sectionTitle: 'Questions',
    faqs: [
      {
        q: 'How many plants do I need for perpetual harvest?',
        a: 'Depends on your flowering time and harvest frequency. With 8-week strains and two tents, 4-8 plants in rotation keeps you harvesting every 2-4 weeks. Try our <a href="/tools/perpetual-calculator">perpetual harvest calculator</a> to find your ideal number.',
      },
      {
        q: 'Can I plan a two tent setup with veg and flower?',
        a: 'Yes — this is exactly what Plantegia is built for. Map both tents, schedule when plants move from veg to flower, and see your whole rotation on a timeline. Check our <a href="/tools/tent-spacing">tent spacing calculator</a> to plan capacity.',
      },
      {
        q: 'How do I calculate when to start new seeds?',
        a: 'Count backwards from when you need a slot in your flower tent. The timeline view shows you gaps in your schedule so you know when to germinate.',
      },
      {
        q: 'Does it work with autoflowers?',
        a: 'Yes. Autoflowers have fixed lifecycles, which makes planning easier. Set your strain timing and Plantegia tracks the whole cycle from seed to harvest.',
      },
      {
        q: 'What about 8-week vs 10-week flowering strains?',
        a: 'Different flowering times change your whole rotation rhythm. Plantegia lets you set custom stage durations per plant so mixed gardens stay organized.',
      },
      {
        q: 'Is this a grow diary app?',
        a: 'No. Grow diaries track what happened. Plantegia plans what will happen. It is a visual scheduler for growers who think ahead.',
      },
    ],
  },
  cta: {
    price: 'Start for Free',
    note: 'Create your account and plan your first grow today.',
    guarantee: 'Free forever. <a href="https://github.com/plantegia/plantegia-web" target="_blank">Open source on GitHub</a>.',
    cta: 'Enter',
    ctaSignedIn: 'Go to App',
  },
  comingSoon: {
    sectionTitle: 'Coming soon',
    features: [
      {
        title: 'Smart recommendations',
        description: 'DLI, PPE, pH suggestions based on your setup and light schedule.',
      },
      {
        title: 'Printables',
        description: 'Plant labels, planting calendar, recommended conditions. Print and stick.',
      },
      {
        title: 'JSON export/import',
        description: 'Export your plantation data. Perfect for AI agents and automations.',
      },
    ],
  },
} as const;
