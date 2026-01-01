import type { Tutorial } from './types';

// Tutorial 1: Basic Setup
const basicSetupTutorial: Tutorial = {
  id: 'basic-setup',
  name: 'Basic Setup',
  description: 'Create your first growing space and plant',
  steps: [
    {
      id: 'welcome',
      title: 'WELCOME',
      message: 'Welcome to Plantasia!\n\nThis tutorial will guide you through creating your first growing space and planting your first plant.\n\nLet\'s get started.',
      objective: 'Read introduction',
      condition: { type: 'none' },
      autoAdvanceDelay: 20000,
    },
    {
      id: 'create-strain',
      title: 'CREATE STRAIN',
      message: '$ First, let\'s add a plant strain.\n\nTap an empty seed slot in the SEEDS section (bottom center), then tap "New Strain +". Enter a name like "Gorilla Zkittlez".',
      objective: 'Create a strain',
      condition: { type: 'action', action: 'createStrain' },
      hint: 'Strains define plant variety and growth timing',
    },
    {
      id: 'add-seeds',
      title: 'ADD SEEDS',
      message: '$ Now add seeds to your inventory.\n\nSet quantity to 4, keep type as "Seed", then tap "ADD TO INVENTORY".',
      objective: 'Add seeds to inventory',
      condition: {
        type: 'state',
        stateCheck: (state) => state.inventory.length > 0
      },
      hint: 'Seeds appear in the SEEDS section of the hotbar',
    },
    {
      id: 'create-space',
      title: 'CREATE SPACE',
      message: '$ Create your first growing space.\n\nTap the Space tool (▢) in the TOOLBOX, then drag on the canvas to create a room or tent.',
      objective: 'Create a growing space',
      condition: { type: 'action', action: 'createSpace' },
      hint: 'Spaces represent physical growing areas',
    },
    {
      id: 'place-plant',
      title: 'PLACE PLANT',
      message: '$ Place your first plant!\n\nTap your seed in the SEEDS bar, then tap a cell inside your space to plant it.',
      objective: 'Place a plant',
      condition: { type: 'action', action: 'createPlant' },
      hint: 'Plants auto-progress through lifecycle stages',
    },
    {
      id: 'complete',
      title: 'TUTORIAL COMPLETE',
      message: '✓ Well done! You\'ve created your first plantation.\n\nThis plantation is saved and you can continue working on it.\n\nYou can restart this tutorial anytime or try the next one.',
      objective: 'Tutorial finished',
      condition: { type: 'none' },
    },
  ],
  initialState: {
    spaces: [],
    plants: [],
    strains: [],
    inventory: [],
  },
};

// Helper to generate dates relative to today
function daysFromNow(days: number, fullISO = false): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return fullISO ? date.toISOString() : date.toISOString().split('T')[0];
}

