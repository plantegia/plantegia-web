// Design tokens for Plantegia marketing site
// Aligned with main app design system

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

export const STAGE_COLORS = {
  germinating: '#a08060',
  seedling: '#6aA050',
  vegetative: '#51853B',
  flowering: '#15472C',
  harvested: '#3a3530',
} as const;

export const SPACE_COLORS = [
  '#51853B', // green (default)
  '#4ECDC4', // teal
  '#F7DC6F', // gold
  '#E67E22', // orange
  '#9B59B6', // purple
  '#3498DB', // blue
] as const;

// Typography
export const FONT = {
  family: '"Space Mono", monospace',
  sizeSmall: '14px',
  sizeBase: '16px',
  sizeLarge: '18px',
  sizeXL: '24px',
  size2XL: '32px',
  size3XL: '48px',
} as const;

// Spacing
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;
