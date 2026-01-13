import { COLORS, STAGE_COLORS, SPACE_COLORS } from '../../styles/tokens';

interface Plant {
  id: string;
  code: string;
  stage: 'germinating' | 'seedling' | 'vegetative' | 'flowering' | 'harvested';
  gridX: number;
  gridY: number;
  size: 1 | 2 | 4;
}

interface Space {
  id: string;
  name: string;
  gridWidth: number;
  gridHeight: number;
  plants: Plant[];
  colorIndex?: number;
}

interface Props {
  spaces: Space[];
  cellSize?: number;
  highlightedPlant?: string;
}

const STAGE_ABBREV: Record<string, string> = {
  germinating: 'GRM',
  seedling: 'SDL',
  vegetative: 'VEG',
  flowering: 'FLW',
  harvested: 'HRV',
};

export default function SpaceViewDemo({ spaces, cellSize = 40, highlightedPlant }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
      {spaces.map((space, spaceIndex) => {
        const spaceColor = SPACE_COLORS[space.colorIndex ?? spaceIndex % SPACE_COLORS.length];
        const width = space.gridWidth * cellSize;
        const height = space.gridHeight * cellSize;

        return (
          <div key={space.id} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '12px',
                color: spaceColor,
                marginBottom: '4px',
                fontFamily: '"Space Mono", monospace',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {space.name}
            </div>
            <div
              style={{
                position: 'relative',
                width,
                height,
                border: `2px solid ${spaceColor}`,
                borderRadius: '4px',
                backgroundColor: COLORS.backgroundDark,
              }}
            >
              {/* Grid lines */}
              {Array.from({ length: space.gridWidth - 1 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  style={{
                    position: 'absolute',
                    left: (i + 1) * cellSize,
                    top: 0,
                    width: '1px',
                    height: '100%',
                    backgroundColor: COLORS.muted,
                    opacity: 0.3,
                  }}
                />
              ))}
              {Array.from({ length: space.gridHeight - 1 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  style={{
                    position: 'absolute',
                    top: (i + 1) * cellSize,
                    left: 0,
                    height: '1px',
                    width: '100%',
                    backgroundColor: COLORS.muted,
                    opacity: 0.3,
                  }}
                />
              ))}

              {/* Plants */}
              {space.plants.map((plant) => {
                const plantWidth = plant.size === 4 ? 2 : 1;
                const plantHeight = plant.size >= 2 ? 2 : 1;
                const isHighlighted = highlightedPlant === plant.id;

                return (
                  <div
                    key={plant.id}
                    style={{
                      position: 'absolute',
                      left: plant.gridX * cellSize + 2,
                      top: plant.gridY * cellSize + 2,
                      width: plantWidth * cellSize - 4,
                      height: plantHeight * cellSize - 4,
                      backgroundColor: STAGE_COLORS[plant.stage],
                      borderRadius: '2px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Space Mono", monospace',
                      fontSize: '10px',
                      color: COLORS.text,
                      border: isHighlighted ? `2px solid ${COLORS.orange}` : 'none',
                      boxShadow: isHighlighted ? `0 0 8px ${COLORS.orange}` : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{plant.code}</span>
                    <span style={{ fontSize: '8px', opacity: 0.8 }}>
                      {STAGE_ABBREV[plant.stage]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
