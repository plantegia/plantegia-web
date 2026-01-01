import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { updatePlantationSettings } from '../../lib/firestore';
import { COLORS } from '../../constants';

interface HeaderProps {
  plantationName?: string;
  canEdit?: boolean;
}

export function Header({ plantationName, canEdit }: HeaderProps) {
  const navigate = useNavigate();
  const currentPlantationId = useAppStore((s) => s.currentPlantationId);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const historyPastLength = useAppStore((s) => s.history.past.length);
  const historyFutureLength = useAppStore((s) => s.history.future.length);

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
      {canEdit && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
        </div>
      )}
    </header>
  );
}
