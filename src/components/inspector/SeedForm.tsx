import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';

interface SeedFormProps {
  onClose: () => void;
}

export function SeedForm({ onClose }: SeedFormProps) {
  const strains = useAppStore((s) => s.strains);
  const createStrain = useAppStore((s) => s.createStrain);
  const addSeed = useAppStore((s) => s.addSeed);

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedStrainId, setSelectedStrainId] = useState<string | null>(
    strains[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isClone, setIsClone] = useState(false);

  const [newStrainName, setNewStrainName] = useState('');
  const [floweringDays, setFloweringDays] = useState(60);

  const handleSubmit = () => {
    if (mode === 'create' && newStrainName.trim()) {
      const id = createStrain({ name: newStrainName.trim(), floweringDays });
      addSeed(id, quantity, isClone);
    } else if (mode === 'select' && selectedStrainId) {
      addSeed(selectedStrainId, quantity, isClone);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        background: COLORS.backgroundLight,
        borderTop: `1px solid ${COLORS.border}`,
        padding: 16,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 'bold' }}>
          ADD SEEDS
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setMode('select')}
          style={{
            flex: 1,
            padding: '8px',
            background: mode === 'select' ? COLORS.teal : 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: mode === 'select' ? COLORS.background : COLORS.text,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          EXISTING
        </button>
        <button
          onClick={() => setMode('create')}
          style={{
            flex: 1,
            padding: '8px',
            background: mode === 'create' ? COLORS.teal : 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: mode === 'create' ? COLORS.background : COLORS.text,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          NEW STRAIN
        </button>
      </div>

      {mode === 'select' && strains.length > 0 && (
        <select
          value={selectedStrainId || ''}
          onChange={(e) => setSelectedStrainId(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            marginBottom: 12,
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: 'inherit',
          }}
        >
          {strains.map((strain) => (
            <option key={strain.id} value={strain.id}>
              {strain.name} ({strain.abbreviation})
            </option>
          ))}
        </select>
      )}

      {mode === 'select' && strains.length === 0 && (
        <div style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 12 }}>
          No strains yet. Create one first.
        </div>
      )}

      {mode === 'create' && (
        <>
          <input
            type="text"
            value={newStrainName}
            onChange={(e) => setNewStrainName(e.target.value)}
            placeholder="Strain name"
            style={{
              width: '100%',
              padding: 8,
              marginBottom: 8,
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Flowering:</span>
            <input
              type="number"
              value={floweringDays}
              onChange={(e) => setFloweringDays(parseInt(e.target.value) || 60)}
              style={{
                width: 60,
                padding: 6,
                background: COLORS.background,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>days</span>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Qty:</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            style={{
              width: 50,
              padding: 6,
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Type:</span>
          <button
            onClick={() => setIsClone(false)}
            style={{
              padding: '4px 8px',
              background: !isClone ? COLORS.green : 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Seed
          </button>
          <button
            onClick={() => setIsClone(true)}
            style={{
              padding: '4px 8px',
              background: isClone ? COLORS.green : 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Clone
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={mode === 'create' && !newStrainName.trim()}
        style={{
          width: '100%',
          padding: 12,
          background: COLORS.teal,
          border: 'none',
          color: COLORS.background,
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          opacity: mode === 'create' && !newStrainName.trim() ? 0.5 : 1,
        }}
      >
        ADD TO INVENTORY
      </button>
    </div>
  );
}
