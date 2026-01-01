import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { updatePlantationSettings } from '../../lib/firestore';
import { COLORS } from '../../constants';

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
  const timelineOffset = useAppStore((s) => s.timelineOffset);
  const timelineHorizontalOffset = useAppStore((s) => s.timelineHorizontalOffset);
  const viewMode = useAppStore((s) => s.viewMode);
  const centerView = useAppStore((s) => s.centerView);
  const getIdealCenter = useAppStore((s) => s.getIdealCenter);

  const [showCenterButton, setShowCenterButton] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Track canvas size
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.muted,
            fontSize: 18,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ←
        </button>
        <span
          style={{
            fontSize: 14,
            color: COLORS.text,
            fontWeight: 'bold',
          }}
        >
          {plantationName || 'PLANTASIA'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {showCenterButton && (
          <button
            onClick={handleCenter}
            style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.muted,
              fontSize: 16,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
            title="Center view"
          >
            ⌖
          </button>
        )}
        {canEdit && (
          <>
            <button
              onClick={undo}
              disabled={historyPastLength === 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: historyPastLength > 0 ? COLORS.muted : COLORS.border,
                fontSize: 16,
                cursor: historyPastLength > 0 ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: historyPastLength > 0 ? 1 : 0.5,
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={historyFutureLength === 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: historyFutureLength > 0 ? COLORS.muted : COLORS.border,
                fontSize: 16,
                cursor: historyFutureLength > 0 ? 'pointer' : 'default',
                padding: '4px 6px',
                opacity: historyFutureLength > 0 ? 1 : 0.5,
              }}
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
            <button
              onClick={handleShare}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.muted}`,
                color: COLORS.muted,
                padding: '6px 10px',
                fontSize: 14,
                fontFamily: 'inherit',
                cursor: 'pointer',
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
