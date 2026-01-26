import { useState, useMemo } from 'react';
import { COLORS, STAGE_COLORS } from '../../styles/tokens';
import TickSlider from '../ui/TickSlider';

interface Props {
  lang?: 'en' | 'de';
}

export default function PerpetualVsSequentialCalculator({ lang = 'en' }: Props) {
  const [flowerSlots, setFlowerSlots] = useState(4);
  const [floweringWeeks, setFloweringWeeks] = useState(8);
  const [vegWeeks, setVegWeeks] = useState(4);
  const [cleanupWeeks, setCleanupWeeks] = useState(2);
  const [yieldPerPlant, setYieldPerPlant] = useState(60); // grams

  const result = useMemo(() => {
    // Sequential: all plants veg together, flower together, harvest, cleanup, repeat
    const sequentialCycle = vegWeeks + floweringWeeks + cleanupWeeks;
    const sequentialCyclesPerYear = 52 / sequentialCycle;
    const sequentialPlantsPerYear = flowerSlots * sequentialCyclesPerYear;
    const sequentialYieldPerYear = sequentialPlantsPerYear * yieldPerPlant;

    // Perpetual: staggered planting, harvest one every X weeks
    const harvestEveryWeeks = floweringWeeks / flowerSlots;
    const perpetualHarvestsPerYear = 52 / harvestEveryWeeks;
    const perpetualPlantsPerYear = perpetualHarvestsPerYear;
    const perpetualYieldPerYear = perpetualPlantsPerYear * yieldPerPlant;

    // Veg slots needed for perpetual (to keep pipeline full)
    const vegSlotsNeeded = Math.ceil(vegWeeks / harvestEveryWeeks);

    // Advantage calculation
    const yieldAdvantage = ((perpetualYieldPerYear - sequentialYieldPerYear) / sequentialYieldPerYear) * 100;

    return {
      sequential: {
        cycleWeeks: sequentialCycle,
        cyclesPerYear: sequentialCyclesPerYear,
        plantsPerYear: sequentialPlantsPerYear,
        yieldPerYear: sequentialYieldPerYear,
      },
      perpetual: {
        harvestEveryWeeks,
        harvestsPerYear: perpetualHarvestsPerYear,
        plantsPerYear: perpetualPlantsPerYear,
        yieldPerYear: perpetualYieldPerYear,
        vegSlotsNeeded,
      },
      yieldAdvantage,
    };
  }, [flowerSlots, floweringWeeks, vegWeeks, cleanupWeeks, yieldPerPlant]);

  const t = {
    en: {
      sequential: 'Sequential',
      perpetual: 'Perpetual',
      plantsYear: 'plants/year',
      yieldYear: 'yield/year',
      flowerSlots: 'Flower Zone Slots',
      floweringWeeks: 'Flowering Period',
      vegWeeks: 'Veg Period',
      cleanupWeeks: 'Cleanup/Prep Time',
      yieldPerPlant: 'Yield per Plant',
      weeks: 'wk',
      grams: 'g',
      cycleLength: 'cycle',
      cyclesYear: 'cycles/year',
      harvestEvery: 'harvest every',
      harvestsYear: 'harvests/year',
      vegNeeded: 'veg slots needed',
      moreYield: 'more yield',
      lessYield: 'less yield',
      requiresNote: 'Perpetual requires separate veg zone',
      sameFlowerNote: 'Same flower zone capacity for both methods',
      ctaText: 'Plan your perpetual rotation visually with',
      ctaLink: 'Plantegia',
    },
    de: {
      sequential: 'Sequentiell',
      perpetual: 'Perpetual',
      plantsYear: 'Pflanzen/Jahr',
      yieldYear: 'Ertrag/Jahr',
      flowerSlots: 'Blüte-Zone Plätze',
      floweringWeeks: 'Blütezeit',
      vegWeeks: 'Veg-Zeit',
      cleanupWeeks: 'Vorbereitung',
      yieldPerPlant: 'Ertrag pro Pflanze',
      weeks: 'Wo',
      grams: 'g',
      cycleLength: 'Zyklus',
      cyclesYear: 'Zyklen/Jahr',
      harvestEvery: 'Ernte alle',
      harvestsYear: 'Ernten/Jahr',
      vegNeeded: 'Veg-Plätze benötigt',
      moreYield: 'mehr Ertrag',
      lessYield: 'weniger Ertrag',
      requiresNote: 'Perpetual erfordert separate Veg-Zone',
      sameFlowerNote: 'Gleiche Blüte-Zone Kapazität für beide Methoden',
      ctaText: 'Plane deine Perpetual-Rotation visuell mit',
      ctaLink: 'Plantegia',
    },
  };

  const labels = t[lang];

  const formatNumber = (n: number, decimals = 1) => {
    return n % 1 === 0 ? n.toString() : n.toFixed(decimals);
  };

  return (
    <div
      style={{
        fontFamily: '"Space Mono", monospace',
        backgroundColor: COLORS.backgroundDark,
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
      }}
    >
      {/* Results comparison - two columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Sequential */}
        <div
          style={{
            padding: '16px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: COLORS.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}
          >
            {labels.sequential}
          </div>

          {/* Big number - yield */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: COLORS.text,
              lineHeight: 1,
            }}
          >
            {formatNumber(result.sequential.yieldPerYear / 1000, 1)}
            <span style={{ fontSize: '16px', fontWeight: 'normal' }}>kg</span>
          </div>
          <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '16px' }}>
            {labels.yieldYear}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.plantsYear}</span>
              <span>{formatNumber(result.sequential.plantsPerYear)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.cycleLength}</span>
              <span>{result.sequential.cycleWeeks} {labels.weeks}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.cyclesYear}</span>
              <span>{formatNumber(result.sequential.cyclesPerYear)}</span>
            </div>
          </div>
        </div>

        {/* Perpetual */}
        <div
          style={{
            padding: '16px',
            border: `1px solid ${STAGE_COLORS.vegetative}`,
            backgroundColor: 'rgba(81, 133, 59, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: STAGE_COLORS.vegetative,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}
          >
            {labels.perpetual}
          </div>

          {/* Big number - yield */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: STAGE_COLORS.vegetative,
              lineHeight: 1,
            }}
          >
            {formatNumber(result.perpetual.yieldPerYear / 1000, 1)}
            <span style={{ fontSize: '16px', fontWeight: 'normal' }}>kg</span>
          </div>
          <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '16px' }}>
            {labels.yieldYear}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.plantsYear}</span>
              <span>{formatNumber(result.perpetual.plantsPerYear)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.harvestEvery}</span>
              <span>{formatNumber(result.perpetual.harvestEveryWeeks)} {labels.weeks}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.textMuted }}>{labels.vegNeeded}</span>
              <span>{result.perpetual.vegSlotsNeeded}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advantage banner */}
      <div
        style={{
          padding: '12px 16px',
          marginBottom: '24px',
          backgroundColor: result.yieldAdvantage > 0
            ? 'rgba(81, 133, 59, 0.2)'
            : 'rgba(241, 93, 67, 0.2)',
          border: `1px solid ${result.yieldAdvantage > 0 ? STAGE_COLORS.vegetative : COLORS.orange}`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: result.yieldAdvantage > 0 ? STAGE_COLORS.vegetative : COLORS.orange,
          }}
        >
          {result.yieldAdvantage > 0 ? '+' : ''}{formatNumber(result.yieldAdvantage)}%
        </span>{' '}
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
          {result.yieldAdvantage > 0 ? labels.moreYield : labels.lessYield} with perpetual
        </span>
      </div>

      {/* Note about separate veg zone */}
      <div
        style={{
          fontSize: '12px',
          color: COLORS.textMuted,
          marginBottom: '24px',
          padding: '8px 12px',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderLeft: `2px solid ${COLORS.orange}`,
        }}
      >
        ⚠ {labels.requiresNote} ({result.perpetual.vegSlotsNeeded} slots)
        <br />
        <span style={{ opacity: 0.7 }}>{labels.sameFlowerNote}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gap: '20px' }}>
        <TickSlider
          label={labels.flowerSlots}
          value={flowerSlots}
          onChange={setFlowerSlots}
          min={2}
          max={12}
          tickInterval={2}
        />

        <TickSlider
          label={`${labels.floweringWeeks} (${labels.weeks})`}
          value={floweringWeeks}
          onChange={setFloweringWeeks}
          min={6}
          max={12}
          tickInterval={2}
        />

        <TickSlider
          label={`${labels.vegWeeks} (${labels.weeks})`}
          value={vegWeeks}
          onChange={setVegWeeks}
          min={2}
          max={8}
          tickInterval={2}
        />

        <TickSlider
          label={`${labels.cleanupWeeks} (${labels.weeks})`}
          value={cleanupWeeks}
          onChange={setCleanupWeeks}
          min={1}
          max={4}
          tickInterval={1}
        />

        <TickSlider
          label={`${labels.yieldPerPlant} (${labels.grams})`}
          value={yieldPerPlant}
          onChange={setYieldPerPlant}
          min={20}
          max={150}
          step={10}
          tickInterval={3}
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
            href="/p/"
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
