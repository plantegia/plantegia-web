import { useState } from 'react';
import { COLORS } from '../../styles/tokens';

interface Props {
  lang?: 'en' | 'de';
}

interface Result {
  totalCells: number;
  plantsSmall: number;
  plantsMedium: number;
  plantsLarge: number;
  recommendation: string;
}

export default function TentSpacingCalculator({ lang = 'en' }: Props) {
  const [width, setWidth] = useState(4); // feet or cells
  const [height, setHeight] = useState(4);
  const [plantSize, setPlantSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [result, setResult] = useState<Result | null>(null);

  const t = {
    en: {
      title: 'Tent Spacing Calculator',
      tentWidth: 'Tent Width (ft)',
      tentHeight: 'Tent Height (ft)',
      plantSize: 'Plant Size',
      small: 'Small (1 sq ft)',
      medium: 'Medium (2 sq ft)',
      large: 'Large (4 sq ft)',
      calculate: 'Calculate',
      results: 'Results',
      totalArea: 'Total Area',
      sqft: 'sq ft',
      maxPlants: 'Max Plants',
      recommendation: 'Recommendation',
      smallTip: 'Small plants work well for SOG (Sea of Green) setups.',
      mediumTip: 'Medium plants are ideal for most growers. Good balance of yield and management.',
      largeTip: 'Large plants need more space but produce bigger yields per plant.',
    },
    de: {
      title: 'Zelt-Platzierungs-Rechner',
      tentWidth: 'Zeltbreite (ft)',
      tentHeight: 'Zelthöhe (ft)',
      plantSize: 'Pflanzengröße',
      small: 'Klein (1 sq ft)',
      medium: 'Mittel (2 sq ft)',
      large: 'Groß (4 sq ft)',
      calculate: 'Berechnen',
      results: 'Ergebnisse',
      totalArea: 'Gesamtfläche',
      sqft: 'sq ft',
      maxPlants: 'Max. Pflanzen',
      recommendation: 'Empfehlung',
      smallTip: 'Kleine Pflanzen eignen sich gut für SOG (Sea of Green) Setups.',
      mediumTip: 'Mittlere Pflanzen sind ideal für die meisten Grower. Gutes Gleichgewicht.',
      largeTip: 'Große Pflanzen brauchen mehr Platz, produzieren aber mehr pro Pflanze.',
    },
  };

  const labels = t[lang];

  const calculate = () => {
    const totalCells = width * height;

    // Plant sizes in cells
    const sizes = {
      small: 1, // 1x1
      medium: 2, // 1x2
      large: 4, // 2x2
    };

    const cellsPerPlant = sizes[plantSize];
    void cellsPerPlant; // used for size calculations below

    const tips = {
      small: labels.smallTip,
      medium: labels.mediumTip,
      large: labels.largeTip,
    };

    setResult({
      totalCells,
      plantsSmall: Math.floor(totalCells / 1),
      plantsMedium: Math.floor(totalCells / 2),
      plantsLarge: Math.floor(totalCells / 4),
      recommendation: tips[plantSize],
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

  const radioStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>{labels.tentWidth}</label>
            <input
              type="number"
              min={2}
              max={10}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{labels.tentHeight}</label>
            <input
              type="number"
              min={2}
              max={10}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>{labels.plantSize}</label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <label
                key={size}
                style={{
                  ...radioStyle,
                  borderColor: plantSize === size ? COLORS.green : COLORS.border,
                }}
              >
                <input
                  type="radio"
                  name="plantSize"
                  value={size}
                  checked={plantSize === size}
                  onChange={() => setPlantSize(size)}
                  style={{ accentColor: COLORS.green }}
                />
                <span>{labels[size]}</span>
              </label>
            ))}
          </div>
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
              <span style={{ color: COLORS.textMuted }}>{labels.totalArea}</span>
              <span style={{ fontWeight: 'bold' }}>
                {result.totalCells} {labels.sqft}
              </span>
            </div>

            <div
              style={{
                padding: '12px',
                backgroundColor: COLORS.backgroundDark,
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{labels.maxPlants}</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.plantsSmall}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>Small</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.plantsMedium}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>Medium</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{result.plantsLarge}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted }}>Large</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ color: COLORS.textMuted, marginBottom: '4px' }}>
                {labels.recommendation}
              </div>
              <p style={{ margin: 0, fontSize: '14px' }}>{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
