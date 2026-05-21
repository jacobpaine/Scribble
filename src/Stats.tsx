import { getExercisesForStage, stageNames, totalStages } from './exercises';
import type { Progress } from './types';

interface StatsProps {
  progress: Progress;
  onBack: () => void;
  onReset: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return `${min}m ${sec}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function Sparkline({ values, width = 120, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length === 0) return null;
  const max = 100;
  const min = 0;
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function getStreak(history: Progress['history']): number {
  if (history.length === 0) return 0;

  const days = new Set<string>();
  for (const a of history) {
    const d = new Date(a.completedAt);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const sorted = Array.from(days).sort().reverse();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Check if the streak includes today or yesterday
  if (sorted[0] !== todayKey) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    if (sorted[0] !== yesterdayKey) return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export default function Stats({ progress, onBack, onReset }: StatsProps) {
  const { history } = progress;

  const totalAttempts = history.length;
  const totalTimeMs = history.reduce((sum, a) => sum + a.durationMs, 0);
  const streak = getStreak(history);

  // Per-exercise stats: group history by exerciseId
  const byExercise = new Map<string, { accuracies: number[]; attempts: number }>();
  for (const a of history) {
    const entry = byExercise.get(a.exerciseId) ?? { accuracies: [], attempts: 0 };
    entry.accuracies.push(a.accuracy);
    entry.attempts++;
    byExercise.set(a.exerciseId, entry);
  }

  return (
    <div className="app stats-view">
      <header className="stats-header">
        <button className="menu-btn" onClick={onBack}>Back to Menu</button>
        <h1>Stats</h1>
        <button className="reset-btn" onClick={() => { if (window.confirm('Reset all progress? This cannot be undone.')) onReset(); }}>Reset All</button>
      </header>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-value">{totalAttempts}</span>
          <span className="stat-label">Total Attempts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatDuration(totalTimeMs)}</span>
          <span className="stat-label">Practice Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '--'}</span>
          <span className="stat-label">Streak</span>
        </div>
      </div>

      <div className="stats-stages">
        {Array.from({ length: totalStages }, (_, i) => i + 1).filter(stage => stage <= 5).map(stage => {
          const exercises = getExercisesForStage(stage);
          const passedCount = exercises.filter(ex => {
            const r = progress.completedExercises[ex.id];
            return r && r.accuracy >= ex.accuracyThreshold;
          }).length;
          const pct = Math.round((passedCount / exercises.length) * 100);

          return (
            <div key={stage} className="stats-stage-block">
              <div className="stats-stage-header">
                <h3>Stage {stage}: {stageNames[stage]}</h3>
                <span>{passedCount}/{exercises.length} ({pct}%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="stats-exercise-list">
                {exercises.map(ex => {
                  const data = byExercise.get(ex.id);
                  const best = progress.completedExercises[ex.id];
                  return (
                    <div key={ex.id} className="stats-exercise-row">
                      <span className="stats-ex-name">{ex.name}</span>
                      <span className="stats-ex-attempts">{data?.attempts ?? 0} attempts</span>
                      {best && <span className="stats-ex-best">Best: {best.accuracy}%</span>}
                      {data && data.accuracies.length > 1 && (
                        <Sparkline values={data.accuracies.slice(-10)} />
                      )}
                    </div>
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

// Also export the Sparkline for use inline on result screen
export { Sparkline, getStreak };
