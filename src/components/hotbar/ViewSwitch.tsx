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
          color: viewMode === 'space' ? COLORS.text : COLORS.muted,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Space
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 44,
          height: 44,
          border: `1px solid ${COLORS.muted}`,
          boxSizing: 'border-box',
        }}
      >
        <button
          className="btn-tool"
          onClick={() => setViewMode('space')}
          data-view="space"
          style={{
            width: '100%',
            height: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: viewMode === 'space' ? COLORS.teal : 'transparent',
            border: 'none',
            borderBottom: `1px solid ${viewMode === 'space' ? COLORS.teal : COLORS.muted}`,
            color: viewMode === 'space' ? COLORS.backgroundDark : COLORS.muted,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          XY
        </button>
        <button
          className="btn-tool"
          onClick={() => setViewMode('time')}
          data-view="time"
          style={{
            width: '100%',
            height: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: viewMode === 'time' ? COLORS.teal : 'transparent',
            border: 'none',
            color: viewMode === 'time' ? COLORS.backgroundDark : COLORS.muted,
            fontSize: 12,
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
          color: viewMode === 'time' ? COLORS.text : COLORS.muted,
          textTransform: 'uppercase',
          marginTop: 4,
        }}
      >
        Time
      </span>
    </div>
  );
}
