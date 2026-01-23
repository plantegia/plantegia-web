export default {
  home: {
    title: 'Cannabis Grow Planner for Multi-Tent Setups | Plantegia',
    description: 'Cannabis grow planner for perpetual harvest. Visual timeline to schedule veg-to-flower transitions across multiple tents. Plan rotation, avoid gaps. Free for early adopters.',
    keywords: ['cannabis grow planner', 'perpetual harvest planner', 'perpetual harvest schedule', 'two tent grow setup', 'veg and flower tent schedule', 'grow room rotation schedule', 'perpetual harvest calculator', 'multi tent grow planning'],
  },
  guides: {
    title: 'Growing Guides | Plantegia',
    description: 'In-depth guides for planning your indoor grow. Learn perpetual harvest, multi-tent setups, rotation planning, and more.',
    keywords: ['grow guides', 'perpetual harvest guide', 'multi tent guide', 'indoor growing guide'],
    headerTitle: 'Guides',
    headerSubtitle: 'In-depth guides for planning and optimizing your indoor grow.',
  },
  tools: {
    title: 'Free Growing Tools | Plantegia',
    description: 'Free calculators and tools for planning your indoor grow. Perpetual harvest calculator, tent spacing, and more.',
    keywords: ['grow calculator', 'perpetual harvest calculator', 'tent spacing', 'grow tools'],
    headerTitle: 'Free Growing Tools',
    headerSubtitle: 'Calculators and tools to help plan your indoor grow.',
    toolsList: [
      {
        slug: 'perpetual-calculator',
        title: 'Perpetual Harvest Calculator',
        description: 'Calculate how many plants you need for continuous harvests based on flowering time and harvest frequency.',
        icon: '🔄',
      },
      {
        slug: 'tent-spacing',
        title: 'Tent Spacing Calculator',
        description: 'Find out how many plants fit in your grow tent based on tent size and plant spacing.',
        icon: '📐',
      },
      {
        slug: 'perpetual-vs-sequential',
        title: 'Perpetual vs Sequential Calculator',
        description: 'Compare annual yield between perpetual rotation and sequential batch growing methods.',
        icon: '⚖️',
      },
    ],
  },
  perpetualCalculator: {
    title: 'Perpetual Harvest Calculator — Free Plant Count Tool',
    description: 'Calculate exactly how many plants you need for continuous harvests. Free perpetual harvest calculator for cannabis growers. No signup required.',
    keywords: ['perpetual harvest calculator', 'continuous harvest calculator', 'perpetual grow calculator', 'how many plants perpetual harvest', 'harvest schedule calculator', 'perpetual harvest setup'],
    whatIs: {
      title: 'What is Perpetual Harvest?',
      content: 'Perpetual harvest is a growing method where you stagger plant starts so you harvest fresh plants every few weeks instead of all at once. By maintaining plants at different growth stages simultaneously, you create a continuous supply without long gaps between harvests.',
    },
    howItWorks: {
      title: 'How to Use This Calculator',
      intro: 'Enter your strain\'s flowering time, desired veg period, and how often you want to harvest. The calculator shows exactly how many plants you need in veg and flower to maintain continuous harvests.',
      keyConcepts: {
        title: 'Key Inputs Explained',
        items: [
          { term: 'Flowering Period', definition: 'How long your strain takes to flower. Check seed bank info — typically 8-10 weeks for most strains.' },
          { term: 'Veg Period', definition: 'How long you keep plants in vegetative growth. Longer veg = bigger plants but more space needed.' },
          { term: 'Harvest Frequency', definition: 'How often you want to harvest. Every 2 weeks is common and manageable for most setups.' },
        ],
      },
      exampleSetup: {
        title: 'Example Calculation',
        content: 'With an 8-week flowering strain and harvesting every 2 weeks, you need 4 plants in flower at different stages. Add 2 plants in veg (4-week veg period), and you need 6 total plants running at all times.',
      },
      twoTentSetup: {
        title: 'The Two-Tent Setup',
        content: 'Most perpetual growers use two separate spaces: a veg area (18/6 light) and a flower area (12/12 light). Plants move from veg to flower when ready. This separation is essential because flowering plants need uninterrupted darkness.',
      },
    },
    referenceTable: {
      title: 'Quick Reference: Common Setups',
      headers: ['Flowering Time', 'Harvest Every', 'Plants in Flower', 'Plants in Veg*', 'Total'],
      rows: [
        ['8 weeks', '1 week', '8', '4', '12'],
        ['8 weeks', '2 weeks', '4', '2', '6'],
        ['9 weeks', '2 weeks', '5', '2', '7'],
        ['10 weeks', '2 weeks', '5', '3', '8'],
        ['10 weeks', '3 weeks', '4', '2', '6'],
      ],
      footnote: '*Assuming 4-week veg period. Adjust based on your grow style.',
    },
    tips: {
      title: 'Tips for Success',
      items: [
        'Start with fewer plants than calculated while you learn the rhythm',
        'Use the same strain initially — mixing flowering times complicates scheduling',
        'Label plants with start dates to track where each one is in the cycle',
        'Consider cloning for consistency — seeds can vary in flowering time',
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How many plants do I need for perpetual harvest?',
          answer: 'It depends on flowering time and harvest frequency. For an 8-week strain harvesting every 2 weeks, you need 6 plants total (4 flowering + 2 veg). Use the calculator above with your specific parameters.',
        },
        {
          question: 'Can I do perpetual harvest with one tent?',
          answer: 'It\'s difficult because veg and flower require different light schedules (18/6 vs 12/12). Some growers use autoflowers in a single tent, but a two-tent setup gives you much more control.',
        },
        {
          question: 'What\'s the best harvest frequency for beginners?',
          answer: 'Every 2 weeks is ideal for most home growers. Weekly harvests require more plants and management. Monthly harvests mean longer waits between fresh supply.',
        },
        {
          question: 'Do I need to start all plants at once?',
          answer: 'No — you stagger starts to match your harvest frequency. If harvesting every 2 weeks, start a new plant every 2 weeks. The calculator shows this timing.',
        },
      ],
    },
    cta: {
      title: 'Plan Your Full Rotation',
      content: 'This calculator tells you how many plants you need. Plantegia shows you exactly when to start, move, and harvest each one — with a visual timeline across all your grow spaces.',
      button: 'Try Plantegia Free',
    },
  },
  tentSpacing: {
    title: 'Grow Tent Size Calculator — Free Plant Capacity Tool | Plantegia',
    description: 'Calculate how many plants fit in your grow tent instantly. Free tent spacing calculator for any size. Shows equipment costs. No signup required.',
    keywords: ['grow tent calculator', 'how many plants in grow tent', 'tent size calculator', 'plants per square foot', 'grow tent capacity', 'tent spacing calculator', 'grow tent plant count'],
    subtitle: 'Find your tent capacity and estimated setup costs',
    whatIs: {
      title: 'What is Tent Spacing?',
      content: 'Tent spacing refers to how much floor area each plant needs in your grow tent. Proper spacing ensures adequate light penetration, airflow, and room for the plant canopy to develop. The right spacing depends on your training method — SOG setups pack many small plants, while SCROG uses fewer large plants.',
    },
    howItWorks: {
      title: 'How to Use This Calculator',
      intro: 'Enter your tent dimensions in centimeters using the sliders. The calculator instantly shows how many plants fit based on three spacing strategies.',
      keyConcepts: {
        title: 'Plant Size Options',
        items: [
          { term: 'Small (1 sq ft / plant)', definition: 'Sea of Green (SOG) style. Many small plants with minimal veg time. Best for quick cycles and autoflowers.' },
          { term: 'Medium (2 sq ft / plant)', definition: 'Standard grow with LST or topping. The most popular choice for home growers balancing yield and manageability.' },
          { term: 'Large (4 sq ft / plant)', definition: 'SCROG or mainlined plants with extended veg. Fewer plants but maximum yield per plant.' },
        ],
      },
    },
    referenceTable: {
      title: 'Quick Reference: Common Tent Sizes',
      headers: ['Tent Size', 'Area', 'Small', 'Medium', 'Large'],
      rows: [
        ['60×60 cm', '~4 sq ft', '4', '2', '1'],
        ['80×80 cm', '~7 sq ft', '6', '3', '1-2'],
        ['100×100 cm', '~11 sq ft', '9', '5', '2-3'],
        ['120×120 cm', '~16 sq ft', '13', '6-7', '3-4'],
        ['150×150 cm', '~24 sq ft', '20', '10', '5'],
        ['240×120 cm', '~31 sq ft', '26', '13', '6-7'],
      ],
      footnote: 'Based on 1, 2, and 4 sq ft per plant respectively. Actual capacity depends on pot size and training method.',
    },
    tips: {
      title: 'Tips for Optimal Tent Setup',
      items: [
        'Leave 10-15 cm around edges for airflow and accessing plants',
        'Larger pots (11-20L) need more floor space than the plant canopy suggests',
        'Training techniques like LST and SCROG maximize light use in any spacing',
        'For perpetual harvest, factor in both veg and flower tent capacity',
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How many plants can I fit in a 4x4 grow tent?',
          answer: 'A 4×4 ft (120×120 cm) tent fits 4-16 plants depending on grow style. SOG with small plants: 12-16. Standard grows with medium plants: 6-8. SCROG with large plants: 4. The calculator above gives exact numbers for your dimensions.',
        },
        {
          question: 'What spacing do I need per cannabis plant?',
          answer: 'Standard spacing is 2 square feet (roughly 45×45 cm) per plant for medium-sized plants with basic training. SOG growers use 1 sq ft, while SCROG growers need 4 sq ft per plant.',
        },
        {
          question: 'Is it better to grow more small plants or fewer large ones?',
          answer: 'Both can achieve similar yields. More small plants (SOG) harvest faster but need more starts. Fewer large plants take longer but are easier to manage. Many home growers prefer 4-8 medium plants as a balance.',
        },
        {
          question: 'Does tent height affect plant capacity?',
          answer: 'Height affects how tall plants can grow but not floor capacity. Standard 180-200 cm tents work for most grows. Shorter tents (120-150 cm) require more aggressive training to keep plants low.',
        },
      ],
    },
    cta: {
      title: 'Plan Your Complete Grow Setup',
      content: 'Knowing your plant count is just the start. Plantegia helps you plan the full timeline — when to start seeds, when to flip to flower, and when you\'ll harvest — across multiple tents.',
      button: 'Try Plantegia Free',
    },
  },
  perpetualVsSequential: {
    title: 'Perpetual vs Sequential Harvest Calculator — Yield Comparison',
    description: 'Compare perpetual vs sequential harvest yield. See how much more you can harvest with rotation growing. Free calculator, no signup.',
    keywords: ['perpetual vs sequential harvest', 'perpetual harvest yield', 'harvest comparison calculator', 'perpetual harvest vs batch', 'grow yield calculator', 'harvest method comparison'],
    subtitle: 'See how rotation growing maximizes your annual yield',
    whatIs: {
      title: 'Perpetual vs Sequential: Two Approaches',
      content: 'Sequential (batch) growing means all plants veg together, flower together, and harvest together — then you clean up and start over. Perpetual harvest staggers plants so you harvest continuously. Both methods have trade-offs: sequential is simpler to manage but leaves your flower zone empty during veg and cleanup. Perpetual is more complex but maximizes the time your flower zone is producing.',
    },
    howItWorks: {
      title: 'How This Calculator Works',
      intro: 'This calculator compares annual yield for both methods assuming the same flower zone capacity. Perpetual requires an additional veg zone, but uses your flower space more efficiently.',
      keyConcepts: {
        title: 'Key Differences',
        items: [
          { term: 'Sequential', definition: 'One batch at a time. Simpler management, but flower zone sits empty during veg and cleanup phases.' },
          { term: 'Perpetual', definition: 'Continuous rotation. Flower zone always full. Requires separate veg zone and more planning.' },
          { term: 'Cleanup Time', definition: 'Time between harvest and next cycle for drying, curing, and resetting the space. Only affects sequential.' },
        ],
      },
    },
    referenceTable: {
      title: 'Yield Comparison: 4-Slot Flower Zone',
      headers: ['Method', 'Plants/Year', 'Harvests/Year', 'Notes'],
      rows: [
        ['Sequential', '~15', '3-4', 'All at once, then reset'],
        ['Perpetual', '~26', '26', 'One every 2 weeks'],
      ],
      footnote: 'Based on 8-week flowering, 4-week veg, 2-week cleanup. Actual results vary.',
    },
    tips: {
      title: 'Choosing the Right Method',
      items: [
        'Start with sequential if you\'re new — it\'s simpler to learn the basics',
        'Switch to perpetual once you\'re comfortable with the grow cycle',
        'Perpetual requires two separate light schedules (veg 18/6, flower 12/12)',
        'Consider your usage: perpetual provides steady supply, sequential gives bulk harvests',
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Is perpetual harvest really that much more efficient?',
          answer: 'Yes — typically 50-80% more annual yield from the same flower zone. The efficiency comes from eliminating downtime: your flower zone is always full rather than sitting empty during veg and cleanup.',
        },
        {
          question: 'What do I need for perpetual harvest?',
          answer: 'A separate veg zone (can be smaller than flower), the ability to run two light schedules, and a system to track plant stages. The calculator shows how many veg slots you need.',
        },
        {
          question: 'Can I do perpetual with autoflowers?',
          answer: 'Yes — autoflowers simplify perpetual because they don\'t need separate light schedules. However, you lose control over veg duration and plant size.',
        },
        {
          question: 'How does cleanup time affect sequential yields?',
          answer: 'Significantly. Every week of cleanup/reset between cycles means fewer total cycles per year. Minimizing this downtime is key to sequential efficiency.',
        },
      ],
    },
    cta: {
      title: 'Plan Your Perpetual Rotation',
      content: 'This calculator shows the yield advantage. Plantegia helps you actually plan it — visualize when each plant starts, moves to flower, and harvests.',
      button: 'Try Plantegia Free',
    },
  },
} as const;
