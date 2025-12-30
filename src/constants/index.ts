import type { Stage } from '../types';

export const COLORS = {
  background: '#15472C',
  backgroundLight: '#1e5a38',
  backgroundDark: '#231F20',

  green: '#51853B',
  orange: '#F15D43',
  teal: '#FBD19F',

  text: '#FBD19F',
  textMuted: '#d4b088',
  muted: '#3a6a3a',
  border: '#51853B',

  danger: '#F15D43',
} as const;

export const STAGE_COLORS: Record<Stage, string> = {
  germinating: '#a08060',
  seedling: '#6aA050',
  vegetative: '#51853B',
  flowering: '#15472C',
  harvested: '#3a3530',
};

// Colors for different spaces (cycling palette)
export const SPACE_COLORS = [
  '#1e5a38', // light green
  '#0d3820', // dark green
  '#2a5a2a', // forest
  '#1a4a30', // deep green
  '#2a4a3a', // teal-green
  '#1a3a28', // darker
] as const;

export const CELL_SIZE = 56;
export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 2;
export const DEFAULT_ZOOM = 1;

export const VIEWPORT_WIDTH = 390;
export const HOTBAR_HEIGHT = 88;

export const STAGE_DAYS: Record<Stage, number> = {
  germinating: 10,
  seedling: 14,
  vegetative: 30,
  flowering: 60,
  harvested: 10, // Fixed period for harvest
};

export const STAGES: Stage[] = ['germinating', 'seedling', 'vegetative', 'flowering', 'harvested'];

// Short stage abbreviations for UI labels
export const STAGE_ABBREV: Record<Stage, string> = {
  germinating: 'GRM',
  seedling: 'SDL',
  vegetative: 'VEG',
  flowering: 'FLW',
  harvested: 'HRV',
};

// UI sizing constants
export const SPACE_HANDLE_SIZE = 8;

// Cursor constants
export const CURSORS = {
  default: 'default',
  grab: 'grab',
  grabbing: 'grabbing',
  crosshair: 'crosshair',
  cell: 'cell',
  pointer: 'pointer',
  notAllowed: 'not-allowed',
  text: 'text',
  split: 'url(/cursors/split.svg) 12 12, crosshair',
  colResize: 'col-resize',
  nResize: 'n-resize',
  sResize: 's-resize',
  eResize: 'e-resize',
  wResize: 'w-resize',
  neResize: 'ne-resize',
  nwResize: 'nw-resize',
  seResize: 'se-resize',
  swResize: 'sw-resize',
} as const;

export const EDGE_CURSORS: Record<string, string> = {
  n: CURSORS.nResize,
  s: CURSORS.sResize,
  e: CURSORS.eResize,
  w: CURSORS.wResize,
  ne: CURSORS.neResize,
  nw: CURSORS.nwResize,
  se: CURSORS.seResize,
  sw: CURSORS.swResize,
  body: CURSORS.grab,
};
