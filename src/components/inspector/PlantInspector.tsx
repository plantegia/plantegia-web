import { useAppStore } from '../../store/useAppStore';
import { COLORS, STAGES } from '../../constants';
import type { Stage } from '../../types';

interface PlantInspectorProps {
  plantId: string;
  onDelete: () => void;
}

export function PlantInspector({ plantId, onDelete }: PlantInspectorProps) {
  const plant = useAppStore((s) => s.plants.find((p) => p.id === plantId));
  const strains = useAppStore((s) => s.strains);
  const viewMode = useAppStore((s) => s.viewMode);
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
    onDelete();
  };

  // In timeline view, stage is changed by dragging, so the dropdown is read-only
  const isTimelineView = viewMode === 'time';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: COLORS.text,
        fontSize: 14,
      }}
    >
      {/* Plant info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 'bold', fontSize: 16 }}>{plant.code}</span>
          <span style={{ color: COLORS.textMuted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {strain?.name || 'Unknown'}
          </span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
          Day {daysSinceStart} · ~{daysRemaining}d to harvest
        </div>
      </div>

      {/* Stage selector */}
      <select
        value={plant.stage}
        onChange={(e) => updatePlant(plantId, { stage: e.target.value as Stage })}
        disabled={isTimelineView}
        style={{
          padding: '6px 8px',
          background: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.text,
          fontSize: 12,
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

      {/* Compact delete button */}
      <button
        onClick={handleDelete}
        style={{
          padding: '6px 12px',
          background: COLORS.danger,
          border: 'none',
          color: COLORS.text,
          fontSize: 12,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        ✕
      </button>
    </div>
  );
}
