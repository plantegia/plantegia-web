import { useAppStore } from '../../store/useAppStore';
import { COLORS, STAGES } from '../../constants';
import type { Stage, PlantSize } from '../../types';

interface PlantInspectorProps {
  plantId: string;
}

export function PlantInspector({ plantId }: PlantInspectorProps) {
  const plant = useAppStore((s) => s.plants.find((p) => p.id === plantId));
  const strains = useAppStore((s) => s.strains);
  const updatePlant = useAppStore((s) => s.updatePlant);
  const deletePlant = useAppStore((s) => s.deletePlant);
  const setSelection = useAppStore((s) => s.setSelection);

  if (!plant) return null;

  const strain = strains.find((s) => s.id === plant.strainId);

  const startDate = new Date(plant.startedAt);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalDays = (strain?.vegDays || 30) + (strain?.floweringDays || 60);
  const daysRemaining = Math.max(0, totalDays - daysSinceStart);

  const handleDelete = () => {
    deletePlant(plantId);
    setSelection(null);
  };

  return (
    <div style={{ color: COLORS.text, fontSize: 14 }}>
      <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
        {plant.code}
      </div>
      <div style={{ color: COLORS.textMuted, marginBottom: 8 }}>
        {strain?.name || 'Unknown Strain'}
      </div>
      <div style={{ marginBottom: 8 }}>
        Day {daysSinceStart} · {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
      </div>
      <div style={{ marginBottom: 12, color: COLORS.textMuted }}>
        Harvest: ~{daysRemaining}d
      </div>

      <div
        style={{
          height: 1,
          background: COLORS.border,
          margin: '12px 0',
        }}
      />

      <div style={{ marginBottom: 12 }}>
        <span style={{ color: COLORS.textMuted, marginRight: 8 }}>Size:</span>
        {([1, 2, 4] as PlantSize[]).map((size) => (
          <button
            key={size}
            onClick={() => updatePlant(plantId, { size })}
            style={{
              padding: '4px 10px',
              marginRight: 4,
              background: plant.size === size ? COLORS.teal : 'transparent',
              border: `1px solid ${COLORS.border}`,
              color: plant.size === size ? COLORS.background : COLORS.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {size}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ color: COLORS.textMuted, marginRight: 8 }}>Stage:</span>
        <select
          value={plant.stage}
          onChange={(e) => updatePlant(plantId, { stage: e.target.value as Stage })}
          style={{
            padding: 6,
            background: COLORS.background,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </option>
          ))}
        </select>
      </div>

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
        }}
      >
        DELETE
      </button>
    </div>
  );
}
