import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { COLORS, Z_INDEX } from '../constants';
import type { TutorialStep } from './types';
import './TutorialHighlight.css';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isCompleted: boolean;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function TutorialOverlay({
  step,
  stepNumber,
  totalSteps,
  canGoBack,
  canGoForward,
  isCompleted,
  onSkip,
  onPrevious,
  onNext,
  onRestart
}: TutorialOverlayProps) {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

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

  // Streaming text animation
  useEffect(() => {
    setDisplayedMessage('');
    setIsStreaming(true);
    setFadeIn(false);

    // Trigger fade-in animation
    const fadeTimer = setTimeout(() => setFadeIn(true), 50);

    let currentIndex = 0;
    const streamingSpeed = 15; // ms per character

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
      clearTimeout(fadeTimer);
    };
  }, [step.message, stepNumber]); // Re-run when step changes

  // Click to skip animation and show full text
  const handleSkipAnimation = () => {
    if (isStreaming) {
      setDisplayedMessage(step.message);
      setIsStreaming(false);
    }
  };

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-message"
      aria-live="polite"
    >
      <div style={styles.header}>
        <div style={styles.headerText} id="tutorial-title">
          <span style={styles.prefix}>&gt;</span> TUTORIAL [{stepNumber}/{totalSteps}]
        </div>
        <button onClick={onSkip} style={styles.closeButton} aria-label="Skip tutorial">
          <X size={16} />
        </button>
      </div>

      <div style={styles.divider} />

      <div style={styles.body}>
        <div style={styles.title}>
          <span style={styles.prompt}>$</span> {step.title}
        </div>

        <div
          style={{
            ...styles.message,
            cursor: isStreaming ? 'pointer' : 'default',
          }}
          id="tutorial-message"
          onClick={handleSkipAnimation}
          title={isStreaming ? 'Click to skip animation' : undefined}
        >
          {displayedMessage}
          {isStreaming && <span className="tutorial-cursor" style={styles.cursor}>▋</span>}
        </div>

        {step.hint && !isStreaming && (
          <div
            style={{
              ...styles.hint,
              opacity: fadeIn ? 1 : 0,
              transition: 'opacity 0.3s ease 0.5s',
            }}
            aria-label="Hint"
          >
            <span style={styles.hintPrefix}>[TIP]</span> {step.hint}
          </div>
        )}
      </div>

      {isCompleted ? (
        <div style={styles.finalFooter}>
          <button
            onClick={onRestart}
            style={styles.restartButton}
            aria-label="Restart tutorial"
          >
            ↻ Restart Tutorial
          </button>
          <button
            onClick={onSkip}
            style={styles.exitButton}
            aria-label="Exit tutorial"
          >
            Exit
          </button>
        </div>
      ) : (
        <div style={styles.footer}>
          <button
            onClick={onPrevious}
            disabled={!canGoBack}
            style={{
              ...styles.navButton,
              opacity: canGoBack ? 1 : 0.3,
              cursor: canGoBack ? 'pointer' : 'not-allowed',
            }}
            aria-label="Previous step"
          >
            ‹ Back
          </button>
          <div style={styles.stepIndicator}>
            {stepNumber} / {totalSteps}
          </div>
          <button
            onClick={onNext}
            disabled={!canGoForward}
            style={{
              ...styles.navButton,
              opacity: canGoForward ? 1 : 0.3,
              cursor: canGoForward ? 'pointer' : 'not-allowed',
            }}
            aria-label="Next step"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    bottom: 100,
    right: 16,
    width: 300,
    background: COLORS.backgroundDark,
    border: `1px solid ${COLORS.teal}`,
    fontFamily: 'Space Mono, monospace',
    fontSize: 14,
    color: COLORS.text,
    zIndex: Z_INDEX.TUTORIAL_OVERLAY,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  prefix: {
    color: COLORS.teal,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: COLORS.textMuted,
    fontSize: 18,
    cursor: 'pointer',
    padding: 0,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s',
  },
  divider: {
    height: 1,
    background: COLORS.border,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
    color: COLORS.teal,
  },
  prompt: {
    color: COLORS.green,
    marginRight: 4,
  },
  message: {
    lineHeight: 1.5,
    whiteSpace: 'pre-line',
    color: COLORS.text,
  },
  hint: {
    marginTop: 12,
    padding: '8px 12px',
    background: COLORS.background,
    borderLeft: `2px solid ${COLORS.green}`,
    fontSize: 12,
    lineHeight: 1.4,
    color: COLORS.textMuted,
  },
  hintPrefix: {
    color: COLORS.green,
    marginRight: 4,
    fontWeight: 700,
  },
  cursor: {
    color: COLORS.teal,
    marginLeft: 2,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: `1px solid ${COLORS.border}`,
    gap: 8,
  },
  navButton: {
    background: 'none',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: '"Space Mono", monospace',
    padding: '6px 12px',
    transition: 'all 0.15s',
  },
  stepIndicator: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: '"Space Mono", monospace',
  },
  finalFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 16px',
    borderTop: `1px solid ${COLORS.border}`,
  },
  restartButton: {
    background: COLORS.green,
    border: 'none',
    color: COLORS.backgroundDark,
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    fontWeight: 'bold',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  exitButton: {
    background: 'none',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: '"Space Mono", monospace',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
