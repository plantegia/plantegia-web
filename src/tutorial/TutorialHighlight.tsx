import { useEffect, useState } from 'react';
import { COLORS, Z_INDEX } from '../constants';
import './TutorialHighlight.css';

interface TutorialHighlightProps {
  selector: string;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Check if element is visible (not covered by another element)
function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const topElement = document.elementFromPoint(centerX, centerY);
  return topElement !== null && (element === topElement || element.contains(topElement));
}

export function TutorialHighlight({ selector }: TutorialHighlightProps) {
  const [rect, setRect] = useState<ElementRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(selector);
      if (element && isElementVisible(element)) {
        const domRect = element.getBoundingClientRect();
        setRect({
          top: domRect.top,
          left: domRect.left,
          width: domRect.width,
          height: domRect.height,
        });
      } else {
        setRect(null);
      }
    };

    // Initial update
    updateRect();

    // Update on scroll/resize
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    // Observe DOM changes (element might appear later)
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true });

    // Poll for position changes (for animated elements)
    const interval = setInterval(updateRect, 100);

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [selector]);

  if (!rect) return null;

  const padding = 4;

  return (
    <div
      className="tutorial-highlight"
      style={{
        position: 'fixed',
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        border: `2px solid ${COLORS.danger}`,
        borderRadius: 0,
        pointerEvents: 'none',
        zIndex: Z_INDEX.TUTORIAL_HIGHLIGHT,
        boxSizing: 'border-box',
      }}
      aria-hidden="true"
    />
  );
}
