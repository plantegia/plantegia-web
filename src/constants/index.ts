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
  harvested: 0,
};

export const STAGES: Stage[] = ['germinating', 'seedling', 'vegetative', 'flowering', 'harvested'];
