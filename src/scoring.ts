import type { Point, Stroke, TargetShape, HeatmapPoint } from './types';

// Find the minimum distance from a point to any point in a target path
function distanceToPath(point: Point, targetPoints: Point[]): number {
  let minDist = Infinity;
  for (const tp of targetPoints) {
    const dx = point.x - tp.x;
    const dy = point.y - tp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

// Find the minimum distance from a target point to any drawn point
function distanceFromTarget(targetPoint: Point, drawnPoints: Point[]): number {
  let minDist = Infinity;
  for (const dp of drawnPoints) {
    const dx = targetPoint.x - dp.x;
    const dy = targetPoint.y - dp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

// Get all drawn points from all strokes
function flattenStrokes(strokes: Stroke[]): Point[] {
  return strokes.flatMap(s => s.points);
}

// Interpolate between consecutive stroke points so fast strokes stay dense.
// maxGap is in logical pixels.
function densifyStrokes(strokes: Stroke[], maxGap = 4): Point[] {
  const result: Point[] = [];
  for (const stroke of strokes) {
    const pts = stroke.points;
    if (pts.length === 0) continue;
    result.push(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / maxGap);
      for (let j = 1; j <= steps; j++) {
        const t = j / steps;
        result.push({ x: prev.x + dx * t, y: prev.y + dy * t, pressure: prev.pressure });
      }
    }
  }
  return result;
}

function totalInkLength(strokes: Stroke[]): number {
  let total = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.points.length; i++) {
      const dx = stroke.points[i].x - stroke.points[i - 1].x;
      const dy = stroke.points[i].y - stroke.points[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
  }
  return total;
}

function segmentLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// Max acceptable distance in pixels — points farther than this score 0
const MAX_DISTANCE = 30;

export function computeAccuracy(
  strokes: Stroke[],
  targets: TargetShape[],
): number {
  const drawnPoints = flattenStrokes(strokes);
  if (drawnPoints.length === 0) return 0;

  // Get all scoreable target points (exclude 'reference' labels)
  const targetPoints: Point[] = [];
  for (const target of targets) {
    if (target.label === 'reference' || target.label === 'reference-only') continue;
    if (target.type === 'path' && target.points) {
      targetPoints.push(...target.points);
    } else if (target.type === 'dots' && target.dots) {
      targetPoints.push(...target.dots);
    }
  }

  if (targetPoints.length === 0) {
    // All targets are reference-only (freeform) — just check coverage loosely
    const allTargetPoints = targets.flatMap(t => t.points || t.dots || []);
    if (allTargetPoints.length === 0) return 50; // no target to compare
    return computeCoverageScore(drawnPoints, allTargetPoints);
  }

  // Two-way scoring:
  // 1. How well do drawn points follow the target? (precision)
  // 2. How well is the target covered by drawn points? (coverage)

  // Precision: for each drawn point, how close is it to the target?
  let precisionSum = 0;
  for (const dp of drawnPoints) {
    const dist = distanceToPath(dp, targetPoints);
    const score = Math.max(0, 1 - dist / MAX_DISTANCE);
    precisionSum += score;
  }
  const precision = precisionSum / drawnPoints.length;

  // Coverage: for each target point, how close is the nearest drawn point?
  let coverageSum = 0;
  // Sample target points to keep computation reasonable
  const sampleStep = Math.max(1, Math.floor(targetPoints.length / 200));
  let sampleCount = 0;
  for (let i = 0; i < targetPoints.length; i += sampleStep) {
    const dist = distanceFromTarget(targetPoints[i], drawnPoints);
    const score = Math.max(0, 1 - dist / MAX_DISTANCE);
    coverageSum += score;
    sampleCount++;
  }
  const coverage = sampleCount > 0 ? coverageSum / sampleCount : 0;

  // Ink penalty: penalize when total drawn ink far exceeds target path length.
  // Drawing the shape 1-3x is fine; dense scribbling produces 10-100x and scores near 0.
  const inkLength = totalInkLength(strokes);
  const tgtLength = targets
    .filter(t => t.label !== 'reference' && t.label !== 'reference-only' && t.type === 'path')
    .reduce((sum, t) => sum + segmentLength(t.points ?? []), 0);
  const inkRatio = tgtLength > 0 ? inkLength / tgtLength : 1;
  const inkPenalty = inkRatio <= 3 ? 1 : Math.max(0.05, 3 / inkRatio);

  // Weight: 60% precision, 40% coverage — rewards staying on the line
  const accuracy = (precision * 0.6 + coverage * 0.4) * 100 * inkPenalty;
  return Math.round(Math.min(100, Math.max(0, accuracy)));
}

function computeCoverageScore(drawnPoints: Point[], targetPoints: Point[]): number {
  let coverageSum = 0;
  const sampleStep = Math.max(1, Math.floor(targetPoints.length / 200));
  let count = 0;
  for (let i = 0; i < targetPoints.length; i += sampleStep) {
    const dist = distanceFromTarget(targetPoints[i], drawnPoints);
    coverageSum += Math.max(0, 1 - dist / (MAX_DISTANCE * 1.5));
    count++;
  }
  return Math.round((coverageSum / count) * 100);
}

// Generate heatmap data for visual feedback
export function generateHeatmap(
  strokes: Stroke[],
  targets: TargetShape[],
): HeatmapPoint[] {
  const drawnPoints = densifyStrokes(strokes, 4);
  if (drawnPoints.length === 0) return [];

  const targetPoints: Point[] = [];
  for (const target of targets) {
    if (target.type === 'path' && target.points) {
      targetPoints.push(...target.points);
    } else if (target.type === 'dots' && target.dots) {
      targetPoints.push(...target.dots);
    }
  }

  if (targetPoints.length === 0) return [];

  const heatmap: HeatmapPoint[] = [];
  for (const dp of drawnPoints) {
    const dist = distanceToPath(dp, targetPoints);
    heatmap.push({ x: dp.x, y: dp.y, distance: dist });
  }

  return heatmap;
}

// Render heatmap on canvas
export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  heatmap: HeatmapPoint[],
): void {
  for (const point of heatmap) {
    const normalized = Math.min(1, point.distance / MAX_DISTANCE);
    // Green (close) to Red (far)
    const r = Math.round(normalized * 255);
    const g = Math.round((1 - normalized) * 255);
    const b = 0;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
