import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { PlantInspector } from './PlantInspector';
import { SpaceInspector } from './SpaceInspector';
import { COLORS, Z_INDEX } from '../../constants';

interface InspectorProps {
  readOnly?: boolean;
}

export function Inspector({ readOnly }: InspectorProps) {
  const selection = useAppStore((s) => s.selection);
  const setSelection = useAppStore((s) => s.setSelection);

  if (!selection || readOnly) return null;

  const handleClose = () => setSelection(null);

  // Plant inspector: compact bottom bar replacing hotbar
  if (selection.type === 'plant') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: COLORS.backgroundLight,
          borderTop: `1px solid ${COLORS.border}`,
          padding: '12px 16px',
          zIndex: Z_INDEX.INSPECTOR,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <PlantInspector plantId={selection.id} onDelete={handleClose} />
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textMuted,
            cursor: 'pointer',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Space inspector: keep the existing popup style (can be updated later)
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        background: COLORS.backgroundLight,
        border: `1px solid ${COLORS.border}`,
        padding: 16,
        zIndex: Z_INDEX.INSPECTOR,
      }}
    >
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>

      <SpaceInspector spaceId={selection.id} />
    </div>
  );
}
