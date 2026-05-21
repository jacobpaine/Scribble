import { useState, useCallback, useEffect, useRef } from 'react';
import DrawingCanvas from './DrawingCanvas';
import type { DrawingCanvasHandle } from './DrawingCanvas';
import Stats, { Sparkline, getStreak } from './Stats';
import { allExercises, getExercisesForStage, stageNames, totalStages } from './exercises';
import { computeAccuracy, generateHeatmap } from './scoring';
import { loadProgress, saveExerciseResult, resetProgress } from './storage';
import type { Stroke, TargetShape, HeatmapPoint, Progress } from './types';
import './App.css';

type AppState = 'exercise' | 'result' | 'menu' | 'stats';

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('drawing-practice-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* ignore */ }
  return 'light';
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [appState, setAppState] = useState<AppState>('menu');
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [targets, setTargets] = useState<TargetShape[]>([]);
  const [showTargets, setShowTargets] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [blindPhase, setBlindPhase] = useState<'study' | 'draw' | null>(null);
  const [canvasResetKey, setCanvasResetKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseStartRef = useRef<number>(Date.now());
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const currentExercise = currentExerciseId
    ? allExercises.find(e => e.id === currentExerciseId) ?? null
    : null;

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('drawing-practice-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  // TODO: Remove this flag to re-enable progression locking
  const DEV_UNLOCK_ALL = true;

  // Check if a stage is unlocked
  const isStageUnlocked = useCallback((stage: number): boolean => {
    if (DEV_UNLOCK_ALL) return true;
    if (stage === 1) return true;
    // All exercises of previous stage must be completed with passing score
    const prevExercises = getExercisesForStage(stage - 1);
    return prevExercises.every(ex => {
      const result = progress.completedExercises[ex.id];
      return result && result.accuracy >= ex.accuracyThreshold;
    });
  }, [progress]);

  // Check if an exercise is unlocked (all prior exercises in same stage passed)
  const isExerciseUnlocked = useCallback((exercise: typeof allExercises[0]): boolean => {
    if (DEV_UNLOCK_ALL) return true;
    if (!isStageUnlocked(exercise.stage)) return false;
    const stageExercises = getExercisesForStage(exercise.stage);
    const idx = stageExercises.findIndex(e => e.id === exercise.id);
    for (let i = 0; i < idx; i++) {
      const result = progress.completedExercises[stageExercises[i].id];
      if (!result || result.accuracy < stageExercises[i].accuracyThreshold) return false;
    }
    return true;
  }, [progress, isStageUnlocked]);

  const startExercise = useCallback((exerciseId: string) => {
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const generatedTargets = exercise.targetGenerator(800, 600);

    setCurrentExerciseId(exerciseId);
    setTargets(generatedTargets);
    setStrokes([]);
    setHeatmap(null);
    setAccuracy(null);
    setCanvasResetKey(k => k + 1);
    setAppState('exercise');
    setSidebarOpen(false);
    exerciseStartRef.current = Date.now();

    if (exercise.type === 'timed') {
      setTimeRemaining(exercise.timeLimit ?? 30);
      setShowTargets(true);
      setBlindPhase(null);
    } else if (exercise.type === 'blind') {
      setShowTargets(true);
      setBlindPhase('study');
      setTimeRemaining(5);
    } else if (exercise.type === 'freeform') {
      setShowTargets(true);
      setBlindPhase(null);
      setTimeRemaining(null);
    } else {
      setShowTargets(true);
      setBlindPhase(null);
      setTimeRemaining(null);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timeRemaining === null || timeRemaining <= 0) return;
    if (appState !== 'exercise') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          if (blindPhase === 'study') {
            // Study phase over, switch to draw phase
            setShowTargets(false);
            setBlindPhase('draw');
            return null;
          }
          // Timed exercise over — auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, appState, blindPhase]);

  // Auto-submit when timed exercise hits 0
  useEffect(() => {
    if (timeRemaining === 0 && currentExercise?.type === 'timed') {
      submitDrawing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  const submitDrawing = useCallback(() => {
    if (!currentExercise) return;

    const acc = computeAccuracy(strokes, targets);
    const heat = generateHeatmap(strokes, targets);

    setAccuracy(acc);
    setHeatmap(heat);
    setShowTargets(true); // show targets for comparison
    setAppState('result');
    setTimeRemaining(null);
    setBlindPhase(null);

    const result = {
      exerciseId: currentExercise.id,
      accuracy: acc,
      completedAt: Date.now(),
      strokes,
    };
    const durationMs = Date.now() - exerciseStartRef.current;
    const newProgress = saveExerciseResult(currentExercise.id, result, durationMs);
    setProgress(newProgress);
  }, [currentExercise, strokes, targets]);

  const handleStrokesChange = useCallback((newStrokes: Stroke[]) => {
    setStrokes(newStrokes);
  }, []);

  // Find next exercise
  const getNextExercise = useCallback(() => {
    if (!currentExercise) return null;
    const stageExercises = getExercisesForStage(currentExercise.stage);
    const idx = stageExercises.findIndex(e => e.id === currentExercise.id);
    if (idx < stageExercises.length - 1) {
      return stageExercises[idx + 1];
    }
    // Try next stage
    if (currentExercise.stage < totalStages) {
      const nextStage = getExercisesForStage(currentExercise.stage + 1);
      if (nextStage.length > 0 && isStageUnlocked(currentExercise.stage + 1)) {
        return nextStage[0];
      }
    }
    return null;
  }, [currentExercise, isStageUnlocked]);


  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (appState !== 'exercise' || blindPhase === 'study') return;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        canvasRef.current?.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        canvasRef.current?.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        canvasRef.current?.clear();
      } else if (e.key === 'Enter' && strokes.length > 0) {
        e.preventDefault();
        submitDrawing();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [appState, blindPhase, strokes.length, submitDrawing]);

  // ─── RENDER ───

  if (appState === 'stats') {
    return <Stats progress={progress} onBack={() => setAppState('menu')} onReset={() => { resetProgress(); setProgress(loadProgress()); }} />;
  }

  if (appState === 'menu') {
    return (
      <div className="app menu-view">
        <header className="menu-header">
          <h1>Drawing Practice</h1>
          <p className="subtitle">Build tablet drawing skills through guided exercises</p>
          {(() => {
            const streak = getStreak(progress.history);
            if (streak <= 0) return null;
            return <p className="streak-badge">{streak} day streak</p>;
          })()}
          <div className="menu-actions">
            <button className="stats-btn" onClick={() => setAppState('stats')}>Stats</button>
            <button className="theme-btn" onClick={toggleTheme} title="Toggle dark mode">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </header>
        <div className="stages-list">
          {Array.from({ length: totalStages }, (_, i) => i + 1).filter(stage => stage <= 5).map(stage => {
            const unlocked = isStageUnlocked(stage);
            const exercises = getExercisesForStage(stage);
            const completedCount = exercises.filter(ex => {
              const r = progress.completedExercises[ex.id];
              return r && r.accuracy >= ex.accuracyThreshold;
            }).length;

            return (
              <div key={stage} className={`stage-card ${unlocked ? '' : 'locked'}`}>
                <div className="stage-header">
                  <h2>Stage {stage}: {stageNames[stage]}</h2>
                  {!unlocked && <span className="lock-badge">Locked</span>}
                  <span className="stage-progress">{completedCount}/{exercises.length}</span>
                </div>
                <div className="exercise-list">
                  {exercises.map(ex => {
                    const exUnlocked = isExerciseUnlocked(ex);
                    const result = progress.completedExercises[ex.id];
                    const passed = result && result.accuracy >= ex.accuracyThreshold;

                    return (
                      <button
                        key={ex.id}
                        className={`exercise-btn ${passed ? 'passed' : ''} ${!exUnlocked ? 'locked' : ''}`}
                        disabled={!exUnlocked}
                        onClick={() => startExercise(ex.id)}
                      >
                        <span className="exercise-name">{ex.name}</span>
                        {result && (
                          <span className={`exercise-score ${passed ? 'pass' : 'fail'}`}>
                            {result.accuracy}%
                          </span>
                        )}
                        {!exUnlocked && !result && <span className="exercise-lock">&#128274;</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const isBlindStudyPhase = blindPhase === 'study';

  return (
    <div className="app exercise-view">
      {/* Sidebar toggle */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar" onClick={e => e.stopPropagation()}>
            <h3>Exercises</h3>
            <button className="sidebar-home" onClick={() => { setAppState('menu'); setSidebarOpen(false); }}>
              Back to Menu
            </button>
            {Array.from({ length: totalStages }, (_, i) => i + 1).filter(stage => stage <= 5).map(stage => {
              const exercises = getExercisesForStage(stage);
              return (
                <div key={stage} className="sidebar-stage" ref={stage === currentExercise?.stage ? (el) => { if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'instant', block: 'start' })); } : undefined}>
                  <h4>Stage {stage}</h4>
                  {exercises.map(ex => {
                    const exUnlocked = isExerciseUnlocked(ex);
                    const result = progress.completedExercises[ex.id];
                    const passed = result && result.accuracy >= ex.accuracyThreshold;
                    return (
                      <button
                        key={ex.id}
                        className={`sidebar-exercise ${passed ? 'passed' : ''} ${currentExercise?.id === ex.id ? 'active' : ''}`}
                        disabled={!exUnlocked}
                        onClick={() => {
                          startExercise(ex.id);
                          setSidebarOpen(false);
                        }}
                      >
                        {passed && '✓ '}{ex.name}
                        {result && <span className="sidebar-score">{result.accuracy}%</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise header */}
      <div className="exercise-header">
        <div className="exercise-info">
          <span className="exercise-stage">Stage {currentExercise?.stage}</span>
          <h2>{currentExercise?.name}</h2>
          <p>{currentExercise?.description}</p>
        </div>
        <div className="exercise-actions">
          {timeRemaining !== null && timeRemaining > 0 && (
            <span className={`timer ${timeRemaining <= 5 ? 'urgent' : ''}`}>
              {isBlindStudyPhase ? 'Study: ' : ''}{timeRemaining}s
            </span>
          )}
          {appState === 'result' && (
            <>
              <button className="retry-btn" onClick={() => startExercise(currentExercise!.id)}>
                Practice Again
              </button>
              {(() => {
                const next = getNextExercise();
                if (next && accuracy !== null && accuracy >= (currentExercise?.accuracyThreshold ?? 80)) {
                  return (
                    <button className="next-btn" onClick={() => startExercise(next.id)}>
                      Next: {next.name}
                    </button>
                  );
                }
                return null;
              })()}
              <button className="menu-btn" onClick={() => setAppState('menu')}>Menu</button>
            </>
          )}
        </div>
      </div>

      {/* Result banner */}
      {appState === 'result' && accuracy !== null && (
        <div className={`result-banner ${accuracy >= (currentExercise?.accuracyThreshold ?? 80) ? 'pass' : 'fail'}`}>
          <span className="result-accuracy">{accuracy}%</span>
          <span className="result-label">
            {accuracy >= (currentExercise?.accuracyThreshold ?? 80) ? 'Passed!' : `Need ${currentExercise?.accuracyThreshold}% to pass`}
          </span>
        </div>
      )}

      {/* Inline accuracy trend */}
      {appState === 'result' && currentExercise && (() => {
        const attempts = progress.history
          .filter(a => a.exerciseId === currentExercise.id)
          .map(a => a.accuracy)
          .slice(-10);
        if (attempts.length < 2) return null;
        return (
          <div className="inline-trend">
            <span className="inline-trend-label">Last {attempts.length} attempts</span>
            <Sparkline values={attempts} width={150} height={28} />
          </div>
        );
      })()}

      {/* Blind contour study overlay */}
      {isBlindStudyPhase && (
        <div className="study-overlay">
          <p>Study the shape — it will disappear in {timeRemaining}s</p>
        </div>
      )}

      {/* Canvas */}
      <DrawingCanvas
        ref={canvasRef}
        targets={targets}
        showTargets={showTargets}
        showReferenceOnly={currentExercise?.type === 'proportion' && appState !== 'result'}
        onStrokesChange={handleStrokesChange}
        heatmap={heatmap}
        disabled={appState === 'result' || isBlindStudyPhase}
        resetKey={canvasResetKey}
        showAnswer={appState === 'result' && accuracy !== null && accuracy < (currentExercise?.accuracyThreshold ?? 80)}
        strokeColor={theme === 'dark' ? '#e0e0e0' : '#333'}
        resultMode={appState === 'result' ? 'heatmap' : undefined}
        onSubmit={appState === 'exercise' && !isBlindStudyPhase ? submitDrawing : undefined}
        canSubmit={strokes.length > 0}
      />
    </div>
  );
}

export default App;
