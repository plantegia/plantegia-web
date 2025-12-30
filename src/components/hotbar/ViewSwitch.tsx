import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';

export function ViewSwitch() {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 12px 12px',
        background: COLORS.backgroundDark,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        View
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            height: 44,
            border: `1px solid ${COLORS.teal}`,
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => setViewMode(viewMode === 'space' ? 'time' : 'space')}
            style={{
              width: 42,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: viewMode === 'space' ? COLORS.teal : 'transparent',
              border: 'none',
              borderRight: `1px solid ${COLORS.teal}`,
              color: viewMode === 'space' ? COLORS.backgroundDark : COLORS.teal,
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            XY
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'time' ? 'space' : 'time')}
            style={{
              width: 42,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: viewMode === 'time' ? COLORS.teal : 'transparent',
              border: 'none',
              color: viewMode === 'time' ? COLORS.backgroundDark : COLORS.teal,
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            XT
          </button>
        </div>
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
          }}
        >
          {viewMode === 'space' ? 'Space' : 'Time'}
        </span>
      </div>
    </div>
  );
}
