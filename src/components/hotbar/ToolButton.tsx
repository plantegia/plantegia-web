import { COLORS } from '../../constants';

interface ToolButtonProps {
  symbol: string;
  active?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export function ToolButton({ symbol, active, onClick, style }: ToolButtonProps) {
  return (
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
        ...style,
      }}
    >
      {symbol}
    </button>
  );
}
