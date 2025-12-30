import type { Space, Plant, Strain, Stage, PlantSegment } from '../../types';
import { COLORS, STAGE_COLORS, CELL_SIZE, SPACE_COLORS, STAGE_ABBREV, SPACE_HANDLE_SIZE, STAGES } from '../../constants';
import {
  getPlantCells,
  TIME_VIEW_CONSTANTS,
  buildSlotList,
  dateToScreenX,
  getPlantEndDate,
  getStageDuration,
} from '../../utils/grid';

export function renderSpaceView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  selection: { type: 'space' | 'plant'; id: string } | null,
  dragPreview: { startX: number; startY: number; endX: number; endY: number } | null
) {
  // First pass: draw space backgrounds and grids
  spaces.forEach((space, index) => {
    drawSpace(ctx, space, selection?.type === 'space' && selection.id === space.id, index);
  });

  // Second pass: draw space labels on top (so they're not covered by other spaces)
  spaces.forEach((space) => {
    drawSpaceLabel(ctx, space, spaces);
  });

  plants.forEach((plant) => {
    const space = spaces.find((s) => s.id === plant.spaceId);
    if (space) {
      const strain = strains.find((s) => s.id === plant.strainId);
      drawPlant(ctx, plant, space, strain, selection?.type === 'plant' && selection.id === plant.id);
    }
  });

  if (dragPreview) {
    drawDragPreview(ctx, dragPreview);
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

  // Use space's color or fallback to palette by index
  const spaceColor = color || SPACE_COLORS[spaceIndex % SPACE_COLORS.length];
  ctx.fillStyle = spaceColor;
  ctx.fillRect(originX, originY, width, height);

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

function drawPlant(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  space: Space,
  _strain: Strain | undefined,
  isSelected: boolean
) {
  const cells = getPlantCells(plant);
  const minGridX = Math.min(...cells.map((c) => c.gridX));
  const minGridY = Math.min(...cells.map((c) => c.gridY));
  const maxGridX = Math.max(...cells.map((c) => c.gridX));
  const maxGridY = Math.max(...cells.map((c) => c.gridY));

  const x = space.originX + minGridX * CELL_SIZE;
  const y = space.originY + minGridY * CELL_SIZE;
  const width = (maxGridX - minGridX + 1) * CELL_SIZE;
  const height = (maxGridY - minGridY + 1) * CELL_SIZE;

  // Dark semi-transparent backdrop for depth effect
  ctx.fillStyle = COLORS.background;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  ctx.globalAlpha = 1;

  // Plant color on top
  ctx.fillStyle = STAGE_COLORS[plant.stage];
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

  if (isSelected) {
    ctx.strokeStyle = COLORS.teal;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plant.code, x + width / 2, y + height / 2);
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

// New horizontal Time View (X = dates, Y = slots)
export function renderTimeView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  canvasWidth: number,
  canvasHeight: number,
  panY: number,
  panX: number = 0
) {
  const today = new Date();
  const {
    dayWidth,
    weekWidth,
    slotHeight,
    spaceHeaderHeight,
    leftMargin,
    topMargin,
    segmentHeight,
    segmentGap,
  } = TIME_VIEW_CONSTANTS;

  // Build slot list
  const slots = buildSlotList(spaces);

  // Calculate total height needed for all slots
  const totalSlotsHeight = slots.length > 0
    ? slots[slots.length - 1].yOffset + (slots[slots.length - 1].isSpaceHeader ? spaceHeaderHeight : slotHeight)
    : 0;

  // Draw background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw week grid lines (vertical)
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;

  const weeksToShow = Math.ceil(canvasWidth / weekWidth) + 10;
  const startWeek = Math.floor(-panX / weekWidth) - 5;

  for (let w = startWeek; w < startWeek + weeksToShow; w++) {
    const x = leftMargin + panX + w * weekWidth;
    if (x > leftMargin && x < canvasWidth) {
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Draw slot row backgrounds and labels
  ctx.save();
  slots.forEach((slot) => {
    const y = topMargin + slot.yOffset - panY;

    // Skip if off screen
    if (y + slotHeight < topMargin || y > canvasHeight) return;

    if (slot.isSpaceHeader) {
      // Space header row
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, y, canvasWidth, spaceHeaderHeight);

      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(slot.spaceName.toUpperCase(), 8, y + spaceHeaderHeight / 2);

      // Separator line
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + spaceHeaderHeight);
      ctx.lineTo(canvasWidth, y + spaceHeaderHeight);
      ctx.stroke();
    } else {
      // Slot row - alternating background
      const isEven = (slot.gridX + slot.gridY) % 2 === 0;
      ctx.fillStyle = isEven ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(leftMargin, y, canvasWidth - leftMargin, slotHeight);

      // Slot label
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '9px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${slot.gridX},${slot.gridY}`, leftMargin - 8, y + slotHeight / 2);

      // Row separator
      ctx.strokeStyle = COLORS.border;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y + slotHeight);
      ctx.lineTo(canvasWidth, y + slotHeight);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();

  // Draw TODAY line (vertical)
  const todayX = dateToScreenX(today, panX, today);
  if (todayX > leftMargin && todayX < canvasWidth) {
    ctx.strokeStyle = COLORS.orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(todayX, topMargin);
    ctx.lineTo(todayX, canvasHeight);
    ctx.stroke();

    // TODAY label
    ctx.fillStyle = COLORS.orange;
    ctx.font = '9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY', todayX, topMargin - 6);
  }

  // Draw date labels at top
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '9px "Space Mono", monospace';
  ctx.textAlign = 'center';

  const daysToShow = Math.ceil(canvasWidth / dayWidth) + 60;
  const startDay = Math.floor(-panX / dayWidth) - 30;

  for (let d = startDay; d < startDay + daysToShow; d += 7) {
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() + d);
    const x = dateToScreenX(dateObj, panX, today);

    if (x > leftMargin && x < canvasWidth) {
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const day = dateObj.getDate();
      ctx.fillText(`${month} ${day}`, x, topMargin / 2);
    }
  }

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

      const x1 = dateToScreenX(segStartDate, panX, today);
      const x2 = dateToScreenX(segEndDate, panX, today);
      const y = topMargin + slot.yOffset - panY + segmentGap;

      // Skip if off screen
      if (x2 < leftMargin || x1 > canvasWidth) return;
      if (y + segmentHeight < topMargin || y > canvasHeight) return;

      // Draw segment with stage colors
      drawSegmentWithStages(ctx, plant, strain, segment, x1, x2, y, segmentHeight, today, leftMargin);

      // Draw plant code label
      const segWidth = x2 - x1;
      if (segWidth > 40) {
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plant.code, Math.max(leftMargin + 20, x1) + Math.min(segWidth, x2 - leftMargin) / 2, y + segmentHeight / 2);
      }
    });

    // Draw Bezier connections between segments
    if (plant.segments.length > 1) {
      drawSegmentConnections(ctx, plant, strain, slots, panX, panY, today, plantEndDate);
    }
  });

  // Draw left margin background (to cover segments that extend into it)
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, leftMargin, canvasHeight);

  // Redraw slot labels on top
  slots.forEach((slot) => {
    const y = topMargin + slot.yOffset - panY;
    if (y + slotHeight < topMargin || y > canvasHeight) return;

    if (slot.isSpaceHeader) {
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(slot.spaceName.toUpperCase(), 8, y + spaceHeaderHeight / 2);
    } else {
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '9px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${slot.gridX},${slot.gridY}`, leftMargin - 8, y + slotHeight / 2);
    }
  });

  // Draw top margin background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasWidth, topMargin);

  // Redraw date labels
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '9px "Space Mono", monospace';
  ctx.textAlign = 'center';

  for (let d = startDay; d < startDay + daysToShow; d += 7) {
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() + d);
    const x = dateToScreenX(dateObj, panX, today);

    if (x > leftMargin && x < canvasWidth) {
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const day = dateObj.getDate();
      ctx.fillText(`${month} ${day}`, x, topMargin / 2);
    }
  }

  // Redraw TODAY label if visible
  if (todayX > leftMargin && todayX < canvasWidth) {
    ctx.fillStyle = COLORS.orange;
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY', todayX, topMargin / 2);
  }
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
  leftMargin: number
) {
  const { dayWidth } = TIME_VIEW_CONSTANTS;
  const plantStartDate = new Date(plant.startedAt);

  // Iterate through each day of the segment and color by stage
  let currentX = Math.max(x1, leftMargin);
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
    const overlapX1 = Math.max(leftMargin, dateToScreenX(overlapStart, x1 - dateToScreenX(segStartDate, 0, today), today));
    const overlapX2 = Math.min(endX, dateToScreenX(overlapEnd, x1 - dateToScreenX(segStartDate, 0, today), today));

    if (overlapX1 >= overlapX2) continue;

    // Check if in past or future
    const isPast = overlapEnd <= today;
    const isFuture = overlapStart >= today;
    const isMixed = !isPast && !isFuture;

    if (isMixed) {
      // Split into past and future portions
      const todayX = dateToScreenX(today, x1 - dateToScreenX(segStartDate, 0, today), today);

      // Past portion
      ctx.fillStyle = STAGE_COLORS[stage];
      ctx.fillRect(overlapX1, y, Math.min(todayX, overlapX2) - overlapX1, height);

      // Future portion
      if (todayX < overlapX2) {
        ctx.fillStyle = STAGE_COLORS[stage] + '80';
        ctx.fillRect(Math.max(todayX, overlapX1), y, overlapX2 - Math.max(todayX, overlapX1), height);
      }
    } else {
      ctx.fillStyle = isPast ? STAGE_COLORS[stage] : STAGE_COLORS[stage] + '80';
      ctx.fillRect(overlapX1, y, overlapX2 - overlapX1, height);
    }

    // Draw stage abbreviation if wide enough
    const stageWidth = overlapX2 - overlapX1;
    if (stageWidth > 25) {
      ctx.save();
      ctx.fillStyle = COLORS.text;
      ctx.globalAlpha = isPast ? 0.9 : 0.6;
      ctx.font = '7px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(STAGE_ABBREV[stage], overlapX1 + stageWidth / 2, y + height / 2 + 8);
      ctx.restore();
    }
  }

  // Draw segment border
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.max(x1, leftMargin), y, Math.min(x2, leftMargin + 1000) - Math.max(x1, leftMargin), height);

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
        const handleX = dateToScreenX(stageEndDate, x1 - dateToScreenX(segStartDate, 0, today), today);

        if (handleX > leftMargin && handleX < leftMargin + 2000) {
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

// Draw Bezier curve connections between segments
function drawSegmentConnections(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  strain: Strain | undefined,
  slots: SlotInfo[],
  panX: number,
  panY: number,
  today: Date,
  plantEndDate: Date
) {
  const { topMargin, segmentHeight, segmentGap, slotHeight } = TIME_VIEW_CONSTANTS;

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
    const x = dateToScreenX(connectionDate, panX, today);

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
