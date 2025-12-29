import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';

export function Header() {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

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
      <span
        style={{
          fontSize: 18,
          color: COLORS.text,
          fontWeight: 'bold',
          letterSpacing: 2,
        }}
      >
        PLANTASIA
      </span>
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
    </header>
  );
}
