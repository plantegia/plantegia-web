import { useContext } from 'react';
import { TutorialContext } from './TutorialContext';

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    return {
      activeTutorial: null,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 0,
      progress: null,
      isCompleted: false,
      startTutorial: () => {},
      advanceStep: () => {},
      nextStep: () => {},
      previousStep: () => {},
      skipTutorial: () => {},
      completeTutorial: () => {},
      restartTutorial: () => {},
    };
  }
  return context;
}
