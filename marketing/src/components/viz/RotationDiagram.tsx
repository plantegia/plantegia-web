import { COLORS, SPACE_COLORS } from '../../styles/tokens';

interface RotationStep {
  label: string;
  description?: string;
}

interface Props {
  vegSpace: string;
  flowerSpace: string;
  steps?: RotationStep[];
  lang?: 'en' | 'de';
}

export default function RotationDiagram({
  vegSpace = 'VEG',
  flowerSpace = 'FLOWER',
  steps,
  lang = 'en',
}: Props) {
  const defaultSteps = {
    en: [
      { label: '1. Seed/Clone', description: 'Start new plants' },
      { label: '2. Veg Growth', description: '4-8 weeks vegetative' },
      { label: '3. Move to Flower', description: 'When ready to flip' },
      { label: '4. Flowering', description: '8-10 weeks flowering' },
      { label: '5. Harvest', description: 'Harvest & restart cycle' },
    ],
    de: [
      { label: '1. Samen/Klon', description: 'Neue Pflanzen starten' },
      { label: '2. Veg Phase', description: '4-8 Wochen vegetativ' },
      { label: '3. In Blüte', description: 'Wenn bereit zum Flip' },
      { label: '4. Blütephase', description: '8-10 Wochen Blüte' },
      { label: '5. Ernte', description: 'Ernten & Zyklus neu starten' },
    ],
  };

  const rotationSteps = steps || defaultSteps[lang];

  return (
    <div
      style={{
        backgroundColor: COLORS.backgroundDark,
        borderRadius: '8px',
        padding: '24px',
        fontFamily: '"Space Mono", monospace',
      }}
    >
      {/* Spaces */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Veg Space */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '80px',
              border: `3px solid ${SPACE_COLORS[0]}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.background,
              marginBottom: '8px',
            }}
          >
            <span style={{ color: SPACE_COLORS[0], fontWeight: 'bold' }}>{vegSpace}</span>
          </div>
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>18/6</span>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: COLORS.teal,
          }}
        >
          <svg width="48" height="24" viewBox="0 0 48 24">
            <path
              d="M0 12 L36 12 M36 12 L28 4 M36 12 L28 20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Flower Space */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '80px',
              border: `3px solid ${COLORS.orange}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.background,
              marginBottom: '8px',
            }}
          >
            <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>{flowerSpace}</span>
          </div>
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>12/12</span>
        </div>
      </div>

      {/* Steps */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {rotationSteps.map((step, i) => (
          <div
            key={i}
            style={{
              backgroundColor: COLORS.background,
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '11px',
              textAlign: 'center',
              minWidth: '100px',
            }}
          >
            <div style={{ color: COLORS.text, fontWeight: 'bold' }}>{step.label}</div>
            {step.description && (
              <div style={{ color: COLORS.textMuted, fontSize: '10px', marginTop: '2px' }}>
                {step.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
