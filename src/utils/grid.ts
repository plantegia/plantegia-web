import type { Point, Space, Plant, PlantSize, Strain, Stage } from '../types';
import { CELL_SIZE, STAGE_DAYS, STAGES } from '../constants';

// Get canvas CSS height (accounting for device pixel ratio)
export function getCanvasCssHeight(canvas: HTMLCanvasElement): number {
  const dpr = window.devicePixelRatio || 1;
  return canvas.height / dpr;
}

// Get stage duration for a plant, considering customStageDays override
export function getStageDuration(
  stage: Stage,
  plant: Plant | null,
  strain: Strain | undefined
): number {
  // Check plant's custom override first
  if (plant?.customStageDays?.[stage] !== undefined) {
    return plant.customStageDays[stage]!;
  }
  // Then strain-specific durations for veg/flowering
  if (stage === 'vegetative' && strain?.vegDays) {
    return strain.vegDays;
  }
  if (stage === 'flowering' && strain?.floweringDays) {
    return strain.floweringDays;
  }
  // Default durations
  return STAGE_DAYS[stage];
}

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

export type SpaceEdge = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se' | 'body';

export function findSpaceEdgeAt(
  worldPos: Point,
  space: Space,
  threshold: number = 15
): SpaceEdge | null {
  const x1 = space.originX;
  const y1 = space.originY;
  const x2 = x1 + space.gridWidth * CELL_SIZE;
  const y2 = y1 + space.gridHeight * CELL_SIZE;

  // Check if point is within the space bounds (with threshold)
  const withinX = worldPos.x >= x1 - threshold && worldPos.x <= x2 + threshold;
  const withinY = worldPos.y >= y1 - threshold && worldPos.y <= y2 + threshold;
  if (!withinX || !withinY) return null;

  const nearLeft = Math.abs(worldPos.x - x1) < threshold;
  const nearRight = Math.abs(worldPos.x - x2) < threshold;
  const nearTop = Math.abs(worldPos.y - y1) < threshold;
  const nearBottom = Math.abs(worldPos.y - y2) < threshold;

  // Check corners first (higher priority)
  if (nearTop && nearLeft) return 'nw';
  if (nearTop && nearRight) return 'ne';
  if (nearBottom && nearLeft) return 'sw';
  if (nearBottom && nearRight) return 'se';

  // Check edges
  if (nearTop && worldPos.x > x1 && worldPos.x < x2) return 'n';
  if (nearBottom && worldPos.x > x1 && worldPos.x < x2) return 's';
  if (nearLeft && worldPos.y > y1 && worldPos.y < y2) return 'w';
  if (nearRight && worldPos.y > y1 && worldPos.y < y2) return 'e';

  // Check if inside body
  if (worldPos.x > x1 && worldPos.x < x2 && worldPos.y > y1 && worldPos.y < y2) return 'body';

  return null;
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

// Get the end coordinates (exclusive) of a plant's bounding box
export function getPlantBounds(plant: Pick<Plant, 'gridX' | 'gridY' | 'size'>): { endX: number; endY: number } {
  const { gridX, gridY, size } = plant;
  return {
    endX: gridX + (size === 4 || size === 2 ? 2 : 1),
    endY: gridY + (size === 4 ? 2 : 1),
  };
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

// Time View constants (must match renderers.ts)
export const TIME_VIEW_CONSTANTS = {
  dayHeight: 8,
  weekHeight: 56, // 7 days
  columnWidth: 60,
  headerHeight: 40,
  leftMargin: 50,
};

export interface TimelineSegment {
  stage: Stage;
  startDay: number; // negative = past, positive = future (relative to today)
  endDay: number;
}

// Build timeline segments for a plant - single source of truth for timeline calculation
export function buildPlantTimelineSegments(
  plant: Plant,
  strain: Strain | undefined,
  today: Date = new Date()
): TimelineSegment[] {
  const startDate = new Date(plant.startedAt);
  const daysFromStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentStageIndex = STAGES.indexOf(plant.stage);
  const segments: TimelineSegment[] = [];

  if (daysFromStart >= 0) {
    // Plant has started
    const stageStartDate = new Date(plant.stageStartedAt || plant.startedAt);
    const daysInCurrentStage = Math.max(0, Math.floor((today.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate total past days
    let totalPastDays = 0;
    for (let i = 0; i < currentStageIndex; i++) {
      totalPastDays += getStageDuration(STAGES[i], plant, strain);
    }
    totalPastDays += daysInCurrentStage;

    // Build past segments (negative days = below TODAY line)
    let pastDayCounter = -totalPastDays;
    for (let i = 0; i < currentStageIndex; i++) {
      const stage = STAGES[i];
      const stageDuration = getStageDuration(stage, plant, strain);
      segments.push({ stage, startDay: pastDayCounter, endDay: pastDayCounter + stageDuration });
      pastDayCounter += stageDuration;
    }
    // Current stage past portion (from stage start to today)
    if (daysInCurrentStage > 0) {
      segments.push({ stage: plant.stage, startDay: pastDayCounter, endDay: 0 });
    }

    // Future: from today onwards
    const timeline = calculatePlantTimeline(plant, strain, today);
    let futureDayCounter = 0;
    const remainingInCurrentStage = timeline.daysRemainingInStage;
    if (remainingInCurrentStage > 0 && plant.stage !== 'harvested') {
      segments.push({ stage: plant.stage, startDay: 0, endDay: remainingInCurrentStage });
      futureDayCounter = remainingInCurrentStage;
    }
    for (let i = currentStageIndex + 1; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const stageDuration = getStageDuration(stage, plant, strain);
      segments.push({ stage, startDay: futureDayCounter, endDay: futureDayCounter + stageDuration });
      futureDayCounter += stageDuration;
    }
  } else {
    // Plant starts in the future
    const daysUntilStart = Math.abs(daysFromStart);
    let dayCounter = daysUntilStart;
    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const stageDuration = getStageDuration(stage, plant, strain);
      segments.push({ stage, startDay: dayCounter, endDay: dayCounter + stageDuration });
      dayCounter += stageDuration;
    }
  }

  return segments;
}

// Build list of all cells for Time View
export function buildTimeViewCells(spaces: Space[], plants: Plant[]): {
  spaceId: string;
  spaceName: string;
  gridX: number;
  gridY: number;
  plant: Plant | null;
}[] {
  const allCells: { spaceId: string; spaceName: string; gridX: number; gridY: number; plant: Plant | null }[] = [];
  spaces.forEach((space) => {
    for (let y = 0; y < space.gridHeight; y++) {
      for (let x = 0; x < space.gridWidth; x++) {
        const plant = plants.find(
          (p) => p.spaceId === space.id && p.gridX === x && p.gridY === y
        ) || null;
        allCells.push({
          spaceId: space.id,
          spaceName: space.name,
          gridX: x,
          gridY: y,
          plant,
        });
      }
    }
  });
  return allCells;
}

// Find plant at screen position in Time View
export function findPlantAtTimeView(
  screenX: number,
  screenY: number,
  canvasHeight: number,
  timelineOffset: number,
  horizontalOffset: number,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[]
): Plant | null {
  const { dayHeight, columnWidth, headerHeight, leftMargin } = TIME_VIEW_CONSTANTS;
  const todayY = canvasHeight / 2 - timelineOffset;
  const today = new Date();

  const allCells = buildTimeViewCells(spaces, plants);
  const columnIndex = Math.floor((screenX - leftMargin - horizontalOffset) / columnWidth);

  if (columnIndex < 0 || columnIndex >= allCells.length) return null;

  const cell = allCells[columnIndex];
  if (!cell.plant) return null;

  // Calculate plant's Y range on timeline
  const plant = cell.plant;
  const strain = strains.find(s => s.id === plant.strainId);
  const startDate = new Date(plant.startedAt);
  const daysFromStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const currentStageIndex = STAGES.indexOf(plant.stage);

  // Calculate total plant duration (including all stages)
  let totalDuration = 0;
  for (let i = 0; i < STAGES.length; i++) {
    totalDuration += getStageDuration(STAGES[i], plant, strain);
  }

  let plantTopY: number;
  let plantBottomY: number;

  if (daysFromStart >= 0) {
    // Plant has started
    const stageStartDate = new Date(plant.stageStartedAt || plant.startedAt);
    const daysInCurrentStage = Math.max(0, Math.floor((today.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate past days
    let totalPastDays = 0;
    for (let i = 0; i < currentStageIndex; i++) {
      totalPastDays += getStageDuration(STAGES[i], plant, strain);
    }
    totalPastDays += daysInCurrentStage;

    // Calculate future days
    let totalFutureDays = 0;
    const currentStageDays = getStageDuration(plant.stage, plant, strain);
    const remainingInCurrentStage = Math.max(0, currentStageDays - daysInCurrentStage);
    totalFutureDays += remainingInCurrentStage;
    for (let i = currentStageIndex + 1; i < STAGES.length; i++) {
      totalFutureDays += getStageDuration(STAGES[i], plant, strain);
    }

    plantTopY = todayY - totalFutureDays * dayHeight;
    plantBottomY = todayY + totalPastDays * dayHeight;
  } else {
    // Plant starts in the future
    const daysUntilStart = Math.abs(daysFromStart);
    plantTopY = todayY - (daysUntilStart + totalDuration) * dayHeight;
    plantBottomY = todayY - daysUntilStart * dayHeight;
  }

  // Check if click is within plant's column and Y range
  const clickX = screenX - leftMargin - horizontalOffset - columnIndex * columnWidth;
  if (clickX < 2 || clickX > columnWidth - 2) return null;
  if (screenY < plantTopY || screenY > plantBottomY) return null;

  return plant;
}

// Get stage boundary Y positions for a plant in Time View
export function getPlantStageHandles(
  plant: Plant,
  strain: Strain | undefined,
  canvasHeight: number,
  timelineOffset: number
): { stage: Stage; y: number }[] {
  const { dayHeight } = TIME_VIEW_CONSTANTS;
  const todayY = canvasHeight / 2 - timelineOffset;

  // Use shared function to build segments
  const segments = buildPlantTimelineSegments(plant, strain);

  // Convert segments to drawn segments with Y positions
  const drawnSegments: { stage: Stage; topY: number }[] = [];
  segments.forEach((seg) => {
    const segTopY = todayY - seg.endDay * dayHeight;
    const segBottomY = todayY - seg.startDay * dayHeight;
    const segHeight = segBottomY - segTopY;
    if (segHeight > 0) {
      drawnSegments.push({ stage: seg.stage, topY: segTopY });
    }
  });

  // Handles are at topY of segments where idx > 0 and topY < todayY (future)
  // Only for editable stages (not germinating or harvested - they are fixed at 1 week)
  // When dragging a handle UP, we extend the stage BELOW the handle (the current segment)
  // When dragging DOWN, we shrink the stage BELOW the handle
  const handles: { stage: Stage; y: number }[] = [];
  drawnSegments.forEach((seg, idx) => {
    const isEditableStage = seg.stage !== 'germinating' && seg.stage !== 'harvested';
    if (seg.topY < todayY && idx > 0 && isEditableStage) {
      // The handle is at the TOP of this segment
      // Dragging changes THIS segment's stage duration (seg.stage)
      handles.push({ stage: seg.stage, y: seg.topY });
    }
  });

  return handles;
}

// Check if a point is near a stage handle
export function findStageHandleAt(
  screenX: number,
  screenY: number,
  plant: Plant,
  columnX: number,
  strain: Strain | undefined,
  canvasHeight: number,
  timelineOffset: number
): Stage | null {
  const { columnWidth } = TIME_VIEW_CONSTANTS;
  const handleThreshold = 15; // Generous threshold for easier clicking

  // Check X is within column
  if (screenX < columnX || screenX > columnX + columnWidth) return null;

  const handles = getPlantStageHandles(plant, strain, canvasHeight, timelineOffset);

  for (const handle of handles) {
    if (Math.abs(screenY - handle.y) < handleThreshold) {
      return handle.stage;
    }
  }

  return null;
}

// Get column index at screen position in Time View
export function getTimeViewColumnAt(
  screenX: number,
  horizontalOffset: number,
  spaces: Space[],
  plants: Plant[]
): { columnIndex: number; cell: ReturnType<typeof buildTimeViewCells>[0] } | null {
  const { columnWidth, leftMargin } = TIME_VIEW_CONSTANTS;
  const allCells = buildTimeViewCells(spaces, plants);
  const columnIndex = Math.floor((screenX - leftMargin - horizontalOffset) / columnWidth);

  if (columnIndex < 0 || columnIndex >= allCells.length) return null;

  return { columnIndex, cell: allCells[columnIndex] };
}

// Convert Y position to days from today in Time View
export function screenYToDays(
  screenY: number,
  canvasHeight: number,
  timelineOffset: number
): number {
  const { dayHeight } = TIME_VIEW_CONSTANTS;
  const todayY = canvasHeight / 2 - timelineOffset;
  return Math.round((todayY - screenY) / dayHeight);
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

  const currentStageDays = getStageDuration(plant.stage, plant, strain);
  daysRemainingInStage = Math.max(0, currentStageDays - daysInCurrentStage);
  totalDaysRemaining = daysRemainingInStage;

  // Add remaining stages duration
  for (let i = currentStageIndex + 1; i < STAGES.length - 1; i++) {
    const stage = STAGES[i];
    totalDaysRemaining += getStageDuration(stage, plant, strain);
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
