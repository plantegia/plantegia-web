import { COLORS } from '../../constants';

// =============================================================================
// BIRD EASTER EGG - A bird flying across the plantation (top-down view)
// =============================================================================

// =============================================================================
// CONFIGURATION - Tweak these values to adjust bird behavior
// =============================================================================

export const BIRD_CONFIG = {
  // --- Spawn timing ---
  spawnDelayMin: 10000,       // ms - minimum delay before bird spawns (10 sec)
  spawnDelayMax: 50000,       // ms - maximum delay before bird spawns (50 sec)

  // --- Leaderboard activation ---
  leaderboardThreshold: 20000, // ms - time bird must stay in viewport to show leaderboard (20 sec)

  // --- Death conditions ---
  offscreenDeathDelay: 5000,  // ms - time bird can be off-screen before dying (5 sec)

  // --- Size ---
  bodyLength: 24,             // px - body length
  wingSpan: 40,               // px - full wing span when extended

  // --- Movement ---
  speedX: 15,                 // px per second - horizontal movement
  speedY: 4,                  // px per second - base vertical movement (diagonal)
  waveAmplitude: 30,          // px - sine wave amplitude for natural flight
  waveFrequency: 0.3,         // oscillations per second

  // --- Wing animation ---
  flapSpeed: 4,               // flaps per second
  wingMinAngle: 0.3,          // radians - wings at minimum extension
  wingMaxAngle: 0.8,          // radians - wings at maximum extension

  // --- Shadow ---
  shadowOffsetX: 8,           // px - shadow offset (parallax effect)
  shadowOffsetY: 12,
  shadowAlpha: 0.2,

  // --- Parallax ---
  parallaxFactor: 0.15,       // bird moves 15% slower than canvas when panning

  // --- Visibility margin ---
  visibilityMargin: 100,      // px - margin around viewport for visibility check

  // --- Colors ---
  bodyColor: COLORS.textMuted,
  shadowColor: '#000000',
};

// =============================================================================

export interface BirdState {
  // World position (in canvas world coordinates)
  worldX: number;
  worldY: number;

  // Starting position for distance calculation
  startWorldX: number;
  startWorldY: number;

  // Animation time
  startTime: number;

  // Visibility tracking
  isVisible: boolean;
  lastVisibleTime: number;
  lastOffscreenTime: number | null;

  // Leaderboard state
  leaderboardActive: boolean;
  visibleDuration: number;      // total time bird has been visible
  distanceTraveled: number;

  // Lifecycle
  isAlive: boolean;
  scheduledSpawnTime: number | null;
}

// Session-scoped bird state (resets on page reload)
let birdState: BirdState | null = null;
let spawnScheduled = false;

// Schedule bird spawn with random delay
export function scheduleBirdSpawn(): void {
  if (spawnScheduled || birdState?.isAlive) return;

  const delay = BIRD_CONFIG.spawnDelayMin +
    Math.random() * (BIRD_CONFIG.spawnDelayMax - BIRD_CONFIG.spawnDelayMin);

  spawnScheduled = true;

  // Store scheduled time for reference
  if (!birdState) {
    birdState = {
      worldX: 0,
      worldY: 0,
      startWorldX: 0,
      startWorldY: 0,
      startTime: 0,
      isVisible: false,
      lastVisibleTime: 0,
      lastOffscreenTime: null,
      leaderboardActive: false,
      visibleDuration: 0,
      distanceTraveled: 0,
      isAlive: false,
      scheduledSpawnTime: performance.now() + delay,
    };
  } else {
    birdState.scheduledSpawnTime = performance.now() + delay;
  }
}

// Check if it's time to spawn and do it
export function checkAndSpawnBird(
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): void {
  if (!birdState?.scheduledSpawnTime) return;
  if (birdState.isAlive) return;

  const now = performance.now();
  if (now >= birdState.scheduledSpawnTime) {
    doSpawnBird(viewportWidth, viewportHeight, pan, zoom);
  }
}

// Actually spawn the bird
function doSpawnBird(
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): void {
  const now = performance.now();

  // Calculate world position from screen coordinates
  // Start from left side, slightly above visible area
  const screenX = -100; // Start off-screen left
  const screenY = viewportHeight * 0.3; // Upper third

  // Convert to world coordinates
  const worldX = (screenX - pan.x) / zoom;
  const worldY = (screenY - pan.y) / zoom;

  birdState = {
    worldX,
    worldY,
    startWorldX: worldX,
    startWorldY: worldY,
    startTime: now,
    isVisible: false,
    lastVisibleTime: now,
    lastOffscreenTime: null,
    leaderboardActive: false,
    visibleDuration: 0,
    distanceTraveled: 0,
    isAlive: true,
    scheduledSpawnTime: null,
  };

  spawnScheduled = false;
}