// Tutorial 2: Timeline & Rotation Planning
// Scenario: 2 plants showing VEG → FLOWER rotation cycle
// - Plant 1 (ROT-1): Currently in FLOWER, started 30 days ago, finishing soon
// - Plant 2 (ROT-2): Currently in VEG, needs to move to FLOWER when ROT-1 finishes
const timelineRotationTutorial: Tutorial = {
  id: 'timeline-rotation',
  name: 'Timeline & Rotation',
  description: 'Plan VEG → FLOWER rotation with Time View',
  steps: [
    {
      id: 'intro',
      title: 'ROTATION PLANNING',
      message: 'Time View helps you plan when plants move between spaces.\n\nYou have 2 plants:\n• ROT-1 is flowering and finishes soon\n• ROT-2 is in VEG and needs to take its place',
      objective: 'Understand the scenario',
      condition: { type: 'none' },
      autoAdvanceDelay: 20000,
    },
    {
      id: 'switch-view',
      title: 'OPEN TIME VIEW',
      message: 'Switch to Time View to see the timeline.\n\nTap "XT" button in the TIME section (bottom-right of hotbar).',
      objective: 'Open Time View',
      condition: {
        type: 'state',
        stateCheck: (state) => state.viewMode === 'time'
      },
      hint: 'XT = X-axis is Time',
      highlightSelector: '[data-view="time"]',
    },
    {
      id: 'explain-timeline',
      title: 'READING THE TIMELINE',
      message: 'Each horizontal bar is a plant\'s lifecycle.\n\nROT-1 (top) is in FLOWER slot.\nROT-2 (bottom) is in VEG slot.\n\nPan left/right to scroll time.',
      objective: 'Understand timeline layout',
      condition: { type: 'none' },
      autoAdvanceDelay: 60000,
    },
    {
      id: 'explain-problem',
      title: 'THE ROTATION PROBLEM',
      message: 'ROT-2 needs to move from VEG to FLOWER when ROT-1 finishes.\n\nTo schedule this, you\'ll split ROT-2\'s timeline at the move date, then drag the second part to FLOWER.',
      objective: 'Understand what we need to do',
      condition: { type: 'none' },
      autoAdvanceDelay: 60000,
    },
    {
      id: 'split-segment',
      title: 'SPLIT THE SEGMENT',
      message: 'Choose SPLIT in TOOLBOX.\n\nThen tap on ROT-2\'s bar where you want to split it (around day 30 of veg).',
      objective: 'Split ROT-2 segment',
      condition: { type: 'action', action: 'splitSegment' },
      hint: 'Try to extend the VEG stage to match timing perfectly.',
      highlightSelector: '[data-tool="split"]',
    },
    {
      id: 'move-segment',
      title: 'MOVE TO FLOWER',
      message: 'Now drag the RIGHT part of ROT-2 (after the split) UP to the FLOWER row.\n\nThis schedules the transfer.',
      objective: 'Move segment to FLOWER slot',
      condition: { type: 'action', action: 'moveSegmentToSlot' },
      hint: 'Drag vertically to change space',
      highlightSelector: '[data-tool="cursor"]',
    },
    {
      id: 'complete',
      title: 'ROTATION PLANNED',
      message: '✓ You\'ve scheduled a VEG → FLOWER rotation!\n\nThe curved line shows the planned move.\n\nUse this for perpetual harvests.',
      objective: 'Tutorial complete',
      hint: 'Try to drop the next seed right on the timeline to plan the next grow.',
      condition: { type: 'none' },
    },
  ],
  initialState: {
    spaces: [
      {
        id: 'veg-space',
        name: 'VEG',
        originX: 120,
        originY: 80,
        gridWidth: 2,
        gridHeight: 2,
        lightSchedule: '18/6',
        color: '#1e5a38',
      },
      {
        id: 'flower-space',
        name: 'FLOWER',
        originX: 120,
        originY: 260,
        gridWidth: 2,
        gridHeight: 2,
        lightSchedule: '12/12',
        color: '#0d3820',
      },
    ],
    strains: [
      {
        id: 'rotation-strain',
        name: 'Rotation Demo Strain',
        abbreviation: 'RDS',
        vegDays: 30,
        floweringDays: 56,
        strainType: 'hybrid',
        photoperiod: 'photo',
      },
    ],
    plants: [
      // Plant 1: In FLOWER, started 30 days ago (mid-flowering)
      {
        id: 'plant-flower',
        code: 'RDS-1',
        strainId: 'rotation-strain',
        spaceId: 'flower-space',
        gridX: 0,
        gridY: 0,
        size: 1,
        stage: 'flowering',
        generation: 'seed',
        startedAt: daysFromNow(-60, true), // Started 60 days ago (30 veg + 30 flower)
        stageStartedAt: daysFromNow(-30, true), // Flowering started 30 days ago
        segments: [
          {
            id: 'seg-flower-1',
            spaceId: 'flower-space',
            gridX: 0,
            gridY: 0,
            startDate: daysFromNow(-60),
            endDate: null,
          },
        ],
      },
      // Plant 2: In VEG, started 15 days ago (needs to move to FLOWER soon)
      {
        id: 'plant-veg',
        code: 'RDS-2',
        strainId: 'rotation-strain',
        spaceId: 'veg-space',
        gridX: 0,
        gridY: 0,
        size: 1,
        stage: 'vegetative',
        generation: 'seed',
        startedAt: daysFromNow(-15, true),
        stageStartedAt: daysFromNow(-15, true),
        segments: [
          {
            id: 'seg-veg-1',
            spaceId: 'veg-space',
            gridX: 0,
            gridY: 0,
            startDate: daysFromNow(-15),
            endDate: null,
          },
        ],
      },
    ],
    inventory: [],
  },
};

export const TUTORIALS: Record<string, Tutorial> = {
  'basic-setup': basicSetupTutorial,
  'timeline-rotation': timelineRotationTutorial,
};
