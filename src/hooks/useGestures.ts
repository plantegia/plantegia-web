import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { screenToWorld, findSpaceAt, findCellInSpace, findPlantAt, canPlacePlant, snapToGrid, findSpaceEdgeAt, SpaceEdge, findPlantAtTimeView, TIME_VIEW_CONSTANTS, buildTimeViewCells, findStageHandleAt, getTimeViewColumnAt, getStageDuration, getPlantBounds, getCanvasCssHeight } from '../utils/grid';
import { MIN_ZOOM, MAX_ZOOM, CELL_SIZE, SPACE_COLORS } from '../constants';
import type { Point, Space, Plant, Stage } from '../types';

type SpaceDragMode = 'none' | 'move' | 'resize';
type TimeViewDragMode = 'none' | 'plant-move' | 'stage-resize';

interface GestureState {
  isPanning: boolean;
  isDragging: boolean;
  startScreen: Point;
  startWorld: Point;
  lastPan: Point;
  lastTimelineOffset: number;
  lastTimelineHorizontalOffset: number;
  pinchStartDistance: number;
  pinchStartZoom: number;
  pinchCenter: Point;
  moved: boolean;
  // Space drag state
  spaceDragMode: SpaceDragMode;
  draggedSpaceId: string | null;
  resizeEdge: SpaceEdge | null;
  originalSpace: Space | null;
  // Time View drag state
  timeViewDragMode: TimeViewDragMode;
  draggedPlant: Plant | null;
  draggedStage: Stage | null;
  originalStageDays: number;
  startColumnIndex: number;
}

