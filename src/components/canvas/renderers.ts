import type { Space, Plant, Strain, Stage, PlantSegment, TimeViewPlacementPreview, PlantDragPreview, LongPressPreview } from '../../types';
import { COLORS, STAGE_COLORS, CELL_SIZE, SPACE_COLORS, STAGE_ABBREV, SPACE_HANDLE_SIZE, STAGES } from '../../constants';
import {
  getPlantCells,
  TIME_VIEW_CONSTANTS,
  buildSlotList,
  dateToScreenX,
  screenXToDate,
  getPlantEndDate,
  getStageDuration,
  SlotInfo,
} from '../../utils/grid';
import { getCurrentSegment } from '../../utils/migration';

export function renderSpaceView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  selection: { type: 'space' | 'plant'; id: string } | null,
  dragPreview: { startX: number; startY: number; endX: number; endY: number } | null,
  placementPreview: { worldX: number; worldY: number; canPlace: boolean; abbreviation: string } | null,
  plantDragPreview: PlantDragPreview | null
) {
  // First pass: draw space backgrounds and grids
  spaces.forEach((space, index) => {
    drawSpace(ctx, space, selection?.type === 'space' && selection.id === space.id, index);
  });

  // Second pass: draw space labels on top (so they're not covered by other spaces)
  spaces.forEach((space) => {
    drawSpaceLabel(ctx, space, spaces);
  });

  const today = new Date();
  plants.forEach((plant) => {
    // Get the segment active at current date
    const currentSegment = getCurrentSegment(plant, today);
    if (!currentSegment) return;

    // Check if plant lifecycle has ended (past harvest stage)
    const strain = strains.find((s) => s.id === plant.strainId);
    const plantEndDate = getPlantEndDate(plant, strain);
    if (today > plantEndDate) return;

    // Check if plant hasn't started yet
    const plantStartDate = new Date(plant.startedAt);
    if (today < plantStartDate) return;

    const isSelected = selection?.type === 'plant' && selection.id === plant.id;

    // Find the space for the current segment
    const space = currentSegment.spaceId ? spaces.find((s) => s.id === currentSegment.spaceId) : null;
    if (space) {
      drawPlant(ctx, plant, space, isSelected, currentSegment);
    } else if (currentSegment.spaceId === null) {
      // Draw floating plant (not attached to any space)
      drawFloatingPlant(ctx, plant, isSelected, currentSegment);
    }
  });

  if (dragPreview) {
    drawDragPreview(ctx, dragPreview);
  }

  if (placementPreview) {
    drawPlacementPreview(ctx, placementPreview);
  }

  if (plantDragPreview) {
    drawPlantDragPreview(ctx, plantDragPreview);
  }
}

