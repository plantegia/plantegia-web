import { COLORS, STAGE_COLORS } from '../../styles/tokens';

interface PlantTimeline {
  id: string;
  code: string;
  stages: {
    stage: 'germinating' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
    startDay: number;
    endDay: number;
  }[];
}

interface Props {
  plants: PlantTimeline[];
  totalDays?: number;
  currentDay?: number;
  dayWidth?: number;
}

const STAGE_ABBREV: Record<string, string> = {
  germinating: 'GRM',
  seedling: 'SDL',
  vegetative: 'VEG',
  flowering: 'FLW',
  harvested: 'HRV',
};

export default function TimelineDemo({
  plants,
  totalDays = 120,
  currentDay,
  dayWidth = 3,
}: Props) {
  const rowHeight = 28;
  const labelWidth = 60;
  const headerHeight = 24;
  const width = labelWidth + totalDays * dayWidth;
  const height = headerHeight + plants.length * rowHeight;

  // Week markers
  const weeks = Math.ceil(totalDays / 7);

  return (
    <div
      style={{
        overflowX: 'auto',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: '8px',
        padding: '8px',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ fontFamily: '"Space Mono", monospace', display: 'block' }}
      >
        {/* Week markers */}
        {Array.from({ length: weeks + 1 }).map((_, i) => {
          const x = labelWidth + i * 7 * dayWidth;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={headerHeight}
                x2={x}
                y2={height}
                stroke={COLORS.muted}
                strokeOpacity={0.3}
                strokeDasharray="2,2"
              />
              {i % 4 === 0 && (
                <text
                  x={x + 2}
                  y={headerHeight - 8}
                  fill={COLORS.textMuted}
                  fontSize="10"
                >
                  W{i}
                </text>
              )}
            </g>
          );
        })}

        {/* Current day line */}
        {currentDay !== undefined && (
          <line
            x1={labelWidth + currentDay * dayWidth}
            y1={0}
            x2={labelWidth + currentDay * dayWidth}
            y2={height}
            stroke={COLORS.orange}
            strokeWidth={2}
          />
        )}

        {/* Plant rows */}
        {plants.map((plant, rowIndex) => {
          const y = headerHeight + rowIndex * rowHeight;

          return (
            <g key={plant.id}>
              {/* Row background */}
              <rect
                x={0}
                y={y}
                width={width}
                height={rowHeight}
                fill={rowIndex % 2 === 0 ? 'transparent' : COLORS.background}
                fillOpacity={0.3}
              />

              {/* Plant code label */}
              <text
                x={4}
                y={y + rowHeight / 2 + 4}
                fill={COLORS.text}
                fontSize="11"
                fontWeight="bold"
              >
                {plant.code}
              </text>

              {/* Stage segments */}
              {plant.stages.map((segment, segIndex) => {
                const segX = labelWidth + segment.startDay * dayWidth;
                const segWidth = (segment.endDay - segment.startDay) * dayWidth;

                return (
                  <g key={segIndex}>
                    <rect
                      x={segX}
                      y={y + 4}
                      width={segWidth}
                      height={rowHeight - 8}
                      fill={STAGE_COLORS[segment.stage]}
                      rx={2}
                    />
                    {segWidth > 30 && (
                      <text
                        x={segX + segWidth / 2}
                        y={y + rowHeight / 2 + 3}
                        fill={COLORS.text}
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {STAGE_ABBREV[segment.stage]}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
