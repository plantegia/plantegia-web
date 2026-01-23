import { useState, useMemo } from 'react';
import { COLORS } from '../../styles/tokens';
import TickSlider from '../ui/TickSlider';

interface Props {
  lang?: 'en' | 'de';
}

type PlantSize = 'small' | 'medium' | 'large';

const CM_TO_SQFT = 0.00107639; // 1 cm² = 0.00107639 sq ft

// Price ranges in USD (low, high)
const TENT_PRICES: Record<string, [number, number]> = {
  tiny: [50, 80],
  small: [70, 120],
  medium: [100, 180],
  large: [150, 300],
  xlarge: [250, 450],
  xxlarge: [400, 700],
  room: [800, 2000],
};

const EQUIPMENT_COSTS = {
  ledLight: { perSqFt: [25, 45] as [number, number], name: 'LED Grow Light' },
  ventilation: { base: [60, 150] as [number, number], name: 'Ventilation Kit' },
  carbonFilter: { base: [40, 100] as [number, number], name: 'Carbon Filter' },
  fans: { base: [20, 50] as [number, number], name: 'Circulation Fans' },
};

function getPriceRange(sqFt: number): [number, number] {
  if (sqFt <= 4) return TENT_PRICES.tiny;
  if (sqFt <= 12) return TENT_PRICES.small;
  if (sqFt <= 20) return TENT_PRICES.medium;
  if (sqFt <= 40) return TENT_PRICES.large;
  if (sqFt <= 70) return TENT_PRICES.xlarge;
  if (sqFt <= 100) return TENT_PRICES.xxlarge;
  return TENT_PRICES.room;
}

function getEquipmentEstimate(sqFt: number): { total: [number, number]; items: { name: string; range: [number, number] }[] } {
  const items: { name: string; range: [number, number] }[] = [];
  const sizeMultiplier = sqFt <= 16 ? 1 : sqFt <= 36 ? 1.5 : sqFt <= 64 ? 2 : 2.5;

  const ledLow = Math.ceil(sqFt * EQUIPMENT_COSTS.ledLight.perSqFt[0]);
  const ledHigh = Math.ceil(sqFt * EQUIPMENT_COSTS.ledLight.perSqFt[1]);
  items.push({ name: EQUIPMENT_COSTS.ledLight.name, range: [ledLow, ledHigh] });

  items.push({
    name: EQUIPMENT_COSTS.ventilation.name,
    range: [
      Math.ceil(EQUIPMENT_COSTS.ventilation.base[0] * sizeMultiplier),
      Math.ceil(EQUIPMENT_COSTS.ventilation.base[1] * sizeMultiplier),
    ],
  });

  items.push({
    name: EQUIPMENT_COSTS.carbonFilter.name,
    range: [
      Math.ceil(EQUIPMENT_COSTS.carbonFilter.base[0] * sizeMultiplier),
      Math.ceil(EQUIPMENT_COSTS.carbonFilter.base[1] * sizeMultiplier),
    ],
  });

  const fanMultiplier = sqFt <= 25 ? 1 : sqFt <= 50 ? 2 : 3;
  items.push({
    name: EQUIPMENT_COSTS.fans.name,
    range: [
      Math.ceil(EQUIPMENT_COSTS.fans.base[0] * fanMultiplier),
      Math.ceil(EQUIPMENT_COSTS.fans.base[1] * fanMultiplier),
    ],
  });

  const totalLow = items.reduce((sum, item) => sum + item.range[0], 0);
  const totalHigh = items.reduce((sum, item) => sum + item.range[1], 0);

  return { total: [totalLow, totalHigh], items };
}

