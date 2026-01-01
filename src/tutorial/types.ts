import type { Space, Plant, Strain, Seed } from '../types';
import type { AppState } from '../store/useAppStore';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  objective: string;
  condition: {
    type: 'action' | 'state' | 'none';
    action?: string;
    stateCheck?: (state: AppState) => boolean;
  };
  hint?: string;
  autoAdvanceDelay?: number;
  /** CSS selector for element to highlight with pulsing border */
  highlightSelector?: string;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  initialState: {
    spaces: Space[];
    plants: Plant[];
    strains: Strain[];
    inventory: Seed[];
  };
}

export interface TutorialProgress {
  tutorialId: string;
  currentStepIndex: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}
