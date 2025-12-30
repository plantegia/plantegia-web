import { COLORS } from '../../constants';

interface ToolButtonProps {
  symbol?: string;
  icon?: string;
  label?: string;
  active?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export function ToolButton({ symbol, icon, label, active, onClick, style }: ToolButtonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        ...style,
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: active ? COLORS.teal : COLORS.backgroundLight,
          border: `1px solid ${active ? COLORS.teal : COLORS.border}`,
          color: active ? COLORS.background : COLORS.text,
          fontSize: 20,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {icon ? (
          <img
            src={icon}
            alt=""
            style={{
              width: 20,
              height: 20,
              filter: active
                ? 'brightness(0) saturate(100%) invert(16%) sepia(15%) saturate(1500%) hue-rotate(110deg) brightness(95%)'
                : 'brightness(0) saturate(100%) invert(89%) sepia(14%) saturate(500%) hue-rotate(346deg) brightness(103%) contrast(96%)',
            }}
          />
        ) : (
          symbol
        )}
      </button>
      {label && (
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
