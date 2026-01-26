import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Crosshair, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { updatePlantationSettings } from '../../lib/firestore';
import { COLORS, MIN_ZOOM, MAX_ZOOM, MIN_TIMELINE_ZOOM, MAX_TIMELINE_ZOOM, MOBILE_BREAKPOINT } from '../../constants';
import { TIME_VIEW_CONSTANTS } from '../../utils/grid';

interface HeaderProps {
  plantationName?: string;
  canEdit?: boolean;
}

// Threshold in pixels for showing center button
const CENTER_THRESHOLD = 50;

export function Header({ plantationName, canEdit }: HeaderProps) {
  const navigate = useNavigate();
  const currentPlantationId = useAppStore((s) => s.currentPlantationId);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const historyPastLength = useAppStore((s) => s.history.past.length);
  const historyFutureLength = useAppStore((s) => s.history.future.length);

  const pan = useAppStore((s) => s.pan);
  const zoom = useAppStore((s) => s.zoom);
  const setZoom = useAppStore((s) => s.setZoom);
  const setPan = useAppStore((s) => s.setPan);
  const timelineOffset = useAppStore((s) => s.timelineOffset);
  const timelineHorizontalOffset = useAppStore((s) => s.timelineHorizontalOffset);
  const setTimelineHorizontalOffset = useAppStore((s) => s.setTimelineHorizontalOffset);
  const timelineZoom = useAppStore((s) => s.timelineZoom);
  const setTimelineZoom = useAppStore((s) => s.setTimelineZoom);
  const viewMode = useAppStore((s) => s.viewMode);
  const centerView = useAppStore((s) => s.centerView);
  const getIdealCenter = useAppStore((s) => s.getIdealCenter);

  const [showCenterButton, setShowCenterButton] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Track canvas size and mobile state
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Check if we're significantly off-center
  useEffect(() => {
    if (canvasSize.width === 0) return;

    const ideal = getIdealCenter(canvasSize.width, canvasSize.height);

    if (viewMode === 'space') {
      const dx = Math.abs(pan.x - ideal.pan.x);
      const dy = Math.abs(pan.y - ideal.pan.y);
      setShowCenterButton(dx > CENTER_THRESHOLD || dy > CENTER_THRESHOLD);
    } else {
      const dh = Math.abs(timelineHorizontalOffset - ideal.timelineHorizontalOffset);
      const dv = Math.abs(timelineOffset - ideal.timelineOffset);
      setShowCenterButton(dh > CENTER_THRESHOLD || dv > CENTER_THRESHOLD);
    }
  }, [pan, timelineOffset, timelineHorizontalOffset, viewMode, canvasSize, getIdealCenter]);

  const handleCenter = useCallback(() => {
    centerView(canvasSize.width, canvasSize.height);
  }, [centerView, canvasSize]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.25 : 1 / 1.25;
    const clampFn = direction === 'in' ? Math.min : Math.max;
    const limit = direction === 'in'
      ? (viewMode === 'time' ? MAX_TIMELINE_ZOOM : MAX_ZOOM)
      : (viewMode === 'time' ? MIN_TIMELINE_ZOOM : MIN_ZOOM);

    if (viewMode === 'time') {
      const newZoom = clampFn(timelineZoom * factor, limit);
      const { leftMargin } = TIME_VIEW_CONSTANTS;
      const centerX = canvasSize.width / 2 - leftMargin;
      const worldX = (centerX - timelineHorizontalOffset) / timelineZoom;
      const newOffsetX = centerX - worldX * newZoom;
      setTimelineHorizontalOffset(newOffsetX);
      setTimelineZoom(newZoom);
    } else {
      const newZoom = clampFn(zoom * factor, limit);
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const worldX = (centerX - pan.x) / zoom;
      const worldY = (centerY - pan.y) / zoom;
      const newPanX = centerX - worldX * newZoom;
      const newPanY = centerY - worldY * newZoom;
      setPan({ x: newPanX, y: newPanY });
      setZoom(newZoom);
    }
  }, [viewMode, timelineZoom, timelineHorizontalOffset, setTimelineHorizontalOffset, setTimelineZoom, zoom, pan, setPan, setZoom, canvasSize]);

  const handleZoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  const canZoomIn = viewMode === 'time' ? timelineZoom < MAX_TIMELINE_ZOOM : zoom < MAX_ZOOM;
  const canZoomOut = viewMode === 'time' ? timelineZoom > MIN_TIMELINE_ZOOM : zoom > MIN_ZOOM;

  const handleShare = async () => {
    if (!currentPlantationId) return;

    await updatePlantationSettings(currentPlantationId, { isPublic: true });
    const url = `${window.location.origin}/p/${currentPlantationId}?view=1`;
    await navigator.clipboard.writeText(url);
    alert('Link copied!');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <button
          className="btn-icon"
          onClick={() => navigate('/p/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.text,
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            borderRadius: 4,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <span
          style={{
            fontSize: 14,
            color: COLORS.text,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {plantationName || 'PLANTEGIA'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {!isMobile && (
          <>
            <button
              className="btn-icon"
              onClick={handleZoomOut}
              disabled={!canZoomOut}
              style={{
                background: 'transparent',
                border: 'none',
                color: canZoomOut ? COLORS.text : COLORS.border,
                fontSize: 16,
                cursor: canZoomOut ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: canZoomOut ? 1 : 0.5,
                borderRadius: 4,
              }}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={handleZoomIn}
              disabled={!canZoomIn}
              style={{
                background: 'transparent',
                border: 'none',
                color: canZoomIn ? COLORS.text : COLORS.border,
                fontSize: 16,
                cursor: canZoomIn ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: canZoomIn ? 1 : 0.5,
                borderRadius: 4,
              }}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            {showCenterButton && (
              <button
                className="btn-icon"
                onClick={handleCenter}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: COLORS.text,
                  fontSize: 16,
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 4,
                }}
                title="Center view"
              >
                <Crosshair size={16} />
              </button>
            )}
          </>
        )}
        {canEdit && (
          <>
            <button
              className="btn-icon"
              onClick={undo}
              disabled={historyPastLength === 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: historyPastLength > 0 ? COLORS.text : COLORS.border,
                fontSize: 16,
                cursor: historyPastLength > 0 ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: historyPastLength > 0 ? 1 : 0.5,
                borderRadius: 4,
              }}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={redo}
              disabled={historyFutureLength === 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: historyFutureLength > 0 ? COLORS.text : COLORS.border,
                fontSize: 16,
                cursor: historyFutureLength > 0 ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: historyFutureLength > 0 ? 1 : 0.5,
                borderRadius: 4,
              }}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={handleShare}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.text}`,
                color: COLORS.text,
                padding: '6px 10px',
                fontSize: 14,
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              Share
            </button>
          </>
        )}
      </div>
    </header>
  );
}
