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

  if (!plant) return null;

  const isTimelineView = viewMode === 'time';

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: 16 }}>{plant.code}</div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            fontSize: 16,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Strain selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>
          Strain
        </div>
        <select
          value={plant.strainId || ''}
          onChange={(e) => handleStrainChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '8px 10px',
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: 'inherit',
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
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>
          Stage {isTimelineView && <span style={{ opacity: 0.6 }}>(drag to change in timeline)</span>}
        </div>
        <select
          value={plant.stage}
          onChange={(e) => updatePlant(plantId, { stage: e.target.value as Stage })}
          disabled={isTimelineView}
          style={{
            width: '100%',
            padding: '8px 10px',
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 14,
            fontFamily: 'inherit',
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
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: 10,
          background: COLORS.danger,
          border: 'none',
          color: COLORS.text,
          fontSize: 12,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        DELETE
      </button>
    </div>
  );
}
