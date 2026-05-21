export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface Stroke {
  points: Point[];
}

export interface Exercise {
  id: string;
  stage: number;
  name: string;
  description: string;
  type: 'guided' | 'proportion' | 'freeform' | 'timed' | 'blind';
  targetGenerator: (width: number, height: number) => TargetShape[];
  accuracyThreshold: number;
  timeLimit?: number; // seconds, for timed drills
  referenceImage?: string; // for freeform challenges
}

export interface TargetShape {
  type: 'path' | 'circle' | 'dots' | 'image';
  points?: Point[]; // for path type
  cx?: number;
  cy?: number;
  radius?: number; // for circle type
  dots?: Point[]; // for dots type
  label?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  accuracy: number;
  completedAt: number;
  strokes: Stroke[];
}

export interface ExerciseAttempt {
  exerciseId: string;
  accuracy: number;
  completedAt: number;
  durationMs: number;
}

export interface Progress {
  completedExercises: Record<string, ExerciseResult>;
  currentStage: number;
  currentExerciseIndex: number;
  history: ExerciseAttempt[];
}

export interface HeatmapPoint {
  x: number;
  y: number;
  distance: number; // 0 = perfect, higher = worse
}
