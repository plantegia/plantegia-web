import { useState } from 'react';
import { X } from 'lucide-react';
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

  // Auto-open create mode if no strains exist
  const [selectedStrainId, setSelectedStrainId] = useState<string | null>(
    strains.length > 0 ? strains[0].id : null
  );
  const [isCreating, setIsCreating] = useState(strains.length === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(5);
  const [isClone, setIsClone] = useState(false);

  // Default strain name for first-time users
  const [newStrainName, setNewStrainName] = useState(strains.length === 0 ? 'Pineapple Express' : '');
  const [newAbbreviation, setNewAbbreviation] = useState('');
  const [floweringDays, setFloweringDays] = useState(56); // 8 weeks
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
    setNewAbbreviation('');
    setFloweringDays(56); // 8 weeks
    setStrainType('hybrid');
    setPhotoperiod('photo');
  };

  const handleEditClick = () => {
    if (selectedStrain) {
      setIsEditing(true);
      setIsCreating(false);
      setNewStrainName(selectedStrain.name);
      setNewAbbreviation(selectedStrain.abbreviation);
      setFloweringDays(selectedStrain.floweringDays);
      setStrainType(selectedStrain.strainType || 'hybrid');
      setPhotoperiod(selectedStrain.photoperiod || 'photo');
    }
  };

  const handleSaveEdit = () => {
    if (selectedStrainId && newStrainName.trim() && newAbbreviation.trim()) {
      updateStrain(selectedStrainId, {
        name: newStrainName.trim(),
        abbreviation: newAbbreviation.trim().toUpperCase(),
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
        top: 48,
        bottom: 0,
        left: 0,
        right: 0,
        background: COLORS.backgroundLight,
        borderTop: `1px solid ${COLORS.border}`,
        padding: 16,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 'bold' }}>
          ADD SEEDS
        </span>
        <button
          className="btn-icon"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            marginRight: -12,
            marginTop: -8,
            borderRadius: 4,
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Strain selection tiles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {strains.map((strain) => {
          const isSelected = selectedStrainId === strain.id && !isCreating;
          return (
            <div key={strain.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                className="btn-secondary"
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
                  className="btn-secondary"
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
        {strains.length > 0 && (
          <button
            className="btn-secondary"
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
        )}
      </div>

      {/* Strain form (create or edit) */}
      {(isCreating || isEditing) && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={newStrainName}
              onChange={(e) => setNewStrainName(e.target.value)}
              placeholder="Strain name"
              autoFocus
              style={{
                flex: 1,
                padding: 8,
                background: COLORS.background,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {isEditing && (
              <input
                type="text"
                value={newAbbreviation}
                onChange={(e) => setNewAbbreviation(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="ABBR"
                style={{
                  width: 60,
                  padding: 8,
                  background: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Flowering:</span>
              <span style={{ color: COLORS.text, fontSize: 12, marginLeft: 'auto' }}>
                {Math.round(floweringDays / 7)} weeks
              </span>
            </div>
            <input
              type="range"
              min={7}
              max={12}
              step={1}
              list="weeks-ticks"
              value={Math.round(floweringDays / 7)}
              onChange={(e) => setFloweringDays(parseInt(e.target.value) * 7)}
              style={{
                width: '100%',
                accentColor: COLORS.teal,
              }}
            />
            <datalist id="weeks-ticks">
              <option value="7" />
              <option value="8" />
              <option value="9" />
              <option value="10" />
              <option value="11" />
              <option value="12" />
            </datalist>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              {[7, 8, 9, 10, 11, 12].map((w) => (
                <span key={w} style={{ color: COLORS.textMuted, fontSize: 10 }}>{w}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Type:</span>
              {(['indica', 'sativa', 'hybrid'] as const).map((type) => (
                <button
                  className="btn-secondary"
                  key={type}
                  onClick={() => setStrainType(type)}
                  style={{
                    padding: '12px 16px',
                    background: strainType === type ? COLORS.green : 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    minHeight: 44,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Photo:</span>
            {(['auto', 'photo'] as const).map((type) => (
              <button
                className="btn-secondary"
                key={type}
                onClick={() => setPhotoperiod(type)}
                style={{
                  padding: '12px 16px',
                  background: photoperiod === type ? COLORS.green : 'transparent',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 14,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  minHeight: 44,
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {isEditing && (
            <button
              className="btn-primary"
              onClick={handleSaveEdit}
              disabled={!newStrainName.trim() || !newAbbreviation.trim()}
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
                opacity: newStrainName.trim() && newAbbreviation.trim() ? 1 : 0.5,
              }}
            >
              SAVE STRAIN
            </button>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Qty:</span>
          <button
            className="btn-secondary"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              width: 44,
              height: 44,
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <span
            style={{
              width: 44,
              height: 44,
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {quantity}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setQuantity(quantity + 1)}
            style={{
              width: 44,
              height: 44,
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 14 }}>Type:</span>
          <button
            className="btn-secondary"
            onClick={() => setIsClone(false)}
            style={{
              padding: '12px 16px',
              background: !isClone ? COLORS.green : 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 14,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Seed
          </button>
          <button
            className="btn-secondary"
            onClick={() => setIsClone(true)}
            style={{
              padding: '12px 16px',
              background: isClone ? COLORS.green : 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              fontSize: 14,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Clone
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button
        className="btn-primary"
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
          flexShrink: 0,
        }}
      >
        ADD TO INVENTORY
      </button>
    </div>
  );
}
