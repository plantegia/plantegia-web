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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
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
          background: selected ? COLORS.green : COLORS.backgroundLight,
          border: `1px solid ${selected ? COLORS.green : COLORS.border}`,
          color: COLORS.text,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {abbr}
      </button>
      <span
        style={{
          fontSize: 10,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
        }}
      >
        {seed.isClone ? 'C' : 'S'}x{seed.quantity}
      </span>
    </div>
  );
}
