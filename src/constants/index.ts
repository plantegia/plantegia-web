import type { Stage } from '../types';

export const COLORS = {
  background: '#1A1A2E',
  backgroundLight: '#25253d',
  backgroundDark: '#12121f',

  green: '#4a7c59',
  orange: '#d4a574',
  teal: '#5fb3b3',

  text: '#e8e8e8',
  textMuted: '#8888a0',
  muted: '#6a6a8a',
  border: '#3a3a5c',

  danger: '#c45c5c',
} as const;

export const STAGE_COLORS: Record<Stage, string> = {
  germinating: '#8b7355',
  seedling: '#7da87b',
  vegetative: '#4a7c59',
  flowering: '#7c5a8c',
  harvested: '#5a5a6e',
};

// Colors for different spaces (cycling palette)
export const SPACE_COLORS = [
  '#2d3a4a', // blue-gray
  '#3a2d4a', // purple-gray
  '#2d4a3a', // green-gray
  '#4a3a2d', // brown-gray
  '#3a4a4a', // teal-gray
  '#4a2d3a', // magenta-gray
] as const;

export const CELL_SIZE = 56;
export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 2;
export const DEFAULT_ZOOM = 1;

export const VIEWPORT_WIDTH = 390;

export const STAGE_DAYS: Record<Stage, number> = {
  germinating: 7,
  seedling: 14,
  vegetative: 30,
  flowering: 60,
  harvested: 7, // Fixed 1 week for harvest period
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
export const TIME_VIEW_HANDLE_HEIGHT = 14;
export const MIN_SEGMENT_HEIGHT_FOR_LABEL = 20;
