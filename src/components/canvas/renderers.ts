import type { Space, Plant, Strain, Stage } from '../../types';
import { COLORS, STAGE_COLORS, CELL_SIZE, SPACE_COLORS, STAGE_ABBREV, SPACE_HANDLE_SIZE, TIME_VIEW_HANDLE_HEIGHT, MIN_SEGMENT_HEIGHT_FOR_LABEL } from '../../constants';
import { getPlantCells, buildPlantTimelineSegments, TIME_VIEW_CONSTANTS } from '../../utils/grid';

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

export function renderTimeView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  canvasWidth: number,
  canvasHeight: number,
  timelineOffset: number,
  horizontalOffset: number = 0
) {
  const today = new Date();
  const { dayHeight, weekHeight, columnWidth, headerHeight, leftMargin } = TIME_VIEW_CONSTANTS;

  const allCells: { spaceId: string; spaceName: string; gridX: number; gridY: number; plant: Plant | null }[] = [];

  spaces.forEach((space) => {
    for (let y = 0; y < space.gridHeight; y++) {
      for (let x = 0; x < space.gridWidth; x++) {
        const plant = plants.find(
          (p) => p.spaceId === space.id && p.gridX === x && p.gridY === y
        );
        allCells.push({
          spaceId: space.id,
          spaceName: space.name,
          gridX: x,
          gridY: y,
          plant: plant || null,
        });
      }
    }
  });

  const todayY = canvasHeight / 2 - timelineOffset;

  // Draw horizontal week grid lines
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;

  // Calculate range of weeks to draw (beyond visible area for smooth scrolling)
  const weeksAbove = Math.ceil((todayY - headerHeight) / weekHeight) + 2;
  const weeksBelow = Math.ceil((canvasHeight - todayY) / weekHeight) + 2;

  for (let w = -weeksBelow; w <= weeksAbove; w++) {
    const y = todayY - w * weekHeight;
    if (y > headerHeight && y < canvasHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Draw TODAY line
  ctx.strokeStyle = COLORS.orange;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, todayY);
  ctx.lineTo(canvasWidth, todayY);
  ctx.stroke();

  ctx.fillStyle = COLORS.orange;
  ctx.font = '10px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TODAY', 4, todayY - 6);

  // Draw all cells with horizontal offset
  allCells.forEach((cell, i) => {
    const x = leftMargin + i * columnWidth + horizontalOffset;

    // Skip if completely off screen
    if (x + columnWidth < 0 || x > canvasWidth) return;

    // Draw header
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      cell.plant ? cell.plant.code : `${cell.spaceName.slice(0, 3).toUpperCase()}`,
      x + columnWidth / 2,
      headerHeight / 2
    );

    if (cell.plant) {
      const strain = strains.find((s) => s.id === cell.plant!.strainId);

      // Use shared function for timeline segments
      const segments = buildPlantTimelineSegments(cell.plant, strain, today);

      // Draw segments
      // startDay/endDay: negative = past, positive = future
      // Y coords: todayY is baseline, above = future (smaller Y), below = past (larger Y)
      const drawnSegments: { stage: Stage; topY: number; bottomY: number }[] = [];

      segments.forEach((seg) => {
        // Convert days to Y positions (negative days = past = below TODAY = larger Y)
        const segTopY = todayY - seg.endDay * dayHeight;
        const segBottomY = todayY - seg.startDay * dayHeight;
        const segHeight = segBottomY - segTopY;

        if (segHeight <= 0) return;

        drawnSegments.push({ stage: seg.stage, topY: segTopY, bottomY: segBottomY });

        const isFuture = seg.endDay > 0;
        if (isFuture) {
          ctx.fillStyle = STAGE_COLORS[seg.stage] + '80'; // 50% opacity for future
        } else {
          ctx.fillStyle = STAGE_COLORS[seg.stage]; // full color for past
        }
        ctx.fillRect(x + 2, segTopY, columnWidth - 4, segHeight);

        // Draw stage label if segment is tall enough
        if (segHeight >= MIN_SEGMENT_HEIGHT_FOR_LABEL) {
          const centerX = x + columnWidth / 2;
          const centerY = segTopY + segHeight / 2;
          ctx.save();
          ctx.fillStyle = COLORS.text;
          ctx.globalAlpha = isFuture ? 0.6 : 0.9;
          ctx.font = '8px "Space Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(STAGE_ABBREV[seg.stage], centerX, centerY);
          ctx.restore();
        }

        // Draw stage boundary line at transition
        ctx.strokeStyle = COLORS.background;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, segTopY);
        ctx.lineTo(x + columnWidth - 2, segTopY);
        ctx.stroke();
      });

      // Draw drag handles at stage boundaries (for future stages only) - always visible
      if (drawnSegments.length > 0) {
        const handleWidth = columnWidth - 4;

        drawnSegments.forEach((seg, idx) => {
          // Only show handles for editable stages (not germinating or harvested)
          // and only for future stage boundaries (above TODAY line)
          const isEditableStage = seg.stage !== 'germinating' && seg.stage !== 'harvested';
          if (seg.topY < todayY && idx > 0 && isEditableStage) {
            // Draw handle at the top of this segment (boundary between stages)
            // Background bar
            ctx.fillStyle = COLORS.teal;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(
              x + 2,
              seg.topY - TIME_VIEW_HANDLE_HEIGHT / 2,
              handleWidth,
              TIME_VIEW_HANDLE_HEIGHT
            );
            // Center grip lines for visual affordance
            ctx.strokeStyle = COLORS.background;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            const gripY = seg.topY;
            ctx.beginPath();
            ctx.moveTo(x + 10, gripY - 2);
            ctx.lineTo(x + columnWidth - 10, gripY - 2);
            ctx.moveTo(x + 10, gripY + 2);
            ctx.lineTo(x + columnWidth - 10, gripY + 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      }

      ctx.fillStyle = COLORS.text;
      ctx.font = '9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cell.plant.code, x + columnWidth / 2, todayY + 12);
    } else {
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x + columnWidth / 2, headerHeight);
      ctx.lineTo(x + columnWidth / 2, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Draw day labels
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '9px "Space Mono", monospace';
  ctx.textAlign = 'right';

  for (let d = -30; d <= 90; d += 7) {
    const y = todayY - d * dayHeight;
    if (y > headerHeight && y < canvasHeight) {
      ctx.fillText(`${d > 0 ? '+' : ''}${d}d`, leftMargin - 8, y);
    }
  }
}
