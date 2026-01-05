import { Pencil } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants';

interface PlantInspectorProps {
  plantId: string;
  onEdit: () => void;
}

export function PlantInspector({ plantId, onEdit }: PlantInspectorProps) {
  const plant = useAppStore((s) => s.plants.find((p) => p.id === plantId));
  const strains = useAppStore((s) => s.strains);

  if (!plant) return null;

  const strain = strains.find((s) => s.id === plant.strainId);

  const startDate = new Date(plant.startedAt);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalDays = (strain?.vegDays || 30) + (strain?.floweringDays || 60);
  const daysRemaining = Math.max(0, totalDays - daysSinceStart);

  const stageName = plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1);

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
          Day {daysSinceStart} · {stageName} · ~{daysRemaining}d
        </div>
      </div>

      {/* Edit button */}
      <button
        onClick={onEdit}
        style={{
          padding: '8px 12px',
          background: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.text,
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Pencil size={14} />
        Edit
      </button>
    </div>
  );
}
