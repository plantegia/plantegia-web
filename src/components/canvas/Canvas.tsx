import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useGestures } from '../../hooks/useGestures';
import { renderSpaceView, renderTimeView, renderBackgroundGrid, renderLongPressIndicator } from './renderers';
import { renderParticles, resetParticles } from './particles';
import { COLORS, CELL_SIZE, FEATURES } from '../../constants';

// Conditionally import bird module only when feature is enabled
const birdModule = FEATURES.BIRD_MINIGAME
  ? await import('./bird')
  : null;
const BirdOverlayComponent = FEATURES.BIRD_MINIGAME
  ? (await import('./BirdOverlay')).BirdOverlay
  : null;

interface CanvasProps {
  readOnly?: boolean;
}

export function Canvas({ readOnly }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: 500 });
  const [canvasRect, setCanvasRect] = useState({ top: 0, left: 0 });
  const hasCentered = useRef(false);
  const birdSpawned = useRef(false);
  const lastFrameTime = useRef(performance.now());
  const birdUIRef = useRef<{ screenX: number; screenY: number; distance: number; leaderboardActive: boolean } | null>(null);
  const [birdUI, setBirdUI] = useState<{ screenX: number; screenY: number; distance: number; leaderboardActive: boolean } | null>(null);

  // Throttled bird UI update to avoid re-renders every frame
  const updateBirdUI = useCallback((newState: typeof birdUI) => {
    const prev = birdUIRef.current;
    const shouldUpdate = newState === null
      ? prev !== null
      : prev === null || prev.leaderboardActive !== newState.leaderboardActive;

    if (shouldUpdate) {
      birdUIRef.current = newState;
      setBirdUI(newState);
    }
  }, []);

  const {
    pan, zoom,
    spaces, plants, strains,
    selection, dragPreview,
    viewMode, timelineOffset, timelineHorizontalOffset, timelineZoom,
    setPan,
    canvasCursor,
    splitPreview,
    placementPreview,
    timeViewPlacementPreview,
    plantDragPreview,
    longPressPreview,
  } = useAppStore();

  useGestures(canvasRef, canvasRect, readOnly);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
        setCanvasRect({
          top: rect.top,
          left: rect.left,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Center view on content on initial load
  useEffect(() => {
    if (hasCentered.current || spaces.length === 0 || canvasSize.width === 0) return;

    // Calculate bounds of all spaces
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    spaces.forEach(space => {
      minX = Math.min(minX, space.originX);
      minY = Math.min(minY, space.originY);
      maxX = Math.max(maxX, space.originX + space.gridWidth * CELL_SIZE);
      maxY = Math.max(maxY, space.originY + space.gridHeight * CELL_SIZE);
    });

    if (minX === Infinity) return;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const contentCenterX = minX + contentWidth / 2;
    const contentCenterY = minY + contentHeight / 2;

    // Center content in canvas
    const newPanX = canvasSize.width / 2 - contentCenterX * zoom;
    const newPanY = canvasSize.height / 2 - contentCenterY * zoom;

    setPan({ x: newPanX, y: newPanY });
    hasCentered.current = true;
  }, [spaces, canvasSize, zoom, setPan]);

  // Store latest state in refs for animation loop
  const stateRef = useRef({
    canvasSize, pan, zoom, spaces, plants, strains,
    selection, dragPreview, viewMode, timelineOffset, timelineHorizontalOffset, timelineZoom,
    splitPreview, placementPreview, timeViewPlacementPreview, plantDragPreview, longPressPreview,
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      canvasSize, pan, zoom, spaces, plants, strains,
      selection, dragPreview, viewMode, timelineOffset, timelineHorizontalOffset, timelineZoom,
      splitPreview, placementPreview, timeViewPlacementPreview, plantDragPreview, longPressPreview,
    };
  }, [
    canvasSize, pan, zoom, spaces, plants, strains,
    selection, dragPreview, viewMode, timelineOffset, timelineHorizontalOffset, timelineZoom,
    splitPreview, placementPreview, timeViewPlacementPreview, plantDragPreview, longPressPreview,
  ]);

  // Reset particles when switching views
  useEffect(() => {
    if (viewMode === 'time') {
      resetParticles();
    }
  }, [viewMode]);

  // Animation loop for particles and bird
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = stateRef.current;
      const dpr = window.devicePixelRatio || 1;
      const now = performance.now();
      const deltaMs = now - lastFrameTime.current;
      lastFrameTime.current = now;

      // Only resize if needed
      if (canvas.width !== state.canvasSize.width * dpr || canvas.height !== state.canvasSize.height * dpr) {
        canvas.width = state.canvasSize.width * dpr;
        canvas.height = state.canvasSize.height * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, state.canvasSize.width, state.canvasSize.height);

      if (state.viewMode === 'space') {
        // Draw background grid before transform (in screen coordinates)
        renderBackgroundGrid(ctx, state.canvasSize.width, state.canvasSize.height, state.pan, state.zoom);

        ctx.save();
        ctx.translate(state.pan.x, state.pan.y);
        ctx.scale(state.zoom, state.zoom);

        renderSpaceView(ctx, state.spaces, state.plants, state.strains, state.selection, state.dragPreview, state.placementPreview, state.plantDragPreview);

        // Draw particles on top of spaces/plants (atmospheric overlay)
        renderParticles(
          ctx,
          state.spaces,
          state.plants,
          state.strains,
          state.canvasSize.width,
          state.canvasSize.height,
          state.pan,
          state.zoom
        );

        ctx.restore();

        // Bird easter egg (only in space view, when feature is enabled)
        if (FEATURES.BIRD_MINIGAME && birdModule) {
          if (!birdSpawned.current && state.canvasSize.width > 0) {
            birdModule.scheduleBirdSpawn();
            birdSpawned.current = true;
          }

          // Check if bird should spawn, update and render
          birdModule.checkAndSpawnBird(state.canvasSize.width, state.canvasSize.height, state.pan, state.zoom);
          birdModule.updateBird(deltaMs);
          birdModule.updateBirdTracking(state.canvasSize.width, state.canvasSize.height, state.pan, state.zoom);
          birdModule.renderBird(ctx, state.canvasSize.width, state.canvasSize.height, state.pan, state.zoom);

          // Update bird UI state (throttled to avoid re-renders every frame)
          const birdPos = birdModule.getBirdScreenPosition(state.canvasSize.width, state.canvasSize.height, state.pan, state.zoom);
          const birdState = birdModule.getBirdUIState();
          if (birdPos && birdState && birdState.isAlive && birdState.leaderboardActive) {
            updateBirdUI({
              screenX: birdPos.x,
              screenY: birdPos.y,
              distance: birdState.distance,
              leaderboardActive: birdState.leaderboardActive,
            });
          } else {
            updateBirdUI(null);
          }
        }
      } else {
        // Time view - no particles or bird
        renderTimeView(
          ctx,
          state.spaces,
          state.plants,
          state.strains,
          state.canvasSize.width,
          state.canvasSize.height,
          state.timelineOffset,
          state.timelineHorizontalOffset,
          state.timelineZoom,
          state.splitPreview,
          state.timeViewPlacementPreview
        );
      }

      // Draw long press indicator on top of everything
      if (state.longPressPreview) {
        renderLongPressIndicator(ctx, state.longPressPreview);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []); // Empty deps - animation loop runs continuously, state accessed via refs

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        perspective: '600px',
        pointerEvents: 'auto',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          touchAction: 'none',
          cursor: canvasCursor,
        }}
      />
      {/* Bird leaderboard UI overlay (only when feature is enabled) */}
      {FEATURES.BIRD_MINIGAME && BirdOverlayComponent && birdUI && (
        <BirdOverlayComponent
          screenX={birdUI.screenX}
          screenY={birdUI.screenY}
          distance={birdUI.distance}
        />
      )}
    </div>
  );
}
