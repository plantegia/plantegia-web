import type { Space, LightSchedule } from '../types';

// =============================================================================
// LIGHT SCHEDULE UTILITIES
// 24-bit bitmask: bit N = hour N (0=midnight to 23=11PM), 1=light ON, 0=light OFF
// =============================================================================

// Default schedules as bitmasks
// For '18/6': light ON for hours 6-23 (6 AM to midnight)
// For '12/12': light ON for hours 6-17 (6 AM to 6 PM)
// For '20/4': light ON for hours 4-23 (4 AM to midnight)
// For '24/0': light ON all hours
export const DEFAULT_SCHEDULES: Record<LightSchedule, number> = {
  '18/6': 0b111111111111111111000000,   // hours 6-23 ON (typical veg schedule)
  '12/12': 0b000000111111111111000000,  // hours 6-17 ON (typical flower schedule)
  '20/4': 0b111111111111111111110000,   // hours 4-23 ON
  '24/0': 0b111111111111111111111111,   // all hours ON
};

// Default schedule for new spaces (18/6 starting at 6 AM)
export const DEFAULT_LIGHT_SCHEDULE = DEFAULT_SCHEDULES['18/6'];

/**
 * Check if a specific hour (0-23) has light ON
 */
export function isLightOnAtHour(schedule: number, hour: number): boolean {
  return (schedule & (1 << hour)) !== 0;
}

/**
 * Toggle light for a specific hour
 */
export function toggleHour(schedule: number, hour: number): number {
  return schedule ^ (1 << hour);
}

/**
 * Set light ON for a specific hour
 */
export function setLightOn(schedule: number, hour: number): number {
  return schedule | (1 << hour);
}

/**
 * Set light OFF for a specific hour
 */
export function setLightOff(schedule: number, hour: number): number {
  return schedule & ~(1 << hour);
}

/**
 * Check if it's currently "night" (dark period) for a schedule
 * Based on real system time
 */
export function isCurrentlyDark(schedule: number): boolean {
  const currentHour = new Date().getHours();
  return !isLightOnAtHour(schedule, currentHour);
}

/**
 * Get the effective light schedule for a space (handles migration from old format)
 */
export function getEffectiveLightSchedule(space: Space): number {
  // Prefer new customLightSchedule if set
  if (space.customLightSchedule !== undefined) {
    return space.customLightSchedule;
  }
  // Fall back to old lightSchedule, convert to bitmask
  const oldSchedule = space.lightSchedule || '18/6';
  return DEFAULT_SCHEDULES[oldSchedule] ?? DEFAULT_LIGHT_SCHEDULE;
}

/**
 * Count light hours in schedule
 */
export function countLightHours(schedule: number): number {
  let count = 0;
  for (let i = 0; i < 24; i++) {
    if (isLightOnAtHour(schedule, i)) count++;
  }
  return count;
}

/**
 * Format schedule for display (e.g., "18/6")
 */
export function formatSchedule(schedule: number): string {
  const lightHours = countLightHours(schedule);
  const darkHours = 24 - lightHours;
  return `${lightHours}/${darkHours}`;
}

/**
 * Create a schedule from start and end hours (for quick presets)
 * @param startHour - Hour when light turns ON (0-23)
 * @param lightDuration - Number of hours light stays on
 */
export function createScheduleFromRange(startHour: number, lightDuration: number): number {
  let schedule = 0;
  for (let i = 0; i < lightDuration; i++) {
    const hour = (startHour + i) % 24;
    schedule = setLightOn(schedule, hour);
  }
  return schedule;
}

/**
 * Build a map of spaceId -> isDark based on current time
 * Utility function used by renderers and sleep animation
 */
export function buildDarkSpaceMap(spaces: { id: string; customLightSchedule?: number; lightSchedule?: string }[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  spaces.forEach(space => {
    const schedule = getEffectiveLightSchedule(space as Space);
    map.set(space.id, isCurrentlyDark(schedule));
  });
  return map;
}
