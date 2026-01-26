import type { Tutorial } from './types';

// Tutorial 1: Basic Setup
const basicSetupTutorial: Tutorial = {
  id: 'basic-setup',
  name: 'Basic Setup',
  description: 'Seeds, Plants and Spaces',
  steps: [
    {
      id: 'add-seeds',
      title: 'ADD SEEDS',
      message: 'Tap empty slot → ADD TO INVENTORY',
      objective: 'Add seeds to inventory',
      condition: {
        type: 'state',
        stateCheck: (state) => state.inventory.length > 0
      },
      highlightSelector: '[data-slot="empty"]',
    },
    {
      id: 'place-plant',
      title: 'PLANT SEED',
      message: 'Tap inside tent to plant',
      objective: 'Place a plant',
      condition: { type: 'action', action: 'createPlant' },
    },
    {
      id: 'open-timeline',
      title: 'VIEW TIMELINE',
      message: 'Tap TIME to see grow schedule',
      objective: 'Open Time View',
      condition: {
        type: 'state',
        stateCheck: (state) => state.viewMode === 'time'
      },
      highlightSelector: '[data-view="time"]',
    },
    {
      id: 'complete',
      title: 'DONE!',
      message: 'Your grow is planned! Auto-saved.',
      objective: 'Complete',
      condition: { type: 'none' },
    },
  ],
  initialState: {
    spaces: [
      {
        id: 'default-tent',
        name: '2x2 Tent',
        originX: 112, // 2 * CELL_SIZE (56)
        originY: 112, // 2 * CELL_SIZE
        gridWidth: 2,
        gridHeight: 2,
        lightSchedule: '18/6',
        color: '#4ECDC4',
      },
    ],
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
  description: 'Plan VEG → FLOWER rotation',
  steps: [
    {
      id: 'switch-view',
      title: 'OPEN TIMELINE',
      message: 'Tap TIME to open timeline',
      objective: 'Open Time View',
      condition: {
        type: 'state',
        stateCheck: (state) => state.viewMode === 'time'
      },
      highlightSelector: '[data-view="time"]',
    },
    {
      id: 'split-segment',
      title: 'SPLIT SEGMENT',
      message: 'Tap Split tool → tap RDS-2 bar',
      objective: 'Split the segment',
      condition: { type: 'action', action: 'splitSegment' },
      highlightSelector: '[data-tool="split"]',
    },
    {
      id: 'move-segment',
      title: 'MOVE TO FLOWER',
      message: 'Drag RDS-2 right part → FLOWER row',
      objective: 'Move segment',
      condition: { type: 'action', action: 'moveSegmentToSlot' },
      highlightSelector: '[data-tool="cursor"]',
    },
    {
      id: 'complete',
      title: 'DONE!',
      message: 'Done! Rotation scheduled.',
      objective: 'Complete',
      condition: { type: 'none' },
    },
  ],
  initialState: {
    spaces: [
      {
        id: 'veg-space',
        name: 'VEG',
        originX: 112, // 2 * CELL_SIZE (56)
        originY: 56,  // 1 * CELL_SIZE
        gridWidth: 2,
        gridHeight: 2,
        lightSchedule: '18/6',
        color: '#4ECDC4', // teal
      },
      {
        id: 'flower-space',
        name: 'FLOWER',
        originX: 112, // 2 * CELL_SIZE
        originY: 224, // 4 * CELL_SIZE
        gridWidth: 2,
        gridHeight: 2,
        lightSchedule: '12/12',
        color: '#E67E22', // orange
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
