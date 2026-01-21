export default {
  home: {
    title: 'Perpetual Harvest Planner for Multi-Tent Growers | Plantegia',
    description: 'Plan your perpetual harvest across multiple tents. Visual grow planner for rotation schedules, veg-to-flower timing, and continuous cycles. One-time $29.',
    keywords: ['perpetual harvest planner', 'cannabis grow planner', 'multi tent grow schedule', 'two tent setup', 'grow room planning', 'veg and flower tent', 'perpetual harvest calculator', 'indoor grow rotation'],
  },
  blog: {
    title: 'Blog | Plantegia',
    description: 'Tips, guides, and strategies for planning your indoor grow. Learn about perpetual harvest, multi-tent setups, and rotation planning.',
    keywords: ['grow planning blog', 'perpetual harvest guide', 'multi tent tips', 'indoor growing'],
    headerTitle: 'Blog',
    headerSubtitle: 'Tips, guides, and strategies for planning your indoor grow.',
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
    ],
  },
  perpetualCalculator: {
    title: 'Perpetual Harvest Calculator',
    description: 'Calculate how many plants you need for continuous harvests. Plan your veg and flower tent setup for perpetual harvesting.',
    keywords: ['perpetual harvest calculator', 'continuous harvest', 'perpetual grow', 'harvest schedule calculator'],
    howItWorks: {
      title: 'How Perpetual Harvest Works',
      intro: 'A perpetual harvest setup means you\'re always harvesting fresh plants by staggering when you start new ones. Instead of harvesting everything at once, you harvest one plant (or batch) every few weeks while new plants are always growing.',
      keyConcepts: {
        title: 'Key Concepts',
        items: [
          { term: 'Flowering Period', definition: 'How long your strain takes to flower (typically 8-10 weeks).' },
          { term: 'Veg Period', definition: 'How long you keep plants in vegetative growth before flipping to flower. Longer veg = bigger plants.' },
          { term: 'Harvest Frequency', definition: 'How often you want to harvest. Every 2 weeks is common.' },
        ],
      },
      exampleSetup: {
        title: 'Example Setup',
        content: 'With an 8-week flowering strain and harvesting every 2 weeks, you need 4 plants in flower at different stages. Add 2 plants in veg (4-week veg period), and you need 6 total plants running at all times.',
      },
      twoTentSetup: {
        title: 'Two-Tent Setup',
        content: 'Most perpetual growers use two tents: one for veg (18/6 light schedule) and one for flower (12/12). Plants move from veg to flower when they\'re ready, keeping a continuous pipeline of plants at different stages.',
      },
    },
  },
  tentSpacing: {
    title: 'Tent Spacing Calculator',
    description: 'Calculate how many plants fit in your grow tent. Find the optimal plant spacing for your tent size.',
    keywords: ['grow tent calculator', 'plant spacing', 'how many plants fit', 'tent size plants'],
    guide: {
      title: 'Plant Spacing Guide',
      intro: 'Proper plant spacing ensures each plant gets enough light and airflow. Too many plants leads to crowding, poor airflow, and lower yields per plant.',
      plantSizes: {
        title: 'Plant Size Guidelines',
        items: [
          { size: 'Small (1 sq ft)', description: 'Sea of Green (SOG) or quick veg. Many small plants with short veg time.' },
          { size: 'Medium (2 sq ft)', description: 'Standard training (LST, topping). Most common for home growers.' },
          { size: 'Large (4 sq ft)', description: 'Long veg, heavy training (SCROG, mainlining). Fewer plants but bigger yields per plant.' },
        ],
      },
      commonTentSizes: {
        title: 'Common Tent Sizes',
        headers: ['Tent Size', 'Small', 'Medium', 'Large'],
        rows: [
          ['2x2 ft', '4', '2', '1'],
          ['3x3 ft', '9', '4', '2'],
          ['4x4 ft', '16', '8', '4'],
          ['5x5 ft', '25', '12', '6'],
          ['4x8 ft', '32', '16', '8'],
        ],
      },
      tips: {
        title: 'Tips for Better Yields',
        items: [
          'Fewer larger plants often produce more than many small plants',
          'Training techniques (LST, topping) maximize canopy coverage',
          'Leave space for airflow to prevent mold and pests',
          'Consider pot size — larger pots need more floor space',
        ],
      },
    },
  },
} as const;
