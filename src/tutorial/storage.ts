import type { TutorialProgress } from './types';

const STORAGE_PREFIX = 'plantasia_tutorial_progress_';

export function saveTutorialProgress(progress: TutorialProgress): void {
  const key = `${STORAGE_PREFIX}${progress.tutorialId}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

export function clearTutorialProgress(tutorialId: string): void {
  const key = `${STORAGE_PREFIX}${tutorialId}`;
  localStorage.removeItem(key);
}