// Export background grid renderer separately so it can be called before transform
export function renderBackgroundGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  pan: { x: number; y: number },
  zoom: number
) {
  const scaledCellSize = CELL_SIZE * zoom;

  // Calculate grid offset based on pan
  const offsetX = ((pan.x % scaledCellSize) + scaledCellSize) % scaledCellSize;
  const offsetY = ((pan.y % scaledCellSize) + scaledCellSize) % scaledCellSize;

  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  // Vertical lines
  for (let x = offsetX; x <= canvasWidth; x += scaledCellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = offsetY; y <= canvasHeight; y += scaledCellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawSpace(ctx: CanvasRenderingContext2D, space: Space, isSelected: boolean, spaceIndex: number) {
  const { originX, originY, gridWidth, gridHeight, color } = space;
  const width = gridWidth * CELL_SIZE;
  const height = gridHeight * CELL_SIZE;

  // Fill empty cells with dark background first
  ctx.fillStyle = COLORS.backgroundDark;
  ctx.fillRect(originX, originY, width, height);

  // Use space's color or fallback to palette by index - will be drawn for plant cells later
  const spaceColor = color || SPACE_COLORS[spaceIndex % SPACE_COLORS.length];
  ctx.fillStyle = spaceColor;
  // Only draw border area slightly colored to indicate space bounds
  ctx.globalAlpha = 0.3;
  ctx.fillRect(originX, originY, width, height);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  for (let x = 0; x <= gridWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(originX + x * CELL_SIZE, originY);
    ctx.lineTo(originX + x * CELL_SIZE, originY + height);
    ctx.stroke();
  }
  for (let y = 0; y <= gridHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(originX, originY + y * CELL_SIZE);
    ctx.lineTo(originX + width, originY + y * CELL_SIZE);
    ctx.stroke();
  }

  if (isSelected) {
    ctx.strokeStyle = COLORS.teal;
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2;
  }
  ctx.strokeRect(originX, originY, width, height);

  // Draw resize handles when selected
  if (isSelected) {
    const corners = [
      { x: originX, y: originY },                    // nw
      { x: originX + width, y: originY },            // ne
      { x: originX, y: originY + height },           // sw
      { x: originX + width, y: originY + height },   // se
    ];

    ctx.fillStyle = COLORS.teal;
    corners.forEach(corner => {
      ctx.fillRect(
        corner.x - SPACE_HANDLE_SIZE / 2,
        corner.y - SPACE_HANDLE_SIZE / 2,
        SPACE_HANDLE_SIZE,
        SPACE_HANDLE_SIZE
      );
    });

    // Draw edge handles (midpoints)
    const edgeHandles = [
      { x: originX + width / 2, y: originY },                // n
      { x: originX + width / 2, y: originY + height },       // s
      { x: originX, y: originY + height / 2 },               // w
      { x: originX + width, y: originY + height / 2 },       // e
    ];

    ctx.fillStyle = COLORS.teal;
    edgeHandles.forEach(handle => {
      ctx.fillRect(
        handle.x - SPACE_HANDLE_SIZE / 2,
        handle.y - SPACE_HANDLE_SIZE / 2,
        SPACE_HANDLE_SIZE,
        SPACE_HANDLE_SIZE
      );
    });
  }
}

function drawSpaceLabel(ctx: CanvasRenderingContext2D, space: Space, allSpaces: Space[]) {
  const { originX, originY, gridWidth, gridHeight, name } = space;
  const width = gridWidth * CELL_SIZE;
  const height = gridHeight * CELL_SIZE;
  const labelHeight = 14;
  const padding = 4;

  // Check which sides are free (not overlapping with other spaces)
  const checkOverlap = (x: number, y: number, w: number, h: number): boolean => {
    return allSpaces.some(other => {
      if (other.id === space.id) return false;
      const otherX = other.originX;
      const otherY = other.originY;
      const otherW = other.gridWidth * CELL_SIZE;
      const otherH = other.gridHeight * CELL_SIZE;
      return !(x + w <= otherX || x >= otherX + otherW || y + h <= otherY || y >= otherY + otherH);
    });
  };

  // Try positions: top, bottom, left, right
  type Position = { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline; maxWidth: number };
  const positions: Position[] = [
    // Top (above space)
    { x: originX + padding, y: originY - padding, align: 'left', baseline: 'bottom', maxWidth: width - padding * 2 },
    // Bottom (below space)
    { x: originX + padding, y: originY + height + padding, align: 'left', baseline: 'top', maxWidth: width - padding * 2 },
    // Left (to the left of space)
    { x: originX - padding, y: originY + padding, align: 'right', baseline: 'top', maxWidth: 100 },
    // Right (to the right of space)
    { x: originX + width + padding, y: originY + padding, align: 'left', baseline: 'top', maxWidth: 100 },
  ];

  // Check areas for each position
  const labelAreas = [
    { x: originX, y: originY - labelHeight - padding, w: width, h: labelHeight + padding }, // top
    { x: originX, y: originY + height, w: width, h: labelHeight + padding }, // bottom
    { x: originX - 100 - padding, y: originY, w: 100 + padding, h: labelHeight }, // left
    { x: originX + width, y: originY, w: 100 + padding, h: labelHeight }, // right
  ];

  // Find first free position
  let chosenPosition: Position | null = null;
  for (let i = 0; i < positions.length; i++) {
    if (!checkOverlap(labelAreas[i].x, labelAreas[i].y, labelAreas[i].w, labelAreas[i].h)) {
      chosenPosition = positions[i];
      break;
    }
  }

  // If all sides are occupied, don't show label
  if (!chosenPosition) return;

  ctx.font = '10px "Space Mono", monospace';
  ctx.textAlign = chosenPosition.align;
  ctx.textBaseline = chosenPosition.baseline;

  // Truncate name if too long
  let displayName = name.toUpperCase();
  let textWidth = ctx.measureText(displayName).width;

  if (textWidth > chosenPosition.maxWidth) {
    while (textWidth > chosenPosition.maxWidth - 10 && displayName.length > 1) {
      displayName = displayName.slice(0, -1);
      textWidth = ctx.measureText(displayName + '…').width;
    }
    displayName += '…';
  }

  ctx.fillStyle = COLORS.text;
  ctx.globalAlpha = 0.7;
  ctx.fillText(displayName, chosenPosition.x, chosenPosition.y);
  ctx.globalAlpha = 1;
}

// Common plant drawing logic
function drawPlantBox(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  x: number,
  y: number,
  width: number,
  height: number,
  isSelected: boolean,
  isFloating: boolean
) {
  // Dark semi-transparent backdrop for depth effect
  ctx.fillStyle = COLORS.background;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  ctx.globalAlpha = 1;

  // Plant color on top
  ctx.fillStyle = STAGE_COLORS[plant.stage];
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

  // Border
  if (isFloating) {
    // Dashed border for floating plants
    ctx.strokeStyle = isSelected ? COLORS.teal : COLORS.textMuted;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    ctx.setLineDash([]);
  } else if (isSelected) {
    ctx.strokeStyle = COLORS.teal;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  // Plant code label
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plant.code, x + width / 2, y + height / 2);
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  space: Space,
  isSelected: boolean,
  segment?: PlantSegment
) {
  const gridX = segment?.gridX ?? plant.gridX;
  const gridY = segment?.gridY ?? plant.gridY;
  const cells = getPlantCells({ ...plant, gridX, gridY });
  const minGridX = Math.min(...cells.map((c) => c.gridX));
  const minGridY = Math.min(...cells.map((c) => c.gridY));
  const maxGridX = Math.max(...cells.map((c) => c.gridX));
  const maxGridY = Math.max(...cells.map((c) => c.gridY));

  const x = space.originX + minGridX * CELL_SIZE;
  const y = space.originY + minGridY * CELL_SIZE;
  const width = (maxGridX - minGridX + 1) * CELL_SIZE;
  const height = (maxGridY - minGridY + 1) * CELL_SIZE;

  drawPlantBox(ctx, plant, x, y, width, height, isSelected, false);
}

// Draw a floating plant (not attached to any space) using world coordinates
function drawFloatingPlant(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  isSelected: boolean,
  segment: PlantSegment
) {
  const cells = getPlantCells({ ...plant, gridX: segment.gridX, gridY: segment.gridY });
  const minGridX = Math.min(...cells.map((c) => c.gridX));
  const minGridY = Math.min(...cells.map((c) => c.gridY));
  const maxGridX = Math.max(...cells.map((c) => c.gridX));
  const maxGridY = Math.max(...cells.map((c) => c.gridY));

  const x = minGridX * CELL_SIZE;
  const y = minGridY * CELL_SIZE;
  const width = (maxGridX - minGridX + 1) * CELL_SIZE;
  const height = (maxGridY - minGridY + 1) * CELL_SIZE;

  drawPlantBox(ctx, plant, x, y, width, height, isSelected, true);
}

function drawDragPreview(
  ctx: CanvasRenderingContext2D,
  preview: { startX: number; startY: number; endX: number; endY: number }
) {
  const minX = Math.min(preview.startX, preview.endX);
  const minY = Math.min(preview.startY, preview.endY);
  const maxX = Math.max(preview.startX, preview.endX);
  const maxY = Math.max(preview.startY, preview.endY);

  const snappedX = Math.floor(minX / CELL_SIZE) * CELL_SIZE;
  const snappedY = Math.floor(minY / CELL_SIZE) * CELL_SIZE;
  const width = Math.max(CELL_SIZE, Math.ceil((maxX - snappedX) / CELL_SIZE) * CELL_SIZE);
  const height = Math.max(CELL_SIZE, Math.ceil((maxY - snappedY) / CELL_SIZE) * CELL_SIZE);

  ctx.fillStyle = 'rgba(74, 124, 89, 0.3)';
  ctx.fillRect(snappedX, snappedY, width, height);

  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(snappedX, snappedY, width, height);
  ctx.setLineDash([]);
}

function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  preview: { worldX: number; worldY: number; canPlace: boolean; abbreviation: string }
) {
  const x = preview.worldX;
  const y = preview.worldY;
  const size = CELL_SIZE;

  const color = preview.canPlace ? COLORS.green : COLORS.orange;
  const fillAlpha = preview.canPlace ? 0.3 : 0.2;

  // Fill
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fillRect(x, y, size, size);
  ctx.globalAlpha = 1;

  // Dashed border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  ctx.setLineDash([]);

  // Abbreviation in center
  ctx.font = 'bold 14px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(preview.abbreviation, x + size / 2, y + size / 2);
}

function drawPlantDragPreview(
  ctx: CanvasRenderingContext2D,
  preview: PlantDragPreview
) {
  const size = CELL_SIZE;
  const color = preview.canPlace ? COLORS.green : COLORS.orange;

  // Draw ghost at source position (faded)
  ctx.fillStyle = COLORS.teal;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(preview.sourceWorldX, preview.sourceWorldY, size, size);
  ctx.globalAlpha = 1;

  // Draw dashed border at source
  ctx.strokeStyle = COLORS.teal;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(preview.sourceWorldX + 1, preview.sourceWorldY + 1, size - 2, size - 2);
  ctx.setLineDash([]);

  // Draw line connecting source to target
  const srcCenterX = preview.sourceWorldX + size / 2;
  const srcCenterY = preview.sourceWorldY + size / 2;
  const tgtCenterX = preview.targetWorldX + size / 2;
  const tgtCenterY = preview.targetWorldY + size / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(srcCenterX, srcCenterY);
  ctx.lineTo(tgtCenterX, tgtCenterY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw target position preview
  const fillAlpha = preview.canPlace ? 0.4 : 0.25;
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fillRect(preview.targetWorldX, preview.targetWorldY, size, size);
  ctx.globalAlpha = 1;

  // Draw solid border at target
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(preview.targetWorldX + 1, preview.targetWorldY + 1, size - 2, size - 2);

  // Abbreviation at target
  ctx.font = 'bold 14px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(preview.abbreviation, preview.targetWorldX + size / 2, preview.targetWorldY + size / 2);
}

// Draw placement preview for Time View - shows full plant lifecycle timeline as ghost preview
function drawTimeViewPlacementPreview(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  slotY: number,
  leftMargin: number,
  canvasWidth: number,
  canPlace: boolean,
  abbreviation: string,
  strain: Strain | undefined,
  panX: number,
  today: Date,
  zoom: number = 1
) {
  const { segmentHeight, segmentGap } = TIME_VIEW_CONSTANTS;
  const segmentY = slotY + segmentGap;

  // Calculate start date from cursor position
  const startDate = screenXToDate(screenX, panX, today, zoom);

  // Calculate total plant duration using default/strain stage durations
  let totalDays = 0;
  const stageDurations: { stage: Stage; duration: number; startDay: number }[] = [];

  for (const stage of STAGES) {
    const duration = getStageDuration(stage, null, strain);
    stageDurations.push({ stage, duration, startDay: totalDays });
    totalDays += duration;
  }

  // Calculate end X position
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays);
  const endX = dateToScreenX(endDate, panX, today, zoom);

  // Base alpha for ghost preview
  const baseAlpha = canPlace ? 0.6 : 0.4;

  // Draw each stage as colored segment
  for (const { stage, duration, startDay } of stageDurations) {
    const stageStartDate = new Date(startDate);
    stageStartDate.setDate(stageStartDate.getDate() + startDay);
    const stageEndDate = new Date(stageStartDate);
    stageEndDate.setDate(stageEndDate.getDate() + duration);

    const stageX1 = dateToScreenX(stageStartDate, panX, today, zoom);
    const stageX2 = dateToScreenX(stageEndDate, panX, today, zoom);

    // Skip if completely off screen
    if (stageX2 < leftMargin || stageX1 > canvasWidth) continue;

    // Clip to visible area
    const drawX1 = Math.max(stageX1, leftMargin);
    const drawX2 = Math.min(stageX2, canvasWidth);
    const stageWidth = drawX2 - drawX1;

    if (stageWidth <= 0) continue;

    // Draw stage background
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = STAGE_COLORS[stage];
    ctx.fillRect(drawX1, segmentY, stageWidth, segmentHeight);

    // Draw stage label if wide enough
    if (stageWidth > 25) {
      ctx.globalAlpha = baseAlpha * 0.9;
      ctx.fillStyle = stage === 'germinating' ? COLORS.backgroundDark : COLORS.text;
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (stage === 'germinating') {
        // Show abbreviation in germinating stage
        ctx.fillText(abbreviation, drawX1 + stageWidth / 2, segmentY + segmentHeight / 2);
      } else if (stageWidth > 35) {
        // Show stage abbrev + weeks
        const weeks = Math.round(duration / 7);
        ctx.fillText(`${STAGE_ABBREV[stage]} ${weeks}W`, drawX1 + stageWidth / 2, segmentY + segmentHeight / 2);
      } else {
        // Just abbreviation
        ctx.fillText(STAGE_ABBREV[stage], drawX1 + stageWidth / 2, segmentY + segmentHeight / 2);
      }
    }
  }

  ctx.globalAlpha = 1;

  // Draw dashed border around entire preview segment
  const previewX1 = Math.max(screenX, leftMargin);
  const previewWidth = Math.min(endX, canvasWidth) - previewX1;

  if (previewWidth > 0) {
    ctx.strokeStyle = canPlace ? COLORS.green : COLORS.orange;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(previewX1, segmentY, previewWidth, segmentHeight);
    ctx.setLineDash([]);
  }
}

// New horizontal Time View (X = dates, Y = slots)
export function renderTimeView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  canvasWidth: number,
  canvasHeight: number,
  panY: number,
  panX: number = 0,
  zoom: number = 1,
  splitPreview: { x: number; plantId: string; segmentId: string } | null = null,
  timeViewPlacementPreview: TimeViewPlacementPreview | null = null
) {
  const today = new Date();
  const {
    dayWidth: baseDayWidth,
    slotHeight,
    spaceHeaderHeight,
    leftMargin,
    topMargin,
    segmentHeight,
    segmentGap,
  } = TIME_VIEW_CONSTANTS;

  // Apply zoom to horizontal time scale
  const dayWidth = baseDayWidth * zoom;
  const weekWidth = dayWidth * 7;

  // Local helper that includes zoom
  const toScreenX = (date: Date) => dateToScreenX(date, panX, today, zoom);

  // Build slot list
  const slots = buildSlotList(spaces, plants);

  // Draw background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Header offset for fixed header (matches Header component height)
  const headerHeight = 48;

  // Draw week grid lines (vertical)
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.15;

  const weeksToShow = Math.ceil(canvasWidth / weekWidth) + 10;
  const startWeek = Math.floor(-panX / weekWidth) - 5;

  for (let w = startWeek; w < startWeek + weeksToShow; w++) {
    const x = leftMargin + panX + w * weekWidth;
    if (x > leftMargin && x < canvasWidth) {
      ctx.beginPath();
      ctx.moveTo(x, headerHeight + topMargin);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Draw slot row backgrounds and space headers (no coordinate labels)
  ctx.save();
  slots.forEach((slot) => {
    const y = headerHeight + topMargin + slot.yOffset - panY;

    // Skip if off screen
    if (y + slotHeight < headerHeight + topMargin || y > canvasHeight) return;

    if (slot.isSpaceHeader) {
      // Space header row
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, y, canvasWidth, spaceHeaderHeight);

      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(slot.spaceName.toUpperCase(), canvasWidth / 2, y + spaceHeaderHeight / 2);

      // Separator line below header
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + spaceHeaderHeight);
      ctx.lineTo(canvasWidth, y + spaceHeaderHeight);
      ctx.stroke();
    } else {
      // Slot row - alternating background (no coordinate labels, no left margin)
      const isEven = (slot.gridX + slot.gridY) % 2 === 0;
      ctx.fillStyle = isEven ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, y, canvasWidth, slotHeight);

      // Row separator
      ctx.strokeStyle = COLORS.text;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y + slotHeight);
      ctx.lineTo(canvasWidth, y + slotHeight);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();

  // Draw TODAY line (vertical)
  const todayX = toScreenX(today);
  if (todayX > leftMargin && todayX < canvasWidth) {
    ctx.strokeStyle = COLORS.orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(todayX, headerHeight + topMargin);
    ctx.lineTo(todayX, canvasHeight);
    ctx.stroke();

    // TODAY label
    ctx.fillStyle = COLORS.orange;
    ctx.font = '9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY', todayX, headerHeight + topMargin - 6);
  }

  // Draw date labels at top (smart spacing to avoid overlap)
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '9px "Space Mono", monospace';
  ctx.textAlign = 'center';

  const daysToShow = Math.ceil(canvasWidth / dayWidth) + 60;
  const startDay = Math.floor(-panX / dayWidth) - 30;
  const minLabelSpacing = 50; // minimum pixels between labels
  let lastLabelX = -Infinity;

  for (let d = startDay; d < startDay + daysToShow; d += 7) {
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() + d);
    const x = toScreenX(dateObj);

    // Skip if too close to TODAY label
    const tooCloseToToday = Math.abs(x - todayX) < minLabelSpacing;
    if (x > leftMargin && x < canvasWidth && x - lastLabelX >= minLabelSpacing && !tooCloseToToday) {
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const day = dateObj.getDate();
      ctx.fillText(`${day} ${month}`, x, headerHeight + topMargin / 2);
      lastLabelX = x;
    }
  }

  const { splitGap } = TIME_VIEW_CONSTANTS;

  // Draw plant segments
  plants.forEach((plant) => {
    if (!plant.segments || plant.segments.length === 0) return;

    const strain = strains.find((s) => s.id === plant.strainId);
    const plantEndDate = getPlantEndDate(plant, strain);

    // Draw each segment
    plant.segments.forEach((segment, segIdx) => {
      const slot = slots.find(
        (s) => !s.isSpaceHeader && s.spaceId === segment.spaceId && s.gridX === segment.gridX && s.gridY === segment.gridY
      );
      if (!slot) return;

      const segStartDate = new Date(segment.startDate);
      const segEndDate = segment.endDate ? new Date(segment.endDate) : plantEndDate;

      // Check if this segment has a split before/after it
      const hasSplitBefore = segIdx > 0;
      const hasSplitAfter = segIdx < plant.segments.length - 1 && segment.endDate !== null;

      // Apply gap offset for split segments
      let x1 = toScreenX(segStartDate);
      let x2 = toScreenX(segEndDate);

      // Add half-gap to start if there's a split before
      if (hasSplitBefore) {
        x1 += splitGap / 2;
      }
      // Subtract half-gap from end if there's a split after
      if (hasSplitAfter) {
        x2 -= splitGap / 2;
      }

      const y = topMargin + slot.yOffset - panY + segmentGap;

      // Skip if off screen
      if (x2 < leftMargin || x1 > canvasWidth) return;
      if (y + segmentHeight < topMargin || y > canvasHeight) return;

      // Draw segment with stage colors
      drawSegmentWithStages(ctx, plant, strain, segment, x1, x2, y, segmentHeight, today, leftMargin, hasSplitBefore, hasSplitAfter, zoom);

      // Draw zigzag edges for split points
      if (hasSplitBefore && x1 > leftMargin) {
        drawZigzagEdge(ctx, x1, y, segmentHeight, 'right', COLORS.background);
      }
      if (hasSplitAfter && x2 > leftMargin && x2 < canvasWidth) {
        drawZigzagEdge(ctx, x2, y, segmentHeight, 'left', COLORS.background);
      }
    });
  });

  // Draw conflict highlights for overlapping segments in the same slot
  type SegmentInfo = {
    plantId: string;
    segmentId: string;
    startDate: Date;
    endDate: Date;
    slot: SlotInfo;
    x1: number;
    x2: number;
    y: number;
  };
  const allSegments: SegmentInfo[] = [];

  // Collect all segment info
  plants.forEach((plant) => {
    if (!plant.segments) return;
    const strain = strains.find((s) => s.id === plant.strainId);
    const plantEndDate = getPlantEndDate(plant, strain);

    plant.segments.forEach((segment) => {
      const slot = slots.find(
        (s) => !s.isSpaceHeader && s.spaceId === segment.spaceId && s.gridX === segment.gridX && s.gridY === segment.gridY
      );
      if (!slot) return;

      const segStartDate = new Date(segment.startDate);
      const segEndDate = segment.endDate ? new Date(segment.endDate) : plantEndDate;
      const x1 = toScreenX(segStartDate);
      const x2 = toScreenX(segEndDate);
      const y = topMargin + slot.yOffset - panY + segmentGap;

      allSegments.push({
        plantId: plant.id,
        segmentId: segment.id,
        startDate: segStartDate,
        endDate: segEndDate,
        slot,
        x1,
        x2,
        y,
      });
    });
  });

  // Find and draw conflicts
  for (let i = 0; i < allSegments.length; i++) {
    for (let j = i + 1; j < allSegments.length; j++) {
      const a = allSegments[i];
      const b = allSegments[j];

      // Skip if same plant or different slots
      if (a.plantId === b.plantId) continue;
      if (a.slot.spaceId !== b.slot.spaceId || a.slot.gridX !== b.slot.gridX || a.slot.gridY !== b.slot.gridY) continue;

      // Check time overlap
      if (a.startDate < b.endDate && b.startDate < a.endDate) {
        // Found conflict - draw overlap region with danger border
        const overlapStart = Math.max(a.x1, b.x1);
        const overlapEnd = Math.min(a.x2, b.x2);

        if (overlapEnd > overlapStart && overlapEnd > leftMargin && overlapStart < canvasWidth) {
          const drawX = Math.max(overlapStart, leftMargin);
          const drawWidth = Math.min(overlapEnd, canvasWidth) - drawX;

          ctx.strokeStyle = COLORS.danger;
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, a.y, drawWidth, segmentHeight);
        }
      }
    }
  }

  // Draw all Bezier connections AFTER all segments (so they're on top)
  plants.forEach((plant) => {
    if (!plant.segments || plant.segments.length <= 1) return;
    drawSegmentConnections(ctx, plant, slots, panX, panY, today, zoom);
  });

  // Draw merge buttons after connections
  plants.forEach((plant) => {
    if (!plant.segments || plant.segments.length < 2) return;

    for (let i = 0; i < plant.segments.length - 1; i++) {
      const seg1 = plant.segments[i];
      const seg2 = plant.segments[i + 1];

      // Only show merge button if segments are in the same slot (not moved)
      if (seg1.spaceId === seg2.spaceId && seg1.gridX === seg2.gridX && seg1.gridY === seg2.gridY) {
        const slot = slots.find(
          (s) => !s.isSpaceHeader && s.spaceId === seg1.spaceId && s.gridX === seg1.gridX && s.gridY === seg1.gridY
        );
        if (!slot) continue;

        const splitDate = new Date(seg2.startDate);
        const splitX = toScreenX(splitDate);
        const y = topMargin + slot.yOffset - panY + segmentGap;

        if (splitX > leftMargin && splitX < canvasWidth && y > topMargin && y < canvasHeight) {
          drawMergeButton(ctx, splitX, y, segmentHeight);
        }
      }
    }
  });

  // Redraw TODAY line on top of segments
  if (todayX > leftMargin && todayX < canvasWidth) {
    ctx.strokeStyle = COLORS.orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(todayX, topMargin);
    ctx.lineTo(todayX, canvasHeight);
    ctx.stroke();
  }


  // Draw top margin background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasWidth, topMargin);

  // Redraw date labels (smart spacing to avoid overlap)
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '9px "Space Mono", monospace';
  ctx.textAlign = 'center';
  lastLabelX = -Infinity;

  for (let d = startDay; d < startDay + daysToShow; d += 7) {
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() + d);
    const x = toScreenX(dateObj);

    // Skip if too close to TODAY label
    const tooCloseToToday = Math.abs(x - todayX) < minLabelSpacing;
    if (x > leftMargin && x < canvasWidth && x - lastLabelX >= minLabelSpacing && !tooCloseToToday) {
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const day = dateObj.getDate();
      ctx.fillText(`${day} ${month}`, x, topMargin / 2);
      lastLabelX = x;
    }
  }

  // Redraw TODAY label if visible
  if (todayX > leftMargin && todayX < canvasWidth) {
    ctx.fillStyle = COLORS.orange;
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY', todayX, topMargin / 2);
  }

  // Draw split preview line on hovered segment
  if (splitPreview && splitPreview.x > leftMargin) {
    const plant = plants.find(p => p.id === splitPreview.plantId);
    if (plant) {
      const segment = plant.segments?.find(s => s.id === splitPreview.segmentId);
      if (segment) {
        const slot = slots.find(
          s => !s.isSpaceHeader && s.spaceId === segment.spaceId && s.gridX === segment.gridX && s.gridY === segment.gridY
        );
        if (slot) {
          const y = topMargin + slot.yOffset - panY + segmentGap;

          // Only draw if segment row is visible
          if (y + segmentHeight > topMargin && y < canvasHeight) {
            ctx.strokeStyle = COLORS.teal;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(splitPreview.x, y);
            ctx.lineTo(splitPreview.x, y + segmentHeight);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }
  }

  // Draw Time View placement preview
  if (timeViewPlacementPreview && timeViewPlacementPreview.screenX > leftMargin) {
    const slot = slots.find(
      s => !s.isSpaceHeader &&
           s.spaceId === timeViewPlacementPreview.spaceId &&
           s.gridX === timeViewPlacementPreview.gridX &&
           s.gridY === timeViewPlacementPreview.gridY
    );
    if (slot) {
      const y = topMargin + slot.yOffset - panY;

      // Only draw if slot row is visible
      if (y + slotHeight > topMargin && y < canvasHeight) {
        const previewStrain = timeViewPlacementPreview.strainId
          ? strains.find(s => s.id === timeViewPlacementPreview.strainId)
          : undefined;

        drawTimeViewPlacementPreview(
          ctx,
          timeViewPlacementPreview.screenX,
          y,
          leftMargin,
          canvasWidth,
          timeViewPlacementPreview.canPlace,
          timeViewPlacementPreview.abbreviation,
          previewStrain,
          panX,
          today,
          zoom
        );
      }
    }
  }
}

// Overlay colors for distinguishing plants
const PLANT_OVERLAY_COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#95E1D3', // mint
  '#DDA0DD', // plum
  '#F7DC6F', // gold
  '#85C1E9', // sky blue
  '#F8B500', // amber
] as const;

// Simple hash function to get consistent color index from plant id
function getPlantColorIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % PLANT_OVERLAY_COLORS.length;
}

