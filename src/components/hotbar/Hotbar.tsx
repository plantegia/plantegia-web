import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ToolButton } from './ToolButton';
import { SeedSlot } from './SeedSlot';
import { EmptySlot } from './EmptySlot';
import { SeedForm } from '../inspector/SeedForm';
import { COLORS } from '../../constants';

interface HotbarProps {
  readOnly?: boolean;
}

export function Hotbar({ readOnly }: HotbarProps) {
  const [showSeedForm, setShowSeedForm] = useState(false);

  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const inventory = useAppStore((s) => s.inventory);
  const strains = useAppStore((s) => s.strains);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);
  const selectSeed = useAppStore((s) => s.selectSeed);
  const viewMode = useAppStore((s) => s.viewMode);

  if (readOnly) {
    return (
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 12px',
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.backgroundDark,
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
    <>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.backgroundDark,
          flexShrink: 0,
        }}
      >
        <ToolButton
          symbol="▢"
          active={activeTool === 'space'}
          onClick={() => setActiveTool(activeTool === 'space' ? null : 'space')}
        />

        {inventory.map((seed) => (
          <SeedSlot
            key={seed.id}
            seed={seed}
            strain={strains.find((s) => s.id === seed.strainId)}
            selected={selectedSeedId === seed.id}
            onClick={() => selectSeed(selectedSeedId === seed.id ? null : seed.id)}
          />
        ))}

        {inventory.length < 4 && <EmptySlot onClick={() => setShowSeedForm(true)} />}

        {viewMode === 'time' && (
          <ToolButton
            symbol="/"
            active={activeTool === 'split'}
            onClick={() => setActiveTool(activeTool === 'split' ? null : 'split')}
            style={{ marginLeft: 'auto' }}
          />
        )}

        <ToolButton
          symbol="✕"
          active={activeTool === 'erase'}
          onClick={() => setActiveTool(activeTool === 'erase' ? null : 'erase')}
          style={viewMode !== 'time' ? { marginLeft: 'auto' } : undefined}
        />

        <ToolButton symbol="⚙" onClick={() => {}} />
      </div>

      {showSeedForm && <SeedForm onClose={() => setShowSeedForm(false)} />}
    </>
  );
}
