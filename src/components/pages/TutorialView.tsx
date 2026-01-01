import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TUTORIALS, useTutorial } from '../../tutorial';
import { createPlantation, updatePlantation } from '../../lib/firestore';
import { COLORS, VIEWPORT_WIDTH } from '../../constants';

export function TutorialView() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTutorial } = useTutorial();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorialId || !user) return;

    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      setError(`Tutorial "${tutorialId}" not found`);
      return;
    }

    // Flag to track if component is still mounted
    let isMounted = true;

    // Create tutorial plantation
    createPlantation(user.uid, `Tutorial: ${tutorial.name}`)
      .then(plantation => {
        if (!isMounted) return Promise.reject('unmounted');

        // Update plantation with tutorial flag and initial state
        return updatePlantation(plantation.id, {
          ...tutorial.initialState,
          isTutorial: true,
        }).then(() => plantation.id);
      })
      .then(plantationId => {
        if (!isMounted) return;

        // Start tutorial from beginning (always reset)
        startTutorial(tutorialId, true);
        // Navigate to plantation
        navigate(`/p/${plantationId}`);
      })
      .catch(err => {
        if (!isMounted || err === 'unmounted') return;

        console.error('Failed to create tutorial plantation:', err);
        setError('Failed to create tutorial. Please try again.');
      });

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [tutorialId, user, startTutorial, navigate]);

  return (
    <div style={styles.container}>
      {error ? (
        <>
          <div style={styles.message}>{error}</div>
          <button style={styles.button} onClick={() => navigate('/')}>
            Back to list
          </button>
        </>
      ) : (
        <div style={styles.message}>Creating tutorial...</div>
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
  button: {
    padding: '12px 24px',
    fontSize: 14,
    fontFamily: '"Space Mono", monospace',
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.text,
    border: 'none',
    cursor: 'pointer',
  },
};