// Draw color overlay on segment to distinguish plants
function drawSegmentOverlay(
  ctx: CanvasRenderingContext2D,
  colorIndex: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = PLANT_OVERLAY_COLORS[colorIndex];
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

// Draw a segment bar with stage colors
function drawSegmentWithStages(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  strain: Strain | undefined,
  segment: PlantSegment,
  x1: number,
  x2: number,
  y: number,
  height: number,
  today: Date,
  leftMargin: number,
  _hasSplitBefore: boolean = false,
  _hasSplitAfter: boolean = false,
  zoom: number = 1
) {
  const { maxVisibleWidth } = TIME_VIEW_CONSTANTS;
  const plantStartDate = new Date(plant.startedAt);

  const endX = x2;

  // Calculate stage boundaries within the segment
  let dayCounter = 0;
  for (const stage of STAGES) {
    const stageDuration = getStageDuration(stage, plant, strain);
    const stageStartDay = dayCounter;
    const stageEndDay = dayCounter + stageDuration;
    dayCounter = stageEndDay;

    // Convert to dates
    const stageStartDate = new Date(plantStartDate);
    stageStartDate.setDate(stageStartDate.getDate() + stageStartDay);
    const stageEndDate = new Date(plantStartDate);
    stageEndDate.setDate(stageEndDate.getDate() + stageEndDay);

    // Check if this stage overlaps with segment
    const segStartDate = new Date(segment.startDate);
    const segEndDate = segment.endDate ? new Date(segment.endDate) : getPlantEndDate(plant, strain);

    const overlapStart = new Date(Math.max(stageStartDate.getTime(), segStartDate.getTime()));
    const overlapEnd = new Date(Math.min(stageEndDate.getTime(), segEndDate.getTime()));

    if (overlapStart >= overlapEnd) continue;

    // Convert overlap to screen coordinates
    const overlapX1 = Math.max(leftMargin, dateToScreenX(overlapStart, x1 - dateToScreenX(segStartDate, 0, today, zoom), today, zoom));
    const overlapX2 = Math.min(endX, dateToScreenX(overlapEnd, x1 - dateToScreenX(segStartDate, 0, today, zoom), today, zoom));

    if (overlapX1 >= overlapX2) continue;

    // Check if in past or future
    const isPast = overlapEnd <= today;

    // Draw stage with slight transparency to allow lines to show through
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = STAGE_COLORS[stage];
    ctx.fillRect(overlapX1, y, overlapX2 - overlapX1, height);
    ctx.globalAlpha = 1;

    // Draw stage label
    const stageWidth = overlapX2 - overlapX1;
    const weeks = Math.round(stageDuration / 7);

    if (stage === 'germinating') {
      // For germinating stage, show plant code prominently
      if (stageWidth > 20) {
        ctx.save();
        ctx.fillStyle = COLORS.backgroundDark;
        ctx.globalAlpha = isPast ? 0.9 : 0.7;
        ctx.font = 'bold 10px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plant.code, overlapX1 + stageWidth / 2, y + height / 2);
        ctx.restore();
      }
    } else if (stage === 'harvested') {
      // For harvested stage, just show HRV without weeks
      if (stageWidth > 20) {
        ctx.save();
        ctx.fillStyle = COLORS.text;
        ctx.globalAlpha = isPast ? 0.9 : 0.7;
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(STAGE_ABBREV[stage], overlapX1 + stageWidth / 2, y + height / 2);
        ctx.restore();
      }
    } else if (stageWidth > 35) {
      // For other stages, show abbreviation + weeks
      ctx.save();
      ctx.fillStyle = COLORS.text;
      ctx.globalAlpha = isPast ? 0.9 : 0.7;
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = `${STAGE_ABBREV[stage]} ${weeks}W`;
      ctx.fillText(label, overlapX1 + stageWidth / 2, y + height / 2);
      ctx.restore();
    } else if (stageWidth > 20) {
      // Narrow stage - just abbreviation
      ctx.save();
      ctx.fillStyle = COLORS.text;
      ctx.globalAlpha = isPast ? 0.9 : 0.7;
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(STAGE_ABBREV[stage], overlapX1 + stageWidth / 2, y + height / 2);
      ctx.restore();
    }
  }

  // Draw color overlay to distinguish plants
  const colorIndex = getPlantColorIndex(plant.id);
  const segX = Math.max(x1, leftMargin);
  const segWidth = Math.min(x2, leftMargin + maxVisibleWidth) - segX;
  drawSegmentOverlay(ctx, colorIndex, segX, y, segWidth, height);

  // Draw segment border (subtle)
  ctx.strokeStyle = COLORS.backgroundDark;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(Math.max(x1, leftMargin), y, Math.min(x2, leftMargin + maxVisibleWidth) - Math.max(x1, leftMargin), height);
  ctx.globalAlpha = 1;

  // Draw resize handles at STAGE BOUNDARIES (not segment edges)
  // Editable stages: seedling, vegetative, flowering (germinating and harvested are fixed)
  const handleWidth = TIME_VIEW_CONSTANTS.handleWidth;
  const handleColor = COLORS.teal;
  const editableStages: Stage[] = ['seedling', 'vegetative', 'flowering'];

  let stageDayCounter = 0;
  for (const stage of STAGES) {
    const stageDuration = getStageDuration(stage, plant, strain);
    stageDayCounter += stageDuration;

    // Draw handle at the END of editable stages (which is the boundary with next stage)
    if (editableStages.includes(stage)) {
      const stageEndDate = new Date(plantStartDate);
      stageEndDate.setDate(stageEndDate.getDate() + stageDayCounter);

      // Check if this boundary is within the segment
      const segStartDate = new Date(segment.startDate);
      const segEndDate = segment.endDate ? new Date(segment.endDate) : getPlantEndDate(plant, strain);

      if (stageEndDate > segStartDate && stageEndDate < segEndDate) {
        const handleX = dateToScreenX(stageEndDate, x1 - dateToScreenX(segStartDate, 0, today, zoom), today, zoom);

        if (handleX > leftMargin && handleX < leftMargin + maxVisibleWidth) {
          ctx.fillStyle = handleColor;
          ctx.fillRect(handleX - handleWidth / 2, y, handleWidth, height);

          // Handle grip lines
          ctx.strokeStyle = COLORS.background;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(handleX - 1, y + 6);
          ctx.lineTo(handleX - 1, y + height - 6);
          ctx.moveTo(handleX + 1, y + 6);
          ctx.lineTo(handleX + 1, y + height - 6);
          ctx.stroke();
        }
      }
    }
  }
}

// Draw zigzag edge for split point
function drawZigzagEdge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  direction: 'left' | 'right',
  color: string
) {
  const { zigzagSize } = TIME_VIEW_CONSTANTS;
  const zigzagCount = Math.floor(height / (zigzagSize * 2));
  const offset = direction === 'left' ? -zigzagSize : zigzagSize;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < zigzagCount; i++) {
    const baseY = y + i * zigzagSize * 2;
    ctx.lineTo(x + offset, baseY + zigzagSize);
    ctx.lineTo(x, baseY + zigzagSize * 2);
  }

  // Complete to bottom and fill
  ctx.lineTo(x, y + height);
  if (direction === 'left') {
    ctx.lineTo(x - zigzagSize, y + height);
    ctx.lineTo(x - zigzagSize, y);
  } else {
    ctx.lineTo(x + zigzagSize, y + height);
    ctx.lineTo(x + zigzagSize, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw merge button between split segments (switch icon - two connected circles)
function drawMergeButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number
) {
  const { mergeButtonSize } = TIME_VIEW_CONSTANTS;
  const centerY = y + height / 2;
  const circleRadius = 3;
  const offset = 4;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(26, 42, 30, 0.6)';
  ctx.beginPath();
  ctx.roundRect(x - mergeButtonSize / 2, centerY - mergeButtonSize / 2, mergeButtonSize, mergeButtonSize, mergeButtonSize / 2);
  ctx.fill();

  // Connection line
  ctx.strokeStyle = COLORS.textMuted;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - offset, centerY - offset);
  ctx.lineTo(x + offset, centerY + offset);
  ctx.stroke();

  // Top-left circle
  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(x - offset, centerY - offset, circleRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bottom-right circle
  ctx.beginPath();
  ctx.arc(x + offset, centerY + offset, circleRadius, 0, Math.PI * 2);
  ctx.fill();
}

// Draw Bezier curve connections between segments
function drawSegmentConnections(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  slots: SlotInfo[],
  panX: number,
  panY: number,
  today: Date,
  zoom: number = 1
) {
  const { topMargin, segmentHeight, segmentGap } = TIME_VIEW_CONSTANTS;

  for (let i = 0; i < plant.segments.length - 1; i++) {
    const seg1 = plant.segments[i];
    const seg2 = plant.segments[i + 1];

    const slot1 = slots.find(
      (s) => !s.isSpaceHeader && s.spaceId === seg1.spaceId && s.gridX === seg1.gridX && s.gridY === seg1.gridY
    );
    const slot2 = slots.find(
      (s) => !s.isSpaceHeader && s.spaceId === seg2.spaceId && s.gridX === seg2.gridX && s.gridY === seg2.gridY
    );
    if (!slot1 || !slot2) continue;

    // Connection point: end of seg1
    const connectionDate = new Date(seg2.startDate);
    const x = dateToScreenX(connectionDate, panX, today, zoom);

    const y1 = topMargin + slot1.yOffset - panY + segmentGap + segmentHeight / 2;
    const y2 = topMargin + slot2.yOffset - panY + segmentGap + segmentHeight / 2;

    // Skip if same slot
    if (slot1.yOffset === slot2.yOffset) continue;

    // Draw Bezier curve
    const curveOffset = 30;
    ctx.strokeStyle = COLORS.textMuted;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.bezierCurveTo(x + curveOffset, y1, x + curveOffset, y2, x, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw small circles at connection points
    ctx.fillStyle = COLORS.textMuted;
    ctx.beginPath();
    ctx.arc(x, y1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw long press indicator - circular progress around touch point
export function renderLongPressIndicator(
  ctx: CanvasRenderingContext2D,
  preview: LongPressPreview
) {
  const { screenX, screenY, progress } = preview;
  const radius = 28;
  const lineWidth = 3;

  ctx.save();

  // Outer glow effect
  if (progress > 0.5) {
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 209, 159, ${(progress - 0.5) * 0.2})`;
    ctx.fill();
  }

  // Background circle
  ctx.beginPath();
  ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(251, 209, 159, 0.2)';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Progress arc
  ctx.beginPath();
  ctx.arc(
    screenX,
    screenY,
    radius,
    -Math.PI / 2, // Start from top
    -Math.PI / 2 + progress * Math.PI * 2, // Progress clockwise
    false
  );
  ctx.strokeStyle = COLORS.teal;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot that pulses
  const dotRadius = 4 + progress * 2;
  ctx.beginPath();
  ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = progress >= 1 ? COLORS.teal : COLORS.textMuted;
  ctx.fill();

  ctx.restore();
}
