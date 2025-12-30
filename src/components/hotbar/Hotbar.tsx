import { Toolbox } from './Toolbox';
import { Inventory } from './Inventory';
import { ViewSwitch } from './ViewSwitch';
import { COLORS } from '../../constants';

interface HotbarProps {
  readOnly?: boolean;
}

export function Hotbar({ readOnly }: HotbarProps) {
  if (readOnly) {
    return (
      <div
        style={{
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 12px',
          background: COLORS.background,
          flexShrink: 0,
          color: COLORS.textMuted,
          fontSize: 14,
        }}
      >
        View only
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        padding: '0 12px 12px',
        flexShrink: 0,
      }}
    >
      <Toolbox />
      <Inventory />
      <ViewSwitch />
    </div>
  );
}
