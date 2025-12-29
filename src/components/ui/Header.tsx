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
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const currentPlantationId = useAppStore((s) => s.currentPlantationId);

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
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        flexShrink: 0,
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
      <div style={{ display: 'flex', gap: 8 }}>
        {canEdit && (
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
        )}
        <button
          onClick={() => setViewMode(viewMode === 'space' ? 'time' : 'space')}
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.teal}`,
            color: COLORS.teal,
            padding: '6px 14px',
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {viewMode === 'space' ? 'TIME' : 'SPACE'}
        </button>
      </div>
    </header>
  );
}