export default function TentSpacingCalculator({ lang = 'en' }: Props) {
  const [widthCm, setWidthCm] = useState(120);
  const [heightCm, setHeightCm] = useState(120);
  const [plantSize, setPlantSize] = useState<PlantSize>('medium');

  const t = {
    en: {
      tentWidth: 'Width',
      tentHeight: 'Depth',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      smallTip: 'Small plants work well for SOG (Sea of Green) setups.',
      mediumTip: 'Medium plants offer good balance of yield and management.',
      largeTip: 'Large plants need more space but yield more per plant.',
      estimatedCost: 'Estimated Costs',
      tentPrice: 'Tent',
      totalSetup: 'Total Setup',
      notATent: 'This is a grow room, not a tent',
      notATentDesc: 'Spaces >300×300 cm are typically dedicated rooms.',
      priceNote: 'Estimates based on typical market ranges.',
    },
    de: {
      tentWidth: 'Breite',
      tentHeight: 'Tiefe',
      small: 'Klein',
      medium: 'Mittel',
      large: 'Groß',
      smallTip: 'Kleine Pflanzen eignen sich für SOG-Setups.',
      mediumTip: 'Mittlere Pflanzen bieten gutes Gleichgewicht.',
      largeTip: 'Große Pflanzen brauchen mehr Platz, mehr Ertrag.',
      estimatedCost: 'Geschätzte Kosten',
      tentPrice: 'Zelt',
      totalSetup: 'Gesamt',
      notATent: 'Das ist ein Grow-Raum, kein Zelt',
      notATentDesc: 'Räume >300×300 cm sind typischerweise dedizierte Räume.',
      priceNote: 'Schätzungen basierend auf Marktpreisen.',
    },
  };

  const labels = t[lang];

  const result = useMemo(() => {
    const sqCm = widthCm * heightCm;
    const sqFt = sqCm * CM_TO_SQFT;
    const plantsSmall = Math.floor(sqFt / 1);
    const plantsMedium = Math.floor(sqFt / 2);
    const plantsLarge = Math.floor(sqFt / 4);
    const isNotATent = sqFt > 100;
    const tentPrice = getPriceRange(sqFt);
    const equipment = getEquipmentEstimate(sqFt);
    const totalLow = tentPrice[0] + equipment.total[0];
    const totalHigh = tentPrice[1] + equipment.total[1];

    return {
      plantsSmall,
      plantsMedium,
      plantsLarge,
      isNotATent,
      tentPrice,
      equipment,
      totalPrice: [totalLow, totalHigh] as [number, number],
    };
  }, [widthCm, heightCm]);

  const tips: Record<PlantSize, string> = {
    small: labels.smallTip,
    medium: labels.mediumTip,
    large: labels.largeTip,
  };

  const formatPrice = (range: [number, number]) => `$${range[0]}–$${range[1]}`;

  return (
    <div
      style={{
        fontFamily: '"Space Mono", monospace',
        backgroundColor: COLORS.backgroundDark,
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
      }}
    >
      {/* Plant counts - 3 boxes */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {(['small', 'medium', 'large'] as const).map((size) => (
          <div
            key={size}
            onClick={() => setPlantSize(size)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '16px 8px',
              border: `1px solid ${plantSize === size ? COLORS.green : COLORS.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: plantSize === size ? COLORS.green : COLORS.text,
                lineHeight: 1,
              }}
            >
              {size === 'small' ? result.plantsSmall : size === 'medium' ? result.plantsMedium : result.plantsLarge}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: COLORS.textMuted,
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {labels[size]}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={{ marginBottom: '24px', fontSize: '13px', color: COLORS.textMuted }}>
        {tips[plantSize]}
      </div>

      {/* Warning for large spaces */}
      {result.isNotATent && (
        <div
          style={{
            border: `1px solid ${COLORS.orange}`,
            padding: '12px',
            marginBottom: '24px',
            fontSize: '13px',
          }}
        >
          <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>⚠ {labels.notATent}</span>
          {' · '}
          <span style={{ color: COLORS.textMuted }}>{labels.notATentDesc}</span>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
        <TickSlider
          label={labels.tentWidth}
          value={widthCm}
          onChange={setWidthCm}
          min={60}
          max={360}
          step={30}
          tickInterval={2}
          unit="cm"
        />

        <TickSlider
          label={labels.tentHeight}
          value={heightCm}
          onChange={setHeightCm}
          min={60}
          max={360}
          step={30}
          tickInterval={2}
          unit="cm"
        />
      </div>

      {/* Cost estimates */}
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: '20px',
        }}
      >
        <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '12px', textTransform: 'uppercase' }}>
          {labels.estimatedCost}
        </div>

        <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: COLORS.textMuted }}>{labels.tentPrice}</span>
            <span>{formatPrice(result.tentPrice)}</span>
          </div>

          {result.equipment.items.map((item) => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{item.name}</span>
              <span>{formatPrice(item.range)}</span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: `1px solid ${COLORS.border}`,
              marginTop: '6px',
              fontWeight: 'bold',
            }}
          >
            <span>{labels.totalSetup}</span>
            <span style={{ color: COLORS.green }}>{formatPrice(result.totalPrice)}</span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '12px' }}>
          {labels.priceNote}
        </div>
      </div>
    </div>
  );
}
