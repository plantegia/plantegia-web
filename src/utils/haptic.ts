// Haptic feedback utility for mobile devices
// Uses Vibration API (Android) with iOS fallback attempts

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  // Check if Vibration API is available
  if (!navigator.vibrate) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: 50,
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail if vibration not supported
  }
}

// Check if device supports haptic feedback
export function supportsHaptic(): boolean {
  return 'vibrate' in navigator;
}
