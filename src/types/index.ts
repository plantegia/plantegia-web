export type Stage = 'germinating' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
export type Generation = 'seed' | 'clone';
export type PlantSize = 1 | 2 | 4;
export type Tool = 'cursor' | 'space' | 'erase' | 'split';
export type ViewMode = 'space' | 'time';
export type LightSchedule = '18/6' | '12/12' | '20/4' | '24/0';
// 24-bit bitmask: bit N = hour N (0=midnight), 1=light ON, 0=light OFF
export type CustomLightSchedule = number;
export type StrainType = 'indica' | 'sativa' | 'hybrid';
export type Photoperiod = 'auto' | 'photo';

export interface PlantSegment {
  id: string;
  spaceId: string | null;  // null = floating (not assigned to any space)
  gridX: number;
  gridY: number;
  startDate: string;  // absolute ISO date
  endDate: string | null;  // null = until end of lifecycle
}

// Time View placement preview for showing ghost plant before placing
export interface TimeViewPlacementPreview {
  screenX: number;
  spaceId: string | null;  // null = floating slot
  gridX: number;
  gridY: number;
  canPlace: boolean;
  abbreviation: string;
  strainId: string | null;
}

// Plant drag preview for Space View
export interface PlantDragPreview {
  plantId: string;
  abbreviation: string;
  sourceWorldX: number;
  sourceWorldY: number;
  targetWorldX: number;
  targetWorldY: number;
  canPlace: boolean;
}

// Long press preview for mobile touch drag
export interface LongPressPreview {
  type: 'plant' | 'space' | 'segment';
  id: string;
  segmentId?: string;
  screenX: number;
  screenY: number;
  progress: number; // 0-1 for animation
}

export interface Space {
  id: string;
  name: string;
  originX: number;
  originY: number;
  gridWidth: number;
  gridHeight: number;
  lightSchedule?: LightSchedule;  // Legacy, kept for migration
  customLightSchedule?: CustomLightSchedule;  // New: 24-hour bitmask
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
  spaceId: string | null;  // null = floating (not assigned to any space)
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
  strainType?: StrainType;
  photoperiod?: Photoperiod;
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
  spaceId: string | null;  // null = floating slot
  gridX: number;
  gridY: number;
}

export interface Plantation {
  id: string;
  ownerId: string;
  name: string;
  isPublic: boolean;
  isTutorial?: boolean;
  createdAt: string;
  updatedAt: string;
  spaces: Space[];
  plants: Plant[];
  strains: Strain[];
  inventory: Seed[];
}
