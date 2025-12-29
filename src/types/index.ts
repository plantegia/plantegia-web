export type Stage = 'germinating' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
export type Generation = 'seed' | 'clone';
export type PlantSize = 1 | 2 | 4;
export type Tool = 'space' | 'erase';
export type ViewMode = 'space' | 'time';
export type LightSchedule = '18/6' | '12/12' | '20/4' | '24/0';

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
  spaceId: string;
  gridX: number;
  gridY: number;
  size: PlantSize;
  stage: Stage;
  generation: Generation;
  startedAt: string;
  stageStartedAt: string;
  // Custom stage durations for this plant (overrides strain defaults)
  customStageDays?: Partial<Record<Stage, number>>;
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
