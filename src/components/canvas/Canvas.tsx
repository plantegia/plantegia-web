import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useGestures } from '../../hooks/useGestures';
import { renderSpaceView, renderTimeView } from './renderers';
import { COLORS, CELL_SIZE } from '../../constants';

interface CanvasProps {
  readOnly?: boolean;
}

export function Canvas({ readOnly }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: 500 });
  const [canvasRect, setCanvasRect] = useState({ top: 0, left: 0 });
  const hasCentered = useRef(false);

  const {
    pan, zoom,
    spaces, plants, strains,
    selection, dragPreview,
    viewMode, timelineOffset, timelineHorizontalOffset,
    setPan,
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

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    if (viewMode === 'space') {
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      renderSpaceView(ctx, spaces, plants, strains, selection, dragPreview);

      ctx.restore();
    } else {
      renderTimeView(
        ctx,
        spaces,
        plants,
        strains,
        canvasSize.width,
        canvasSize.height,
        timelineOffset,
        timelineHorizontalOffset
      );
    }
  }, [
    canvasSize, pan, zoom, spaces, plants, strains,
    selection, dragPreview, viewMode, timelineOffset, timelineHorizontalOffset,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}
