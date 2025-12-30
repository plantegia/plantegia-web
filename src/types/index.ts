export type Stage = 'germinating' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
export type Generation = 'seed' | 'clone';
export type PlantSize = 1 | 2 | 4;
export type Tool = 'space' | 'erase' | 'split';
export type ViewMode = 'space' | 'time';
export type LightSchedule = '18/6' | '12/12' | '20/4' | '24/0';

export interface PlantSegment {
  id: string;
  spaceId: string;
  gridX: number;
  gridY: number;
  startDate: string;  // absolute ISO date
  endDate: string | null;  // null = until end of lifecycle
}

export interface Space {
  id: string;
  name: string;
  originX: number;
  originY: number;
  gridWidth: number;
  gridHeight: number;
  lightSchedule?: LightSchedule;
  color?: string;
}

export interface Plant {
  id: string;
  code: string;
  strainId: string | null;
  size: PlantSize;
  stage: Stage;
  generation: Generation;
  startedAt: string;
  segments: PlantSegment[];  // ordered by startDate
  customStageDays?: Partial<Record<Stage, number>>;
  // Backward compat - synced with current segment (last segment where startDate <= today)
  spaceId: string;
  gridX: number;
  gridY: number;
  stageStartedAt: string;
}

export interface Strain {
  id: string;
  name: string;
  abbreviation: string;
  floweringDays: number;
  vegDays: number;
}

export interface Seed {
  id: string;
  strainId: string;
  quantity: number;
  isClone: boolean;
}

export interface Selection {
  type: 'space' | 'plant';
  id: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface SlotId {
  spaceId: string;
  gridX: number;
  gridY: number;
}

export interface Plantation {
  id: string;
  ownerId: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  spaces: Space[];
  plants: Plant[];
  strains: Strain[];
  inventory: Seed[];
}
