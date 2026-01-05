import type { Space, Plant } from '../../types';
import { CELL_SIZE, COLORS } from '../../constants';
import { getCurrentSegment } from '../../utils/migration';

// =============================================================================
// SLEEP ANIMATION CONFIGURATION
// =============================================================================

const ZZZ_LIFETIME = 2500;           // ms - how long each Zzz sequence takes
const ZZZ_RISE_DISTANCE = 30;        // px - how high Zzz floats
const ZZZ_SPAWN_INTERVAL = 3000;     // ms - time between new Zzz spawns per plant
const ZZZ_FONT_SIZES = [10, 12, 14]; // px - sizes for z, Z, Z (increasing)
const ZZZ_STAGGER_DELAY = 200;       // ms - delay between each Z appearing

// Fade timing (as fraction of lifetime 0-1)
const FADE_IN_END = 0.2;
const FADE_OUT_START = 0.7;

// =============================================================================
// TYPES
// =============================================================================

interface ZzzParticle {
  plantId: string;
  offsetX: number;      // Position relative to plant center (0-1 offset)
  offsetY: number;
  birthTime: number;    // performance.now() timestamp
  zIndex: number;       // 0, 1, or 2 for the three Z's
}

// =============================================================================
// STATE
// =============================================================================

// Cache for Zzz particles per plant
const zzzParticles = new Map<string, ZzzParticle[]>();
const lastSpawnTime = new Map<string, number>();

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Spawn new Zzz particles for a plant if needed
 */
function spawnZzzIfNeeded(plantId: string, now: number): void {
  const lastSpawn = lastSpawnTime.get(plantId) || 0;

  if (now - lastSpawn < ZZZ_SPAWN_INTERVAL) return;

  // Create new Zzz sequence (3 Z's with staggered start)
  const newParticles: ZzzParticle[] = [];
  for (let i = 0; i < 3; i++) {
    newParticles.push({
      plantId,
      offsetX: 0.3 + Math.random() * 0.4,  // Centered with some variance
      offsetY: -0.1 + Math.random() * 0.2, // Slightly above plant
      birthTime: now + i * ZZZ_STAGGER_DELAY,
      zIndex: i,
    });
  }

  // Append to existing particles
  const existing = zzzParticles.get(plantId) || [];
  zzzParticles.set(plantId, [...existing, ...newParticles]);
  lastSpawnTime.set(plantId, now);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Render Zzz animation for sleeping plants
 * Call this in Space View after renderParticles
 * @param darkSpaces - Pre-computed map of spaceId -> isDark from buildDarkSpaceMap()
 */
export function renderSleepAnimation(
  ctx: CanvasRenderingContext2D,
  spaces: Space[],
  plants: Plant[],
  darkSpaces: Map<string, boolean>
): void {
  const now = performance.now();
  const today = new Date();

  // Check if any space is dark - if not, skip entirely
  let anyDark = false;
  for (const isDark of darkSpaces.values()) {
    if (isDark) {
      anyDark = true;
      break;
    }
  }
  if (!anyDark) {
    // Clear all particles if no spaces are dark
    zzzParticles.clear();
    lastSpawnTime.clear();
    return;
  }

  ctx.save();

  // Process each plant
  plants.forEach(plant => {
    const segment = getCurrentSegment(plant, today);
    if (!segment || !segment.spaceId) return;

    // Check if plant's space is dark
    const isDark = darkSpaces.get(segment.spaceId);
    if (!isDark) {
      // Not dark, clear any existing particles for this plant
      zzzParticles.delete(plant.id);
      lastSpawnTime.delete(plant.id);
      return;
    }

    // Spawn new Zzz if needed
    spawnZzzIfNeeded(plant.id, now);

    // Get plant world position
    const space = spaces.find(s => s.id === segment.spaceId);
    if (!space) return;

    // Calculate plant center position in world coordinates
    const plantWorldX = space.originX + segment.gridX * CELL_SIZE + CELL_SIZE / 2;
    const plantWorldY = space.originY + segment.gridY * CELL_SIZE;

    // Render particles
    const particles = zzzParticles.get(plant.id) || [];
    const activeParticles: ZzzParticle[] = [];

    particles.forEach(p => {
      const age = now - p.birthTime;

      // Skip if not born yet (staggered spawn)
      if (age < 0) {
        activeParticles.push(p);
        return;
      }

      // Remove if too old
      if (age > ZZZ_LIFETIME) return;

      const progress = age / ZZZ_LIFETIME;

      // Calculate alpha (fade in then fade out)
      let alpha: number;
      if (progress < FADE_IN_END) {
        alpha = progress / FADE_IN_END;
      } else if (progress > FADE_OUT_START) {
        alpha = (1 - progress) / (1 - FADE_OUT_START);
      } else {
        alpha = 1;
      }

      // Calculate position with rise and drift
      const riseAmount = progress * ZZZ_RISE_DISTANCE;
      const driftX = Math.sin(progress * Math.PI * 2) * 5;  // Gentle horizontal drift

      const x = plantWorldX + (p.offsetX - 0.5) * CELL_SIZE + driftX;
      const y = plantWorldY - riseAmount + p.offsetY * CELL_SIZE;

      // Draw Z character
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = `bold ${ZZZ_FONT_SIZES[p.zIndex]}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Z', x, y);

      activeParticles.push(p);
    });

    // Update cache with active particles only
    if (activeParticles.length > 0) {
      zzzParticles.set(plant.id, activeParticles);
    } else {
      zzzParticles.delete(plant.id);
    }
  });

  ctx.restore();
}

/**
 * Reset animation state (call when switching views or on unmount)
 */
export function resetSleepAnimation(): void {
  zzzParticles.clear();
  lastSpawnTime.clear();
}
