import { COLORS } from '../../constants';

interface EmptySlotProps {
  onClick: () => void;
}

export function EmptySlot({ onClick }: EmptySlotProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <button
        className="btn-tool"
        onClick={onClick}
        data-slot="empty"
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: `1px dashed ${COLORS.border}`,
          color: COLORS.textMuted,
          fontSize: 20,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        +
      </button>
      <span
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
        }}
      >
        Add
      </span>
    </div>
  );
}
