import { useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, STAGES } from '../../constants';
import type { Stage } from '../../types';
import { generatePlantCode } from '../../utils/abbreviation';

interface PlantEditPanelProps {
  plantId: string;
  onClose: () => void;
}

export function PlantEditPanel({ plantId, onClose }: PlantEditPanelProps) {
  const plant = useAppStore((s) => s.plants.find((p) => p.id === plantId));
  const plants = useAppStore((s) => s.plants);
  const strains = useAppStore((s) => s.strains);
  const viewMode = useAppStore((s) => s.viewMode);
  const updatePlant = useAppStore((s) => s.updatePlant);
  const deletePlant = useAppStore((s) => s.deletePlant);
  const setSelection = useAppStore((s) => s.setSelection);

  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  if (!plant) return null;

  const isTimelineView = viewMode === 'time';

  const isCodeUnique = (code: string) => {
    return !plants.some((p) => p.id !== plantId && p.code === code);
  };

  const handleCodeEdit = (newCode: string) => {
    const trimmed = newCode.trim().toUpperCase();
    setEditingCode(trimmed);

    if (!trimmed) {
      setCodeError('Code is required');
    } else if (!isCodeUnique(trimmed)) {
      setCodeError('Code already exists');
    } else {
      setCodeError(null);
    }
  };

  const handleCodeSave = () => {
    if (editingCode && !codeError) {
      updatePlant(plantId, { code: editingCode });
      setEditingCode(null);
    }
  };

  const handleCodeCancel = () => {
    setEditingCode(null);
    setCodeError(null);
  };

  const handleStrainChange = (newStrainId: string | null) => {
    const newStrain = newStrainId ? strains.find((s) => s.id === newStrainId) : null;
    const newAbbreviation = newStrain?.abbreviation || 'PLT';

    // Generate new code based on new strain
    const existingCodes = plants.filter((p) => p.id !== plantId).map((p) => p.code);
    const newCode = generatePlantCode(newAbbreviation, existingCodes);

    updatePlant(plantId, { strainId: newStrainId, code: newCode });
  };

  const handleDelete = () => {
    deletePlant(plantId);
    setSelection(null);
    onClose();
  };

  return (
    <div style={{ color: COLORS.text, fontSize: 14 }}>
      {/* Header with editable code */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        {editingCode !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <input
              type="text"
              value={editingCode}
              onChange={(e) => handleCodeEdit(e.target.value)}
              autoFocus
              style={{
                width: 120,
                height: 44,
                padding: '8px 12px',
                background: COLORS.background,
                border: `1px solid ${codeError ? COLORS.danger : COLORS.border}`,
                color: COLORS.text,
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !codeError) handleCodeSave();
                if (e.key === 'Escape') handleCodeCancel();
              }}
            />
            <button
              className="btn-primary"
              onClick={handleCodeSave}
              disabled={!!codeError}
              style={{
                width: 44,
                height: 44,
                background: codeError ? COLORS.backgroundLight : COLORS.green,
                border: 'none',
                color: codeError ? COLORS.textMuted : COLORS.background,
                cursor: codeError ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={20} />
            </button>
            <button
              className="btn-icon"
              onClick={handleCodeCancel}
              style={{
                width: 44,
                height: 44,
                background: 'transparent',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <X size={20} />
            </button>
            {codeError && (
              <span style={{ color: COLORS.danger, fontSize: 12 }}>{codeError}</span>
            )}
          </div>
        ) : (
          <div
            onClick={() => setEditingCode(plant.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer',
              padding: '4px 8px',
              marginLeft: -8,
              border: `1px solid transparent`,
            }}
            title="Click to edit"
          >
            {plant.code}
            <Pencil size={14} style={{ color: COLORS.textMuted }} />
          </div>
        )}
        <button
          className="btn-icon"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: -8,
            borderRadius: 4,
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Strain selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 6 }}>
          Strain
        </div>
        <select
          value={plant.strainId || ''}
          onChange={(e) => handleStrainChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '12px 10px',
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: 'inherit',
            minHeight: 44,
          }}
        >
          <option value="">No strain</option>
          {strains.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.abbreviation})
            </option>
          ))}
        </select>
      </div>

      {/* Stage selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 6 }}>
          Stage {isTimelineView && <span style={{ opacity: 0.6 }}>(drag to change in timeline)</span>}
        </div>
        <select
          value={plant.stage}
          onChange={(e) => updatePlant(plantId, { stage: e.target.value as Stage })}
          disabled={isTimelineView}
          style={{
            width: '100%',
            padding: '12px 10px',
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: 'inherit',
            minHeight: 44,
            opacity: isTimelineView ? 0.6 : 1,
            cursor: isTimelineView ? 'not-allowed' : 'pointer',
          }}
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Delete button */}
      <button
        className="btn-danger"
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: 14,
          background: COLORS.danger,
          border: 'none',
          color: COLORS.text,
          fontSize: 14,
          cursor: 'pointer',
          marginTop: 8,
          minHeight: 44,
        }}
      >
        DELETE
      </button>
    </div>
  );
}
