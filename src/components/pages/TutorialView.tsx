import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TUTORIALS, useTutorial } from '../../tutorial';
import { createPlantation, updatePlantation, findTutorialPlantation } from '../../lib/firestore';
import { COLORS, VIEWPORT_WIDTH } from '../../constants';

export function TutorialView() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { startTutorial } = useTutorial();
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/p/', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!tutorialId || !user) return;

    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      setError(`Tutorial "${tutorialId}" not found`);
      return;
    }

    let isMounted = true;

    // First check if tutorial plantation already exists
    findTutorialPlantation(user.uid, tutorialId)
      .then(existing => {
        if (!isMounted) return Promise.reject('unmounted');

        if (existing) {
          // Tutorial already exists - just navigate to it
          startTutorial(tutorialId, false);
          navigate(`/p/${existing.id}`);
          return Promise.reject('exists');
        }

        // Create new tutorial plantation
        return createPlantation(user.uid, `Tutorial: ${tutorial.name}`);
      })
      .then(plantation => {
        if (!isMounted) return Promise.reject('unmounted');

        // Update plantation with tutorial flag, tutorialId, and initial state
        return updatePlantation(plantation.id, {
          ...tutorial.initialState,
          isTutorial: true,
          tutorialId: tutorialId,
        }).then(() => plantation.id);
      })
      .then(plantationId => {
        if (!isMounted) return;

        // Start tutorial from beginning for new tutorials
        startTutorial(tutorialId, true);
        navigate(`/p/${plantationId}`);
      })
      .catch(err => {
        if (!isMounted || err === 'unmounted' || err === 'exists') return;

        console.error('Failed to create tutorial plantation:', err);
        setError('Failed to create tutorial. Please try again.');
      });

    return () => {
      isMounted = false;
    };
  }, [tutorialId, user, startTutorial, navigate]);

  // Don't render anything while auth is loading or redirecting
  if (authLoading || !user) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {error ? (
        <>
          <div style={styles.message}>{error}</div>
          <button className="btn-secondary" style={styles.button} onClick={() => navigate('/p/')}>
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
