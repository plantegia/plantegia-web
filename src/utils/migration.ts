import { nanoid } from 'nanoid';
import type { Plant, PlantSegment, Plantation } from '../types';

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

export function migratePlantation(plantation: Plantation): Plantation {
  return {
    ...plantation,
    plants: plantation.plants.map((p) => migratePlantToSegments(p as unknown as LegacyPlant)),
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

