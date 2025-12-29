import type { Point, Space, Plant, PlantSize, Strain, Stage } from '../types';
import { CELL_SIZE, STAGE_DAYS, STAGES } from '../constants';

export function screenToWorld(
  screen: Point,
  pan: Point,
  zoom: number
): Point {
  return {
    x: (screen.x - pan.x) / zoom,
    y: (screen.y - pan.y) / zoom,
  };
}

export function worldToScreen(
  world: Point,
  pan: Point,
  zoom: number
): Point {
  return {
    x: world.x * zoom + pan.x,
    y: world.y * zoom + pan.y,
  };
}

export function snapToGrid(value: number): number {
  return Math.floor(value / CELL_SIZE) * CELL_SIZE;
}

export function getGridPosition(worldPos: Point): { gridX: number; gridY: number } {
  return {
    gridX: Math.floor(worldPos.x / CELL_SIZE),
    gridY: Math.floor(worldPos.y / CELL_SIZE),
  };
}

export function findSpaceAt(worldPos: Point, spaces: Space[]): Space | null {
  return spaces.find(space => {
    const x1 = space.originX;
    const y1 = space.originY;
    const x2 = x1 + space.gridWidth * CELL_SIZE;
    const y2 = y1 + space.gridHeight * CELL_SIZE;

    return worldPos.x >= x1 && worldPos.x < x2 &&
           worldPos.y >= y1 && worldPos.y < y2;
  }) || null;
}

export function findCellInSpace(
  worldPos: Point,
  space: Space
): { gridX: number; gridY: number } | null {
  const relX = worldPos.x - space.originX;
  const relY = worldPos.y - space.originY;

  if (relX < 0 || relY < 0) return null;

  const gridX = Math.floor(relX / CELL_SIZE);
  const gridY = Math.floor(relY / CELL_SIZE);

  if (gridX >= space.gridWidth || gridY >= space.gridHeight) return null;

  return { gridX, gridY };
}

export function getPlantCells(plant: Plant): { gridX: number; gridY: number }[] {
  const cells: { gridX: number; gridY: number }[] = [];
  const { gridX, gridY, size } = plant;

  if (size === 1) {
    cells.push({ gridX, gridY });
  } else if (size === 2) {
    cells.push({ gridX, gridY });
    cells.push({ gridX: gridX + 1, gridY });
  } else if (size === 4) {
    cells.push({ gridX, gridY });
    cells.push({ gridX: gridX + 1, gridY });
    cells.push({ gridX, gridY: gridY + 1 });
    cells.push({ gridX: gridX + 1, gridY: gridY + 1 });
  }

  return cells;
}

export function isCellOccupied(
  spaceId: string,
  gridX: number,
  gridY: number,
  plants: Plant[],
  excludePlantId?: string
): boolean {
  return plants.some(plant => {
    if (plant.spaceId !== spaceId) return false;
    if (excludePlantId && plant.id === excludePlantId) return false;

    const cells = getPlantCells(plant);
    return cells.some(cell => cell.gridX === gridX && cell.gridY === gridY);
  });
}

export function canPlacePlant(
  spaceId: string,
  gridX: number,
  gridY: number,
  size: PlantSize,
  space: Space,
  plants: Plant[],
  excludePlantId?: string
): boolean {
  const testPlant = { gridX, gridY, size, spaceId } as Plant;
  const cells = getPlantCells(testPlant);

  return cells.every(cell => {
    if (cell.gridX < 0 || cell.gridY < 0) return false;
    if (cell.gridX >= space.gridWidth || cell.gridY >= space.gridHeight) return false;
    return !isCellOccupied(spaceId, cell.gridX, cell.gridY, plants, excludePlantId);
  });
}

export function findPlantAt(
  worldPos: Point,
  plants: Plant[],
  spaces: Space[]
): Plant | null {
  for (const plant of plants) {
    const space = spaces.find(s => s.id === plant.spaceId);
    if (!space) continue;

    const cells = getPlantCells(plant);

    for (const cell of cells) {
      const cellX = space.originX + cell.gridX * CELL_SIZE;
      const cellY = space.originY + cell.gridY * CELL_SIZE;

      if (
        worldPos.x >= cellX &&
        worldPos.x < cellX + CELL_SIZE &&
        worldPos.y >= cellY &&
        worldPos.y < cellY + CELL_SIZE
      ) {
        return plant;
      }
    }
  }

  return null;
}

export interface PlantTimeline {
  daysInCurrentStage: number;
  daysRemainingInStage: number;
  totalDaysRemaining: number;
  harvestDate: Date;
  startDate: Date;
}

export function calculatePlantTimeline(
  plant: Plant,
  strain: Strain | undefined,
  today: Date = new Date()
): PlantTimeline {
  const stageStartDate = new Date(plant.stageStartedAt || plant.startedAt);
  const startDate = new Date(plant.startedAt);

  const daysInCurrentStage = Math.floor(
    (today.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentStageIndex = STAGES.indexOf(plant.stage);

  let daysRemainingInStage = 0;
  let totalDaysRemaining = 0;

  if (plant.stage === 'harvested') {
    return {
      daysInCurrentStage,
      daysRemainingInStage: 0,
      totalDaysRemaining: 0,
      harvestDate: stageStartDate,
      startDate,
    };
  }

  if (plant.stage === 'flowering') {
    const floweringDays = strain?.floweringDays || STAGE_DAYS.flowering;
    daysRemainingInStage = Math.max(0, floweringDays - daysInCurrentStage);
    totalDaysRemaining = daysRemainingInStage;
  } else if (plant.stage === 'vegetative') {
    const vegDays = strain?.vegDays || STAGE_DAYS.vegetative;
    const floweringDays = strain?.floweringDays || STAGE_DAYS.flowering;
    daysRemainingInStage = Math.max(0, vegDays - daysInCurrentStage);
    totalDaysRemaining = daysRemainingInStage + floweringDays;
  } else {
    const currentStageDays = STAGE_DAYS[plant.stage];
    daysRemainingInStage = Math.max(0, currentStageDays - daysInCurrentStage);

    totalDaysRemaining = daysRemainingInStage;
    for (let i = currentStageIndex + 1; i < STAGES.length - 1; i++) {
      const stage = STAGES[i];
      if (stage === 'vegetative') {
        totalDaysRemaining += strain?.vegDays || STAGE_DAYS.vegetative;
      } else if (stage === 'flowering') {
        totalDaysRemaining += strain?.floweringDays || STAGE_DAYS.flowering;
      } else {
        totalDaysRemaining += STAGE_DAYS[stage];
      }
    }
  }

  const harvestDate = new Date(today.getTime() + totalDaysRemaining * 24 * 60 * 60 * 1000);

  return {
    daysInCurrentStage,
    daysRemainingInStage,
    totalDaysRemaining,
    harvestDate,
    startDate,
  };
}
