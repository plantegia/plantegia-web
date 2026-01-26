import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { COLORS, Z_INDEX } from '../constants';
import type { TutorialStep } from './types';
import './TutorialHighlight.css';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  onSkip: () => void;
}

export function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  onSkip,
}: TutorialOverlayProps) {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  // Handle Escape key to skip tutorial
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  // Streaming text animation (typewriter effect)
  useEffect(() => {
    setDisplayedMessage('');
    setIsStreaming(true);

    let currentIndex = 0;
    const streamingSpeed = 20; // ms per character

    const streamInterval = setInterval(() => {
      if (currentIndex <= step.message.length) {
        setDisplayedMessage(step.message.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, streamingSpeed);

    return () => {
      clearInterval(streamInterval);
    };
  }, [step.message, stepNumber]);

  // Click to skip animation and show full text
  const handleSkipAnimation = () => {
    if (isStreaming) {
      setDisplayedMessage(step.message);
      setIsStreaming(false);
    }
  };

  return (
    <div
      style={styles.container}
      onClick={handleSkipAnimation}
      role="status"
      aria-live="polite"
    >
      <div style={styles.content}>
        <span style={styles.counter}>{stepNumber}/{totalSteps}</span>
        <span style={styles.message}>
          {displayedMessage}
          {isStreaming && <span className="tutorial-cursor" style={styles.cursor}>▋</span>}
        </span>
      </div>
      <button
        className="btn-icon"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        style={styles.closeButton}
        aria-label="Skip tutorial"
      >
        <X size={14} />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 48, // Below header
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: COLORS.backgroundDark,
    borderBottom: `1px solid ${COLORS.border}`,
    fontFamily: 'Space Mono, monospace',
    fontSize: 12,
    color: COLORS.text,
    zIndex: Z_INDEX.TUTORIAL_OVERLAY,
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  counter: {
    color: COLORS.textMuted,
    flexShrink: 0,
  },
  message: {
    color: COLORS.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cursor: {
    color: COLORS.teal,
    marginLeft: 1,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: COLORS.textMuted,
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 8,
    borderRadius: 4,
  },
};
