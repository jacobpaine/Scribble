import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import type { Point, Stroke, TargetShape, HeatmapPoint } from './types';
import { renderHeatmap } from './scoring';

interface DrawingCanvasProps {
  targets: TargetShape[];
  showTargets: boolean;
  showReferenceOnly?: boolean; // show reference labels but not target labels
  onStrokesChange: (strokes: Stroke[]) => void;
  heatmap: HeatmapPoint[] | null;
  disabled?: boolean;
  resetKey?: number;
  showAnswer?: boolean;
  strokeColor?: string;
  resultMode?: 'heatmap' | 'overlay' | 'side-by-side';
  onSubmit?: () => void;
  canSubmit?: boolean;
}

export interface DrawingCanvasHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const LOGICAL_W = 800;
const LOGICAL_H = 600;

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas({
  targets,
  showTargets,
  showReferenceOnly,
  onStrokesChange,
  heatmap,
  disabled,
  resetKey,
  showAnswer,
  strokeColor = '#333',
  resultMode,
  onSubmit,
  canSubmit,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const undoneRef = useRef<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const [, forceUpdate] = useState(0);

  const getCanvasPoint = useCallback((e: PointerEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / LOGICAL_W, rect.height / LOGICAL_H);
    const offsetX = (rect.width - LOGICAL_W * scale) / 2;
    const offsetY = (rect.height - LOGICAL_H * scale) / 2;
    return {
      x: (e.clientX - rect.left - offsetX) / scale,
      y: (e.clientY - rect.top - offsetY) / scale,
      pressure: e.pressure || 0.5,
      timestamp: Date.now(),
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Uniform scale + center: fit the 800×600 logical space into the physical
    // canvas without distortion, with equal letterbox margins on the short axis.
    const scale = Math.min(canvas.width / LOGICAL_W, canvas.height / LOGICAL_H);
    const offsetX = (canvas.width - LOGICAL_W * scale) / 2;
    const offsetY = (canvas.height - LOGICAL_H * scale) / 2;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw targets as faint guides (or bold answer on fail)
    if (showTargets || showAnswer) {
      for (const target of targets) {
        // Skip targets labeled 'target' if we only show references (not in answer mode)
        if (!showAnswer && showReferenceOnly && target.label !== 'reference' && target.label !== 'reference-only') continue;

        if (target.type === 'path' && target.points && target.points.length > 1) {
          const isReference = target.label === 'reference';
          if (showAnswer) {
            ctx.strokeStyle = 'rgba(37, 99, 235, 0.7)';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = isReference ? 'rgba(100, 100, 255, 0.5)' : 'rgba(200, 200, 200, 0.4)';
            ctx.lineWidth = isReference ? 3 : 2;
            ctx.setLineDash(isReference ? [] : [8, 4]);
          }
          ctx.beginPath();
          ctx.moveTo(target.points[0].x, target.points[0].y);
          for (let i = 1; i < target.points.length; i++) {
            ctx.lineTo(target.points[i].x, target.points[i].y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (target.type === 'dots' && target.dots) {
          ctx.fillStyle = showAnswer ? 'rgba(37, 99, 235, 0.7)' : 'rgba(200, 200, 200, 0.5)';
          for (const dot of target.dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // If proportion exercise, draw center axis
      const hasMirror = targets.some(t => t.label === 'reference' || t.label === 'target');
      if (hasMirror) {
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(LOGICAL_W / 2, 0);
        ctx.lineTo(LOGICAL_W / 2, LOGICAL_H);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Default / heatmap mode: draw strokes + heatmap
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
    if (currentStrokeRef.current.length > 1) {
      drawStroke(ctx, { points: currentStrokeRef.current });
    }
    if (heatmap) {
      renderHeatmap(ctx, heatmap);
    }

    ctx.restore();
  }, [targets, showTargets, showReferenceOnly, showAnswer, heatmap, strokeColor, resultMode]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pts = stroke.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    if (pts.length === 2) {
      ctx.lineWidth = 2 + (pts[1].pressure ?? 0.5) * 4;
      ctx.lineTo(pts[1].x, pts[1].y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const pressure = pts[i].pressure ?? 0.5;
        ctx.lineWidth = 2 + pressure * 4;
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      // Final segment to last point
      const last = pts[pts.length - 1];
      ctx.lineWidth = 2 + (last.pressure ?? 0.5) * 4;
      ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();
  }

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redraw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redraw]);

  // Pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [getCanvasPoint(e, canvas)];
      undoneRef.current = []; // clear redo stack on new stroke
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      currentStrokeRef.current.push(getCanvasPoint(e, canvas));
      redraw();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      isDrawingRef.current = false;
      if (currentStrokeRef.current.length > 1) {
        strokesRef.current = [...strokesRef.current, { points: [...currentStrokeRef.current] }];
        onStrokesChange(strokesRef.current);
      }
      currentStrokeRef.current = [];
      redraw();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
    };
  }, [disabled, getCanvasPoint, onStrokesChange, redraw]);

  // Clear strokes when resetKey changes (new exercise)
  useEffect(() => {
    strokesRef.current = [];
    undoneRef.current = [];
    currentStrokeRef.current = [];
    redraw();
  }, [resetKey, redraw]);

  // Redraw when dependencies change
  useEffect(() => {
    redraw();
  }, [redraw]);

  const undo = () => {
    if (strokesRef.current.length === 0) return;
    const last = strokesRef.current[strokesRef.current.length - 1];
    undoneRef.current.push(last);
    strokesRef.current = strokesRef.current.slice(0, -1);
    onStrokesChange(strokesRef.current);
    redraw();
    forceUpdate(n => n + 1);
  };

  const redo = () => {
    if (undoneRef.current.length === 0) return;
    const last = undoneRef.current.pop()!;
    strokesRef.current = [...strokesRef.current, last];
    onStrokesChange(strokesRef.current);
    redraw();
    forceUpdate(n => n + 1);
  };

  const clear = () => {
    undoneRef.current = [...strokesRef.current];
    strokesRef.current = [];
    currentStrokeRef.current = [];
    onStrokesChange([]);
    redraw();
    forceUpdate(n => n + 1);
  };

  useImperativeHandle(ref, () => ({ undo, redo, clear }));

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
      />
      {!disabled && (
        <div className="canvas-controls">
          <button onClick={undo} disabled={strokesRef.current.length === 0} title="Undo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a5 5 0 0 1 0 10H9" /><path d="M3 10l4-4" /><path d="M3 10l4 4" />
            </svg>
          </button>
          <button onClick={redo} disabled={undoneRef.current.length === 0} title="Redo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H11a5 5 0 0 0 0 10h4" /><path d="M21 10l-4-4" /><path d="M21 10l-4 4" />
            </svg>
          </button>
          <button onClick={clear} disabled={strokesRef.current.length === 0} title="Clear">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6" />
            </svg>
          </button>
          {onSubmit && (
            <button className="submit-btn" onClick={onSubmit} disabled={!canSubmit} title="Submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;
