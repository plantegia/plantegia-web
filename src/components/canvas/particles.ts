import type { Space, Plant, Stage, Strain } from '../../types';
import { CELL_SIZE, COLORS, STAGE_COLORS, SPACE_COLORS, STAGE_DAYS } from '../../constants';
import { getCurrentSegment } from '../../utils/migration';

// =============================================================================
// PARTICLE CONFIGURATION - Tweak these values to experiment
// =============================================================================

// --- Particle counts by cell type ---
const PARTICLES_PLANT_CELL = 2;   // cells with plants
const PARTICLES_SPACE_CELL = 1;   // empty cells inside spaces
const PARTICLES_NEAR_SPACE = 1;   // cells within PROXIMITY_RADIUS of a space
const PARTICLES_FAR_EMPTY = 1;    // cells far from any space

// --- Distance falloff ---
const PROXIMITY_RADIUS = 10;       // Manhattan distance (cells) to still count as "near"

// --- Particle size ---
const PARTICLE_SIZE_SMALL = 5;  // px - 70% of particles
const PARTICLE_SIZE_MEDIUM = 10;   // px - 30% of particles

// --- Particle lifetime & movement ---
const PARTICLE_LIFETIME_MIN = 2000;  // ms - minimum time particle lives
const PARTICLE_LIFETIME_MAX = 3000;  // ms - maximum time particle lives
const PARTICLE_RISE_DISTANCE = 5;   // px - total distance particle rises during lifetime
const PARTICLE_ALPHA_MAX = 1;      // max opacity (0-1)

// --- Respawn delays (ms) - time between death and respawn ---
const RESPAWN_DELAY_MIN = 2000;        // minimum delay for all types
const RESPAWN_DELAY_MAX_PLANT = 60000; // max additional delay for plant cells
const RESPAWN_DELAY_MAX_SPACE = 80000; // max additional delay for space cells
const RESPAWN_DELAY_MAX_NEAR = 80000;  // max additional delay for near cells
const RESPAWN_DELAY_MAX_FAR = 40000;    // max additional delay for far cells

// --- Fade timing (as fraction of lifetime 0-1) ---
const FADE_IN_END = 0.2;    // fully visible after this point
const FADE_OUT_START = 0.7; // start fading after this point

// =============================================================================

interface Particle {
  x: number; // position within cell (0-1)
  y: number; // position within cell (0-1)
  size: number;
  birthTime: number;
  lifetime: number;
  respawnDelay: number; // delay before this particle respawns
  deathTime: number; // when particle died (for respawn delay)
  isWaiting: boolean; // waiting to respawn
}

interface CellInfo {
  type: 'plant' | 'space' | 'near' | 'far';
  color: string;
  particleCount: number;
  maxRespawnDelay: number;
  riseDistance: number;  // dynamic based on flowering progress
}

// Cache for cell particles
const cellParticlesCache = new Map<string, Particle[]>();

// Track visible cells for cleanup
let visibleCellKeys = new Set<string>();
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 5000; // Clean up every 5 seconds

// Track if initial mount has completed (to suppress spawn effect on page load)
let isMounted = false;
let mountTime = 0;

function getCellKey(cellX: number, cellY: number): string {
  return `${cellX},${cellY}`;
}

function createParticle(now: number, maxRespawnDelay: number): Particle {
  return {
    x: Math.random(),
    y: Math.random(),
    size: Math.random() < 0.7 ? PARTICLE_SIZE_SMALL : PARTICLE_SIZE_MEDIUM,
    birthTime: now,
    lifetime: PARTICLE_LIFETIME_MIN + Math.random() * (PARTICLE_LIFETIME_MAX - PARTICLE_LIFETIME_MIN),
    respawnDelay: RESPAWN_DELAY_MIN + Math.random() * maxRespawnDelay,
    deathTime: 0,
    isWaiting: false,
  };
}

