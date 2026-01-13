import { useState } from 'react';
import { COLORS, STAGE_COLORS } from '../../styles/tokens';

interface Props {
  lang?: 'en' | 'de';
}

interface Result {
  plantsInVeg: number;
  plantsInFlower: number;
  totalPlants: number;
  plantEveryXDays: number;
  harvestEveryXDays: number;
  vegWeeks: number;
}

export default function PerpetualCalculator({ lang = 'en' }: Props) {
  const [floweringWeeks, setFloweringWeeks] = useState(8);
  const [vegWeeks, setVegWeeks] = useState(4);
  const [harvestFrequency, setHarvestFrequency] = useState(2); // weeks between harvests
  const [result, setResult] = useState<Result | null>(null);

  const t = {
    en: {
      title: 'Perpetual Harvest Calculator',
      floweringWeeks: 'Flowering Period (weeks)',
      vegWeeks: 'Veg Period (weeks)',
      harvestFrequency: 'Harvest Every (weeks)',
      calculate: 'Calculate',
      results: 'Results',
      plantsInVeg: 'Plants in Veg',
      plantsInFlower: 'Plants in Flower',
      totalPlants: 'Total Plants Needed',
      plantEvery: 'Plant new every',
      harvestEvery: 'Harvest every',
      days: 'days',
      weeks: 'weeks',
      tip: 'Tip: Adjust veg period to control plant size before flowering.',
    },
    de: {
      title: 'Dauerernte Rechner',
      floweringWeeks: 'Blütezeit (Wochen)',
      vegWeeks: 'Veg-Zeit (Wochen)',
      harvestFrequency: 'Ernte alle (Wochen)',
      calculate: 'Berechnen',
      results: 'Ergebnisse',
      plantsInVeg: 'Pflanzen in Veg',
      plantsInFlower: 'Pflanzen in Blüte',
      totalPlants: 'Benötigte Pflanzen',
      plantEvery: 'Neue Pflanze alle',
      harvestEvery: 'Ernte alle',
      days: 'Tage',
      weeks: 'Wochen',
      tip: 'Tipp: Passe die Veg-Zeit an um die Pflanzengröße vor der Blüte zu kontrollieren.',
    },
  };

  const labels = t[lang];

  const calculate = () => {
    const harvestDays = harvestFrequency * 7;
    const floweringDays = floweringWeeks * 7;
    const vegDays = vegWeeks * 7;

    // Plants in flowering = flowering days / harvest frequency
    const plantsInFlower = Math.ceil(floweringDays / harvestDays);
    // Plants in veg = veg days / harvest frequency
    const plantsInVeg = Math.ceil(vegDays / harvestDays);

    setResult({
      plantsInVeg,
      plantsInFlower,
      totalPlants: plantsInVeg + plantsInFlower,
      plantEveryXDays: harvestDays,
      harvestEveryXDays: harvestDays,
      vegWeeks,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '16px',
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.text,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    color: COLORS.textMuted,
  };

  return (
    <div
      style={{
        fontFamily: '"Space Mono", monospace',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>{labels.floweringWeeks}</label>
          <input
            type="number"
            min={6}
            max={14}
            value={floweringWeeks}
            onChange={(e) => setFloweringWeeks(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>{labels.vegWeeks}</label>
          <input
            type="number"
            min={2}
            max={12}
            value={vegWeeks}
            onChange={(e) => setVegWeeks(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>{labels.harvestFrequency}</label>
          <input
            type="number"
            min={1}
            max={4}
            value={harvestFrequency}
            onChange={(e) => setHarvestFrequency(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <button
          onClick={calculate}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontFamily: '"Space Mono", monospace',
            fontWeight: 'bold',
            backgroundColor: COLORS.green,
            color: COLORS.text,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.orange)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.green)}
        >
          {labels.calculate}
        </button>
      </div>

      {result && (
        <div
          style={{
            backgroundColor: COLORS.background,
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <h4 style={{ marginBottom: '16px', color: COLORS.teal }}>{labels.results}</h4>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.plantsInVeg}</span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: STAGE_COLORS.vegetative,
                  padding: '2px 8px',
                  backgroundColor: COLORS.backgroundDark,
                  borderRadius: '4px',
                }}
              >
                {result.plantsInVeg}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.plantsInFlower}</span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: STAGE_COLORS.flowering,
                  padding: '2px 8px',
                  backgroundColor: COLORS.backgroundDark,
                  borderRadius: '4px',
                }}
              >
                {result.plantsInFlower}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={{ color: COLORS.textMuted }}>{labels.totalPlants}</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{result.totalPlants}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.plantEvery}</span>
              <span>
                {result.plantEveryXDays} {labels.days}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.harvestEvery}</span>
              <span>
                {result.harvestEveryXDays} {labels.days}
              </span>
            </div>
          </div>

          <p
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: COLORS.textMuted,
              fontStyle: 'italic',
            }}
          >
            {labels.tip}
          </p>
        </div>
      )}
    </div>
  );
}
