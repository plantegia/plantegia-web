import { createContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TUTORIALS } from './tutorials';
import { attachActionDetector } from './actionDetector';
import { saveTutorialProgress, clearTutorialProgress } from './storage';
import type { Tutorial, TutorialStep, TutorialProgress } from './types';

interface TutorialContextValue {
  activeTutorial: Tutorial | null;
  currentStep: TutorialStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: TutorialProgress | null;
  isCompleted: boolean;

  startTutorial: (tutorialId: string, resetProgress?: boolean) => void;
  advanceStep: () => void;
  previousStep: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  restartTutorial: () => void;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);

  const currentStep = activeTutorial?.steps[currentStepIndex] ?? null;
  const totalSteps = activeTutorial?.steps.length ?? 0;
  const isCompleted = currentStepIndex >= totalSteps - 1;

  // Use ref to maintain stable callback reference
  const advanceStepRef = useRef<() => void>();

  useEffect(() => {
    advanceStepRef.current = () => {
      if (!activeTutorial || !progress) return;

      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= activeTutorial.steps.length) {
          // Tutorial complete
          const updatedProgress: TutorialProgress = {
            ...progress,
            currentStepIndex: nextIndex,
            completed: true,
            completedAt: new Date().toISOString(),
          };
          saveTutorialProgress(updatedProgress);
          setProgress(updatedProgress);
          setActiveTutorial(null);
          return prevIndex; // Don't actually update since we're clearing
        }

        // Advance to next step
        const updatedProgress: TutorialProgress = {
          ...progress,
          currentStepIndex: nextIndex,
        };
        saveTutorialProgress(updatedProgress);
        setProgress(updatedProgress);
        return nextIndex;
      });
    };
  });

  const advanceStep = useCallback(() => {
    advanceStepRef.current?.();
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTutorial || !progress || currentStepIndex >= activeTutorial.steps.length - 1) return;

    setCurrentStepIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      const updatedProgress: TutorialProgress = {
        ...progress,
        currentStepIndex: nextIndex,
      };
      saveTutorialProgress(updatedProgress);
      setProgress(updatedProgress);
      return nextIndex;
    });
  }, [activeTutorial, currentStepIndex, progress]);

  const previousStep = useCallback(() => {
    if (!progress || currentStepIndex <= 0) return;

    setCurrentStepIndex(prevIndex => {
      const nextIndex = prevIndex - 1;
      const updatedProgress: TutorialProgress = {
        ...progress,
        currentStepIndex: nextIndex,
      };
      saveTutorialProgress(updatedProgress);
      setProgress(updatedProgress);
      return nextIndex;
    });
  }, [currentStepIndex, progress]);

  const startTutorial = useCallback((tutorialId: string, resetProgress = false) => {
    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      console.error(`Tutorial not found: ${tutorialId}`);
      return;
    }

    // Clear existing progress if resetProgress is true
    if (resetProgress) {
      clearTutorialProgress(tutorialId);
    }

    // Always start from beginning (no loading existing progress)
    const newProgress: TutorialProgress = {
      tutorialId,
      currentStepIndex: 0,
      completed: false,
      startedAt: new Date().toISOString(),
    };

    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);
    setProgress(newProgress);
    saveTutorialProgress(newProgress);
  }, []);

  const skipTutorial = useCallback(() => {
    if (!activeTutorial || !progress) return;

    // Mark as incomplete but save progress
    const updatedProgress: TutorialProgress = {
      ...progress,
      currentStepIndex,
    };
    saveTutorialProgress(updatedProgress);

    setActiveTutorial(null);
    setProgress(null);
  }, [activeTutorial, progress, currentStepIndex]);

  const completeTutorial = useCallback(() => {
    if (!activeTutorial || !progress) return;

    const updatedProgress: TutorialProgress = {
      ...progress,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    saveTutorialProgress(updatedProgress);

    setActiveTutorial(null);
    setProgress(null);
  }, [activeTutorial, progress]);

  const restartTutorial = useCallback(() => {
    if (!activeTutorial) return;

    // Reset to first step
    setCurrentStepIndex(0);
    const updatedProgress: TutorialProgress = {
      tutorialId: activeTutorial.id,
      currentStepIndex: 0,
      completed: false,
      startedAt: new Date().toISOString(),
    };
    saveTutorialProgress(updatedProgress);
    setProgress(updatedProgress);
  }, [activeTutorial]);

  // Subscribe to store state changes for state-based conditions
  useEffect(() => {
    if (!currentStep || currentStep.condition.type !== 'state') return;

    const unsubscribe = useAppStore.subscribe((state) => {
      if (currentStep.condition.stateCheck?.(state)) {
        advanceStepRef.current?.();
      }
    });

    return unsubscribe;
  }, [currentStep]);

  // Attach action detector for action-based conditions
  useEffect(() => {
    if (!activeTutorial || !currentStep || currentStep.condition.type !== 'action') return;

    const cleanup = attachActionDetector((actionName) => {
      if (currentStep.condition.action === actionName) {
        advanceStepRef.current?.();
      }
    });

    return cleanup;
  }, [activeTutorial, currentStep]);

  // Auto-advance for timed steps
  useEffect(() => {
    if (!currentStep?.autoAdvanceDelay) return;

    const timer = setTimeout(() => {
      advanceStepRef.current?.();
    }, currentStep.autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const value: TutorialContextValue = {
    activeTutorial,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isCompleted,
    startTutorial,
    advanceStep,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    restartTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}
