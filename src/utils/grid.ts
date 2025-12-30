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
    const space = plant.spaceId ? spaces.find(s => s.id === plant.spaceId) : null;
    const cells = getPlantCells(plant);

    for (const cell of cells) {
      let cellX: number;
      let cellY: number;

      if (space) {
        // Plant attached to a space
        cellX = space.originX + cell.gridX * CELL_SIZE;
        cellY = space.originY + cell.gridY * CELL_SIZE;
      } else {
        // Floating plant - gridX/gridY are world coordinates
        cellX = cell.gridX * CELL_SIZE;
        cellY = cell.gridY * CELL_SIZE;
      }

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

// Time View constants - horizontal timeline (X = dates, Y = slots)
export const TIME_VIEW_CONSTANTS = {
  // X-axis (dates)
  dayWidth: 4,            // pixels per day
  weekWidth: 28,          // 7 * 4 = 28px per week

  // Y-axis (slots)
  slotHeight: 32,         // height per slot row
  spaceHeaderHeight: 24,  // space name header

  // Margins
  leftMargin: 100,        // space for slot labels
  topMargin: 40,          // space for date labels

  // Segments
  segmentHeight: 24,      // visual height of segment bar
  segmentGap: 4,          // vertical padding within slot
  handleWidth: 8,         // resize handle width
  splitGap: 8,            // horizontal gap between split segments (px)
  zigzagSize: 4,          // zigzag teeth size
  mergeButtonSize: 14,    // size of merge (X) button

  // Rendering limits
  maxVisibleWidth: 2000,  // max width for segment clipping (px)
};

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

// ============================================
// New horizontal Time View utilities
// ============================================

export interface SlotInfo {
  spaceId: string | null;  // null = floating slot
  spaceName: string;
  gridX: number;
  gridY: number;
  yOffset: number;  // pixel offset from top (after topMargin)
  isSpaceHeader?: boolean;
}

// Build slot list for Y-axis (grouped by space)
export function buildSlotList(spaces: Space[], plants?: Plant[]): SlotInfo[] {
  const { slotHeight, spaceHeaderHeight } = TIME_VIEW_CONSTANTS;
  const slots: SlotInfo[] = [];
  let yOffset = 0;

  spaces.forEach((space) => {
    // Add space header
    slots.push({
      spaceId: space.id,
      spaceName: space.name,
      gridX: -1,
      gridY: -1,
      yOffset,
      isSpaceHeader: true,
    });
    yOffset += spaceHeaderHeight;

    // Add cell slots
    for (let y = 0; y < space.gridHeight; y++) {
      for (let x = 0; x < space.gridWidth; x++) {
        slots.push({
          spaceId: space.id,
          spaceName: space.name,
          gridX: x,
          gridY: y,
          yOffset,
        });
        yOffset += slotHeight;
      }
    }
  });

  // Add floating section for plants/segments without spaceId
  if (plants) {
    // Collect unique floating positions from segments
    const floatingPositions = new Set<string>();
    plants.forEach((plant) => {
      plant.segments?.forEach((segment) => {
        if (segment.spaceId === null) {
          floatingPositions.add(`${segment.gridX},${segment.gridY}`);
        }
      });
      // Also check plant's backward-compat spaceId
      if (plant.spaceId === null) {
        floatingPositions.add(`${plant.gridX},${plant.gridY}`);
      }
    });

    if (floatingPositions.size > 0) {
      // Add floating header
      slots.push({
        spaceId: null,
        spaceName: '—',
        gridX: -1,
        gridY: -1,
        yOffset,
        isSpaceHeader: true,
      });
      yOffset += spaceHeaderHeight;

      // Add floating slots
      const sortedPositions = Array.from(floatingPositions)
        .map((pos) => {
          const [x, y] = pos.split(',').map(Number);
          return { gridX: x, gridY: y };
        })
        .sort((a, b) => a.gridY - b.gridY || a.gridX - b.gridX);

      sortedPositions.forEach(({ gridX, gridY }) => {
        slots.push({
          spaceId: null,
          spaceName: '—',
          gridX,
          gridY,
          yOffset,
        });
        yOffset += slotHeight;
      });
    }
  }

  return slots;
}

// Convert date to days from today
export function dateToDays(date: Date, today: Date = new Date()): number {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

// Convert screen X to date
export function screenXToDate(screenX: number, panX: number, today: Date = new Date()): Date {
  const { dayWidth, leftMargin } = TIME_VIEW_CONSTANTS;
  const daysFromToday = Math.floor((screenX - leftMargin - panX) / dayWidth);
  const result = new Date(today);
  result.setDate(result.getDate() + daysFromToday);
  return result;
}

// Convert date to screen X
export function dateToScreenX(date: Date, panX: number, today: Date = new Date()): number {
  const { dayWidth, leftMargin } = TIME_VIEW_CONSTANTS;
  const days = dateToDays(date, today);
  return leftMargin + panX + days * dayWidth;
}

// Get plant's total lifecycle duration in days
export function getPlantTotalDays(plant: Plant, strain: Strain | undefined): number {
  let total = 0;
  for (const stage of STAGES) {
    total += getStageDuration(stage, plant, strain);
  }
  return total;
}

// Get plant end date (harvest end)
export function getPlantEndDate(plant: Plant, strain: Strain | undefined): Date {
  const startDate = new Date(plant.startedAt);
  const totalDays = getPlantTotalDays(plant, strain);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays);
  return endDate;
}

// Get total plant duration from strain defaults (for preview before plant exists)
export function getPlantDurationFromStrain(strain: Strain | undefined): number {
  let total = 0;
  for (const stage of STAGES) {
    if (stage === 'vegetative' && strain?.vegDays) {
      total += strain.vegDays;
    } else if (stage === 'flowering' && strain?.floweringDays) {
      total += strain.floweringDays;
    } else {
      total += STAGE_DAYS[stage];
    }
  }
  return total;
}

// Check if a new plant can be placed at a slot/time without conflicts
// Unlike canPlacePlant, this checks segment time overlaps for Time View placement
export function canPlacePlantAtTime(
  spaceId: string,
  gridX: number,
  gridY: number,
  startDate: Date,
  durationDays: number,
  plants: Plant[],
  strains: Strain[]
): boolean {
  const newEndDate = new Date(startDate);
  newEndDate.setDate(newEndDate.getDate() + durationDays);

  // Check all plants for segment conflicts at this slot
  for (const plant of plants) {
    if (!plant.segments) continue;

    const strain = strains.find(s => s.id === plant.strainId);
    const plantEndDate = getPlantEndDate(plant, strain);

    for (const segment of plant.segments) {
      // Check if segment is in the same slot
      if (segment.spaceId !== spaceId || segment.gridX !== gridX || segment.gridY !== gridY) {
        continue;
      }

      // Get segment time range
      const segStartDate = new Date(segment.startDate);
      const segEndDate = segment.endDate ? new Date(segment.endDate) : plantEndDate;

      // Check time overlap
      if (startDate < segEndDate && newEndDate > segStartDate) {
        return false; // Conflict found
      }
    }
  }

  return true;
}

// Get stage at a specific date for a plant
export function getStageAtDate(plant: Plant, strain: Strain | undefined, date: Date): Stage {
  const startDate = new Date(plant.startedAt);
  const daysFromStart = dateToDays(date, startDate);

  if (daysFromStart < 0) {
    return 'germinating'; // Before plant started
  }

  let dayCounter = 0;
  for (const stage of STAGES) {
    const stageDuration = getStageDuration(stage, plant, strain);
    if (daysFromStart < dayCounter + stageDuration) {
      return stage;
    }
    dayCounter += stageDuration;
  }

  return 'harvested';
}

// Editable stages (germinating and harvested are fixed)
export const EDITABLE_STAGES: Stage[] = ['seedling', 'vegetative', 'flowering'];

export type SegmentHitZone = 'stage-handle' | 'body' | 'merge-button';

export interface SegmentHitResult {
  plant: Plant;
  segmentId: string;
  hitZone: SegmentHitZone;
  stage?: Stage; // Which stage's end boundary was hit (for stage-handle)
  segmentIndex?: number; // Index of segment (for merge operations)
}

// Find segment at screen position in new horizontal Time View
export function findSegmentAtHorizontal(
  screenX: number,
  screenY: number,
  plants: Plant[],
  strains: Strain[],
  spaces: Space[],
  panX: number,
  panY: number,
  today: Date = new Date()
): SegmentHitResult | null {
  const { topMargin, handleWidth, segmentHeight, segmentGap } = TIME_VIEW_CONSTANTS;
  const slots = buildSlotList(spaces, plants);

  for (const plant of plants) {
    if (!plant.segments) continue;
    const strain = strains.find((s) => s.id === plant.strainId);
    const plantEndDate = getPlantEndDate(plant, strain);
    const plantStartDate = new Date(plant.startedAt);

    for (const segment of plant.segments) {
      // Find slot for this segment
      const slot = slots.find(
        (s) => !s.isSpaceHeader && s.spaceId === segment.spaceId && s.gridX === segment.gridX && s.gridY === segment.gridY
      );
      if (!slot) continue;

      // Calculate segment X bounds
      const segStartDate = new Date(segment.startDate);
      const segEndDate = segment.endDate ? new Date(segment.endDate) : plantEndDate;

      const x1 = dateToScreenX(segStartDate, panX, today);
      const x2 = dateToScreenX(segEndDate, panX, today);
      const y = topMargin + slot.yOffset - panY + segmentGap;

      // Check if point is in segment bounds
      if (screenX >= x1 && screenX <= x2 && screenY >= y && screenY <= y + segmentHeight) {
        // Check for stage boundary handles first
        let stageDayCounter = 0;
        for (const stage of STAGES) {
          const stageDuration = getStageDuration(stage, plant, strain);
          stageDayCounter += stageDuration;

          if (EDITABLE_STAGES.includes(stage)) {
            const stageEndDate = new Date(plantStartDate);
            stageEndDate.setDate(stageEndDate.getDate() + stageDayCounter);

            // Check if this boundary is within the segment
            if (stageEndDate > segStartDate && stageEndDate < segEndDate) {
              const handleX = dateToScreenX(stageEndDate, panX, today);

              // Check if click is on the handle
              if (Math.abs(screenX - handleX) < handleWidth) {
                return { plant, segmentId: segment.id, hitZone: 'stage-handle', stage };
              }
            }
          }
        }

        // Not on a handle, return body
        return { plant, segmentId: segment.id, hitZone: 'body' };
      }
    }
  }

  return null;
}

// Find merge button at screen position
export interface MergeButtonHitResult {
  plantId: string;
  segmentIndex: number;
}

export function findMergeButtonAt(
  screenX: number,
  screenY: number,
  plants: Plant[],
  spaces: Space[],
  panX: number,
  panY: number,
  today: Date = new Date()
): MergeButtonHitResult | null {
  const { topMargin, segmentHeight, segmentGap, mergeButtonSize } = TIME_VIEW_CONSTANTS;
  const slots = buildSlotList(spaces, plants);

  for (const plant of plants) {
    if (!plant.segments || plant.segments.length < 2) continue;

    for (let i = 0; i < plant.segments.length - 1; i++) {
      const seg1 = plant.segments[i];
      const seg2 = plant.segments[i + 1];

      // Only check if segments are in the same slot
      if (seg1.spaceId !== seg2.spaceId || seg1.gridX !== seg2.gridX || seg1.gridY !== seg2.gridY) {
        continue;
      }

      const slot = slots.find(
        (s) => !s.isSpaceHeader && s.spaceId === seg1.spaceId && s.gridX === seg1.gridX && s.gridY === seg1.gridY
      );
      if (!slot) continue;

      const splitDate = new Date(seg2.startDate);
      const splitX = dateToScreenX(splitDate, panX, today);
      const y = topMargin + slot.yOffset - panY + segmentGap;
      const buttonCenterY = y + segmentHeight / 2;

      // Check if click is within the merge button circle
      const dx = screenX - splitX;
      const dy = screenY - buttonCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= mergeButtonSize / 2) {
        return { plantId: plant.id, segmentIndex: i };
      }
    }
  }

  return null;
}

// Find slot at screen Y position
export function findSlotAtY(
  screenY: number,
  panY: number,
  spaces: Space[],
  plants?: Plant[]
): SlotInfo | null {
  const { topMargin, slotHeight, spaceHeaderHeight } = TIME_VIEW_CONSTANTS;
  const slots = buildSlotList(spaces, plants);
  const adjustedY = screenY - topMargin + panY;

  // Find the slot where adjustedY falls within its bounds
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const height = slot.isSpaceHeader ? spaceHeaderHeight : slotHeight;

    if (adjustedY >= slot.yOffset && adjustedY < slot.yOffset + height) {
      // Found the slot, but skip if it's a header
      if (slot.isSpaceHeader) return null;
      return slot;
    }
  }

  return null;
}
