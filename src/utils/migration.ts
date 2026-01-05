import { nanoid } from 'nanoid';
import type { Plant, PlantSegment, Plantation, Space, LightSchedule } from '../types';
import { DEFAULT_SCHEDULES } from './lightSchedule';

interface LegacyPlant {
  id: string;
  code: string;
  strainId: string | null;
  spaceId: string;
  gridX: number;
  gridY: number;
  size: 1 | 2 | 4;
  stage: string;
  generation: string;
  startedAt: string;
  stageStartedAt: string;
  customStageDays?: Partial<Record<string, number>>;
  segments?: PlantSegment[];
}

export function migratePlantToSegments(plant: LegacyPlant): Plant {
  // If already has segments array with data, skip migration
  if (plant.segments && plant.segments.length > 0) {
    return plant as Plant;
  }

  // Convert old single-location plant to segment-based plant
  const segment: PlantSegment = {
    id: nanoid(),
    spaceId: plant.spaceId,
    gridX: plant.gridX,
    gridY: plant.gridY,
    startDate: plant.startedAt,
    endDate: null,  // extends to end of lifecycle
  };

  return {
    ...plant,
    segments: [segment],
  } as Plant;
}

/**
 * Migrate space light schedule from old string format to new bitmask
 * Removes legacy lightSchedule field after migration
 */
export function migrateSpaceLightSchedule(space: Space): Space {
  // Skip if already has custom schedule and no legacy field
  if (space.customLightSchedule !== undefined && space.lightSchedule === undefined) {
    return space;
  }

  // Convert old format to new bitmask if needed
  const bitmask = space.customLightSchedule !== undefined
    ? space.customLightSchedule
    : DEFAULT_SCHEDULES[(space.lightSchedule || '18/6') as LightSchedule] ?? DEFAULT_SCHEDULES['18/6'];

  // Create new space without legacy field
  const { lightSchedule: _removed, ...spaceWithoutLegacy } = space;

  return {
    ...spaceWithoutLegacy,
    customLightSchedule: bitmask,
  };
}

export function migratePlantation(plantation: Plantation): Plantation {
  return {
    ...plantation,
    plants: plantation.plants.map((p) => migratePlantToSegments(p as unknown as LegacyPlant)),
    spaces: plantation.spaces.map(migrateSpaceLightSchedule),
  };
}

// Get the current segment for a plant (for Space View display)
// Returns the segment that is active "now" based on startDate/endDate
export function getCurrentSegment(plant: Plant, date: Date = new Date()): PlantSegment | null {
  if (!plant.segments || plant.segments.length === 0) {
    return null;
  }

  const dateStr = date.toISOString().split('T')[0];

  // Find segment where startDate <= date and (endDate is null or endDate > date)
  for (let i = plant.segments.length - 1; i >= 0; i--) {
    const seg = plant.segments[i];
    const segStart = seg.startDate.split('T')[0];
    const segEnd = seg.endDate ? seg.endDate.split('T')[0] : null;

    if (segStart <= dateStr && (segEnd === null || segEnd > dateStr)) {
      return seg;
    }
  }

  // Fallback to last segment
  return plant.segments[plant.segments.length - 1];
}

