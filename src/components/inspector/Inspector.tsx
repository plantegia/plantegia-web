import { useAppStore } from '../../store/useAppStore';
import { PlantInspector } from './PlantInspector';
import { SpaceInspector } from './SpaceInspector';
import { COLORS } from '../../constants';

export function Inspector() {
  const selection = useAppStore((s) => s.selection);
  const setSelection = useAppStore((s) => s.setSelection);

  if (!selection) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        background: COLORS.backgroundLight,
        border: `1px solid ${COLORS.border}`,
        padding: 16,
        zIndex: 50,
      }}
    >
      <button
        onClick={() => setSelection(null)}
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

      {selection.type === 'plant' && <PlantInspector plantId={selection.id} />}
      {selection.type === 'space' && <SpaceInspector spaceId={selection.id} />}
    </div>
  );
}