// Lighten a hex color for particles
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 255) + amount);
  const g = Math.min(255, ((num >> 8) & 255) + amount);
  const b = Math.min(255, (num & 255) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// Calculate minimum distance from cell to any space cell
function getDistanceToNearestSpace(
  cellX: number,
  cellY: number,
  spaces: Space[]
): number {
  let minDist = Infinity;

  spaces.forEach(space => {
    const startCellX = Math.floor(space.originX / CELL_SIZE);
    const startCellY = Math.floor(space.originY / CELL_SIZE);
    const endCellX = startCellX + space.gridWidth - 1;
    const endCellY = startCellY + space.gridHeight - 1;

    // Clamp to nearest point on space rectangle
    const nearestX = Math.max(startCellX, Math.min(cellX, endCellX));
    const nearestY = Math.max(startCellY, Math.min(cellY, endCellY));

    const dist = Math.abs(cellX - nearestX) + Math.abs(cellY - nearestY); // Manhattan distance
    minDist = Math.min(minDist, dist);
  });

  return minDist;
}

// Calculate flowering progress (0-1) with exponential curve toward end
function getFloweringProgress(plant: Plant, strain: Strain | undefined): number {
  if (plant.stage !== 'flowering') return 0;

  const stageStart = new Date(plant.stageStartedAt);
  const today = new Date();
  const daysInStage = Math.floor((today.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24));

  // Get flowering duration
  let floweringDays = STAGE_DAYS.flowering;
  if (plant.customStageDays?.flowering !== undefined) {
    floweringDays = plant.customStageDays.flowering;
  } else if (strain?.floweringDays) {
    floweringDays = strain.floweringDays;
  }

  const linearProgress = Math.min(1, Math.max(0, daysInStage / floweringDays));
  // Start with visible effect (0.5 base), accelerate to 1.0 with exponential curve
  // Day 1: ~0.5, Mid-flowering: ~0.7, End: 1.0
  const baseEffect = 0.5;
  const exponentialBoost = linearProgress * linearProgress * (1 - baseEffect);
  return baseEffect + exponentialBoost;
}

// Build maps of cell info
function buildCellInfoMaps(
  spaces: Space[],
  plants: Plant[],
  strains: Strain[]
): {
  plantCells: Map<string, { stage: Stage; floweringProgress: number }>;
  spaceCells: Map<string, { color: string; spaceIndex: number }>;
} {
  const plantCells = new Map<string, { stage: Stage; floweringProgress: number }>();
  const spaceCells = new Map<string, { color: string; spaceIndex: number }>();
  const today = new Date();

  // Map plants first
  plants.forEach(plant => {
    const segment = getCurrentSegment(plant, today);
    if (!segment) return;

    const space = segment.spaceId ? spaces.find(s => s.id === segment.spaceId) : null;
    const strain = plant.strainId ? strains.find(s => s.id === plant.strainId) : undefined;
    const floweringProgress = getFloweringProgress(plant, strain);

    let worldCellX: number, worldCellY: number;
    if (space) {
      worldCellX = Math.floor(space.originX / CELL_SIZE) + segment.gridX;
      worldCellY = Math.floor(space.originY / CELL_SIZE) + segment.gridY;
    } else {
      worldCellX = segment.gridX;
      worldCellY = segment.gridY;
    }

    const cellsWide = plant.size === 4 ? 2 : 1;
    const cellsHigh = plant.size >= 2 ? 2 : 1;

    for (let dx = 0; dx < cellsWide; dx++) {
      for (let dy = 0; dy < cellsHigh; dy++) {
        const key = getCellKey(worldCellX + dx, worldCellY + dy);
        plantCells.set(key, { stage: plant.stage, floweringProgress });
      }
    }
  });

  // Map spaces
  spaces.forEach((space, spaceIndex) => {
    const startCellX = Math.floor(space.originX / CELL_SIZE);
    const startCellY = Math.floor(space.originY / CELL_SIZE);
    const color = space.color || SPACE_COLORS[spaceIndex % SPACE_COLORS.length];

    for (let dx = 0; dx < space.gridWidth; dx++) {
      for (let dy = 0; dy < space.gridHeight; dy++) {
        const key = getCellKey(startCellX + dx, startCellY + dy);
        if (!plantCells.has(key)) {
          spaceCells.set(key, { color, spaceIndex });
        }
      }
    }
  });

  return { plantCells, spaceCells };
}

function getCellInfo(
  cellX: number,
  cellY: number,
  key: string,
  plantCells: Map<string, { stage: Stage; floweringProgress: number }>,
  spaceCells: Map<string, { color: string; spaceIndex: number }>,
  spaces: Space[]
): CellInfo {
  // Plant cell - dynamic based on stage and flowering progress
  const plantInfo = plantCells.get(key);
  if (plantInfo) {
    // Harvested plants: no particles (life cycle complete)
    if (plantInfo.stage === 'harvested') {
      return {
        type: 'plant',
        color: lightenColor(STAGE_COLORS[plantInfo.stage], 60),
        particleCount: 0,
        maxRespawnDelay: RESPAWN_DELAY_MAX_PLANT,
        riseDistance: PARTICLE_RISE_DISTANCE,
      };
    }

    // Flowering plants: particles intensify with exponential progress
    if (plantInfo.stage === 'flowering') {
      const progress = plantInfo.floweringProgress;
      // Respawn delay decreases from 60s to 5s as flowering progresses
      const dynamicRespawnDelay = RESPAWN_DELAY_MAX_PLANT * (1 - progress * 0.9);
      // Rise distance increases from 5px to 10px
      const dynamicRiseDistance = PARTICLE_RISE_DISTANCE * (1 + progress);

      return {
        type: 'plant',
        color: lightenColor(STAGE_COLORS[plantInfo.stage], 60),
        particleCount: PARTICLES_PLANT_CELL,
        maxRespawnDelay: dynamicRespawnDelay,
        riseDistance: dynamicRiseDistance,
      };
    }

    // Other stages: normal behavior
    return {
      type: 'plant',
      color: lightenColor(STAGE_COLORS[plantInfo.stage], 60),
      particleCount: PARTICLES_PLANT_CELL,
      maxRespawnDelay: RESPAWN_DELAY_MAX_PLANT,
      riseDistance: PARTICLE_RISE_DISTANCE,
    };
  }

  // Space cell - medium particles
  const spaceInfo = spaceCells.get(key);
  if (spaceInfo) {
    return {
      type: 'space',
      color: lightenColor(spaceInfo.color, 10),
      particleCount: PARTICLES_SPACE_CELL,
      maxRespawnDelay: RESPAWN_DELAY_MAX_SPACE,
      riseDistance: PARTICLE_RISE_DISTANCE,
    };
  }

  // Empty cell - check distance to nearest space
  const distance = getDistanceToNearestSpace(cellX, cellY, spaces);

  if (distance <= PROXIMITY_RADIUS) {
    return {
      type: 'near',
      color: COLORS.backgroundLight,
      particleCount: PARTICLES_NEAR_SPACE,
      maxRespawnDelay: RESPAWN_DELAY_MAX_NEAR,
      riseDistance: PARTICLE_RISE_DISTANCE,
    };
  }

  return {
    type: 'far',
    color: COLORS.backgroundLight,
    particleCount: PARTICLES_FAR_EMPTY,
    maxRespawnDelay: RESPAWN_DELAY_MAX_FAR,
    riseDistance: PARTICLE_RISE_DISTANCE,
  };
}

// Render particles for visible cells (called inside world transform)
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  strains: Strain[],
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): void {
  const now = performance.now();

  // Initialize mount time on first render
  if (mountTime === 0) {
    mountTime = now;
  }

  // Calculate visible cell range
  const startCellX = Math.floor(-pan.x / zoom / CELL_SIZE) - 1;
  const startCellY = Math.floor(-pan.y / zoom / CELL_SIZE) - 1;
  const endCellX = Math.ceil((viewportWidth - pan.x) / zoom / CELL_SIZE) + 1;
  const endCellY = Math.ceil((viewportHeight - pan.y) / zoom / CELL_SIZE) + 1;

  // Build lookup maps
  const { plantCells, spaceCells } = buildCellInfoMaps(spaces, plants, strains);

  ctx.save();

  // Iterate over visible cells
  for (let cellX = startCellX; cellX <= endCellX; cellX++) {
    for (let cellY = startCellY; cellY <= endCellY; cellY++) {
      const key = getCellKey(cellX, cellY);
      const cellInfo = getCellInfo(cellX, cellY, key, plantCells, spaceCells, spaces);

      // Get or create particles for this cell
      let particles = cellParticlesCache.get(key);
      if (!particles || particles.length !== cellInfo.particleCount) {
        particles = [];
        for (let i = 0; i < cellInfo.particleCount; i++) {
          const p = createParticle(now, cellInfo.maxRespawnDelay);
          if (!isMounted) {
            // On initial page load: start particles in waiting state
            // They will spawn gradually with random delays
            p.isWaiting = true;
            p.deathTime = mountTime;
            p.respawnDelay = RESPAWN_DELAY_MIN + Math.random() * cellInfo.maxRespawnDelay;
          } else {
            // After mount (scroll, new cells): show particles immediately with staggered lifetimes
            // This creates the nice "burst" effect when new cells appear
            p.birthTime = now - Math.random() * p.lifetime;
          }
          particles.push(p);
        }
        cellParticlesCache.set(key, particles);
      }

      const cellWorldX = cellX * CELL_SIZE;
      const cellWorldY = cellY * CELL_SIZE;

      // Update and render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Handle respawn delay
        if (p.isWaiting) {
          if (now - p.deathTime >= p.respawnDelay) {
            // Respawn with new properties
            const newP = createParticle(now, cellInfo.maxRespawnDelay);
            particles[i] = newP;
            continue;
          }
          // Still waiting, skip rendering
          continue;
        }

        const age = now - p.birthTime;
        const progress = age / p.lifetime;

        // Mark as waiting to respawn if dead
        if (progress >= 1) {
          p.isWaiting = true;
          p.deathTime = now;
          p.respawnDelay = RESPAWN_DELAY_MIN + Math.random() * cellInfo.maxRespawnDelay;
          continue;
        }

        // Calculate alpha (fade in/out)
        let alpha: number;
        if (progress < FADE_IN_END) {
          alpha = (progress / FADE_IN_END) * PARTICLE_ALPHA_MAX;
        } else if (progress > FADE_OUT_START) {
          alpha = ((1 - progress) / (1 - FADE_OUT_START)) * PARTICLE_ALPHA_MAX;
        } else {
          alpha = PARTICLE_ALPHA_MAX;
        }

        // Calculate position (rise upward based on progress, not time)
        const riseAmount = progress * cellInfo.riseDistance;
        const x = cellWorldX + p.x * CELL_SIZE;
        const y = cellWorldY + p.y * CELL_SIZE - riseAmount;

        // Draw square particle
        ctx.globalAlpha = alpha;
        ctx.fillStyle = cellInfo.color;
        const halfSize = p.size / 2;
        ctx.fillRect(x - halfSize, y - halfSize, p.size, p.size);
      }
    }
  }

  // Mark as mounted after first render pass
  // Future cell creations will get the "burst" effect
  if (!isMounted) {
    isMounted = true;
  }

  // Periodic cleanup of cells no longer visible (prevents memory leak)
  if (now - lastCleanupTime > CLEANUP_INTERVAL) {
    const newVisibleKeys = new Set<string>();
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        newVisibleKeys.add(getCellKey(cellX, cellY));
      }
    }

    // Remove cached particles for cells that are no longer visible
    for (const key of cellParticlesCache.keys()) {
      if (!newVisibleKeys.has(key)) {
        cellParticlesCache.delete(key);
      }
    }

    visibleCellKeys = newVisibleKeys;
    lastCleanupTime = now;
  }

  ctx.restore();
}

// Clear cache
export function resetParticles(): void {
  cellParticlesCache.clear();
  isMounted = false;
  mountTime = 0;
}
