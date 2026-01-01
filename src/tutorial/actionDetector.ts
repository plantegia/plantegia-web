import { useAppStore } from '../store/useAppStore';

type TrackedActionName =
  | 'createSpace'
  | 'createPlant'
  | 'createStrain'
  | 'addSeed'
  | 'splitSegment'
  | 'moveSegmentToSlot'
  | 'setViewMode';

const TRACKED_ACTIONS: TrackedActionName[] = [
  'createSpace',
  'createPlant',
  'createStrain',
  'addSeed',
  'splitSegment',
  'moveSegmentToSlot',
  'setViewMode',
];

/**
 * Safely wraps store actions to emit events when called.
 *
 * IMPORTANT: This is a temporary patch for tutorial detection only.
 * The wrapper preserves original function behavior and cleans up properly.
 *
 * @param onAction Callback invoked after action executes
 * @returns Cleanup function that must be called to restore originals
 */
type StoreActionFunction = (...args: unknown[]) => unknown;

export function attachActionDetector(
  onAction: (actionName: TrackedActionName) => void
): () => void {
  const store = useAppStore.getState();
  const originalActions = new Map<TrackedActionName, StoreActionFunction>();
  let isActive = true;

  // Wrap each tracked action
  TRACKED_ACTIONS.forEach((actionName) => {
    const original = store[actionName];
    if (typeof original !== 'function') return;

    // Store original reference
    originalActions.set(actionName, original as StoreActionFunction);

    // Create wrapper that preserves original behavior
    const wrapped = (...args: unknown[]) => {
      // Call original with proper context
      const result = (original as StoreActionFunction)(...args);

      // Emit event only if detector is still active
      if (isActive) {
        onAction(actionName);
      }

      return result;
    };

    // Safely update store state
    useAppStore.setState({ [actionName]: wrapped });
  });

  // Return cleanup function
  return () => {
    isActive = false;

    // Restore all original actions
    const restoreState: Record<string, StoreActionFunction> = {};
    originalActions.forEach((original, actionName) => {
      restoreState[actionName] = original;
    });

    useAppStore.setState(restoreState);
    originalActions.clear();
  };
}
