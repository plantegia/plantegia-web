import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  screenToWorld,
  findSpaceAt,
  findCellInSpace,
  findPlantAt,
  canPlacePlant,
  canPlacePlantAtTime,
  getPlantDurationFromStrain,
  snapToGrid,
  findSpaceEdgeAt,
  SpaceEdge,
  TIME_VIEW_CONSTANTS,
  getPlantBounds,
  findSegmentAtHorizontal,
  findSlotAtY,
  screenXToDate,
  SegmentHitZone,
  getStageDuration,
  findMergeButtonAt,
} from '../utils/grid';
import { MIN_ZOOM, MAX_ZOOM, MIN_TIMELINE_ZOOM, MAX_TIMELINE_ZOOM, CELL_SIZE, SPACE_COLORS, CURSORS, EDGE_CURSORS, LONG_PRESS_DURATION, LONG_PRESS_MOVE_THRESHOLD } from '../constants';
import type { Point, Space, Stage } from '../types';
import { triggerHaptic } from '../utils/haptic';

type SpaceDragMode = 'none' | 'move' | 'resize' | 'plant-move';
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
  // Plant drag state (Space View)
  draggedSpaceViewPlantId: string | null;
  originalPlantPosition: { spaceId: string | null; gridX: number; gridY: number } | null;
  // New Time View drag state (horizontal timeline)
  timeViewDragMode: TimeViewDragMode;
  draggedTimeViewPlantId: string | null;
  draggedSegmentId: string | null;
  segmentHitZone: SegmentHitZone | null;
  originalStartedAt: string | null;
  // Stage resize
  resizingStage: Stage | null;
  originalStageDays: number | null;
  // Long press for touch drag
  longPressTimer: ReturnType<typeof setTimeout> | null;
  longPressTriggered: boolean;
  longPressTarget: {
    type: 'plant' | 'space' | 'segment';
    id: string;
    segmentId?: string;
  } | null;
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
    draggedSpaceViewPlantId: null,
    originalPlantPosition: null,
    draggedTimeViewPlantId: null,
    draggedSegmentId: null,
    segmentHitZone: null,
    originalStartedAt: null,
    resizingStage: null,
    originalStageDays: null,
    longPressTimer: null,
    longPressTriggered: false,
    longPressTarget: null,
  });

  const {
    pan, setPan, zoom, setZoom,
    activeTool, selectedSeedId, setActiveTool,
    spaces, plants, strains, inventory,
    createSpace, createPlant, consumeSeed,
    deletePlant, deleteSpace, updateSpace, updatePlant,
    setSelection, selection,
    setDragPreview, dragPreview,
    viewMode,
    timelineOffset, setTimelineOffset,
    timelineHorizontalOffset, setTimelineHorizontalOffset,
    timelineZoom, setTimelineZoom,
    saveSnapshot,
    // Segment operations
    splitSegment, mergeSegments, moveSegmentToSlot, shiftPlantInTime, movePlantInSpaceView,
    // Cursor
    setCanvasCursor,
    // Split preview
    setSplitPreview,
    // Placement preview
    setPlacementPreview,
    // Time View placement preview
    setTimeViewPlacementPreview,
    // Plant drag preview
    setPlantDragPreview,
    // Long press preview
    setLongPressPreview,
  } = useAppStore();

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    return {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top,
    };
  }, [canvasRect]);

  // Get cursor for current tool/seed selection
  const getToolCursor = useCallback((): string | null => {
    if (activeTool === 'space') return CURSORS.crosshair;
    if (activeTool === 'erase') return CURSORS.notAllowed;
    if (activeTool === 'split') return CURSORS.split;
    if (selectedSeedId) return CURSORS.cell;
    return null;
  }, [activeTool, selectedSeedId]);

  // Determine cursor based on current state and hover position
  const updateCursor = useCallback((screenPos: Point, isDragging: boolean, dragMode: SpaceDragMode | TimeViewDragMode, resizeEdge?: SpaceEdge | null) => {
    // Priority 1: Active drag operation
    if (isDragging) {
      if (dragMode === 'move' || dragMode === 'plant-move' || dragMode === 'segment-move-x' || dragMode === 'segment-move-y') {
        setCanvasCursor(CURSORS.grabbing);
        return;
      }
      if (dragMode === 'resize' && resizeEdge) {
        setCanvasCursor(EDGE_CURSORS[resizeEdge] || CURSORS.default);
        return;
      }
      if (dragMode === 'stage-resize') {
        setCanvasCursor(CURSORS.colResize);
        return;
      }
      if (dragMode === 'pan') {
        setCanvasCursor(CURSORS.grabbing);
        return;
      }
    }

    // Priority 2: Tool/seed selected
    const toolCursor = getToolCursor();
    if (toolCursor) {
      setCanvasCursor(toolCursor);
      // Update split preview when split tool is active and hovering over segment
      if (activeTool === 'split' && viewMode === 'time') {
        const hitResult = findSegmentAtHorizontal(
          screenPos.x,
          screenPos.y,
          plants,
          strains,
          spaces,
          timelineHorizontalOffset,
          timelineOffset,
          new Date(),
          timelineZoom
        );
        if (hitResult) {
          setSplitPreview({ x: screenPos.x, plantId: hitResult.plant.id, segmentId: hitResult.segmentId });
        } else {
          setSplitPreview(null);
        }
        setPlacementPreview(null);
      } else if (selectedSeedId && viewMode === 'space') {
        // Update placement preview when seed is selected
        setSplitPreview(null);
        setTimeViewPlacementPreview(null);
        const worldPos = screenToWorld(screenPos, pan, zoom);
        // Snap to grid for preview (show on any cell, not just inside spaces)
        const snappedX = snapToGrid(worldPos.x);
        const snappedY = snapToGrid(worldPos.y);

        // Get abbreviation from selected seed's strain
        const seed = inventory.find(s => s.id === selectedSeedId);
        const strain = seed ? strains.find(st => st.id === seed.strainId) : null;
        const abbreviation = strain?.abbreviation || 'PLT';

        // Check if we can place at this location
        const space = findSpaceAt(worldPos, spaces);
        let canPlace = false;
        if (space) {
          const cell = findCellInSpace(worldPos, space);
          if (cell) {
            canPlace = canPlacePlant(space.id, cell.gridX, cell.gridY, 1, space, plants);
          }
        }

        setPlacementPreview({ worldX: snappedX, worldY: snappedY, canPlace, abbreviation });
      } else if (selectedSeedId && viewMode === 'time') {
        // Update Time View placement preview when seed is selected
        setSplitPreview(null);
        setPlacementPreview(null);

        const slot = findSlotAtY(screenPos.y, timelineOffset, spaces, plants);
        if (slot && !slot.isSpaceHeader) {
          const seed = inventory.find(s => s.id === selectedSeedId);
          const strain = seed ? strains.find(st => st.id === seed.strainId) : undefined;
          const abbreviation = strain?.abbreviation || 'PLT';

          // Calculate start date from cursor position and plant duration
          const startDate = screenXToDate(screenPos.x, timelineHorizontalOffset);
          const duration = getPlantDurationFromStrain(strain);

          // Check for time-based conflicts (not just space occupancy)
          const canPlace = canPlacePlantAtTime(
            slot.spaceId,
            slot.gridX,
            slot.gridY,
            startDate,
            duration,
            plants,
            strains
          );

          setTimeViewPlacementPreview({
            screenX: screenPos.x,
            spaceId: slot.spaceId,
            gridX: slot.gridX,
            gridY: slot.gridY,
            canPlace,
            abbreviation,
            strainId: seed?.strainId || null,
          });
        } else {
          setTimeViewPlacementPreview(null);
        }
      } else {
        setSplitPreview(null);
        setPlacementPreview(null);
        setTimeViewPlacementPreview(null);
      }
      return;
    }

    // Clear previews when no tool selected
    setSplitPreview(null);
    setPlacementPreview(null);
    setTimeViewPlacementPreview(null);

    // Priority 3: Hover detection
    const worldPos = screenToWorld(screenPos, pan, zoom);

    if (viewMode === 'space') {
      // Check if hovering over selected space edges/body
      if (selection?.type === 'space') {
        const space = spaces.find(s => s.id === selection.id);
        if (space) {
          const edge = findSpaceEdgeAt(worldPos, space);
          if (edge) {
            setCanvasCursor(EDGE_CURSORS[edge] || CURSORS.default);
            return;
          }
        }
      }

      // Check if hovering over any plant
      const plant = findPlantAt(worldPos, plants, spaces);
      if (plant) {
        setCanvasCursor(CURSORS.pointer);
        return;
      }

      // Check if hovering over any space (for selection)
      const space = findSpaceAt(worldPos, spaces);
      if (space) {
        setCanvasCursor(CURSORS.pointer);
        return;
      }
    } else if (viewMode === 'time') {
      // Check for merge button hover first
      const mergeHit = findMergeButtonAt(
        screenPos.x,
        screenPos.y,
        plants,
        spaces,
        timelineHorizontalOffset,
        timelineOffset,
        new Date(),
        timelineZoom
      );

      if (mergeHit) {
        setCanvasCursor(CURSORS.pointer);
        return;
      }

      // Check for segment hover
      const hitResult = findSegmentAtHorizontal(
        screenPos.x,
        screenPos.y,
        plants,
        strains,
        spaces,
        timelineHorizontalOffset,
        timelineOffset,
        new Date(),
        timelineZoom
      );

      if (hitResult) {
        if (hitResult.hitZone === 'stage-handle') {
          setCanvasCursor(CURSORS.colResize);
          return;
        }
        setCanvasCursor(CURSORS.grab);
        return;
      }
    }

    // Default cursor
    setCanvasCursor(CURSORS.default);
  }, [getToolCursor, activeTool, selectedSeedId, viewMode, pan, zoom, timelineZoom, selection, spaces, plants, strains, inventory, timelineOffset, timelineHorizontalOffset, setCanvasCursor, setSplitPreview, setPlacementPreview, setTimeViewPlacementPreview]);

  // Update cursor when tool/seed selection changes (without mouse movement)
  useEffect(() => {
    const toolCursor = getToolCursor();
    setCanvasCursor(toolCursor || CURSORS.default);
  }, [getToolCursor, setCanvasCursor]);

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
            }
          }
        }
      }
      return;
    }

    if (selectedSeedId && viewMode === 'time') {
      // In new horizontal Time View, tapping with seed selected places a plant at that slot/date
      const slot = findSlotAtY(screenPos.y, timelineOffset, spaces, plants);
      if (!slot || slot.isSpaceHeader) return;

      const seed = inventory.find(s => s.id === selectedSeedId);
      if (!seed || seed.quantity <= 0) return;

      // For floating slots (spaceId === null), we don't need a space
      const space = slot.spaceId ? spaces.find(s => s.id === slot.spaceId) : null;
      if (slot.spaceId && !space) return;

      // Get date from X position and calculate duration
      const startDate = screenXToDate(screenPos.x, timelineHorizontalOffset);
      const strain = strains.find(st => st.id === seed.strainId);
      const duration = getPlantDurationFromStrain(strain);

      // Check for time-based conflicts (not just space occupancy)
      if (!canPlacePlantAtTime(slot.spaceId, slot.gridX, slot.gridY, startDate, duration, plants, strains)) return;

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
        timelineOffset,
        new Date(),
        timelineZoom
      );

      if (hitResult) {
        const { plant, segmentId } = hitResult;
        const splitDate = screenXToDate(screenPos.x, timelineHorizontalOffset, new Date(), timelineZoom);
        splitSegment(plant.id, segmentId, splitDate);
        // Reset to cursor after splitting
        setActiveTool('cursor');
      }
      return;
    }

    // Handle merge button click in Time View (before checking for segment drag)
    if ((!activeTool || activeTool === 'cursor') && viewMode === 'time') {
      const mergeHit = findMergeButtonAt(
        screenPos.x,
        screenPos.y,
        plants,
        spaces,
        timelineHorizontalOffset,
        timelineOffset,
        new Date(),
        timelineZoom
      );

      if (mergeHit) {
        mergeSegments(mergeHit.plantId, mergeHit.segmentIndex);
        return;
      }
    }

    // In Time View, don't select plants on tap (no inspector needed)
    // Drag interactions are handled in mouseDown/mouseMove
    if ((!activeTool || activeTool === 'cursor') && !selectedSeedId && viewMode === 'time') {
      // Clear selection on tap outside plants
      setSelection(null);
      return;
    }

    if ((!activeTool || activeTool === 'cursor') && !selectedSeedId && viewMode === 'space') {
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
    pan, zoom, timelineZoom, activeTool, selectedSeedId, spaces, plants, strains, inventory, viewMode,
    deletePlant, deleteSpace, createPlant, consumeSeed, setSelection, setActiveTool,
    timelineOffset, timelineHorizontalOffset, readOnly, splitSegment, mergeSegments,
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
      // Reset to cursor after creating space
      setActiveTool('cursor');
    }

    setDragPreview(null);
  }, [activeTool, viewMode, spaces.length, createSpace, setDragPreview, readOnly, setActiveTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Helper to clear long press state
    const clearLongPress = () => {
      const g = gestureRef.current;
      if (g.longPressTimer) {
        clearTimeout(g.longPressTimer);
        g.longPressTimer = null;
      }
      g.longPressTriggered = false;
      g.longPressTarget = null;
      setLongPressPreview(null);
    };

    // Helper to start long press animation
    const startLongPressAnimation = (target: GestureState['longPressTarget'], screenPos: Point) => {
      const g = gestureRef.current;
      if (!target) return;

      let progress = 0;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(1, elapsed / LONG_PRESS_DURATION);

        if (g.longPressTarget === target) {
          setLongPressPreview({
            type: target.type,
            id: target.id,
            segmentId: target.segmentId,
            screenX: screenPos.x,
            screenY: screenPos.y,
            progress,
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
      };

      requestAnimationFrame(animate);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;

      // Clear any existing long press
      clearLongPress();

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
        g.spaceDragMode = 'none';
        g.timeViewDragMode = 'none';

        // Don't start long press if we have an active tool or seed selected
        if (readOnly || activeTool === 'space' || activeTool === 'erase' || activeTool === 'split' || selectedSeedId) {
          return;
        }

        // Detect what we're touching for potential long press drag
        if (viewMode === 'space') {
          // Check for plant
          const plant = findPlantAt(g.startWorld, plants, spaces);
          if (plant) {
            g.longPressTarget = { type: 'plant', id: plant.id };
            startLongPressAnimation(g.longPressTarget, screenPos);

            g.longPressTimer = setTimeout(() => {
              if (g.longPressTarget?.type === 'plant') {
                triggerHaptic('medium');
                g.longPressTriggered = true;
                g.spaceDragMode = 'plant-move';
                g.draggedSpaceViewPlantId = plant.id;
                g.originalPlantPosition = {
                  spaceId: plant.spaceId,
                  gridX: plant.gridX,
                  gridY: plant.gridY,
                };
                saveSnapshot();
              }
            }, LONG_PRESS_DURATION);
            return;
          }

          // Check for selected space (for move/resize)
          if (selection?.type === 'space') {
            const space = spaces.find(s => s.id === selection.id);
            if (space) {
              const edge = findSpaceEdgeAt(g.startWorld, space);
              if (edge) {
                g.longPressTarget = { type: 'space', id: space.id };
                startLongPressAnimation(g.longPressTarget, screenPos);

                g.longPressTimer = setTimeout(() => {
                  if (g.longPressTarget?.type === 'space') {
                    triggerHaptic('medium');
                    g.longPressTriggered = true;
                    if (edge === 'body') {
                      g.spaceDragMode = 'move';
                    } else {
                      g.spaceDragMode = 'resize';
                      g.resizeEdge = edge;
                    }
                    g.draggedSpaceId = space.id;
                    g.originalSpace = { ...space };
                    saveSnapshot();
                  }
                }, LONG_PRESS_DURATION);
                return;
              }
            }
          }
        } else if (viewMode === 'time') {
          // Check for segment
          const hitResult = findSegmentAtHorizontal(
            screenPos.x,
            screenPos.y,
            plants,
            strains,
            spaces,
            timelineHorizontalOffset,
            timelineOffset,
            new Date(),
            timelineZoom
          );

          if (hitResult) {
            g.longPressTarget = {
              type: 'segment',
              id: hitResult.plant.id,
              segmentId: hitResult.segmentId,
            };
            startLongPressAnimation(g.longPressTarget, screenPos);

            g.longPressTimer = setTimeout(() => {
              if (g.longPressTarget?.type === 'segment') {
                triggerHaptic('medium');
                g.longPressTriggered = true;
                g.draggedTimeViewPlantId = hitResult.plant.id;
                g.draggedSegmentId = hitResult.segmentId;
                g.segmentHitZone = hitResult.hitZone;
                g.originalStartedAt = hitResult.plant.startedAt;

                if (hitResult.hitZone === 'stage-handle' && hitResult.stage) {
                  g.timeViewDragMode = 'stage-resize';
                  g.resizingStage = hitResult.stage;
                  const strain = strains.find((s) => s.id === hitResult.plant.strainId);
                  g.originalStageDays = getStageDuration(hitResult.stage, hitResult.plant, strain);
                } else {
                  g.timeViewDragMode = 'segment-move-x';
                }
                saveSnapshot();
              }
            }, LONG_PRESS_DURATION);
            return;
          }
        }
      }

      if (e.touches.length === 2) {
        clearLongPress();
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
        clearLongPress();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scale = dist / g.pinchStartDistance;
        const newZoom = clamp(g.pinchStartZoom * scale, MIN_ZOOM, MAX_ZOOM);

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
        const distance = Math.hypot(dx, dy);

        // Cancel long press if moved too much before it triggered
        if (!g.longPressTriggered && distance > LONG_PRESS_MOVE_THRESHOLD) {
          clearLongPress();
          g.moved = true;
        }

        // Handle drag after long press triggered
        if (g.longPressTriggered) {
          // Mark as moved when dragging after long press
          if (distance > LONG_PRESS_MOVE_THRESHOLD) {
            g.moved = true;
          }

          // Plant drag in Space View
          if (g.spaceDragMode === 'plant-move' && g.draggedSpaceViewPlantId) {
            const currentWorld = screenToWorld(screenPos, pan, zoom);
            const draggedPlant = plants.find(p => p.id === g.draggedSpaceViewPlantId);
            const strain = draggedPlant?.strainId ? strains.find(s => s.id === draggedPlant.strainId) : null;
            const abbreviation = strain?.abbreviation || 'PLT';

            const origPos = g.originalPlantPosition;
            const sourceSpace = origPos?.spaceId ? spaces.find(s => s.id === origPos.spaceId) : null;
            const sourceWorldX = sourceSpace && origPos ? sourceSpace.originX + origPos.gridX * CELL_SIZE : 0;
            const sourceWorldY = sourceSpace && origPos ? sourceSpace.originY + origPos.gridY * CELL_SIZE : 0;

            const targetSpace = findSpaceAt(currentWorld, spaces);
            if (targetSpace) {
              const cell = findCellInSpace(currentWorld, targetSpace);
              if (cell) {
                const canPlace = canPlacePlant(targetSpace.id, cell.gridX, cell.gridY, 1, targetSpace, plants, g.draggedSpaceViewPlantId);
                const targetWorldX = targetSpace.originX + cell.gridX * CELL_SIZE;
                const targetWorldY = targetSpace.originY + cell.gridY * CELL_SIZE;

                setPlantDragPreview({
                  plantId: g.draggedSpaceViewPlantId,
                  abbreviation,
                  sourceWorldX,
                  sourceWorldY,
                  targetWorldX,
                  targetWorldY,
                  canPlace,
                });
                return;
              }
            }

            // Not over valid cell
            const snappedX = snapToGrid(currentWorld.x);
            const snappedY = snapToGrid(currentWorld.y);
            setPlantDragPreview({
              plantId: g.draggedSpaceViewPlantId,
              abbreviation,
              sourceWorldX,
              sourceWorldY,
              targetWorldX: snappedX,
              targetWorldY: snappedY,
              canPlace: false,
            });
            return;
          }

          // Space move/resize
          if ((g.spaceDragMode === 'move' || g.spaceDragMode === 'resize') && g.originalSpace && g.draggedSpaceId) {
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

          // Time View segment drag
          if (g.timeViewDragMode !== 'none' && g.draggedTimeViewPlantId) {
            const { dayWidth: baseDayWidth } = TIME_VIEW_CONSTANTS;
            const dayWidth = baseDayWidth * timelineZoom;

            // Detect vertical vs horizontal movement
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const moveThreshold = 10;

            if (g.timeViewDragMode === 'segment-move-x' && absDy > moveThreshold && absDy > absDx * 1.5) {
              g.timeViewDragMode = 'segment-move-y';
            }

            if (g.timeViewDragMode === 'segment-move-x') {
              const daysDelta = Math.round(dx / dayWidth);
              if (daysDelta !== 0) {
                shiftPlantInTime(g.draggedTimeViewPlantId, daysDelta);
                g.startScreen.x = screenPos.x;
              }
              return;
            }

            if (g.timeViewDragMode === 'segment-move-y') {
              const slot = findSlotAtY(screenPos.y, timelineOffset, spaces, plants);
              if (slot && !slot.isSpaceHeader && g.draggedSegmentId) {
                moveSegmentToSlot(g.draggedTimeViewPlantId, g.draggedSegmentId, {
                  spaceId: slot.spaceId,
                  gridX: slot.gridX,
                  gridY: slot.gridY,
                });
              }
              return;
            }

            if (g.timeViewDragMode === 'stage-resize' && g.resizingStage && g.originalStageDays !== null) {
              const daysDelta = Math.round(dx / dayWidth);
              const newDays = Math.max(1, g.originalStageDays + daysDelta);
              const plant = plants.find((p) => p.id === g.draggedTimeViewPlantId);
              if (plant) {
                const newCustomStageDays = {
                  ...plant.customStageDays,
                  [g.resizingStage]: newDays,
                };
                updatePlant(g.draggedTimeViewPlantId, { customStageDays: newCustomStageDays }, true);
              }
              return;
            }
          }
        }

        // Regular pan/scroll (not dragging)
        if (distance > 5) {
          g.moved = true;
        }

        if (!g.longPressTriggered) {
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
          } else if ((!activeTool || activeTool === 'cursor') && !selectedSeedId) {
            g.isPanning = true;
            setPan({
              x: g.lastPan.x + dx,
              y: g.lastPan.y + dy,
            });
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;

      // Save long press state before clearing
      const wasLongPressTriggered = g.longPressTriggered;

      // Clear long press timer
      clearLongPress();

      // Complete plant drag in Space View
      if (g.spaceDragMode === 'plant-move' && g.draggedSpaceViewPlantId && wasLongPressTriggered) {
        if (g.moved) {
          const touch = e.changedTouches[0];
          if (touch) {
            const screenPos = getCanvasPoint(touch.clientX, touch.clientY);
            const currentWorld = screenToWorld(screenPos, pan, zoom);
            const targetSpace = findSpaceAt(currentWorld, spaces);

            if (targetSpace) {
              const cell = findCellInSpace(currentWorld, targetSpace);
              if (cell) {
                const canPlace = canPlacePlant(targetSpace.id, cell.gridX, cell.gridY, 1, targetSpace, plants, g.draggedSpaceViewPlantId);
                if (canPlace) {
                  movePlantInSpaceView(g.draggedSpaceViewPlantId, targetSpace.id, cell.gridX, cell.gridY);
                }
              }
            }
          }
        }
        setPlantDragPreview(null);
      }

      // Reset all drag state
      g.spaceDragMode = 'none';
      g.draggedSpaceId = null;
      g.resizeEdge = null;
      g.originalSpace = null;
      g.draggedSpaceViewPlantId = null;
      g.originalPlantPosition = null;
      g.timeViewDragMode = 'none';
      g.draggedTimeViewPlantId = null;
      g.draggedSegmentId = null;
      g.segmentHitZone = null;
      g.originalStartedAt = null;
      g.resizingStage = null;
      g.originalStageDays = null;
      g.longPressTriggered = false;
      g.longPressTarget = null;

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
      g.draggedTimeViewPlantId = null;
      g.draggedSegmentId = null;
      g.segmentHitZone = null;
      g.originalStartedAt = null;

      // Reset plant drag state
      g.draggedSpaceViewPlantId = null;
      g.originalPlantPosition = null;

      // Check if clicking on selected space's edges for resize/move (Space View)
      if (!readOnly && selection?.type === 'space' && viewMode === 'space' && (!activeTool || activeTool === 'cursor') && !selectedSeedId) {
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

      // Check if clicking on plant for drag (Space View)
      if (!readOnly && viewMode === 'space' && (!activeTool || activeTool === 'cursor') && !selectedSeedId) {
        const plant = findPlantAt(g.startWorld, plants, spaces);
        if (plant) {
          g.spaceDragMode = 'plant-move';
          g.draggedSpaceViewPlantId = plant.id;
          g.originalPlantPosition = {
            spaceId: plant.spaceId,
            gridX: plant.gridX,
            gridY: plant.gridY,
          };
        }
      }

      // Check for Time View drag interactions (new horizontal timeline)
      if (!readOnly && viewMode === 'time' && !selectedSeedId) {
        // Check if split tool is active - handled on tap, not drag
        if (activeTool === 'split') {
          // Split tool handled in handleTap
          return;
        }

        // Check if clicking on merge button - handled on tap, not drag
        const mergeHit = findMergeButtonAt(
          screenPos.x,
          screenPos.y,
          plants,
          spaces,
          timelineHorizontalOffset,
          timelineOffset,
          new Date(),
          timelineZoom
        );
        if (mergeHit) {
          // Merge button click will be handled in handleTap
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
          timelineOffset,
          new Date(),
          timelineZoom
        );

        if (hitResult && (!activeTool || activeTool === 'cursor')) {
          const { plant, segmentId, hitZone, stage } = hitResult;

          saveSnapshot(); // Save before drag starts
          g.draggedTimeViewPlantId = plant.id;
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
      const g = gestureRef.current;
      const screenPos = getCanvasPoint(e.clientX, e.clientY);

      // Handle hover (no button pressed)
      if (e.buttons === 0) {
        updateCursor(screenPos, false, 'none', null);
        return;
      }

      // Handle drag (button pressed)
      if (e.buttons !== 1) return;

      // Update cursor during drag
      if (g.spaceDragMode !== 'none') {
        updateCursor(screenPos, true, g.spaceDragMode, g.resizeEdge);
      } else if (g.timeViewDragMode !== 'none') {
        updateCursor(screenPos, true, g.timeViewDragMode, null);
      } else if (g.isPanning) {
        updateCursor(screenPos, true, 'pan', null);
      }

      const dx = screenPos.x - g.startScreen.x;
      const dy = screenPos.y - g.startScreen.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        g.moved = true;
      }

      // Handle space move/resize
      if ((g.spaceDragMode === 'move' || g.spaceDragMode === 'resize') && g.originalSpace && g.draggedSpaceId) {
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

      // Handle plant move in Space View
      if (g.spaceDragMode === 'plant-move' && g.draggedSpaceViewPlantId && g.originalPlantPosition) {
        const currentWorld = screenToWorld(screenPos, pan, zoom);
        const draggedPlant = plants.find(p => p.id === g.draggedSpaceViewPlantId);
        const strain = draggedPlant?.strainId ? strains.find(s => s.id === draggedPlant.strainId) : null;
        const abbreviation = strain?.abbreviation || 'PLT';

        // Get source position in world coordinates
        const origPos = g.originalPlantPosition;
        const sourceSpace = origPos.spaceId ? spaces.find(s => s.id === origPos.spaceId) : null;
        const sourceWorldX = sourceSpace ? sourceSpace.originX + origPos.gridX * CELL_SIZE : 0;
        const sourceWorldY = sourceSpace ? sourceSpace.originY + origPos.gridY * CELL_SIZE : 0;

        // Find which space and cell the cursor is over
        const targetSpace = findSpaceAt(currentWorld, spaces);
        if (targetSpace) {
          const cell = findCellInSpace(currentWorld, targetSpace);
          if (cell) {
            // Check if can place (excluding the dragged plant itself)
            const canPlace = canPlacePlant(targetSpace.id, cell.gridX, cell.gridY, 1, targetSpace, plants, g.draggedSpaceViewPlantId);
            const targetWorldX = targetSpace.originX + cell.gridX * CELL_SIZE;
            const targetWorldY = targetSpace.originY + cell.gridY * CELL_SIZE;

            setPlantDragPreview({
              plantId: g.draggedSpaceViewPlantId,
              abbreviation,
              sourceWorldX,
              sourceWorldY,
              targetWorldX,
              targetWorldY,
              canPlace,
            });
            updateCursor(screenPos, true, 'plant-move', null);
            return;
          }
        }

        // Cursor not over valid cell - show preview at cursor position as invalid
        const snappedX = snapToGrid(currentWorld.x);
        const snappedY = snapToGrid(currentWorld.y);
        setPlantDragPreview({
          plantId: g.draggedSpaceViewPlantId,
          abbreviation,
          sourceWorldX,
          sourceWorldY,
          targetWorldX: snappedX,
          targetWorldY: snappedY,
          canPlace: false,
        });
        updateCursor(screenPos, true, 'plant-move', null);
        return;
      }

      // Handle new horizontal Time View drag interactions
      if (g.timeViewDragMode !== 'none' && g.draggedTimeViewPlantId) {
        const { dayWidth: baseDayWidth } = TIME_VIEW_CONSTANTS;
        const dayWidth = baseDayWidth * timelineZoom;

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
            shiftPlantInTime(g.draggedTimeViewPlantId, daysDelta);
            // Reset dx tracking by updating start position
            g.startScreen.x = screenPos.x;
          }
          return;
        }

        if (g.timeViewDragMode === 'segment-move-y') {
          // Vertical drag = move segment to different slot
          const slot = findSlotAtY(screenPos.y, timelineOffset, spaces, plants);
          if (slot && !slot.isSpaceHeader && g.draggedSegmentId) {
            moveSegmentToSlot(g.draggedTimeViewPlantId, g.draggedSegmentId, {
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
          const plant = plants.find((p) => p.id === g.draggedTimeViewPlantId);
          if (plant) {
            const newCustomStageDays = {
              ...plant.customStageDays,
              [g.resizingStage]: newDays,
            };
            updatePlant(g.draggedTimeViewPlantId, { customStageDays: newCustomStageDays }, true);
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
      } else if ((!activeTool || activeTool === 'cursor') && !selectedSeedId) {
        g.isPanning = true;
        setPan({
          x: g.lastPan.x + dx,
          y: g.lastPan.y + dy,
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const g = gestureRef.current;
      const screenPos = getCanvasPoint(e.clientX, e.clientY);

      // If we were doing plant drag in Space View
      if (g.spaceDragMode === 'plant-move' && g.draggedSpaceViewPlantId) {
        if (g.moved) {
          // Complete the move
          const currentWorld = screenToWorld(screenPos, pan, zoom);
          const targetSpace = findSpaceAt(currentWorld, spaces);

          if (targetSpace) {
            const cell = findCellInSpace(currentWorld, targetSpace);
            if (cell) {
              const canPlace = canPlacePlant(targetSpace.id, cell.gridX, cell.gridY, 1, targetSpace, plants, g.draggedSpaceViewPlantId);
              if (canPlace) {
                movePlantInSpaceView(g.draggedSpaceViewPlantId, targetSpace.id, cell.gridX, cell.gridY);
              }
            }
          }
        } else {
          // No movement - this is a tap, select the plant
          setSelection({ type: 'plant', id: g.draggedSpaceViewPlantId });
        }

        g.spaceDragMode = 'none';
        g.draggedSpaceViewPlantId = null;
        g.originalPlantPosition = null;
        g.moved = false;
        setPlantDragPreview(null);
        updateCursor(screenPos, false, 'none', null);
        return;
      }

      // If we were doing space drag (move/resize), don't trigger tap
      if (g.spaceDragMode === 'move' || g.spaceDragMode === 'resize') {
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
        g.draggedTimeViewPlantId = null;
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
        handleTap(screenPos);
      }

      g.isPanning = false;
      g.isDragging = false;
      g.moved = false;

      // Reset cursor after drag ends
      updateCursor(screenPos, false, 'none', null);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const screenPos = getCanvasPoint(e.clientX, e.clientY);
      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      if (viewMode === 'time') {
        // Time View: zoom horizontally (time scale)
        const { leftMargin } = TIME_VIEW_CONSTANTS;
        const newZoom = clamp(timelineZoom * delta, MIN_TIMELINE_ZOOM, MAX_TIMELINE_ZOOM);

        // Zoom towards mouse X position (keeping the date under cursor stable)
        const mouseX = screenPos.x - leftMargin;
        const worldX = (mouseX - timelineHorizontalOffset) / timelineZoom;
        const newOffsetX = mouseX - worldX * newZoom;

        setTimelineHorizontalOffset(newOffsetX);
        setTimelineZoom(newZoom);
      } else {
        // Space View: zoom both axes
        const newZoom = clamp(zoom * delta, MIN_ZOOM, MAX_ZOOM);

        // Zoom towards mouse position
        const worldX = (screenPos.x - pan.x) / zoom;
        const worldY = (screenPos.y - pan.y) / zoom;

        const newPanX = screenPos.x - worldX * newZoom;
        const newPanY = screenPos.y - worldY * newZoom;

        setPan({ x: newPanX, y: newPanY });
        setZoom(newZoom);
      }
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
    timelineZoom, setTimelineZoom,
    selection, spaces, plants, strains, readOnly, updateSpace, updatePlant, canResizeSpace, setSelection,
    saveSnapshot, splitSegment, moveSegmentToSlot, shiftPlantInTime, movePlantInSpaceView, setPlantDragPreview, updateCursor,
    setLongPressPreview, canvasRect, inventory,
  ]);
}