// Kill the bird
function killBird(): void {
  if (birdState) {
    birdState.isAlive = false;
    birdState.scheduledSpawnTime = null;
  }
  spawnScheduled = false;
}

// Update bird position based on elapsed time
export function updateBird(deltaMs: number): void {
  if (!birdState || !birdState.isAlive) return;

  const deltaSeconds = deltaMs / 1000;

  // Move diagonally with sine wave for natural movement
  birdState.worldX += BIRD_CONFIG.speedX * deltaSeconds;
  birdState.worldY += BIRD_CONFIG.speedY * deltaSeconds;

  // Calculate distance traveled
  const dx = birdState.worldX - birdState.startWorldX;
  const dy = birdState.worldY - birdState.startWorldY;
  birdState.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
}

// Check if bird is in viewport and update tracking state
export function updateBirdTracking(
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): void {
  if (!birdState || !birdState.isAlive) return;

  const now = performance.now();
  const elapsed = now - birdState.startTime;
  const elapsedSeconds = elapsed / 1000;

  // Calculate screen position with parallax
  const waveOffset = Math.sin(elapsedSeconds * BIRD_CONFIG.waveFrequency * Math.PI * 2) * BIRD_CONFIG.waveAmplitude;
  const effectiveWorldY = birdState.worldY + waveOffset;

  // Apply parallax - bird moves slower relative to canvas pan
  const parallaxPan = {
    x: pan.x * (1 - BIRD_CONFIG.parallaxFactor),
    y: pan.y * (1 - BIRD_CONFIG.parallaxFactor),
  };

  const screenX = birdState.worldX * zoom + parallaxPan.x;
  const screenY = effectiveWorldY * zoom + parallaxPan.y;

  // Check if bird is visible
  const margin = BIRD_CONFIG.visibilityMargin;
  const isVisible = screenX > -margin && screenX < viewportWidth + margin &&
                    screenY > -margin && screenY < viewportHeight + margin;

  const wasVisible = birdState.isVisible;
  birdState.isVisible = isVisible;

  if (isVisible) {
    // Bird is on screen
    birdState.lastOffscreenTime = null;

    if (!wasVisible) {
      // Just became visible
      birdState.lastVisibleTime = now;
    } else {
      // Still visible - accumulate visible time
      birdState.visibleDuration += now - birdState.lastVisibleTime;
      birdState.lastVisibleTime = now;
    }

    // Check if leaderboard should activate
    if (!birdState.leaderboardActive && birdState.visibleDuration >= BIRD_CONFIG.leaderboardThreshold) {
      birdState.leaderboardActive = true;
    }
  } else {
    // Bird is off screen
    if (wasVisible) {
      // Just went off screen
      birdState.lastOffscreenTime = now;
    } else if (birdState.lastOffscreenTime !== null) {
      // Check if off-screen too long - kill bird
      const offscreenDuration = now - birdState.lastOffscreenTime;
      if (offscreenDuration >= BIRD_CONFIG.offscreenDeathDelay) {
        killBird();
      }
    }
  }
}

// Get current bird screen position for UI overlay
export function getBirdScreenPosition(
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): { x: number; y: number; visible: boolean } | null {
  if (!birdState || !birdState.isAlive) return null;

  const elapsed = performance.now() - birdState.startTime;
  const elapsedSeconds = elapsed / 1000;

  const waveOffset = Math.sin(elapsedSeconds * BIRD_CONFIG.waveFrequency * Math.PI * 2) * BIRD_CONFIG.waveAmplitude;
  const effectiveWorldY = birdState.worldY + waveOffset;

  // Apply parallax
  const parallaxPan = {
    x: pan.x * (1 - BIRD_CONFIG.parallaxFactor),
    y: pan.y * (1 - BIRD_CONFIG.parallaxFactor),
  };

  const screenX = birdState.worldX * zoom + parallaxPan.x;
  const screenY = effectiveWorldY * zoom + parallaxPan.y;

  const margin = BIRD_CONFIG.visibilityMargin;
  const visible = screenX > -margin && screenX < viewportWidth + margin &&
                  screenY > -margin && screenY < viewportHeight + margin;

  return { x: screenX, y: screenY, visible };
}

