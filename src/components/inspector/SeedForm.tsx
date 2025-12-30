import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';
import type { StrainType, Photoperiod } from '../../types';

interface SeedFormProps {
  onClose: () => void;
}

export function SeedForm({ onClose }: SeedFormProps) {
  const strains = useAppStore((s) => s.strains);
  const createStrain = useAppStore((s) => s.createStrain);
  const addSeed = useAppStore((s) => s.addSeed);

  const [selectedStrainId, setSelectedStrainId] = useState<string | null>(
    strains[0]?.id || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isClone, setIsClone] = useState(false);

  const [newStrainName, setNewStrainName] = useState('');
  const [floweringDays, setFloweringDays] = useState(60);
  const [strainType, setStrainType] = useState<StrainType>('hybrid');
  const [photoperiod, setPhotoperiod] = useState<Photoperiod>('photo');

  const updateStrain = useAppStore((s) => s.updateStrain);

  const selectedStrain = strains.find((s) => s.id === selectedStrainId);

  const handleStrainSelect = (strainId: string) => {
    setSelectedStrainId(strainId);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedStrainId(null);
    setNewStrainName('');
    setFloweringDays(60);
    setStrainType('hybrid');
    setPhotoperiod('photo');
  };

  const handleEditClick = () => {
    if (selectedStrain) {
      setIsEditing(true);
      setIsCreating(false);
      setNewStrainName(selectedStrain.name);
      setFloweringDays(selectedStrain.floweringDays);
      setStrainType(selectedStrain.strainType || 'hybrid');
      setPhotoperiod(selectedStrain.photoperiod || 'photo');
    }
  };

  const handleSaveEdit = () => {
    if (selectedStrainId && newStrainName.trim()) {
      updateStrain(selectedStrainId, {
        name: newStrainName.trim(),
        floweringDays,
        strainType,
        photoperiod,
      });
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    if (isCreating && newStrainName.trim()) {
      const id = createStrain({ name: newStrainName.trim(), floweringDays, strainType, photoperiod });
      addSeed(id, quantity, isClone);
    } else if (!isCreating && selectedStrainId) {
      addSeed(selectedStrainId, quantity, isClone);
    }
    onClose();
  };

  const canSubmit = isCreating ? newStrainName.trim() : selectedStrainId;

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

      {/* Strain selection tiles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {strains.map((strain) => {
          const isSelected = selectedStrainId === strain.id && !isCreating;
          return (
            <div key={strain.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                onClick={() => handleStrainSelect(strain.id)}
                style={{
                  padding: '8px 12px',
                  background: isSelected ? COLORS.teal : 'transparent',
                  border: `1px solid ${COLORS.border}`,
                  color: isSelected ? COLORS.background : COLORS.text,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {strain.abbreviation}
              </button>
              {isSelected && !isEditing && (
                <button
                  onClick={handleEditClick}
                  style={{
                    padding: '8px 6px',
                    background: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  ✎
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={handleCreateClick}
          style={{
            padding: '8px 12px',
            background: isCreating ? COLORS.teal : 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: isCreating ? COLORS.background : COLORS.text,
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          +
        </button>
      </div>

      {/* Strain form (create or edit) */}
      {(isCreating || isEditing) && (
        <>
          <input
            type="text"
            value={newStrainName}
            onChange={(e) => setNewStrainName(e.target.value)}
            placeholder="Strain name"
            autoFocus
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

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Type:</span>
              {(['indica', 'sativa', 'hybrid'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setStrainType(type)}
                  style={{
                    padding: '4px 8px',
                    background: strainType === type ? COLORS.green : 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontSize: 12,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Photo:</span>
            {(['auto', 'photo'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPhotoperiod(type)}
                style={{
                  padding: '4px 8px',
                  background: photoperiod === type ? COLORS.green : 'transparent',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 12,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {isEditing && (
            <button
              onClick={handleSaveEdit}
              disabled={!newStrainName.trim()}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 12,
                background: COLORS.green,
                border: 'none',
                color: COLORS.background,
                fontSize: 12,
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: newStrainName.trim() ? 1 : 0.5,
              }}
            >
              SAVE STRAIN
            </button>
          )}
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
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: 12,
          background: COLORS.teal,
          border: 'none',
          color: COLORS.background,
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          opacity: canSubmit ? 1 : 0.5,
        }}
      >
        ADD TO INVENTORY
      </button>
    </div>
  );
}
