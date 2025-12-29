import type { Space, Plant, Strain, Stage } from '../../types';
import { COLORS, STAGE_COLORS, CELL_SIZE, STAGE_DAYS, STAGES } from '../../constants';
import { getPlantCells, calculatePlantTimeline } from '../../utils/grid';

export function renderSpaceView(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  selection: { type: 'space' | 'plant'; id: string } | null,
  dragPreview: { startX: number; startY: number; endX: number; endY: number } | null
) {
  spaces.forEach((space) => {
    drawSpace(ctx, space, selection?.type === 'space' && selection.id === space.id);
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

function drawSpace(ctx: CanvasRenderingContext2D, space: Space, isSelected: boolean) {
  const { originX, originY, gridWidth, gridHeight, name } = space;
  const width = gridWidth * CELL_SIZE;
  const height = gridHeight * CELL_SIZE;

  ctx.fillStyle = COLORS.backgroundLight;
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

  ctx.fillStyle = COLORS.text;
  ctx.font = '14px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(name.toUpperCase(), originX + 4, originY - 4);
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  plant: Plant,
  space: Space,
  strain: Strain | undefined,
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
  const dayHeight = 8;
  const columnWidth = 60;
  const headerHeight = 40;
  const leftMargin = 50;

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
      const startDate = new Date(cell.plant.startedAt);
      const daysFromStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const strain = strains.find((s) => s.id === cell.plant!.strainId);
      const timeline = calculatePlantTimeline(cell.plant, strain, today);

      const currentStageIndex = STAGES.indexOf(cell.plant.stage);

      // Build timeline segments for each stage
      const segments: { stage: Stage; startDay: number; endDay: number }[] = [];

      if (daysFromStart >= 0) {
        // Plant has started - calculate past and future segments
        const stageStartDate = new Date(cell.plant.stageStartedAt || cell.plant.startedAt);
        const daysInCurrentStage = Math.max(0, Math.floor((today.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Past: all completed stages + current stage's elapsed time
        // Calculate total past days based on stage durations
        let totalPastDays = 0;
        for (let i = 0; i < currentStageIndex; i++) {
          const stage = STAGES[i];
          const stageDuration = stage === 'vegetative' ? (strain?.vegDays || STAGE_DAYS.vegetative) :
                               stage === 'flowering' ? (strain?.floweringDays || STAGE_DAYS.flowering) :
                               STAGE_DAYS[stage];
          totalPastDays += stageDuration;
        }
        totalPastDays += daysInCurrentStage;

        // Build past segments (negative days = below TODAY line)
        let pastDayCounter = -totalPastDays;
        for (let i = 0; i < currentStageIndex; i++) {
          const stage = STAGES[i];
          const stageDuration = stage === 'vegetative' ? (strain?.vegDays || STAGE_DAYS.vegetative) :
                               stage === 'flowering' ? (strain?.floweringDays || STAGE_DAYS.flowering) :
                               STAGE_DAYS[stage];
          segments.push({ stage, startDay: pastDayCounter, endDay: pastDayCounter + stageDuration });
          pastDayCounter += stageDuration;
        }
        // Current stage past portion (from stage start to today)
        if (daysInCurrentStage > 0) {
          segments.push({ stage: cell.plant.stage, startDay: pastDayCounter, endDay: 0 });
        }

        // Future: from today to harvest
        let futureDayCounter = 0;
        const remainingInCurrentStage = timeline.daysRemainingInStage;
        if (remainingInCurrentStage > 0 && cell.plant.stage !== 'harvested') {
          segments.push({ stage: cell.plant.stage, startDay: 0, endDay: remainingInCurrentStage });
          futureDayCounter = remainingInCurrentStage;
        }
        for (let i = currentStageIndex + 1; i < STAGES.length - 1; i++) {
          const stage = STAGES[i];
          const stageDuration = stage === 'vegetative' ? (strain?.vegDays || STAGE_DAYS.vegetative) :
                               stage === 'flowering' ? (strain?.floweringDays || STAGE_DAYS.flowering) :
                               STAGE_DAYS[stage];
          segments.push({ stage, startDay: futureDayCounter, endDay: futureDayCounter + stageDuration });
          futureDayCounter += stageDuration;
        }
      } else {
        // Plant starts in the future
        const daysUntilStart = Math.abs(daysFromStart);
        let dayCounter = daysUntilStart;
        for (let i = 0; i < STAGES.length - 1; i++) {
          const stage = STAGES[i];
          const stageDuration = stage === 'vegetative' ? (strain?.vegDays || STAGE_DAYS.vegetative) :
                               stage === 'flowering' ? (strain?.floweringDays || STAGE_DAYS.flowering) :
                               STAGE_DAYS[stage];
          segments.push({ stage, startDay: dayCounter, endDay: dayCounter + stageDuration });
          dayCounter += stageDuration;
        }
      }

      // Draw segments
      // startDay/endDay: negative = past, positive = future
      // Y coords: todayY is baseline, above = future (smaller Y), below = past (larger Y)
      segments.forEach((seg) => {
        // Convert days to Y positions (negative days = past = below TODAY = larger Y)
        const segTopY = todayY - seg.endDay * dayHeight;
        const segBottomY = todayY - seg.startDay * dayHeight;
        const segHeight = segBottomY - segTopY;

        if (segHeight <= 0) return;

        const isFuture = seg.endDay > 0;
        if (isFuture) {
          ctx.fillStyle = STAGE_COLORS[seg.stage] + '80'; // 50% opacity for future
        } else {
          ctx.fillStyle = STAGE_COLORS[seg.stage]; // full color for past
        }
        ctx.fillRect(x + 2, segTopY, columnWidth - 4, segHeight);

        // Draw stage boundary line at transition
        ctx.strokeStyle = COLORS.background;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, segTopY);
        ctx.lineTo(x + columnWidth - 2, segTopY);
        ctx.stroke();
      });

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