// Get bird state for UI
export function getBirdUIState(): {
  leaderboardActive: boolean;
  distance: number;
  isVisible: boolean;
  isAlive: boolean;
} | null {
  if (!birdState) return null;

  return {
    leaderboardActive: birdState.leaderboardActive,
    distance: Math.round(birdState.distanceTraveled),
    isVisible: birdState.isVisible,
    isAlive: birdState.isAlive,
  };
}

// Draw bird silhouette (top-down view)
function drawBirdShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingAngle: number,
  color: string,
  alpha: number = 1
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.translate(x, y);

  // Bird is flying to the right, so rotate slightly
  ctx.rotate(Math.PI / 12); // ~15 degrees

  // Body (elongated ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_CONFIG.bodyLength / 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (small circle at front)
  ctx.beginPath();
  ctx.ellipse(BIRD_CONFIG.bodyLength / 2 - 2, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail (triangle at back)
  ctx.beginPath();
  ctx.moveTo(-BIRD_CONFIG.bodyLength / 2, 0);
  ctx.lineTo(-BIRD_CONFIG.bodyLength / 2 - 8, -4);
  ctx.lineTo(-BIRD_CONFIG.bodyLength / 2 - 8, 4);
  ctx.closePath();
  ctx.fill();

  // Wings (animated)
  const wingLength = BIRD_CONFIG.wingSpan / 2;
  const wingWidth = 8;

  // Left wing
  ctx.save();
  ctx.rotate(-wingAngle);
  ctx.beginPath();
  ctx.ellipse(0, -wingLength / 2, wingWidth, wingLength / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.rotate(wingAngle);
  ctx.beginPath();
  ctx.ellipse(0, wingLength / 2, wingWidth, wingLength / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// Render bird on canvas (called within world transform)
export function renderBird(
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
  pan: { x: number; y: number },
  zoom: number
): void {
  if (!birdState || !birdState.isAlive) return;

  const now = performance.now();
  const elapsed = now - birdState.startTime;
  const elapsedSeconds = elapsed / 1000;

  // Calculate wave offset for natural flight
  const waveOffset = Math.sin(elapsedSeconds * BIRD_CONFIG.waveFrequency * Math.PI * 2) * BIRD_CONFIG.waveAmplitude;

  // Calculate wing angle (oscillating)
  const flapPhase = (elapsedSeconds * BIRD_CONFIG.flapSpeed * Math.PI * 2) % (Math.PI * 2);
  const wingAngle = BIRD_CONFIG.wingMinAngle +
    (Math.sin(flapPhase) * 0.5 + 0.5) * (BIRD_CONFIG.wingMaxAngle - BIRD_CONFIG.wingMinAngle);

  // Calculate screen position with parallax
  const parallaxPan = {
    x: pan.x * (1 - BIRD_CONFIG.parallaxFactor),
    y: pan.y * (1 - BIRD_CONFIG.parallaxFactor),
  };

  const screenX = birdState.worldX * zoom + parallaxPan.x;
  const screenY = (birdState.worldY + waveOffset) * zoom + parallaxPan.y;

  // Check if visible
  const margin = BIRD_CONFIG.visibilityMargin;
  if (screenX < -margin || screenX > viewportWidth + margin ||
      screenY < -margin || screenY > viewportHeight + margin) {
    return;
  }

  ctx.save();
  // Reset transform to screen coordinates
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Scale for high DPI
  const dpr = window.devicePixelRatio || 1;
  ctx.scale(dpr, dpr);

  // Draw shadow first
  drawBirdShape(
    ctx,
    screenX + BIRD_CONFIG.shadowOffsetX,
    screenY + BIRD_CONFIG.shadowOffsetY,
    wingAngle,
    BIRD_CONFIG.shadowColor,
    BIRD_CONFIG.shadowAlpha
  );

  // Draw bird
  drawBirdShape(
    ctx,
    screenX,
    screenY,
    wingAngle,
    BIRD_CONFIG.bodyColor
  );

  ctx.restore();
}

// Reset bird state (for testing)
export function resetBird(): void {
  birdState = null;
  spawnScheduled = false;
}

// Get raw bird state for leaderboard submission
export function getBirdState(): BirdState | null {
  return birdState;
}

// Check if bird is alive
export function isBirdAlive(): boolean {
  return birdState?.isAlive ?? false;
}