function getDistance(t1: Touch | MouseEvent, t2: Touch): number {
  const x1 = 'clientX' in t1 ? t1.clientX : t1.clientX;
  const y1 = 'clientY' in t1 ? t1.clientY : t1.clientY;
  return Math.hypot(t2.clientX - x1, t2.clientY - y1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useGestures(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  canvasRect: { top: number; left: number },
  readOnly?: boolean
) {
  const gestureRef = useRef<GestureState>({
    isPanning: false,
    isDragging: false,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    lastPan: { x: 0, y: 0 },
    lastTimelineOffset: 0,
    lastTimelineHorizontalOffset: 0,
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    pinchCenter: { x: 0, y: 0 },
    moved: false,
    spaceDragMode: 'none',
    draggedSpaceId: null,
    resizeEdge: null,
    originalSpace: null,
    timeViewDragMode: 'none',
    draggedPlant: null,
    draggedStage: null,
    originalStageDays: 0,
    startColumnIndex: -1,
  });

  const {
    pan, setPan, zoom, setZoom,
    activeTool, selectedSeedId,
    spaces, plants, strains, inventory,
    createSpace, createPlant, consumeSeed,
    deletePlant, deleteSpace, updateSpace, updatePlant,
    setSelection, selection,
    setDragPreview, dragPreview,
    viewMode,
    timelineOffset, setTimelineOffset,
    timelineHorizontalOffset, setTimelineHorizontalOffset,
    saveSnapshot,
  } = useAppStore();

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    return {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top,
    };
  }, [canvasRect]);

  // Check if resize is valid (no plants would be cut off)
  const canResizeSpace = useCallback((spaceId: string, newWidth: number, newHeight: number): boolean => {
    const plantsInSpace = plants.filter(p => p.spaceId === spaceId);
    return !plantsInSpace.some((plant) => {
      const { endX, endY } = getPlantBounds(plant);
      return endX > newWidth || endY > newHeight;
    });
  }, [plants]);

  const handleTap = useCallback((screenPos: Point) => {
    const worldPos = screenToWorld(screenPos, pan, zoom);

    // In read-only mode, only allow viewing (selection) but no modifications
    if (readOnly) {
      if (viewMode === 'space') {
        const plant = findPlantAt(worldPos, plants, spaces);
        if (plant) {
          setSelection({ type: 'plant', id: plant.id });
          return;
        }
        const space = findSpaceAt(worldPos, spaces);
        if (space) {
          setSelection({ type: 'space', id: space.id });
          return;
        }
        setSelection(null);
      }
      return;
    }

    if (activeTool === 'erase') {
      const plant = findPlantAt(worldPos, plants, spaces);
      if (plant) {
        deletePlant(plant.id);
        return;
      }
      const space = findSpaceAt(worldPos, spaces);
      if (space) {
        deleteSpace(space.id);
      }
      return;
    }

    if (selectedSeedId && viewMode === 'space') {
      const space = findSpaceAt(worldPos, spaces);
      if (space) {
        const cell = findCellInSpace(worldPos, space);
        if (cell) {
          const seed = inventory.find(s => s.id === selectedSeedId);
          if (seed && seed.quantity > 0) {
            if (canPlacePlant(space.id, cell.gridX, cell.gridY, 1, space, plants)) {
              createPlant({
                spaceId: space.id,
                strainId: seed.strainId,
                gridX: cell.gridX,
                gridY: cell.gridY,
                generation: seed.isClone ? 'clone' : 'seed',
              });
              consumeSeed(selectedSeedId);
              return;
            }
          }
        }
        // If plant couldn't be placed, select the space instead
        setSelection({ type: 'space', id: space.id });
      }
      return;
    }

    if (selectedSeedId && viewMode === 'time') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { dayHeight, columnWidth, leftMargin } = TIME_VIEW_CONSTANTS;
      const canvasHeight = getCanvasCssHeight(canvas);
      const todayY = canvasHeight / 2 - timelineOffset;

      const allCells: { spaceId: string; gridX: number; gridY: number; hasPlant: boolean }[] = [];
      spaces.forEach((space) => {
        for (let y = 0; y < space.gridHeight; y++) {
          for (let x = 0; x < space.gridWidth; x++) {
            const hasPlant = plants.some(
              (p) => p.spaceId === space.id && p.gridX === x && p.gridY === y
            );
            allCells.push({ spaceId: space.id, gridX: x, gridY: y, hasPlant });
          }
        }
      });

      const columnIndex = Math.floor((screenPos.x - leftMargin - timelineHorizontalOffset) / columnWidth);
      if (columnIndex < 0 || columnIndex >= allCells.length) return;

      const targetCell = allCells[columnIndex];
      if (targetCell.hasPlant) return;

      // daysFromToday can be negative (past) or positive (future)
      const daysFromToday = Math.round((todayY - screenPos.y) / dayHeight);

      const seed = inventory.find(s => s.id === selectedSeedId);
      if (!seed || seed.quantity <= 0) return;

      const space = spaces.find(s => s.id === targetCell.spaceId);
      if (!space) return;

      if (!canPlacePlant(space.id, targetCell.gridX, targetCell.gridY, 1, space, plants)) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + daysFromToday);

      createPlant({
        spaceId: targetCell.spaceId,
        strainId: seed.strainId,
        gridX: targetCell.gridX,
        gridY: targetCell.gridY,
        generation: seed.isClone ? 'clone' : 'seed',
        startedAt: startDate.toISOString(),
      });
      consumeSeed(selectedSeedId);
      return;
    }

    // In Time View, don't select plants on tap (no inspector needed)
    // Drag interactions are handled in mouseDown/mouseMove
    if (!activeTool && !selectedSeedId && viewMode === 'time') {
      // Clear selection on tap outside plants
      setSelection(null);
      return;
    }

    if (!activeTool && viewMode === 'space') {
      const plant = findPlantAt(worldPos, plants, spaces);
      if (plant) {
        setSelection({ type: 'plant', id: plant.id });
        return;
      }

      const space = findSpaceAt(worldPos, spaces);
      if (space) {
        setSelection({ type: 'space', id: space.id });
        return;
      }

      setSelection(null);
    }
  }, [
    canvasRef, pan, zoom, activeTool, selectedSeedId, spaces, plants, inventory, viewMode,
    deletePlant, deleteSpace, createPlant, consumeSeed, setSelection,
    timelineOffset, timelineHorizontalOffset, readOnly,
  ]);

  const handleDragEnd = useCallback((startWorld: Point, endWorld: Point) => {
    if (readOnly) return;

    if (activeTool === 'space' && viewMode === 'space') {
      const minX = Math.min(startWorld.x, endWorld.x);
      const minY = Math.min(startWorld.y, endWorld.y);
      const maxX = Math.max(startWorld.x, endWorld.x);
      const maxY = Math.max(startWorld.y, endWorld.y);

      const originX = snapToGrid(minX);
      const originY = snapToGrid(minY);
      const gridWidth = Math.max(1, Math.ceil((maxX - originX) / CELL_SIZE));
      const gridHeight = Math.max(1, Math.ceil((maxY - originY) / CELL_SIZE));

      // Pick random color from palette
      const randomColor = SPACE_COLORS[Math.floor(Math.random() * SPACE_COLORS.length)];

      createSpace({
        name: `Space ${spaces.length + 1}`,
        originX,
        originY,
        gridWidth,
        gridHeight,
        color: randomColor,
      });
    }

    setDragPreview(null);
  }, [activeTool, viewMode, spaces.length, createSpace, setDragPreview, readOnly]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const screenPos = getCanvasPoint(touch.clientX, touch.clientY);
        g.startScreen = screenPos;
        g.startWorld = screenToWorld(screenPos, pan, zoom);
        g.lastPan = { ...pan };
        g.lastTimelineOffset = timelineOffset;
        g.lastTimelineHorizontalOffset = timelineHorizontalOffset;
        g.moved = false;
        g.isPanning = false;
        g.isDragging = false;
      }

      if (e.touches.length === 2) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - canvasRect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - canvasRect.top;
        g.pinchStartDistance = dist;
        g.pinchStartZoom = zoom;
        g.pinchCenter = { x: centerX, y: centerY };
        g.lastPan = { ...pan };
        g.isPanning = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;

      if (e.touches.length === 2 && viewMode === 'space') {
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scale = dist / g.pinchStartDistance;
        const newZoom = clamp(g.pinchStartZoom * scale, MIN_ZOOM, MAX_ZOOM);

        // Zoom towards pinch center
        const worldX = (g.pinchCenter.x - g.lastPan.x) / g.pinchStartZoom;
        const worldY = (g.pinchCenter.y - g.lastPan.y) / g.pinchStartZoom;

        const newPanX = g.pinchCenter.x - worldX * newZoom;
        const newPanY = g.pinchCenter.y - worldY * newZoom;

        setPan({ x: newPanX, y: newPanY });
        setZoom(newZoom);
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const screenPos = getCanvasPoint(touch.clientX, touch.clientY);
        const dx = screenPos.x - g.startScreen.x;
        const dy = screenPos.y - g.startScreen.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          g.moved = true;
        }

        if (viewMode === 'time') {
          g.isPanning = true;
          setTimelineOffset(g.lastTimelineOffset - dy);
          setTimelineHorizontalOffset(g.lastTimelineHorizontalOffset + dx);
        } else if (activeTool === 'space' && viewMode === 'space') {
          g.isDragging = true;
          const currentWorld = screenToWorld(screenPos, pan, zoom);
          setDragPreview({
            startX: g.startWorld.x,
            startY: g.startWorld.y,
            endX: currentWorld.x,
            endY: currentWorld.y,
          });
        } else if (!activeTool && !selectedSeedId) {
          g.isPanning = true;
          setPan({
            x: g.lastPan.x + dx,
            y: g.lastPan.y + dy,
          });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;

      if (g.isDragging && dragPreview) {
        handleDragEnd(
          { x: dragPreview.startX, y: dragPreview.startY },
          { x: dragPreview.endX, y: dragPreview.endY }
        );
      } else if (!g.moved && !g.isPanning) {
        handleTap(g.startScreen);
      }

      g.isPanning = false;
      g.isDragging = false;
      g.moved = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const g = gestureRef.current;
      const screenPos = getCanvasPoint(e.clientX, e.clientY);
      g.startScreen = screenPos;
      g.startWorld = screenToWorld(screenPos, pan, zoom);
      g.lastPan = { ...pan };
      g.lastTimelineOffset = timelineOffset;
      g.lastTimelineHorizontalOffset = timelineHorizontalOffset;
      g.moved = false;
      g.isPanning = false;
      g.isDragging = false;
      g.spaceDragMode = 'none';
      g.draggedSpaceId = null;
      g.resizeEdge = null;
      g.originalSpace = null;
      g.timeViewDragMode = 'none';
      g.draggedPlant = null;
      g.draggedStage = null;
      g.originalStageDays = 0;
      g.startColumnIndex = -1;

      // Check if clicking on selected space's edges for resize/move (Space View)
      if (!readOnly && selection?.type === 'space' && viewMode === 'space' && !activeTool && !selectedSeedId) {
        const space = spaces.find(s => s.id === selection.id);
        if (space) {
          const edge = findSpaceEdgeAt(g.startWorld, space);
          if (edge === 'body') {
            saveSnapshot(); // Save before drag starts
            g.spaceDragMode = 'move';
            g.draggedSpaceId = space.id;
            g.originalSpace = { ...space };
          } else if (edge) {
            saveSnapshot(); // Save before drag starts
            g.spaceDragMode = 'resize';
            g.draggedSpaceId = space.id;
            g.resizeEdge = edge;
            g.originalSpace = { ...space };
          }
        }
      }

      // Check for Time View drag interactions
      if (!readOnly && viewMode === 'time' && !activeTool && !selectedSeedId) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasHeight = getCanvasCssHeight(canvas);
        const { columnWidth, leftMargin } = TIME_VIEW_CONSTANTS;
        const allCells = buildTimeViewCells(spaces, plants);

        // First, find which plant (if any) is at the click position
        const plantAtClick = findPlantAtTimeView(
          screenPos.x,
          screenPos.y,
          canvasHeight,
          timelineOffset,
          timelineHorizontalOffset,
          spaces,
          plants,
          strains
        );

        if (plantAtClick) {
          const strain = strains.find(s => s.id === plantAtClick.strainId);
          const plantColumnIndex = allCells.findIndex(c => c.plant?.id === plantAtClick.id);

          if (plantColumnIndex >= 0) {
            const columnX = leftMargin + plantColumnIndex * columnWidth + timelineHorizontalOffset;

            // Check for stage handle drag (handles are always active on any plant)
            const stageHandle = findStageHandleAt(
              screenPos.x,
              screenPos.y,
              plantAtClick,
              columnX,
              strain,
              canvasHeight,
              timelineOffset
            );

            if (stageHandle) {
              saveSnapshot(); // Save before drag starts
              g.timeViewDragMode = 'stage-resize';
              g.draggedPlant = { ...plantAtClick };
              g.draggedStage = stageHandle;
              g.originalStageDays = getStageDuration(stageHandle, plantAtClick, strain);
              g.startColumnIndex = plantColumnIndex;
              return;
            }

            // Otherwise, set up plant move drag
            saveSnapshot(); // Save before drag starts
            g.timeViewDragMode = 'plant-move';
            g.draggedPlant = { ...plantAtClick };
            g.startColumnIndex = plantColumnIndex;
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return;

      const g = gestureRef.current;
      const screenPos = getCanvasPoint(e.clientX, e.clientY);
      const dx = screenPos.x - g.startScreen.x;
      const dy = screenPos.y - g.startScreen.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        g.moved = true;
      }

      // Handle space move/resize
      if (g.spaceDragMode !== 'none' && g.originalSpace && g.draggedSpaceId) {
        const currentWorld = screenToWorld(screenPos, pan, zoom);
        const deltaX = currentWorld.x - g.startWorld.x;
        const deltaY = currentWorld.y - g.startWorld.y;

        if (g.spaceDragMode === 'move') {
          const newOriginX = snapToGrid(g.originalSpace.originX + deltaX);
          const newOriginY = snapToGrid(g.originalSpace.originY + deltaY);
          updateSpace(g.draggedSpaceId, { originX: newOriginX, originY: newOriginY }, true);
        } else if (g.spaceDragMode === 'resize' && g.resizeEdge) {
          const orig = g.originalSpace;
          let newOriginX = orig.originX;
          let newOriginY = orig.originY;
          let newWidth = orig.gridWidth;
          let newHeight = orig.gridHeight;

          // Calculate new dimensions based on edge being dragged
          if (g.resizeEdge.includes('e')) {
            const newRight = orig.originX + orig.gridWidth * CELL_SIZE + deltaX;
            newWidth = Math.max(1, Math.round((newRight - orig.originX) / CELL_SIZE));
          }
          if (g.resizeEdge.includes('w')) {
            const snappedOriginX = snapToGrid(orig.originX + deltaX);
            const rightEdge = orig.originX + orig.gridWidth * CELL_SIZE;
            newWidth = Math.max(1, Math.round((rightEdge - snappedOriginX) / CELL_SIZE));
            newOriginX = rightEdge - newWidth * CELL_SIZE;
          }
          if (g.resizeEdge.includes('s')) {
            const newBottom = orig.originY + orig.gridHeight * CELL_SIZE + deltaY;
            newHeight = Math.max(1, Math.round((newBottom - orig.originY) / CELL_SIZE));
          }
          if (g.resizeEdge.includes('n')) {
            const snappedOriginY = snapToGrid(orig.originY + deltaY);
            const bottomEdge = orig.originY + orig.gridHeight * CELL_SIZE;
            newHeight = Math.max(1, Math.round((bottomEdge - snappedOriginY) / CELL_SIZE));
            newOriginY = bottomEdge - newHeight * CELL_SIZE;
          }

          // Only apply if resize is valid
          if (canResizeSpace(g.draggedSpaceId, newWidth, newHeight)) {
            updateSpace(g.draggedSpaceId, {
              originX: newOriginX,
              originY: newOriginY,
              gridWidth: newWidth,
              gridHeight: newHeight,
            }, true);
          }
        }
        return;
      }

      // Handle Time View drag interactions
      if (g.timeViewDragMode !== 'none' && g.draggedPlant) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { dayHeight, weekHeight } = TIME_VIEW_CONSTANTS;

        if (g.timeViewDragMode === 'stage-resize' && g.draggedStage) {
          // Calculate new stage duration based on Y delta
          // Moving up (negative dy) = longer duration, moving down = shorter
          const weeksDelta = Math.round(-dy / weekHeight);
          const daysDelta = weeksDelta * 7;
          const newDays = Math.max(7, g.originalStageDays + daysDelta); // Minimum 1 week

          // Update plant's customStageDays
          const currentPlant = plants.find(p => p.id === g.draggedPlant!.id);
          if (currentPlant) {
            const newCustomStageDays = {
              ...currentPlant.customStageDays,
              [g.draggedStage]: newDays,
            };
            updatePlant(g.draggedPlant.id, { customStageDays: newCustomStageDays }, true);
          }
          return;
        }

        if (g.timeViewDragMode === 'plant-move') {
          // Calculate new column and time offset
          const columnResult = getTimeViewColumnAt(screenPos.x, timelineHorizontalOffset, spaces, plants);
          if (columnResult && columnResult.columnIndex !== g.startColumnIndex) {
            const targetCell = columnResult.cell;

            // Check if target cell is empty or is the dragged plant itself
            if (!targetCell.plant || targetCell.plant.id === g.draggedPlant.id) {
              const targetSpace = spaces.find(s => s.id === targetCell.spaceId);
              if (targetSpace && canPlacePlant(targetCell.spaceId, targetCell.gridX, targetCell.gridY, g.draggedPlant.size, targetSpace, plants, g.draggedPlant.id)) {
                updatePlant(g.draggedPlant.id, {
                  spaceId: targetCell.spaceId,
                  gridX: targetCell.gridX,
                  gridY: targetCell.gridY,
                }, true);
                // Update start column index
                g.startColumnIndex = columnResult.columnIndex;
              }
            }
          }

          // Calculate time shift (snap to weeks)
          const weeksDelta = Math.round(-dy / weekHeight);
          if (weeksDelta !== 0) {
            const daysDelta = weeksDelta * 7;
            const currentPlant = plants.find(p => p.id === g.draggedPlant!.id);
            if (currentPlant) {
              const currentStartDate = new Date(currentPlant.startedAt);
              const newStartDate = new Date(currentStartDate.getTime() + daysDelta * 24 * 60 * 60 * 1000);
              updatePlant(g.draggedPlant.id, { startedAt: newStartDate.toISOString() }, true);
              // Reset dy tracking
              g.startScreen.y = screenPos.y;
            }
          }
          return;
        }
      }

      if (viewMode === 'time' && g.timeViewDragMode === 'none') {
        g.isPanning = true;
        setTimelineOffset(g.lastTimelineOffset - dy);
        setTimelineHorizontalOffset(g.lastTimelineHorizontalOffset + dx);
      } else if (activeTool === 'space' && viewMode === 'space') {
        g.isDragging = true;
        const currentWorld = screenToWorld(screenPos, pan, zoom);
        setDragPreview({
          startX: g.startWorld.x,
          startY: g.startWorld.y,
          endX: currentWorld.x,
          endY: currentWorld.y,
        });
      } else if (!activeTool && !selectedSeedId) {
        g.isPanning = true;
        setPan({
          x: g.lastPan.x + dx,
          y: g.lastPan.y + dy,
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const g = gestureRef.current;

      // If we were doing space drag, don't trigger tap
      if (g.spaceDragMode !== 'none') {
        g.spaceDragMode = 'none';
        g.draggedSpaceId = null;
        g.resizeEdge = null;
        g.originalSpace = null;
        g.moved = false;
        return;
      }

      // If we were doing Time View drag, don't trigger tap
      if (g.timeViewDragMode !== 'none') {
        g.timeViewDragMode = 'none';
        g.draggedPlant = null;
        g.draggedStage = null;
        g.originalStageDays = 0;
        g.startColumnIndex = -1;
        g.moved = false;
        return;
      }

      if (g.isDragging && dragPreview) {
        handleDragEnd(
          { x: dragPreview.startX, y: dragPreview.startY },
          { x: dragPreview.endX, y: dragPreview.endY }
        );
      } else if (!g.moved) {
        const screenPos = getCanvasPoint(e.clientX, e.clientY);
        handleTap(screenPos);
      }

      g.isPanning = false;
      g.isDragging = false;
      g.moved = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (viewMode === 'time') return;

      const screenPos = getCanvasPoint(e.clientX, e.clientY);
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = clamp(zoom * delta, MIN_ZOOM, MAX_ZOOM);

      // Zoom towards mouse position
      const worldX = (screenPos.x - pan.x) / zoom;
      const worldY = (screenPos.y - pan.y) / zoom;

      const newPanX = screenPos.x - worldX * newZoom;
      const newPanY = screenPos.y - worldY * newZoom;

      setPan({ x: newPanX, y: newPanY });
      setZoom(newZoom);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [
    canvasRef, pan, zoom, activeTool, selectedSeedId, viewMode,
    getCanvasPoint, handleTap, handleDragEnd, setPan, setZoom, setDragPreview, dragPreview,
    timelineOffset, timelineHorizontalOffset, setTimelineOffset, setTimelineHorizontalOffset,
    selection, spaces, plants, strains, readOnly, updateSpace, updatePlant, canResizeSpace, setSelection,
    saveSnapshot,
  ]);
}
