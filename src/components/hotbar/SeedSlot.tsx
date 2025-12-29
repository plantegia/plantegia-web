import type { Seed, Strain } from '../../types';
import { COLORS } from '../../constants';

interface SeedSlotProps {
  seed: Seed;
  strain: Strain | undefined;
  selected: boolean;
  onClick: () => void;
}

export function SeedSlot({ seed, strain, selected, onClick }: SeedSlotProps) {
  const abbr = strain?.abbreviation || 'PLT';

  return (
    <button
      onClick={onClick}
      style={{
        width: 52,
        height: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        background: selected ? COLORS.green : COLORS.backgroundLight,
        border: `1px solid ${selected ? COLORS.green : COLORS.border}`,
        color: COLORS.text,
        fontSize: 11,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.15s',
        padding: 2,
      }}
    >
      <span style={{ fontWeight: 'bold', fontSize: 12 }}>{abbr}</span>
      <span style={{ fontSize: 10, color: COLORS.textMuted }}>
        {seed.isClone ? 'C' : 'S'}x{seed.quantity}
      </span>
    </button>
  );
}
