import { Toolbox } from './Toolbox';
import { Inventory } from './Inventory';
import { ViewSwitch } from './ViewSwitch';
import { COLORS, Z_INDEX } from '../../constants';
import { useAppStore } from '../../store/useAppStore';

interface HotbarProps {
  readOnly?: boolean;
}

export function Hotbar({ readOnly }: HotbarProps) {
  const selection = useAppStore((s) => s.selection);

  // Hide hotbar when a plant is selected (plant inspector replaces it)
  if (selection?.type === 'plant' && !readOnly) {
    return null;
  }

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
          zIndex: Z_INDEX.HOTBAR,
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
        zIndex: Z_INDEX.HOTBAR,
        pointerEvents: 'auto',
      }}
    >
      <Toolbox />
      <Inventory />
      <ViewSwitch />
    </div>
  );
}
