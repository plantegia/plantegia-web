import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlantInspector } from './PlantInspector';
import { PlantEditPanel } from './PlantEditPanel';
import { SpaceInspector } from './SpaceInspector';
import { COLORS, Z_INDEX } from '../../constants';

interface InspectorProps {
  readOnly?: boolean;
}

export function Inspector({ readOnly }: InspectorProps) {
  const selection = useAppStore((s) => s.selection);
  const setSelection = useAppStore((s) => s.setSelection);
  const [isEditing, setIsEditing] = useState(false);

  // Reset edit mode when selection changes
  useEffect(() => {
    setIsEditing(false);
  }, [selection?.id]);

  if (!selection || readOnly) return null;

  const handleClose = () => {
    setSelection(null);
    setIsEditing(false);
  };

  // Plant inspector
  if (selection.type === 'plant') {
    // Edit mode: show full panel
    if (isEditing) {
      return (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: COLORS.backgroundLight,
            borderTop: `1px solid ${COLORS.border}`,
            padding: 16,
            zIndex: Z_INDEX.INSPECTOR,
            pointerEvents: 'auto',
          }}
        >
          <PlantEditPanel
            plantId={selection.id}
            onClose={() => setIsEditing(false)}
          />
        </div>
      );
    }

    // Compact mode: bottom bar
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
        }}
      >
        <PlantInspector plantId={selection.id} onEdit={() => setIsEditing(true)} />
      </div>
    );
  }

  // Space inspector: keep the existing popup style
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
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        ✕
      </button>

      <SpaceInspector spaceId={selection.id} />
    </div>
  );
}
