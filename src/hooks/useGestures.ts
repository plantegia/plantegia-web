import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  screenToWorld,
  findSpaceAt,
  findCellInSpace,
  findPlantAt,
  canPlacePlant,
  snapToGrid,
  findSpaceEdgeAt,
  SpaceEdge,
  TIME_VIEW_CONSTANTS,
  getPlantBounds,
  getCanvasCssHeight,
  findSegmentAtHorizontal,
  findSlotAtY,
  screenXToDate,
  buildSlotList,
  SegmentHitZone,
  getStageDuration,
} from '../utils/grid';
import { MIN_ZOOM, MAX_ZOOM, CELL_SIZE, SPACE_COLORS } from '../constants';
import type { Point, Space, Plant, Stage, PlantSegment } from '../types';

type SpaceDragMode = 'none' | 'move' | 'resize';
type TimeViewDragMode = 'none' | 'segment-move-x' | 'segment-move-y' | 'stage-resize' | 'pan';

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
  // New Time View drag state (horizontal timeline)
  timeViewDragMode: TimeViewDragMode;
  draggedPlantId: string | null;
  draggedSegmentId: string | null;
  segmentHitZone: SegmentHitZone | null;
  originalStartedAt: string | null;
  // Stage resize
  resizingStage: Stage | null;
  originalStageDays: number | null;
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
    draggedPlantId: null,
    draggedSegmentId: null,
    segmentHitZone: null,
    originalStartedAt: null,
    resizingStage: null,
    originalStageDays: null,
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
    // Segment operations
    splitSegment, moveSegmentToSlot, shiftPlantInTime,
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
      // In new horizontal Time View, tapping with seed selected places a plant at that slot/date
      const slots = buildSlotList(spaces);
      const slot = findSlotAtY(screenPos.y, timelineOffset, spaces);
      if (!slot || slot.isSpaceHeader) return;

      const seed = inventory.find(s => s.id === selectedSeedId);
      if (!seed || seed.quantity <= 0) return;

      const space = spaces.find(s => s.id === slot.spaceId);
      if (!space) return;

      if (!canPlacePlant(space.id, slot.gridX, slot.gridY, 1, space, plants)) return;

      // Get date from X position
      const startDate = screenXToDate(screenPos.x, timelineHorizontalOffset);

      createPlant({
        spaceId: slot.spaceId,
        strainId: seed.strainId,
        gridX: slot.gridX,
        gridY: slot.gridY,
        generation: seed.isClone ? 'clone' : 'seed',
        startedAt: startDate.toISOString(),
      });
      consumeSeed(selectedSeedId);
      return;
    }

    // Handle split tool in Time View
    if (activeTool === 'split' && viewMode === 'time') {
      const hitResult = findSegmentAtHorizontal(
        screenPos.x,
        screenPos.y,
        plants,
        strains,
        spaces,
        timelineHorizontalOffset,
        timelineOffset
      );

      if (hitResult) {
        const { plant, segmentId } = hitResult;
        const splitDate = screenXToDate(screenPos.x, timelineHorizontalOffset);
        splitSegment(plant.id, segmentId, splitDate);
      }
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
    canvasRef, pan, zoom, activeTool, selectedSeedId, spaces, plants, strains, inventory, viewMode,
    deletePlant, deleteSpace, createPlant, consumeSeed, setSelection,
    timelineOffset, timelineHorizontalOffset, readOnly, splitSegment,
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
      g.draggedPlantId = null;
      g.draggedSegmentId = null;
      g.segmentHitZone = null;
      g.originalStartedAt = null;

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

      // Check for Time View drag interactions (new horizontal timeline)
      if (!readOnly && viewMode === 'time' && !selectedSeedId) {
        // Check if split tool is active - handled on tap, not drag
        if (activeTool === 'split') {
          // Split tool handled in handleTap
          return;
        }

        // Check for segment hit
        const hitResult = findSegmentAtHorizontal(
          screenPos.x,
          screenPos.y,
          plants,
          strains,
          spaces,
          timelineHorizontalOffset,
          timelineOffset
        );

        if (hitResult && !activeTool) {
          const { plant, segmentId, hitZone, stage } = hitResult;

          saveSnapshot(); // Save before drag starts
          g.draggedPlantId = plant.id;
          g.draggedSegmentId = segmentId;
          g.segmentHitZone = hitZone;
          g.originalStartedAt = plant.startedAt;

          // Determine drag mode based on hit zone
          if (hitZone === 'stage-handle' && stage) {
            g.timeViewDragMode = 'stage-resize';
            g.resizingStage = stage;
            // Get strain for this plant
            const strain = strains.find((s) => s.id === plant.strainId);
            g.originalStageDays = getStageDuration(stage, plant, strain);
          } else {
            // Body - can switch to Y-move based on movement direction
            g.timeViewDragMode = 'segment-move-x';
            g.resizingStage = null;
            g.originalStageDays = null;
          }
          return;
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

      // Handle new horizontal Time View drag interactions
      if (g.timeViewDragMode !== 'none' && g.draggedPlantId) {
        const { dayWidth, slotHeight } = TIME_VIEW_CONSTANTS;

        // Detect drag direction and lock to X or Y movement
        // Once we've moved enough in one direction, lock to that axis
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const moveThreshold = 10; // pixels before locking direction

        // Determine movement direction if not yet locked
        if (g.timeViewDragMode === 'segment-move-x' && absDy > moveThreshold && absDy > absDx * 1.5) {
          // User is dragging more vertically - switch to Y mode
          g.timeViewDragMode = 'segment-move-y';
        }

        if (g.timeViewDragMode === 'segment-move-x') {
          // Horizontal drag = shift plant in time
          // Calculate days delta based on X movement
          const daysDelta = Math.round(dx / dayWidth);

          if (daysDelta !== 0) {
            shiftPlantInTime(g.draggedPlantId, daysDelta);
            // Reset dx tracking by updating start position
            g.startScreen.x = screenPos.x;
          }
          return;
        }

        if (g.timeViewDragMode === 'segment-move-y') {
          // Vertical drag = move segment to different slot
          const slot = findSlotAtY(screenPos.y, timelineOffset, spaces);
          if (slot && !slot.isSpaceHeader && g.draggedSegmentId) {
            moveSegmentToSlot(g.draggedPlantId, g.draggedSegmentId, {
              spaceId: slot.spaceId,
              gridX: slot.gridX,
              gridY: slot.gridY,
            });
          }
          return;
        }

        if (g.timeViewDragMode === 'stage-resize' && g.resizingStage && g.originalStageDays !== null) {
          // Resize stage duration by dragging its end boundary
          const daysDelta = Math.round(dx / dayWidth);
          const newDays = Math.max(1, g.originalStageDays + daysDelta);

          // Update plant's customStageDays
          const plant = plants.find((p) => p.id === g.draggedPlantId);
          if (plant) {
            const newCustomStageDays = {
              ...plant.customStageDays,
              [g.resizingStage]: newDays,
            };
            updatePlant(g.draggedPlantId, { customStageDays: newCustomStageDays }, true);
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
        g.draggedPlantId = null;
        g.draggedSegmentId = null;
        g.segmentHitZone = null;
        g.originalStartedAt = null;
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
    saveSnapshot, splitSegment, moveSegmentToSlot, shiftPlantInTime,
  ]);
}
