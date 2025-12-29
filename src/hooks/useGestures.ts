import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { screenToWorld, findSpaceAt, findCellInSpace, findPlantAt, canPlacePlant, snapToGrid } from '../utils/grid';
import { MIN_ZOOM, MAX_ZOOM, CELL_SIZE } from '../constants';
import type { Point } from '../types';

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
  });

  const {
    pan, setPan, zoom, setZoom,
    activeTool, selectedSeedId,
    spaces, plants, strains, inventory,
    createSpace, createPlant, consumeSeed,
    deletePlant, deleteSpace,
    setSelection, selection,
    setDragPreview, dragPreview,
    viewMode,
    timelineOffset, setTimelineOffset,
    timelineHorizontalOffset, setTimelineHorizontalOffset,
  } = useAppStore();

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    return {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top,
    };
  }, [canvasRect]);

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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dayHeight = 8;
      const columnWidth = 60;
      const headerHeight = 40;
      const leftMargin = 50;
      const canvasHeight = canvas.height;
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

      const daysFromToday = Math.round((todayY - screenPos.y) / dayHeight);
      if (daysFromToday < 0) return;

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

      createSpace({
        name: `Space ${spaces.length + 1}`,
        originX,
        originY,
        gridWidth,
        gridHeight,
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
    };

    const handleMouseUp = (e: MouseEvent) => {
      const g = gestureRef.current;

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
  ]);
}
