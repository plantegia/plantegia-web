import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useKeyboardShortcuts(enabled: boolean = true) {
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const activeTool = useAppStore((s) => s.activeTool);
  const selectedSeedId = useAppStore((s) => s.selectedSeedId);
  const selectSeed = useAppStore((s) => s.selectSeed);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Escape: Reset to cursor tool
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedSeedId) {
          selectSeed(null);
        }
        if (activeTool && activeTool !== 'cursor') {
          setActiveTool('cursor');
        }
        return;
      }

      // Undo: Ctrl+Z (Windows) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y (Windows) or Cmd+Shift+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, undo, redo, setActiveTool, activeTool, selectedSeedId, selectSeed]);
}
