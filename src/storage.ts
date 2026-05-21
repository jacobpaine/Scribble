import type { Progress, ExerciseResult, ExerciseAttempt } from './types';

const STORAGE_KEY = 'drawing-practice-progress';
const MAX_HISTORY = 500;

const defaultProgress: Progress = {
  completedExercises: {},
  currentStage: 1,
  currentExerciseIndex: 0,
  history: [],
};

export function loadProgress(): Progress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate: ensure history array exists
      if (!parsed.history) parsed.history = [];
      return parsed;
    }
  } catch {
    // corrupted data, reset
  }
  return { ...defaultProgress, history: [] };
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function saveExerciseResult(exerciseId: string, result: ExerciseResult, durationMs: number): Progress {
  const progress = loadProgress();
  const existing = progress.completedExercises[exerciseId];
  // Keep the best score
  if (!existing || result.accuracy > existing.accuracy) {
    progress.completedExercises[exerciseId] = result;
  }

  // Append lean attempt to history
  const attempt: ExerciseAttempt = {
    exerciseId,
    accuracy: result.accuracy,
    completedAt: result.completedAt,
    durationMs,
  };
  progress.history.push(attempt);
  if (progress.history.length > MAX_HISTORY) {
    progress.history = progress.history.slice(-MAX_HISTORY);
  }

  saveProgress(progress);
  return progress;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
