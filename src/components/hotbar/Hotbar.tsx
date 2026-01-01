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
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 12px',
          background: COLORS.background,
          color: COLORS.textMuted,
          fontSize: 14,
          zIndex: 10,
          pointerEvents: 'auto',
        }}
      >
        View only
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        padding: '0 12px 12px',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <Toolbox />
      <Inventory />
      <ViewSwitch />
    </div>
  );
}
