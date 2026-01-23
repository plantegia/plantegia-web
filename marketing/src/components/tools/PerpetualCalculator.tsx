import { useState, useMemo } from 'react';
import { COLORS, STAGE_COLORS } from '../../styles/tokens';
import TickSlider from '../ui/TickSlider';

interface Props {
  lang?: 'en' | 'de';
}

export default function PerpetualCalculator({ lang = 'en' }: Props) {
  const [floweringWeeks, setFloweringWeeks] = useState(8);
  const [vegWeeks, setVegWeeks] = useState(4);
  const [harvestFrequency, setHarvestFrequency] = useState(2); // weeks between harvests

  const result = useMemo(() => {
    const harvestDays = harvestFrequency * 7;
    const floweringDays = floweringWeeks * 7;
    const vegDays = vegWeeks * 7;

    const plantsInFlower = Math.ceil(floweringDays / harvestDays);
    const plantsInVeg = Math.ceil(vegDays / harvestDays);

    return {
      plantsInVeg,
      plantsInFlower,
      totalPlants: plantsInVeg + plantsInFlower,
      plantEveryXDays: harvestDays,
      harvestEveryXDays: harvestDays,
    };
  }, [floweringWeeks, vegWeeks, harvestFrequency]);

  const t = {
    en: {
      title: 'Perpetual Harvest Calculator',
      floweringWeeks: 'Flowering Period (weeks)',
      vegWeeks: 'Veg Period (weeks)',
      harvestFrequency: 'Harvest Every (weeks)',
      calculate: 'Calculate',
      results: 'Results',
      plantsInVeg: 'Veg Zone',
      plantsInFlower: 'Flower Zone',
      totalPlants: 'Total Plants Needed',
      plantEvery: 'Plant new every',
      harvestEvery: 'Harvest every',
      days: 'days',
      weeks: 'weeks',
      tip: 'Tip: Adjust veg period to control plant size before flowering.',
      ctaText: 'Different strains have different veg and flowering periods. For precise planning with multiple strains,',
      ctaLink: 'try Plantegia',
    },
    de: {
      title: 'Dauerernte Rechner',
      floweringWeeks: 'Blütezeit (Wochen)',
      vegWeeks: 'Veg-Zeit (Wochen)',
      harvestFrequency: 'Ernte alle (Wochen)',
      calculate: 'Berechnen',
      results: 'Ergebnisse',
      plantsInVeg: 'Veg Zone',
      plantsInFlower: 'Flower Zone',
      totalPlants: 'Benötigte Pflanzen',
      plantEvery: 'Neue Pflanze alle',
      harvestEvery: 'Ernte alle',
      days: 'Tage',
      weeks: 'Wochen',
      tip: 'Tipp: Passe die Veg-Zeit an um die Pflanzengröße vor der Blüte zu kontrollieren.',
      ctaText: 'Verschiedene Sorten haben unterschiedliche Veg- und Blütezeiten. Für präzise Planung mit mehreren Sorten,',
      ctaLink: 'Plantegia testen',
    },
  };

  const labels = t[lang];

  return (
    <div
      style={{
        fontFamily: '"Space Mono", monospace',
        backgroundColor: COLORS.backgroundDark,
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
      }}
    >
      {/* Results - big numbers */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '16px',
            border: `1px solid ${STAGE_COLORS.vegetative}`,
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: STAGE_COLORS.vegetative,
              lineHeight: 1,
            }}
          >
            {result.plantsInVeg}
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
            {labels.plantsInVeg}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '16px',
            border: `1px solid ${STAGE_COLORS.vegetative}`,
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: STAGE_COLORS.vegetative,
              lineHeight: 1,
            }}
          >
            {result.plantsInFlower}
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
            {labels.plantsInFlower}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gap: '24px' }}>
        <TickSlider
          label={labels.floweringWeeks}
          value={floweringWeeks}
          onChange={setFloweringWeeks}
          min={6}
          max={14}
          tickInterval={2}
        />

        <TickSlider
          label={labels.vegWeeks}
          value={vegWeeks}
          onChange={setVegWeeks}
          min={2}
          max={12}
          tickInterval={2}
        />

        <TickSlider
          label={labels.harvestFrequency}
          value={harvestFrequency}
          onChange={setHarvestFrequency}
          min={1}
          max={8}
          tickInterval={2}
        />
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: `1px solid ${COLORS.border}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: COLORS.textMuted,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {labels.ctaText}{' '}
          <a
            href="https://app.plantegia.com"
            style={{
              color: COLORS.text,
              fontWeight: 'bold',
            }}
          >
            {labels.ctaLink}
          </a>
        </p>
      </div>
    </div>
  );
}
