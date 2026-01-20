import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../ui/Header';
import { Canvas } from '../canvas/Canvas';
import { Hotbar } from '../hotbar/Hotbar';
import { Inspector } from '../inspector/Inspector';
import { useAuth } from '../../hooks/useAuth';
import { usePlantation } from '../../hooks/usePlantation';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useTutorial, TutorialOverlay, TutorialHighlight } from '../../tutorial';
import { COLORS, VIEWPORT_WIDTH } from '../../constants';

export function PlantationView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plantation, loading, error } = usePlantation(id || '');
  const { currentStep, currentStepIndex, totalSteps, isCompleted, skipTutorial, nextStep, previousStep, restartTutorial } = useTutorial();

  const isViewOnly = searchParams.get('view') === '1';
  const isOwner = plantation && user && plantation.ownerId === user.uid;
  const canEdit = Boolean(isOwner && !isViewOnly);

  // Enable keyboard shortcuts only when user can edit
  useKeyboardShortcuts(canEdit || false);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>Loading...</div>
      </div>
    );
  }

  if (error || !plantation) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>{error || 'Plantation not found'}</div>
        <button style={styles.backButton} onClick={() => navigate('/p/')}>
          Back to list
        </button>
      </div>
    );
  }

  if (!isOwner && !plantation.isPublic) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>This plantation is private</div>
        <button style={styles.backButton} onClick={() => navigate('/p/')}>
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: COLORS.background,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Canvas readOnly={!canEdit} />
      <Header plantationName={plantation.name} canEdit={canEdit} />
      <Inspector readOnly={!canEdit} />
      <Hotbar readOnly={!canEdit} />
      {currentStep && (
        <>
          {currentStep.highlightSelector && (
            <TutorialHighlight selector={currentStep.highlightSelector} />
          )}
          <TutorialOverlay
            step={currentStep}
            stepNumber={currentStepIndex + 1}
            totalSteps={totalSteps}
            canGoBack={currentStepIndex > 0}
            canGoForward={currentStepIndex < totalSteps - 1}
            isCompleted={isCompleted}
            onSkip={skipTutorial}
            onPrevious={previousStep}
            onNext={nextStep}
            onRestart={restartTutorial}
          />
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: VIEWPORT_WIDTH,
    height: '100dvh',
    margin: '0 auto',
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    fontFamily: '"Space Mono", monospace',
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  backButton: {
    padding: '12px 24px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.text,
    border: 'none',
    cursor: 'pointer',
  },
};
