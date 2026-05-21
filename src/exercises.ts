import type { Exercise, Point, TargetShape } from './types';

// Helper to generate points along a line
function linePath(x1: number, y1: number, x2: number, y2: number, steps = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
  }
  return points;
}

// Helper to generate points along a circle
function circlePath(cx: number, cy: number, r: number, steps = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

// Helper to generate a rectangle path
function rectPath(x: number, y: number, w: number, h: number): Point[] {
  return [
    ...linePath(x, y, x + w, y, 25),
    ...linePath(x + w, y, x + w, y + h, 25),
    ...linePath(x + w, y + h, x, y + h, 25),
    ...linePath(x, y + h, x, y, 25),
  ];
}

// Helper to generate a triangle path
function trianglePath(cx: number, cy: number, size: number): Point[] {
  const h = size * Math.sqrt(3) / 2;
  const x1 = cx, y1 = cy - h * 2 / 3;
  const x2 = cx - size / 2, y2 = cy + h / 3;
  const x3 = cx + size / 2, y3 = cy + h / 3;
  return [
    ...linePath(x1, y1, x2, y2, 33),
    ...linePath(x2, y2, x3, y3, 33),
    ...linePath(x3, y3, x1, y1, 33),
  ];
}

// S-curve
function sCurvePath(cx: number, cy: number, size: number, steps = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx + Math.sin(t * Math.PI * 2) * size * 0.4;
    const y = cy - size / 2 + t * size;
    points.push({ x, y });
  }
  return points;
}

// Arc
function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number, steps = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

// Spiral
function spiralPath(cx: number, cy: number, maxR: number, turns = 3, steps = 200): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const r = t * maxR;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

// Figure-8
function figure8Path(cx: number, cy: number, size: number, steps = 200): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2;
    points.push({
      x: cx + Math.sin(angle) * size * 0.4,
      y: cy + Math.sin(angle * 2) * size * 0.25,
    });
  }
  return points;
}

// Star
function starPath(cx: number, cy: number, outerR: number, innerR: number, spikes = 5): Point[] {
  const points: Point[] = [];
  const allVertices: Point[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    allVertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  for (let i = 0; i < allVertices.length; i++) {
    const next = allVertices[(i + 1) % allVertices.length];
    points.push(...linePath(allVertices[i].x, allVertices[i].y, next.x, next.y, 20));
  }
  return points;
}

// Pentagon
function pentagonPath(cx: number, cy: number, r: number): Point[] {
  const vertices: Point[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    vertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  const points: Point[] = [];
  for (let i = 0; i < 5; i++) {
    const next = vertices[(i + 1) % 5];
    points.push(...linePath(vertices[i].x, vertices[i].y, next.x, next.y, 20));
  }
  return points;
}

// Arrow
function arrowPath(cx: number, cy: number, size: number): Point[] {
  const shaftH = size * 0.125;
  const shaftLeft = cx - size * 0.35;
  const shaftRight = shaftLeft + size * 0.5;
  const tipX = cx + size * 0.4;
  const headTop = cy - size * 0.2;
  const headBot = cy + size * 0.2;
  // Trace full arrow outline as one continuous path (no internal edges)
  return [
    ...linePath(shaftLeft, cy - shaftH, shaftRight, cy - shaftH, 20),  // top of shaft
    ...linePath(shaftRight, cy - shaftH, shaftRight, headTop, 10),      // up to head top
    ...linePath(shaftRight, headTop, tipX, cy, 20),                     // top diagonal to tip
    ...linePath(tipX, cy, shaftRight, headBot, 20),                     // tip to bottom diagonal
    ...linePath(shaftRight, headBot, shaftRight, cy + shaftH, 10),      // head bottom to shaft
    ...linePath(shaftRight, cy + shaftH, shaftLeft, cy + shaftH, 20),   // bottom of shaft
    ...linePath(shaftLeft, cy + shaftH, shaftLeft, cy - shaftH, 15),    // left side closes
  ];
}

// Heart
function heartPath(cx: number, cy: number, size: number, steps = 150): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + size * 0.4 * 16 * Math.pow(Math.sin(t), 3) / 16;
    const y = cy - size * 0.4 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
    points.push({ x, y });
  }
  return points;
}

// Evaluate a cubic bezier at parameter t
function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// Evaluate a quadratic bezier at parameter t
function quadBezier(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

// Generate points along a cubic bezier curve
function cubicBezierPath(p0: Point, p1: Point, p2: Point, p3: Point, steps = 30): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(cubicBezier(p0, p1, p2, p3, i / steps));
  }
  return points;
}

// Generate points along a quadratic bezier curve
function quadBezierPath(p0: Point, p1: Point, p2: Point, steps = 20): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(quadBezier(p0, p1, p2, i / steps));
  }
  return points;
}

// Crescent moon — smooth bezier curves matching the SVG reference
function crescentPath(cx: number, cy: number, r: number): Point[] {
  // The SVG viewBox is 400x400 centered at (200,200). Scale to fit radius r.
  const scale = r / 140; // SVG outer radius is ~140 from center
  const ox = cx - 200 * scale;
  const oy = cy - 200 * scale;
  const s = (x: number, y: number): Point => ({ x: ox + x * scale, y: oy + y * scale });

  return [
    // Outer arc: top cusp down-left to bottom cusp
    ...cubicBezierPath(s(200, 60), s(90, 60), s(40, 130), s(40, 200), 40),
    ...cubicBezierPath(s(40, 200), s(40, 270), s(90, 340), s(200, 340), 40),
    // Inner arc: bottom cusp back up to top cusp
    ...cubicBezierPath(s(200, 340), s(140, 310), s(110, 260), s(110, 200), 40),
    ...cubicBezierPath(s(110, 200), s(110, 140), s(140, 90), s(200, 60), 40),
  ];
}

// Diamond
function diamondPath(cx: number, cy: number, w: number, h: number): Point[] {
  return [
    ...linePath(cx, cy - h / 2, cx + w / 2, cy, 25),
    ...linePath(cx + w / 2, cy, cx, cy + h / 2, 25),
    ...linePath(cx, cy + h / 2, cx - w / 2, cy, 25),
    ...linePath(cx - w / 2, cy, cx, cy - h / 2, 25),
  ];
}

// Wave
function wavePath(cx: number, cy: number, width: number, amplitude: number, periods: number, steps = 200): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx - width / 2 + t * width;
    const y = cy + Math.sin(t * Math.PI * 2 * periods) * amplitude;
    points.push({ x, y });
  }
  return points;
}

// Maple leaf — official Canadian flag geometry
function mapleLeafPath(cx: number, cy: number, size: number): Point[] {
  // Vertices from official Canadian flag specification, normalized to 400x400
  const verts: [number, number][] = [
    [192.4,370.0], [196.2,297.2], [186.8,288.9], [114.4,301.7],
    [124.2,274.7], [122.5,268.5], [43.1,204.2], [61.0,195.9],
    [63.8,189.2], [48.1,140.9], [93.9,150.6], [100.0,147.4],
    [108.9,126.6], [144.6,164.9], [153.9,160.1], [136.7,71.3],
    [164.3,87.3], [172.0,85.0], [200.0,30.0], [228.0,85.0],
    [235.7,87.3], [263.3,71.3], [246.1,160.1], [255.4,164.9],
    [291.1,126.6], [300.0,147.4], [306.1,150.6], [351.9,140.9],
    [336.2,189.2], [339.0,195.9], [356.9,204.2], [277.5,268.5],
    [275.8,274.7], [285.6,301.7], [213.2,288.9], [203.8,297.2],
    [207.6,370.0],
  ];

  // Scale and center to fit the requested size
  const scale = size / 400;
  const ox = cx - 200 * scale;
  const oy = cy - 200 * scale;

  const points: Point[] = [];
  for (let i = 0; i < verts.length; i++) {
    const [x1, y1] = verts[i];
    const [x2, y2] = verts[(i + 1) % verts.length];
    points.push(...linePath(ox + x1 * scale, oy + y1 * scale, ox + x2 * scale, oy + y2 * scale, 10));
  }

  return points;
}

// Lightning bolt — closed polygon outline
function lightningPath(cx: number, cy: number, size: number): Point[] {
  const s = size * 0.4;
  // Classic thunderbolt: wide at top, narrows to a point at bottom
  // Vertices traced clockwise from top-left
  return [
    ...linePath(cx - s * 0.35, cy - s * 1.1, cx + s * 0.55, cy - s * 1.1, 10),  // top edge
    ...linePath(cx + s * 0.55, cy - s * 1.1, cx + s * 0.05, cy - s * 0.1, 15),   // right diagonal down
    ...linePath(cx + s * 0.05, cy - s * 0.1, cx + s * 0.45, cy - s * 0.1, 8),    // middle-right step
    ...linePath(cx + s * 0.45, cy - s * 0.1, cx - s * 0.05, cy + s * 1.2, 20),   // right edge to point
    ...linePath(cx - s * 0.05, cy + s * 1.2, cx - s * 0.05, cy + s * 0.15, 12),  // bottom to mid notch
    ...linePath(cx - s * 0.05, cy + s * 0.15, cx - s * 0.4, cy + s * 0.15, 8),   // middle-left step
    ...linePath(cx - s * 0.4, cy + s * 0.15, cx - s * 0.35, cy - s * 1.1, 18),   // left edge back to top
  ];
}

// Cat face — returns separate target shapes to avoid stray connecting lines
function catFaceTargets(cx: number, cy: number, size: number): TargetShape[] {
  const r = size * 0.3;
  const targets: TargetShape[] = [];

  // Head outline with ears as one continuous path
  // Trace clockwise from bottom of head, up left side, left ear, across top, right ear, down right side
  const earL = { bx: cx - r * 0.7, by: cy - r * 0.7, tx: cx - r * 0.45, ty: cy - r * 1.4, ix: cx - r * 0.05, iy: cy - r * 0.95 };
  const earR = { bx: cx + r * 0.7, by: cy - r * 0.7, tx: cx + r * 0.45, ty: cy - r * 1.4, ix: cx + r * 0.05, iy: cy - r * 0.95 };

  // Arc from bottom (270°) counter-clockwise up to left ear base (~225°)
  const headWithEars: Point[] = [];
  // Bottom arc to left ear base
  const leftEarAngle = Math.atan2(earL.by - cy, earL.bx - cx); // ~-2.36 rad
  const rightEarAngle = Math.atan2(earR.by - cy, earR.bx - cx); // ~-0.78 rad
  const rightEarInnerAngle = Math.atan2(earR.iy - cy, earR.ix - cx);
  const leftEarInnerAngle = Math.atan2(earL.iy - cy, earL.ix - cx);

  // Arc: from right ear inner back down around bottom to left ear base
  headWithEars.push(...arcPath(cx, cy, r, rightEarInnerAngle, leftEarAngle + Math.PI * 2, 60));
  // Left ear up
  headWithEars.push(...linePath(earL.bx, earL.by, earL.tx, earL.ty, 12));
  // Left ear down
  headWithEars.push(...linePath(earL.tx, earL.ty, earL.ix, earL.iy, 12));
  // Arc across top between ears
  headWithEars.push(...arcPath(cx, cy, r, leftEarInnerAngle, rightEarAngle, 30));
  // Right ear up
  headWithEars.push(...linePath(earR.bx, earR.by, earR.tx, earR.ty, 12));
  // Right ear down
  headWithEars.push(...linePath(earR.tx, earR.ty, earR.ix, earR.iy, 12));

  targets.push({ type: 'path', points: headWithEars, label: 'reference-only' });

  // Left eye
  targets.push({ type: 'path', points: circlePath(cx - r * 0.35, cy - r * 0.15, r * 0.13, 30), label: 'reference-only' });
  // Right eye
  targets.push({ type: 'path', points: circlePath(cx + r * 0.35, cy - r * 0.15, r * 0.13, 30), label: 'reference-only' });

  // Nose triangle
  const nosePts = [
    ...linePath(cx, cy + r * 0.1, cx - r * 0.09, cy + r * 0.25, 8),
    ...linePath(cx - r * 0.09, cy + r * 0.25, cx + r * 0.09, cy + r * 0.25, 8),
    ...linePath(cx + r * 0.09, cy + r * 0.25, cx, cy + r * 0.1, 8),
  ];
  targets.push({ type: 'path', points: nosePts, label: 'reference-only' });

  // Whiskers (each as its own path)
  targets.push({ type: 'path', points: linePath(cx - r * 0.15, cy + r * 0.18, cx - r * 0.8, cy + r * 0.05, 12), label: 'reference-only' });
  targets.push({ type: 'path', points: linePath(cx - r * 0.15, cy + r * 0.3, cx - r * 0.8, cy + r * 0.35, 12), label: 'reference-only' });
  targets.push({ type: 'path', points: linePath(cx + r * 0.15, cy + r * 0.18, cx + r * 0.8, cy + r * 0.05, 12), label: 'reference-only' });
  targets.push({ type: 'path', points: linePath(cx + r * 0.15, cy + r * 0.3, cx + r * 0.8, cy + r * 0.35, 12), label: 'reference-only' });

  return targets;
}

// Pine tree — single continuous outline: 3 tiered canopy layers + trunk
function treePath(cx: number, cy: number, size: number): Point[] {
  const s = size * 0.35;
  // Layer widths and vertical positions (bottom to top)
  // Each layer: base Y, peak Y, half-width at base, indent where next layer meets
  const trunkHW = s * 0.1;
  const trunkBot = cy + s * 1.0;
  const trunkTop = cy + s * 0.3;

  // Three canopy tiers, each defined by base-y, peak-y, half-width
  const tiers = [
    { baseY: cy + s * 0.35, peakY: cy - s * 0.05, hw: s * 0.35 },  // bottom tier
    { baseY: cy + s * 0.05, peakY: cy - s * 0.4,  hw: s * 0.28 },  // middle tier
    { baseY: cy - s * 0.25, peakY: cy - s * 0.75, hw: s * 0.2 },   // top tier
  ];

  // Trace right side bottom-up, then left side top-down
  // Start at bottom-right of trunk, go clockwise
  return [
    // Trunk right side up
    ...linePath(cx + trunkHW, trunkBot, cx + trunkHW, trunkTop, 8),
    // Bottom tier: right side out, up to peak
    ...linePath(cx + trunkHW, trunkTop, cx + tiers[0].hw, tiers[0].baseY, 8),
    ...linePath(cx + tiers[0].hw, tiers[0].baseY, cx + tiers[1].hw * 0.35, tiers[0].peakY, 12),
    // Middle tier: step out right, up to peak
    ...linePath(cx + tiers[1].hw * 0.35, tiers[0].peakY, cx + tiers[1].hw, tiers[1].baseY, 8),
    ...linePath(cx + tiers[1].hw, tiers[1].baseY, cx + tiers[2].hw * 0.3, tiers[1].peakY, 12),
    // Top tier: step out right, up to tip
    ...linePath(cx + tiers[2].hw * 0.3, tiers[1].peakY, cx + tiers[2].hw, tiers[2].baseY, 8),
    ...linePath(cx + tiers[2].hw, tiers[2].baseY, cx, tiers[2].peakY, 12),
    // Top tier: tip down left side
    ...linePath(cx, tiers[2].peakY, cx - tiers[2].hw, tiers[2].baseY, 12),
    ...linePath(cx - tiers[2].hw, tiers[2].baseY, cx - tiers[2].hw * 0.3, tiers[1].peakY, 8),
    // Middle tier: left side down, step out
    ...linePath(cx - tiers[2].hw * 0.3, tiers[1].peakY, cx - tiers[1].hw, tiers[1].baseY, 12),
    ...linePath(cx - tiers[1].hw, tiers[1].baseY, cx - tiers[1].hw * 0.35, tiers[0].peakY, 8),
    // Bottom tier: left side down, step out
    ...linePath(cx - tiers[1].hw * 0.35, tiers[0].peakY, cx - tiers[0].hw, tiers[0].baseY, 12),
    ...linePath(cx - tiers[0].hw, tiers[0].baseY, cx - trunkHW, trunkTop, 8),
    // Trunk left side down
    ...linePath(cx - trunkHW, trunkTop, cx - trunkHW, trunkBot, 8),
    // Trunk bottom
    ...linePath(cx - trunkHW, trunkBot, cx + trunkHW, trunkBot, 5),
  ];
}

// Music note — head centered at cx, stem at right edge of head
// Hexagon
function hexagonPath(cx: number, cy: number, r: number): Point[] {
  const vertices: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6 - Math.PI / 6;
    vertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  const points: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const next = vertices[(i + 1) % 6];
    points.push(...linePath(vertices[i].x, vertices[i].y, next.x, next.y, 20));
  }
  return points;
}

// Concentric circles
function concentricCircles(cx: number, cy: number, maxR: number, count: number): TargetShape[] {
  const shapes: TargetShape[] = [];
  for (let i = 1; i <= count; i++) {
    shapes.push({
      type: 'path',
      points: circlePath(cx, cy, (i / count) * maxR),
    });
  }
  return shapes;
}

// Cross / plus sign — single continuous 12-sided outline
function crossPath(cx: number, cy: number, size: number): Point[] {
  const arm = size / 2;    // half the total span
  const t = size / 6;      // half the arm thickness
  // 12 vertices clockwise from top-left of the top arm
  return [
    ...linePath(cx - t, cy - arm, cx + t, cy - arm, 8),  // top edge
    ...linePath(cx + t, cy - arm, cx + t, cy - t, 8),    // right side of top arm
    ...linePath(cx + t, cy - t, cx + arm, cy - t, 8),    // top of right arm
    ...linePath(cx + arm, cy - t, cx + arm, cy + t, 8),  // right edge
    ...linePath(cx + arm, cy + t, cx + t, cy + t, 8),    // bottom of right arm
    ...linePath(cx + t, cy + t, cx + t, cy + arm, 8),    // left side of bottom arm
    ...linePath(cx + t, cy + arm, cx - t, cy + arm, 8),  // bottom edge
    ...linePath(cx - t, cy + arm, cx - t, cy + t, 8),    // left side of bottom arm
    ...linePath(cx - t, cy + t, cx - arm, cy + t, 8),    // bottom of left arm
    ...linePath(cx - arm, cy + t, cx - arm, cy - t, 8),  // left edge
    ...linePath(cx - arm, cy - t, cx - t, cy - t, 8),    // top of left arm
    ...linePath(cx - t, cy - t, cx - t, cy - arm, 8),    // right side of top arm (closes)
  ];
}

// ── STAGE 1: Basic Shapes & Lines ──

const stage1Exercises: Exercise[] = [
  {
    id: 's1-scribble-warmup',
    stage: 1,
    name: 'Scribble Warm-up',
    description: 'Loosen up! Fill the canvas with circular scribbles — speed matters more than accuracy',
    type: 'freeform',
    accuracyThreshold: 1,
    targetGenerator: (w, h) => {
      // Large loose circles scattered across canvas as targets
      const shapes: TargetShape[] = [];
      const r = Math.min(w, h) * 0.12;
      const positions = [
        { x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 },
        { x: 0.5, y: 0.5 },
        { x: 0.3, y: 0.7 }, { x: 0.7, y: 0.7 },
      ];
      for (const p of positions) {
        shapes.push({ type: 'path', points: circlePath(w * p.x, h * p.y, r, 30) });
      }
      return shapes;
    },
  },
  {
    id: 's1-line-control',
    stage: 1,
    name: 'Line Control',
    description: 'Draw 5 horizontal lines getting progressively closer together',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const x1 = w * 0.15;
      const x2 = w * 0.85;
      // Lines with decreasing gaps: 0.15, 0.12, 0.09, 0.06, 0.03 of h
      const gaps = [0.15, 0.12, 0.09, 0.06, 0.03];
      let y = h * 0.15;
      for (const gap of gaps) {
        shapes.push({ type: 'path', points: linePath(x1, y, x2, y) });
        y += h * gap;
      }
      return shapes;
    },
  },
  {
    id: 's1-horizontal-line',
    stage: 1,
    name: 'Horizontal Line',
    description: 'Draw a straight horizontal line from left to right',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: linePath(w * 0.2, h * 0.5, w * 0.8, h * 0.5),
    }],
  },
  {
    id: 's1-vertical-line',
    stage: 1,
    name: 'Vertical Line',
    description: 'Draw a straight vertical line from top to bottom',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: linePath(w * 0.5, h * 0.2, w * 0.5, h * 0.8),
    }],
  },
  {
    id: 's1-diagonal-line',
    stage: 1,
    name: 'Diagonal Line',
    description: 'Draw a diagonal line from top-left to bottom-right',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: linePath(w * 0.2, h * 0.2, w * 0.8, h * 0.8),
    }],
  },
  {
    id: 's1-circle',
    stage: 1,
    name: 'Circle',
    description: 'Draw a circle following the guide',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: circlePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.25),
    }],
  },
  {
    id: 's1-ellipse',
    stage: 1,
    name: 'Ellipse',
    description: 'Draw an ellipse (oval) — wider than it is tall',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: ellipsePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, Math.min(w, h) * 0.18),
    }],
  },
  {
    id: 's1-square',
    stage: 1,
    name: 'Square',
    description: 'Draw a square following the guide',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const size = Math.min(w, h) * 0.4;
      return [{
        type: 'path',
        points: rectPath(w * 0.5 - size / 2, h * 0.5 - size / 2, size, size),
      }];
    },
  },
  {
    id: 's1-triangle',
    stage: 1,
    name: 'Triangle',
    description: 'Draw an equilateral triangle',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: trianglePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.4),
    }],
  },
  {
    id: 's1-diamond',
    stage: 1,
    name: 'Diamond',
    description: 'Draw a diamond (rotated square)',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.35;
      return [{ type: 'path', points: diamondPath(w * 0.5, h * 0.5, s, s * 1.3) }];
    },
  },
  {
    id: 's1-cross',
    stage: 1,
    name: 'Cross',
    description: 'Draw a plus sign — one horizontal and one vertical line through the center',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: crossPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.5),
    }],
  },
];

// ── STAGE 2: Curves & Combinations ──

const stage2Exercises: Exercise[] = [
  {
    id: 's2-s-curve',
    stage: 2,
    name: 'S-Curve',
    description: 'Draw a smooth S-curve',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: sCurvePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.6),
    }],
  },
  {
    id: 's2-arc',
    stage: 2,
    name: 'Arc',
    description: 'Draw a smooth arc',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: arcPath(w * 0.5, h * 0.6, Math.min(w, h) * 0.3, Math.PI, 0),
    }],
  },
  {
    id: 's2-spiral',
    stage: 2,
    name: 'Spiral',
    description: 'Draw a spiral from center outward',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: spiralPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.3),
    }],
  },
  {
    id: 's2-figure8',
    stage: 2,
    name: 'Figure 8',
    description: 'Draw a figure-8 (infinity symbol)',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: figure8Path(w * 0.5, h * 0.5, Math.min(w, h) * 0.6),
    }],
  },
  {
    id: 's2-star',
    stage: 2,
    name: 'Star',
    description: 'Draw a 5-pointed star',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.25;
      return [{
        type: 'path',
        points: starPath(w * 0.5, h * 0.5, r, r * 0.4),
      }];
    },
  },
  {
    id: 's2-pentagon',
    stage: 2,
    name: 'Pentagon',
    description: 'Draw a regular pentagon',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: pentagonPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.25),
    }],
  },
  {
    id: 's2-arrow',
    stage: 2,
    name: 'Arrow',
    description: 'Draw an arrow pointing right',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: arrowPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.5),
    }],
  },
  {
    id: 's2-heart',
    stage: 2,
    name: 'Heart',
    description: 'Draw a heart shape',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: heartPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.7),
    }],
  },
  {
    id: 's2-wave',
    stage: 2,
    name: 'Wave',
    description: 'Draw a smooth wave with 3 peaks',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: wavePath(w * 0.5, h * 0.5, w * 0.6, h * 0.15, 3),
    }],
  },
  {
    id: 's2-hexagon',
    stage: 2,
    name: 'Hexagon',
    description: 'Draw a regular hexagon',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: hexagonPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.25),
    }],
  },
  {
    id: 's2-crescent',
    stage: 2,
    name: 'Crescent Moon',
    description: 'Draw a crescent moon shape',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: crescentPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.25),
    }],
  },
  {
    id: 's2-maple-leaf',
    stage: 2,
    name: 'Maple Leaf',
    description: 'Draw a maple leaf with its distinctive lobed shape and center vein',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: mapleLeafPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.7),
    }],
  },
];

// ── STAGE 3: Proportion & Spacing ──

const stage3Exercises: Exercise[] = [
  {
    id: 's3-parallel-lines',
    stage: 3,
    name: 'Parallel Lines',
    description: 'Draw two horizontal lines at equal spacing from center',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [
      { type: 'path', points: linePath(w * 0.2, h * 0.4, w * 0.8, h * 0.4) },
      { type: 'path', points: linePath(w * 0.2, h * 0.6, w * 0.8, h * 0.6) },
    ],
  },
  {
    id: 's3-grid',
    stage: 3,
    name: 'Simple Grid',
    description: 'Draw a 3x3 grid of evenly spaced lines',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const margin = 0.25;
      // Horizontal lines
      for (let i = 0; i < 4; i++) {
        const y = h * (margin + (i / 3) * (1 - 2 * margin));
        shapes.push({ type: 'path', points: linePath(w * margin, y, w * (1 - margin), y) });
      }
      // Vertical lines
      for (let i = 0; i < 4; i++) {
        const x = w * (margin + (i / 3) * (1 - 2 * margin));
        shapes.push({ type: 'path', points: linePath(x, h * margin, x, h * (1 - margin)) });
      }
      return shapes;
    },
  },
  {
    id: 's3-evenly-spaced-dots',
    stage: 3,
    name: 'Evenly Spaced Dots',
    description: 'Place dots at evenly spaced positions along the guide',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const dots: Point[] = [];
      for (let i = 0; i < 7; i++) {
        dots.push({ x: w * (0.15 + (i / 6) * 0.7), y: h * 0.5 });
      }
      return [{ type: 'dots', dots }];
    },
  },
  {
    id: 's3-equal-division',
    stage: 3,
    name: 'Equal Division',
    description: 'Divide the line into equal thirds by placing dots at the 1/3 and 2/3 marks',
    type: 'proportion',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      // Reference line
      const linePoints = linePath(w * 0.15, h * 0.5, w * 0.85, h * 0.5, 50);
      // Target dots at 1/3 and 2/3 positions
      const lineLen = w * 0.7;
      const startX = w * 0.15;
      const dots: Point[] = [
        { x: startX + lineLen / 3, y: h * 0.5 },
        { x: startX + (lineLen * 2) / 3, y: h * 0.5 },
      ];
      return [
        { type: 'path', points: linePoints, label: 'reference' as const },
        { type: 'dots', dots, label: 'target' as const },
      ];
    },
  },
  {
    id: 's3-mirror-triangle',
    stage: 3,
    name: 'Mirror Triangle',
    description: 'A triangle is shown on the left. Draw its flipped reflection on the right side of the center line.',
    type: 'proportion',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const size = Math.min(w, h) * 0.25;
      // Left triangle (shown as reference)
      const leftPoints = trianglePath(w * 0.3, h * 0.5, size);
      // Right triangle (target to draw)
      const rightPoints = leftPoints.map(p => ({
        x: w - p.x,
        y: p.y,
      }));
      return [
        { type: 'path', points: leftPoints, label: 'reference' },
        { type: 'path', points: rightPoints, label: 'target' },
      ];
    },
  },
  {
    id: 's3-mirror-circle',
    stage: 3,
    name: 'Mirror Circle',
    description: 'A circle is shown on the left. Draw a matching circle at the same height on the right side of the center line.',
    type: 'proportion',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.12;
      return [
        { type: 'path', points: circlePath(w * 0.3, h * 0.5, r), label: 'reference' },
        { type: 'path', points: circlePath(w * 0.7, h * 0.5, r), label: 'target' },
      ];
    },
  },
  {
    id: 's3-concentric-circles',
    stage: 3,
    name: 'Concentric Circles',
    description: 'Draw 3 circles nested inside each other, evenly spaced',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => concentricCircles(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, 3),
  },
  {
    id: 's3-mirror-star',
    stage: 3,
    name: 'Mirror Star',
    description: 'A star is shown on the left. Draw its mirror image on the right side of the center line.',
    type: 'proportion',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.15;
      const leftPoints = starPath(w * 0.3, h * 0.5, r, r * 0.4);
      const rightPoints = leftPoints.map(p => ({ x: w - p.x, y: p.y }));
      return [
        { type: 'path', points: leftPoints, label: 'reference' },
        { type: 'path', points: rightPoints, label: 'target' },
      ];
    },
  },
  {
    id: 's3-size-scaling',
    stage: 3,
    name: 'Size Scaling',
    description: 'Draw 3 circles in a row, each one larger than the last',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const base = Math.min(w, h) * 0.06;
      return [
        { type: 'path', points: circlePath(w * 0.25, h * 0.5, base) },
        { type: 'path', points: circlePath(w * 0.5, h * 0.5, base * 1.8) },
        { type: 'path', points: circlePath(w * 0.75, h * 0.5, base * 2.6) },
      ];
    },
  },
  {
    id: 's3-negative-space',
    stage: 3,
    name: 'Negative Space',
    description: 'Draw the crescent-shaped space between two overlapping circles',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const r = Math.min(w, h) * 0.22;
      const cx = w * 0.5, cy = h * 0.5;
      const offset = r * 0.6; // overlap amount

      // Left circle (reference context)
      shapes.push({ type: 'path', points: circlePath(cx - offset, cy, r, 40) });
      // Right circle (reference context)
      shapes.push({ type: 'path', points: circlePath(cx + offset, cy, r, 40) });

      // The crescent: right arc of the left circle that's outside the right circle
      // This is the negative space between them on the left side
      const crescent: Point[] = [];
      for (let i = 0; i <= 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const px = cx - offset + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        // Only include points that are outside the right circle
        const distToRight = Math.sqrt((px - (cx + offset)) ** 2 + (py - cy) ** 2);
        if (distToRight > r) {
          crescent.push({ x: px, y: py });
        }
      }
      if (crescent.length > 2) {
        shapes.push({ type: 'path', points: crescent });
      }
      return shapes;
    },
  },
];

// ── STAGE 5: Freeform Challenges ──

const freeformExercises: Exercise[] = [
  {
    id: 's5-house',
    stage: 5,
    name: 'Draw a House',
    description: 'Draw a simple house shape (square + triangle roof) from memory',
    type: 'freeform',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const size = Math.min(w, h) * 0.3;
      const cx = w * 0.5;
      const baseY = h * 0.65;
      return [
        // Square body
        { type: 'path', points: rectPath(cx - size / 2, baseY - size, size, size) },
        // Triangle roof (continuous V)
        { type: 'path', points: [
          ...linePath(cx - size / 2 - size * 0.1, baseY - size, cx, baseY - size * 1.6, 25),
          ...linePath(cx, baseY - size * 1.6, cx + size / 2 + size * 0.1, baseY - size, 25),
        ] },
      ];
    },
  },
  {
    id: 's5-timed-circles',
    stage: 5,
    name: 'Speed Circles',
    description: 'Draw 5 circles as fast as you can in 30 seconds',
    type: 'timed',
    timeLimit: 30,
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.08;
      const shapes: TargetShape[] = [];
      for (let i = 0; i < 5; i++) {
        shapes.push({
          type: 'path',
          points: circlePath(w * (0.15 + i * 0.175), h * 0.5, r),
        });
      }
      return shapes;
    },
  },
  {
    id: 's5-timed-lines',
    stage: 5,
    name: 'Speed Lines',
    description: 'Draw 8 straight lines as fast as you can in 20 seconds',
    type: 'timed',
    timeLimit: 20,
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      for (let i = 0; i < 8; i++) {
        const y = h * (0.15 + (i / 7) * 0.7);
        shapes.push({ type: 'path', points: linePath(w * 0.2, y, w * 0.8, y) });
      }
      return shapes;
    },
  },
  {
    id: 's5-blind-contour',
    stage: 5,
    name: 'Memory Star',
    description: 'Memorize the shape for 5 seconds, then draw it from memory (shape will hide)',
    type: 'blind',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.2;
      return [{
        type: 'path',
        points: starPath(w * 0.5, h * 0.5, r, r * 0.4),
      }];
    },
  },
  {
    id: 's5-blind-spiral',
    stage: 5,
    name: 'Memory Spiral',
    description: 'Memorize the spiral for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: spiralPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.25, 2),
    }],
  },
  {
    id: 's5-cat-face',
    stage: 5,
    name: 'Cat Face',
    description: 'Draw a cat face with ears, eyes, nose, and whiskers',
    type: 'freeform',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => catFaceTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's5-tree',
    stage: 5,
    name: 'Pine Tree',
    description: 'Draw a pine tree — trunk with 3 layered triangle branches',
    type: 'freeform',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: treePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
      label: 'reference-only',
    }],
  },
  {
    id: 's5-lightning',
    stage: 5,
    name: 'Lightning Bolt',
    description: 'Draw a jagged lightning bolt from top to bottom',
    type: 'freeform',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: lightningPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
      label: 'reference-only',
    }],
  },
  {
    id: 's5-blind-heart',
    stage: 5,
    name: 'Memory Heart',
    description: 'Memorize the heart for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: heartPath(w * 0.5, h * 0.5, Math.min(w, h) * 0.7),
    }],
  },
  {
    id: 's5-speed-shapes',
    stage: 5,
    name: 'Speed Shapes',
    description: 'Draw a circle, square, and triangle in 25 seconds',
    type: 'timed',
    timeLimit: 25,
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.12;
      return [
        { type: 'path', points: circlePath(w * 0.2, h * 0.5, s) },
        { type: 'path', points: rectPath(w * 0.5 - s, h * 0.5 - s, s * 2, s * 2) },
        { type: 'path', points: trianglePath(w * 0.8, h * 0.5, s * 2) },
      ];
    },
  },
];

// ── STAGE 4: Perspective & Construction ──

// Ellipse path (circle squished on Y axis)
function ellipsePath(cx: number, cy: number, rx: number, ry: number, steps = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry });
  }
  return points;
}

const perspectiveExercises: Exercise[] = [
  {
    id: 's4-converging-lines',
    stage: 4,
    name: 'Converging Lines',
    description: 'Draw lines that converge to the vanishing point on the right',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const vpX = w * 0.9;
      const vpY = h * 0.5;
      const shapes: TargetShape[] = [];
      const origins = [0.15, 0.3, 0.5, 0.7, 0.85];
      for (const oy of origins) {
        shapes.push({
          type: 'path',
          points: linePath(w * 0.1, h * oy, vpX, vpY),
        });
      }
      return shapes;
    },
  },
  {
    id: 's4-box-perspective',
    stage: 4,
    name: 'Box in Perspective',
    description: 'Draw a box with edges converging toward one vanishing point',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const vpX = w * 0.85;
      const vpY = h * 0.35;
      const fx = w * 0.2;
      const fy = h * 0.35;
      const fs = Math.min(w, h) * 0.25;
      const d = 0.35; // depth ratio toward VP
      // Back face corners
      const btl = { x: fx + (vpX - fx) * d, y: fy + (vpY - fy) * d };
      const btr = { x: fx + fs + (vpX - fx - fs) * d, y: fy + (vpY - fy) * d };
      const bbr = { x: fx + fs + (vpX - fx - fs) * d, y: fy + fs + (vpY - fy - fs) * d };
      // Front face as separate target
      const front = [
        ...linePath(fx, fy, fx + fs, fy, 15),
        ...linePath(fx + fs, fy, fx + fs, fy + fs, 15),
        ...linePath(fx + fs, fy + fs, fx, fy + fs, 15),
        ...linePath(fx, fy + fs, fx, fy, 15),
      ];
      // Receding edges + back face as one continuous path
      // Trace: top-left receding, across back top, down back right, forward to front, up to front top-right, recede to back top-right (closes)
      const depth = [
        ...linePath(fx, fy, btl.x, btl.y, 12),
        ...linePath(btl.x, btl.y, btr.x, btr.y, 12),
        ...linePath(btr.x, btr.y, bbr.x, bbr.y, 12),
        ...linePath(bbr.x, bbr.y, fx + fs, fy + fs, 12),
      ];
      // Top-right receding edge (separate to avoid stray line)
      const recedeRight = linePath(fx + fs, fy, btr.x, btr.y, 12);
      return [
        { type: 'path', points: front },
        { type: 'path', points: depth },
        { type: 'path', points: recedeRight },
      ];
    },
  },
  {
    id: 's4-cylinder',
    stage: 4,
    name: 'Cylinder',
    description: 'Draw a cylinder — use the center axis as a guide, then draw two ellipses connected by vertical lines',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const cx = w * 0.5;
      const rx = Math.min(w, h) * 0.15;
      const ry = rx * 0.35;
      const topY = h * 0.3;
      const botY = h * 0.7;
      // Each part as a separate target to avoid stray connecting lines
      const topEllipse = ellipsePath(cx, topY, rx, ry);
      const botEllipse = ellipsePath(cx, botY, rx, ry);
      const leftSide = linePath(cx - rx, topY, cx - rx, botY, 30);
      const rightSide = linePath(cx + rx, topY, cx + rx, botY, 30);
      const axis = linePath(cx, topY - ry * 2, cx, botY + ry * 2, 20);
      return [
        { type: 'path', points: topEllipse },
        { type: 'path', points: botEllipse },
        { type: 'path', points: leftSide },
        { type: 'path', points: rightSide },
        { type: 'path', points: axis, label: 'reference' },
      ];
    },
  },
  {
    id: 's4-horizon-depth',
    stage: 4,
    name: 'Horizon & Depth',
    description: 'Draw 3 circles decreasing in size toward the horizon line to create depth',
    type: 'proportion',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      // Horizon line as reference
      const horizonY = h * 0.4;
      const refPoints = linePath(w * 0.1, horizonY, w * 0.9, horizonY);
      // Three circles getting smaller toward horizon
      const c1 = circlePath(w * 0.25, h * 0.7, Math.min(w, h) * 0.1);
      const c2 = circlePath(w * 0.5, h * 0.55, Math.min(w, h) * 0.065);
      const c3 = circlePath(w * 0.7, h * 0.45, Math.min(w, h) * 0.035);
      return [
        { type: 'path', points: refPoints, label: 'reference' },
        { type: 'path', points: c1, label: 'target' },
        { type: 'path', points: c2, label: 'target' },
        { type: 'path', points: c3, label: 'target' },
      ];
    },
  },
  {
    id: 's4-ellipse-perspective',
    stage: 4,
    name: 'Ellipses in Perspective',
    description: 'Draw three ellipses at different tilts — narrower means more tilted away from you',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const cx = w * 0.5;
      const rx = Math.min(w, h) * 0.18;
      const shapes: TargetShape[] = [];
      // Wide ellipse (facing us)
      shapes.push({ type: 'path', points: ellipsePath(cx, h * 0.25, rx, rx * 0.6) });
      // Medium ellipse (angled)
      shapes.push({ type: 'path', points: ellipsePath(cx, h * 0.5, rx, rx * 0.3) });
      // Narrow ellipse (nearly edge-on)
      shapes.push({ type: 'path', points: ellipsePath(cx, h * 0.75, rx, rx * 0.1) });
      return shapes;
    },
  },
  {
    id: 's4-cube-construction',
    stage: 4,
    name: 'Cube Construction',
    description: 'Draw a cube with construction lines — diagonals help find the center of each face',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.25;
      const cx = w * 0.5, cy = h * 0.5;
      const off = s * 0.4; // isometric offset
      const fl = cx - s * 0.5, ft = cy - s * 0.3, fr = cx + s * 0.5, fb = cy + s * 0.5;
      // Cube as single continuous outline: front face, then top face edges, then right face edges
      // Trace the visible outline as one path (no overlapping shared edges)
      const outline = [
        // Bottom of front face
        ...linePath(fl, fb, fr, fb, 12),
        // Right side of front face up
        ...linePath(fr, fb, fr, ft, 12),
        // Top of front face left
        ...linePath(fr, ft, fl, ft, 12),
        // Left side of front face down (closes front)
        ...linePath(fl, ft, fl, fb, 12),
        // Top face: front-left up to back-left
        ...linePath(fl, ft, fl + off, ft - off, 10),
        // Back top edge
        ...linePath(fl + off, ft - off, fr + off, ft - off, 10),
        // Back-right down to front-right (closes top)
        ...linePath(fr + off, ft - off, fr, ft, 10),
      ];
      // Right face (shares top-right corner, separate to avoid retrace stray)
      const rightFace = [
        ...linePath(fr + off, ft - off, fr + off, fb - off, 10),
        ...linePath(fr + off, fb - off, fr, fb, 10),
      ];
      // Construction diagonals on front face (reference only)
      const diag1 = linePath(fl, ft, fr, fb, 10);
      const diag2 = linePath(fr, ft, fl, fb, 10);
      return [
        { type: 'path', points: outline },
        { type: 'path', points: rightFace },
        { type: 'path', points: diag1, label: 'reference' as const },
        { type: 'path', points: diag2, label: 'reference' as const },
      ];
    },
  },
  {
    id: 's4-timed-boxes',
    stage: 4,
    name: 'Speed Perspective Boxes',
    description: 'Draw 3 simple perspective boxes as quickly as you can — 30 seconds!',
    type: 'timed',
    accuracyThreshold: 75,
    timeLimit: 30,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const positions = [
        { x: w * 0.2, y: h * 0.5 },
        { x: w * 0.5, y: h * 0.5 },
        { x: w * 0.8, y: h * 0.5 },
      ];
      const s = Math.min(w, h) * 0.12;
      const off = s * 0.35;
      for (const pos of positions) {
        const l = pos.x - s * 0.5, t = pos.y - s * 0.5;
        const r = pos.x + s * 0.5, b = pos.y + s * 0.5;
        // Front face as continuous rectangle
        const front = [
          ...linePath(l, t, r, t, 8),
          ...linePath(r, t, r, b, 8),
          ...linePath(r, b, l, b, 8),
          ...linePath(l, b, l, t, 8),
        ];
        // Top face: continuous path from front-left corner
        const topFace = [
          ...linePath(l, t, l + off, t - off, 6),
          ...linePath(l + off, t - off, r + off, t - off, 6),
          ...linePath(r + off, t - off, r, t, 6),
        ];
        // Right face: continuous path from top-right back corner
        const rightFace = [
          ...linePath(r + off, t - off, r + off, b - off, 6),
          ...linePath(r + off, b - off, r, b, 6),
        ];
        shapes.push({ type: 'path', points: front });
        shapes.push({ type: 'path', points: topFace });
        shapes.push({ type: 'path', points: rightFace });
      }
      return shapes;
    },
  },
];

// ── STAGE 6: Organic Forms & Gesture ──

// Kidney bean: landscape orientation, convex bottom, concave hilum notch on top
function kidneyBeanPath(cx: number, cy: number, size: number): Point[] {
  const sw = size * 0.55; // half-width (wider than tall)
  const sh = size * 0.32; // half-height
  return [
    // Left (fat) end — broad rounded cap
    ...cubicBezierPath(
      { x: cx - sw * 0.75, y: cy - sh * 0.5 },
      { x: cx - sw * 1.2, y: cy - sh * 0.3 },
      { x: cx - sw * 1.2, y: cy + sh * 0.8 },
      { x: cx - sw * 0.6, y: cy + sh * 1.0 },
      25,
    ),
    // Bottom convex sweep — large arc from left to right
    ...cubicBezierPath(
      { x: cx - sw * 0.6, y: cy + sh * 1.0 },
      { x: cx - sw * 0.1, y: cy + sh * 1.15 },
      { x: cx + sw * 0.4, y: cy + sh * 1.1 },
      { x: cx + sw * 0.75, y: cy + sh * 0.75 },
      30,
    ),
    // Right (narrow) end — tighter rounded cap
    ...cubicBezierPath(
      { x: cx + sw * 0.75, y: cy + sh * 0.75 },
      { x: cx + sw * 1.1, y: cy + sh * 0.3 },
      { x: cx + sw * 1.05, y: cy - sh * 0.6 },
      { x: cx + sw * 0.6, y: cy - sh * 0.75 },
      25,
    ),
    // Top right hump (smaller lobe to the right of hilum)
    ...cubicBezierPath(
      { x: cx + sw * 0.6, y: cy - sh * 0.75 },
      { x: cx + sw * 0.3, y: cy - sh * 0.85 },
      { x: cx + sw * 0.15, y: cy - sh * 0.7 },
      { x: cx + sw * 0.05, y: cy - sh * 0.35 },
      20,
    ),
    // Hilum notch — concave dip inward
    ...cubicBezierPath(
      { x: cx + sw * 0.05, y: cy - sh * 0.35 },
      { x: cx - sw * 0.05, y: cy + sh * 0.05 },
      { x: cx - sw * 0.25, y: cy - sh * 0.1 },
      { x: cx - sw * 0.35, y: cy - sh * 0.45 },
      20,
    ),
    // Top left hump (larger lobe to the left of hilum)
    ...cubicBezierPath(
      { x: cx - sw * 0.35, y: cy - sh * 0.45 },
      { x: cx - sw * 0.45, y: cy - sh * 0.8 },
      { x: cx - sw * 0.65, y: cy - sh * 0.85 },
      { x: cx - sw * 0.75, y: cy - sh * 0.5 },
      20,
    ),
  ];
}

// Leaf outline (simple organic shape — not the maple leaf)
// Returns only the outline; vein must be a separate target
function simpleLeafPath(cx: number, cy: number, size: number, steps = 80): Point[] {
  const points: Point[] = [];
  const h = size * 0.5;
  const w = size * 0.18;
  // Right side (tip at top, base at bottom)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = cy - h + t * h * 2;
    const bulge = Math.sin(t * Math.PI);
    const x = cx + bulge * w;
    points.push({ x, y });
  }
  // Left side (back up)
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const y = cy - h + t * h * 2;
    const bulge = Math.sin(t * Math.PI);
    const x = cx - bulge * w;
    points.push({ x, y });
  }
  return points;
}

// Leaf center vein as separate path
function simpleLeafVein(cx: number, cy: number, size: number): Point[] {
  const h = size * 0.5;
  return linePath(cx, cy - h, cx, cy + h, 30);
}

// Egg outline (slightly narrower at top)
function eggOutlinePath(cx: number, cy: number, size: number): Point[] {
  const ry = size * 0.35;
  const rx = size * 0.22;
  const points: Point[] = [];
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    const topBias = 1 - 0.2 * Math.max(0, -Math.sin(angle));
    points.push({
      x: cx + Math.cos(angle) * rx * topBias,
      y: cy + Math.sin(angle) * ry,
    });
  }
  return points;
}

// Cross-contour lines for egg (returns separate targets)
function eggContourTargets(cx: number, cy: number, size: number): TargetShape[] {
  const ry = size * 0.35;
  const rx = size * 0.22;
  const targets: TargetShape[] = [];
  targets.push({ type: 'path', points: eggOutlinePath(cx, cy, size) });
  for (let j = 1; j <= 4; j++) {
    const t = j / 5;
    const y = cy - ry + t * ry * 2;
    const frac = 1 - ((y - cy) / ry) ** 2;
    if (frac <= 0) continue;
    const halfW = Math.sqrt(frac) * rx * (1 - 0.1 * Math.max(0, -(y - cy) / ry));
    const curvePoints: Point[] = [];
    for (let i = 0; i <= 20; i++) {
      const lt = i / 20;
      const lx = cx - halfW + lt * halfW * 2;
      const curveY = y - Math.sin(lt * Math.PI) * size * 0.03;
      curvePoints.push({ x: lx, y: curveY });
    }
    targets.push({ type: 'path', points: curvePoints });
  }
  return targets;
}

// Simple face outline for blind exercise — returns separate targets
function faceOutlineTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const targets: TargetShape[] = [];
  // Head oval
  targets.push({ type: 'path', points: ellipsePath(cx, cy, s * 0.7, s) });
  // Left eye
  targets.push({ type: 'path', points: ellipsePath(cx - s * 0.28, cy - s * 0.2, s * 0.1, s * 0.06) });
  // Right eye
  targets.push({ type: 'path', points: ellipsePath(cx + s * 0.28, cy - s * 0.2, s * 0.1, s * 0.06) });
  // Nose
  targets.push({ type: 'path', points: linePath(cx, cy - s * 0.05, cx, cy + s * 0.12, 10) });
  // Mouth arc
  const mouth: Point[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const angle = Math.PI * 0.2 + t * Math.PI * 0.6;
    mouth.push({
      x: cx + Math.cos(angle) * s * 0.25,
      y: cy + s * 0.35 + Math.sin(angle) * s * 0.08,
    });
  }
  targets.push({ type: 'path', points: mouth });
  return targets;
}

const stage6Exercises: Exercise[] = [
  {
    id: 's6-leaf',
    stage: 6,
    name: 'Leaf Shape',
    description: 'Draw a smooth organic leaf with a center vein',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.7;
      return [
        { type: 'path', points: simpleLeafPath(w * 0.5, h * 0.5, s) },
        { type: 'path', points: simpleLeafVein(w * 0.5, h * 0.5, s) },
      ];
    },
  },
  {
    id: 's6-gesture-wave',
    stage: 6,
    name: 'Gesture Wave',
    description: 'Draw a flowing wave with varying amplitude in 20 seconds',
    type: 'timed',
    timeLimit: 20,
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const points: Point[] = [];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const x = w * 0.1 + t * w * 0.8;
        const amp = h * 0.12 * (1 + Math.sin(t * Math.PI));
        const y = h * 0.5 + Math.sin(t * Math.PI * 5) * amp;
        points.push({ x, y });
      }
      return [{ type: 'path', points }];
    },
  },
  {
    id: 's6-cross-contour-egg',
    stage: 6,
    name: 'Cross-Contour Egg',
    description: 'Draw an egg with horizontal cross-contour lines to suggest volume',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => eggContourTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's6-blind-face',
    stage: 6,
    name: 'Memory Face',
    description: 'Memorize the face outline for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => faceOutlineTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
  },
  {
    id: 's6-vine',
    stage: 6,
    name: 'Flowing Vine',
    description: 'Draw a curving vine with small leaves branching off at intervals',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const cx = w * 0.5, cy = h * 0.5;
      const size = Math.min(w, h) * 0.8;
      const targets: TargetShape[] = [];
      // Main S-curve vine
      const vine: Point[] = [];
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = cx - size * 0.4 + size * 0.8 * t;
        const y = cy + Math.sin(t * Math.PI * 2.5) * size * 0.12;
        vine.push({ x, y });
      }
      targets.push({ type: 'path', points: vine });
      // Small teardrop leaves at intervals — each as a closed outline
      const leafSize = size * 0.06;
      const leafLen = size * 0.09;
      for (let k = 0; k < 5; k++) {
        const t = (k + 1) / 6;
        const bx = cx - size * 0.4 + size * 0.8 * t;
        const by = cy + Math.sin(t * Math.PI * 2.5) * size * 0.12;
        const dir = k % 2 === 0 ? -1 : 1;
        // Vine tangent angle at this point for leaf orientation
        const dt = 0.01;
        const nextX = cx - size * 0.4 + size * 0.8 * (t + dt);
        const nextY = cy + Math.sin((t + dt) * Math.PI * 2.5) * size * 0.12;
        const tangentAngle = Math.atan2(nextY - by, nextX - bx);
        // Leaf points away from vine at ~60 degrees
        const leafAngle = tangentAngle + dir * Math.PI * 0.4;
        const tipX = bx + Math.cos(leafAngle) * leafLen;
        const tipY = by + Math.sin(leafAngle) * leafLen;
        // Perpendicular for leaf width
        const perpX = Math.cos(leafAngle + Math.PI / 2) * leafSize;
        const perpY = Math.sin(leafAngle + Math.PI / 2) * leafSize;
        // Leaf outline: base -> right bulge -> tip -> left bulge -> base
        const midX = (bx + tipX) / 2;
        const midY = (by + tipY) / 2;
        const leaf = [
          ...quadBezierPath(
            { x: bx, y: by },
            { x: midX + perpX, y: midY + perpY },
            { x: tipX, y: tipY },
            12
          ),
          ...quadBezierPath(
            { x: tipX, y: tipY },
            { x: midX - perpX, y: midY - perpY },
            { x: bx, y: by },
            12
          ),
        ];
        targets.push({ type: 'path', points: leaf });
      }
      return targets;
    },
  },
  {
    id: 's6-bean',
    stage: 6,
    name: 'Bean Shape',
    description: 'Draw a bean (kidney) shape — a fundamental form used in figure drawing and character design',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const cx = w * 0.5, cy = h * 0.5;
      const s = Math.min(w, h) * 0.4;
      return [{ type: 'path', points: kidneyBeanPath(cx, cy, s) }];
    },
  },
  {
    id: 's6-timed-organic',
    stage: 6,
    name: 'Speed Organic Forms',
    description: 'Draw a leaf, an egg, and a bean shape as quickly as you can — 20 seconds!',
    type: 'timed',
    accuracyThreshold: 75,
    timeLimit: 20,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.55;
      return [
        { type: 'path', points: simpleLeafPath(w * 0.2, h * 0.5, s) },
        { type: 'path', points: eggOutlinePath(w * 0.5, h * 0.5, s) },
        { type: 'path', points: kidneyBeanPath(w * 0.8, h * 0.5, s * 0.5) },
      ];
    },
  },
  {
    id: 's6-freeform-flower',
    stage: 6,
    name: 'Draw a Flower',
    description: 'Draw a flower from imagination — stem, leaves, and petals',
    type: 'freeform',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const cx = w * 0.5, cy = h * 0.4;
      const r = Math.min(w, h) * 0.08;
      // Flower center
      shapes.push({ type: 'path', points: circlePath(cx, cy, r, 24) });
      // 6 petals as ellipses around center
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const petal: Point[] = [];
        for (let j = 0; j <= 24; j++) {
          const t = (j / 24) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r * 2 + Math.cos(t) * r * 0.9 * Math.cos(angle) - Math.sin(t) * r * 0.4 * Math.sin(angle);
          const py = cy + Math.sin(angle) * r * 2 + Math.cos(t) * r * 0.9 * Math.sin(angle) + Math.sin(t) * r * 0.4 * Math.cos(angle);
          petal.push({ x: px, y: py });
        }
        shapes.push({ type: 'path', points: petal });
      }
      // Stem
      shapes.push({ type: 'path', points: linePath(cx, cy + r, cx, h * 0.85, 20) });
      // Two leaves on stem
      const leafSize = Math.min(w, h) * 0.06;
      const leafY1 = h * 0.6;
      const leafY2 = h * 0.72;
      shapes.push({ type: 'path', points: [
        ...cubicBezierPath(
          { x: cx, y: leafY1 }, { x: cx + leafSize * 2, y: leafY1 - leafSize },
          { x: cx + leafSize * 2.5, y: leafY1 + leafSize }, { x: cx, y: leafY1 }, 16),
      ] });
      shapes.push({ type: 'path', points: [
        ...cubicBezierPath(
          { x: cx, y: leafY2 }, { x: cx - leafSize * 2, y: leafY2 - leafSize },
          { x: cx - leafSize * 2.5, y: leafY2 + leafSize }, { x: cx, y: leafY2 }, 16),
      ] });
      return shapes;
    },
  },
];

// ── STAGE 7: Hatching & Texture ──

function parallelHatchLines(cx: number, cy: number, size: number, count: number, angle: number): TargetShape[] {
  const s = size * 0.35;
  const shapes: TargetShape[] = [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < count; i++) {
    const offset = -s + (i / (count - 1)) * s * 2;
    // Perpendicular offset from center
    const ox = -sin * offset;
    const oy = cos * offset;
    // Line along the angle direction
    const x1 = cx + ox - cos * s;
    const y1 = cy + oy - sin * s;
    const x2 = cx + ox + cos * s;
    const y2 = cy + oy + sin * s;
    shapes.push({ type: 'path', points: linePath(x1, y1, x2, y2, 20) });
  }
  return shapes;
}

// Butterfly — returns separate targets for body, wings, antennae
function butterflyTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.4;
  const targets: TargetShape[] = [];

  // Body — tapered oval (narrow at ends, wider in middle)
  const body: Point[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2;
    body.push({
      x: cx + Math.cos(t) * s * 0.06,
      y: cy + Math.sin(t) * s * 0.5,
    });
  }
  targets.push({ type: 'path', points: body });

  // Wings — each side has a forewing (upper, larger) and hindwing (lower, smaller)
  // Both drawn as closed bezier outlines branching from the body
  for (const side of [1, -1]) {
    // Forewing: large rounded upper wing
    const forewing = [
      // From body top, sweep out and up to wingtip, then back down to body middle
      ...cubicBezierPath(
        { x: cx, y: cy - s * 0.35 },
        { x: cx + side * s * 0.3, y: cy - s * 1.0 },
        { x: cx + side * s * 1.0, y: cy - s * 0.8 },
        { x: cx + side * s * 0.95, y: cy - s * 0.2 },
        30
      ),
      ...cubicBezierPath(
        { x: cx + side * s * 0.95, y: cy - s * 0.2 },
        { x: cx + side * s * 0.7, y: cy + s * 0.05 },
        { x: cx + side * s * 0.2, y: cy - s * 0.05 },
        { x: cx, y: cy - s * 0.05 },
        20
      ),
    ];
    targets.push({ type: 'path', points: forewing });

    // Hindwing: smaller rounded lower wing
    const hindwing = [
      ...cubicBezierPath(
        { x: cx, y: cy + s * 0.0 },
        { x: cx + side * s * 0.25, y: cy + s * 0.05 },
        { x: cx + side * s * 0.8, y: cy + s * 0.15 },
        { x: cx + side * s * 0.65, y: cy + s * 0.55 },
        25
      ),
      ...cubicBezierPath(
        { x: cx + side * s * 0.65, y: cy + s * 0.55 },
        { x: cx + side * s * 0.45, y: cy + s * 0.7 },
        { x: cx + side * s * 0.15, y: cy + s * 0.5 },
        { x: cx, y: cy + s * 0.35 },
        20
      ),
    ];
    targets.push({ type: 'path', points: hindwing });
  }

  // Antennae — curving outward from head
  targets.push({ type: 'path', points: quadBezierPath(
    { x: cx, y: cy - s * 0.5 },
    { x: cx - s * 0.15, y: cy - s * 0.75 },
    { x: cx - s * 0.3, y: cy - s * 0.85 },
    15
  )});
  targets.push({ type: 'path', points: quadBezierPath(
    { x: cx, y: cy - s * 0.5 },
    { x: cx + s * 0.15, y: cy - s * 0.75 },
    { x: cx + s * 0.3, y: cy - s * 0.85 },
    15
  )});

  return targets;
}

// Snowflake — returns separate targets for each arm (main + 2 branches)
function snowflakeTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const targets: TargetShape[] = [];
  for (let arm = 0; arm < 6; arm++) {
    const angle = (arm / 6) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Main arm
    targets.push({ type: 'path', points: linePath(cx, cy, cx + cos * s, cy + sin * s, 15) });
    // Two branches at 2/3 distance
    const bx = cx + cos * s * 0.65;
    const by = cy + sin * s * 0.65;
    const branchLen = s * 0.3;
    const brAngle1 = angle + Math.PI / 4;
    const brAngle2 = angle - Math.PI / 4;
    targets.push({ type: 'path', points: linePath(bx, by, bx + Math.cos(brAngle1) * branchLen, by + Math.sin(brAngle1) * branchLen, 10) });
    targets.push({ type: 'path', points: linePath(bx, by, bx + Math.cos(brAngle2) * branchLen, by + Math.sin(brAngle2) * branchLen, 10) });
  }
  return targets;
}

// Mandala ring — returns separate targets for circles, radial lines, and petals
function mandalaRingTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const outerR = s;
  const innerR = s * 0.55;
  const targets: TargetShape[] = [];
  // Outer and inner circles
  targets.push({ type: 'path', points: circlePath(cx, cy, outerR) });
  targets.push({ type: 'path', points: circlePath(cx, cy, innerR) });
  // 8 radial lines + petals at midpoints
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    targets.push({ type: 'path', points: linePath(cx + cos * innerR, cy + sin * innerR, cx + cos * outerR, cy + sin * outerR, 10) });
    const midR = (innerR + outerR) / 2;
    targets.push({ type: 'path', points: circlePath(cx + cos * midR, cy + sin * midR, s * 0.08, 20) });
  }
  return targets;
}

const stage7Exercises: Exercise[] = [
  {
    id: 's7-parallel-hatch',
    stage: 7,
    name: 'Parallel Hatching',
    description: 'Draw evenly-spaced diagonal hatch lines within the square',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => parallelHatchLines(w * 0.5, h * 0.5, Math.min(w, h) * 0.7, 8, Math.PI / 4),
  },
  {
    id: 's7-cross-hatch',
    stage: 7,
    name: 'Cross Hatching',
    description: 'Draw two overlapping sets of diagonal lines at perpendicular angles',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => [
      ...parallelHatchLines(w * 0.5, h * 0.5, Math.min(w, h) * 0.6, 6, Math.PI / 4),
      ...parallelHatchLines(w * 0.5, h * 0.5, Math.min(w, h) * 0.6, 6, -Math.PI / 4),
    ],
  },
  {
    id: 's7-gradient-hatch',
    stage: 7,
    name: 'Gradient Hatching',
    description: 'Draw vertical lines with increasing density from left (light) to right (dark)',
    type: 'proportion',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const left = w * 0.12;
      const right = w * 0.88;
      const top = h * 0.25;
      const bot = h * 0.75;
      const totalW = right - left;
      const shapes: TargetShape[] = [];

      // Guide: bounding rectangle (reference)
      const boundRect = [
        ...linePath(left, top, right, top, 15),
        ...linePath(right, top, right, bot, 15),
        ...linePath(right, bot, left, bot, 15),
        ...linePath(left, bot, left, top, 15),
      ];
      shapes.push({ type: 'path', points: boundRect, label: 'reference' });

      // Guide: zone divider lines (reference)
      const zone1End = left + totalW / 3;
      const zone2End = left + totalW * 2 / 3;
      shapes.push({ type: 'path', points: linePath(zone1End, top, zone1End, bot, 12), label: 'reference' });
      shapes.push({ type: 'path', points: linePath(zone2End, top, zone2End, bot, 12), label: 'reference' });

      // Light zone: 3 lines
      const zoneW = totalW / 3;
      for (let i = 0; i < 3; i++) {
        const x = left + (i + 0.5) / 3 * zoneW;
        shapes.push({ type: 'path', points: linePath(x, top, x, bot, 15), label: 'target' });
      }
      // Medium zone: 6 lines
      for (let i = 0; i < 6; i++) {
        const x = zone1End + (i + 0.5) / 6 * zoneW;
        shapes.push({ type: 'path', points: linePath(x, top, x, bot, 15), label: 'target' });
      }
      // Dense zone: 10 lines
      for (let i = 0; i < 10; i++) {
        const x = zone2End + (i + 0.5) / 10 * zoneW;
        shapes.push({ type: 'path', points: linePath(x, top, x, bot, 15), label: 'target' });
      }
      return shapes;
    },
  },
  {
    id: 's7-stipple-dots',
    stage: 7,
    name: 'Stipple Pattern',
    description: 'Place dots in the circular stipple pattern',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const r = Math.min(w, h) * 0.25;
      const dots: Point[] = [];
      // Reproducible pseudo-random dots in a circle
      for (let i = 0; i < 35; i++) {
        const angle = i * 2.399963; // golden angle
        const dist = Math.sqrt(i / 35) * r;
        dots.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist });
      }
      return [{ type: 'dots', dots }];
    },
  },
  {
    id: 's7-timed-hatch-box',
    stage: 7,
    name: 'Speed Hatch Box',
    description: 'Draw the rectangle and fill it with diagonal hatch lines in 30 seconds',
    type: 'timed',
    timeLimit: 30,
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.25;
      const shapes: TargetShape[] = [
        { type: 'path', points: rectPath(w * 0.5 - s, h * 0.5 - s, s * 2, s * 2) },
      ];
      // 6 diagonal hatch lines inside
      for (let i = 1; i <= 6; i++) {
        const offset = -s + (i / 7) * s * 2;
        const x1 = w * 0.5 - s;
        const x2 = w * 0.5 + s;
        const y1 = h * 0.5 + offset - s * 0.5;
        const y2 = h * 0.5 + offset + s * 0.5;
        shapes.push({ type: 'path', points: linePath(x1, y1, x2, y2, 15) });
      }
      return shapes;
    },
  },
  {
    id: 's7-contour-hatch',
    stage: 7,
    name: 'Contour Hatching',
    description: 'Draw curved hatch lines that follow the surface of a sphere — line direction conveys volume',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const cx = w * 0.5, cy = h * 0.5;
      const r = Math.min(w, h) * 0.25;
      const shapes: TargetShape[] = [];
      // Sphere outline (reference)
      shapes.push({ type: 'path', points: circlePath(cx, cy, r), label: 'reference' as const });
      // Curved hatch lines wrapping around sphere
      for (let j = 0; j < 7; j++) {
        const frac = (j + 1) / 8;
        const x = cx - r + frac * r * 2;
        const halfH = Math.sqrt(Math.max(0, 1 - ((x - cx) / r) ** 2)) * r;
        const pts: Point[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const py = cy - halfH + t * halfH * 2;
          // Curve the line to follow sphere surface
          const bulge = Math.sin(t * Math.PI) * r * 0.08 * ((x - cx) / r);
          pts.push({ x: x + bulge, y: py });
        }
        shapes.push({ type: 'path', points: pts });
      }
      return shapes;
    },
  },
  {
    id: 's7-memory-hatch',
    stage: 7,
    name: 'Memory Hatch',
    description: 'Memorize the hatching pattern for 5 seconds, then reproduce it from memory',
    type: 'blind',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.3;
      const cx = w * 0.5, cy = h * 0.5;
      const shapes: TargetShape[] = [];
      // Square boundary as continuous rectangle
      const boundary = [
        ...linePath(cx - s, cy - s, cx + s, cy - s, 12),
        ...linePath(cx + s, cy - s, cx + s, cy + s, 12),
        ...linePath(cx + s, cy + s, cx - s, cy + s, 12),
        ...linePath(cx - s, cy + s, cx - s, cy - s, 12),
      ];
      shapes.push({ type: 'path', points: boundary });
      // Diagonal hatch lines inside — each as separate target
      for (let i = 0; i < 6; i++) {
        const offset = -s + (i + 1) * (s * 2) / 7;
        const x1 = cx - s;
        const y1 = cy - s + offset;
        const x2 = cx - s + offset;
        const y2 = cy - s;
        if (y1 >= cy - s && x2 >= cx - s) {
          shapes.push({ type: 'path', points: linePath(
            Math.max(cx - s, x1), Math.min(cy + s, y1),
            Math.min(cx + s, x2), Math.max(cy - s, y2),
            10
          )});
        }
      }
      return shapes;
    },
  },
  {
    id: 's7-value-scale',
    stage: 7,
    name: 'Value Scale',
    description: 'Draw 5 boxes with hatching density increasing from light to dark',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const boxW = w * 0.14;
      const boxH = h * 0.5;
      const gap = w * 0.03;
      const startX = (w - (boxW * 5 + gap * 4)) / 2;
      const topY = (h - boxH) / 2;

      for (let b = 0; b < 5; b++) {
        const bx = startX + b * (boxW + gap);
        // Box outline (continuous rectangle)
        shapes.push({ type: 'path', points: rectPath(bx, topY, boxW, boxH) });
        // Hatch lines — density increases: 2, 4, 6, 8, 10 lines
        const count = (b + 1) * 2;
        for (let i = 1; i <= count; i++) {
          const y = topY + (i / (count + 1)) * boxH;
          shapes.push({ type: 'path', points: linePath(bx, y, bx + boxW, y, 8) });
        }
      }
      return shapes;
    },
  },
  {
    id: 's7-sphere-shading',
    stage: 7,
    name: 'Sphere Shading',
    description: 'Shade a sphere with curved hatching lines — closer together on the dark side',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const cx = w * 0.5, cy = h * 0.5;
      const r = Math.min(w, h) * 0.3;

      // Sphere outline
      shapes.push({ type: 'path', points: circlePath(cx, cy, r, 60) });

      // Curved hatch lines across the sphere, denser on the right (shadow side)
      // Light source from upper-left, so right side is darker
      const hatchAngles = [-0.35, -0.15, 0.0, 0.10, 0.18, 0.25, 0.31, 0.36, 0.40, 0.43];
      for (const offset of hatchAngles) {
        const hatch: Point[] = [];
        const xOff = offset * r * 2;
        for (let i = 0; i <= 30; i++) {
          const t = i / 30;
          const angle = -Math.PI * 0.4 + t * Math.PI * 0.8;
          const hy = cy + Math.sin(angle) * r * 0.9;
          // Curve the hatch to follow the sphere surface
          const sphereX = Math.sqrt(Math.max(0, r * r - (hy - cy) * (hy - cy)));
          const hx = cx + xOff + Math.cos(angle) * r * 0.05;
          // Only include points inside the sphere
          if (Math.abs(hx - cx) < sphereX * 0.95) {
            hatch.push({ x: hx, y: hy });
          }
        }
        if (hatch.length > 2) {
          shapes.push({ type: 'path', points: hatch });
        }
      }
      return shapes;
    },
  },
];

// ── STAGE 8: Symmetry & Pattern ──

const stage8Exercises: Exercise[] = [
  {
    id: 's8-butterfly',
    stage: 8,
    name: 'Butterfly Wings',
    description: 'Draw a butterfly with symmetrical wings and antennae',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => butterflyTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's8-mandala-ring',
    stage: 8,
    name: 'Mandala Ring',
    description: 'Draw concentric circles with radial lines and petal shapes',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => mandalaRingTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.7),
  },
  {
    id: 's8-tile-pattern',
    stage: 8,
    name: 'Tile Pattern',
    description: 'Trace each of the 4 diamonds in the tile grid',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.15;
      const positions: [number, number][] = [
        [w * 0.3, h * 0.35], [w * 0.7, h * 0.35],
        [w * 0.3, h * 0.65], [w * 0.7, h * 0.65],
      ];
      const gridLines: TargetShape[] = [
        { type: 'path' as const, points: linePath(w * 0.5, h * 0.15, w * 0.5, h * 0.85, 2), label: 'reference-only' },
        { type: 'path' as const, points: linePath(w * 0.1, h * 0.5, w * 0.9, h * 0.5, 2), label: 'reference-only' },
      ];
      const diamonds: TargetShape[] = positions.map(([px, py]) => ({
        type: 'path' as const,
        points: diamondPath(px, py, s, s * 1.3),
      }));
      return [...gridLines, ...diamonds];
    },
  },
  {
    id: 's8-snowflake',
    stage: 8,
    name: 'Snowflake',
    description: 'Draw a 6-fold symmetrical snowflake with branches',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => snowflakeTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.7),
  },
  {
    id: 's8-blind-butterfly',
    stage: 8,
    name: 'Memory Butterfly',
    description: 'Memorize the butterfly for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => butterflyTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's8-rotational',
    stage: 8,
    name: 'Rotational Symmetry',
    description: 'A pattern is shown in the top-left quadrant. Draw the 90° rotated version in the top-right quadrant.',
    type: 'proportion',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const r = Math.min(w, h) * 0.04;
      return [
        // Reference pattern (top-left): L-shape vertical
        { type: 'path', points: linePath(w * 0.1, h * 0.15, w * 0.1, h * 0.4, 15), label: 'reference' as const },
        // Reference pattern: L-shape horizontal
        { type: 'path', points: linePath(w * 0.1, h * 0.4, w * 0.3, h * 0.4, 15), label: 'reference' as const },
        // Reference pattern: circle
        { type: 'path', points: circlePath(w * 0.2, h * 0.25, r, 20), label: 'reference' as const },
        // Target (top-right): 90° rotated L-shape horizontal
        { type: 'path', points: linePath(w * 0.6, h * 0.15, w * 0.85, h * 0.15, 15), label: 'target' as const },
        // Target: L-shape vertical
        { type: 'path', points: linePath(w * 0.6, h * 0.15, w * 0.6, h * 0.35, 15), label: 'target' as const },
        // Target: circle
        { type: 'path', points: circlePath(w * 0.75, h * 0.25, r, 20), label: 'target' as const },
        // Divider
        { type: 'path', points: linePath(w * 0.5, h * 0.05, w * 0.5, h * 0.45, 15), label: 'reference' as const },
      ];
    },
  },
];

// ── STAGE 9: Architectural Forms ──

function archTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const colW = s * 0.18;
  const archR = s * 0.5;
  const baseY = cy + s * 0.6;
  const springY = cy + s * 0.1; // where the arch springs from column tops
  const outerL = cx - archR - colW;
  const outerR = cx + archR + colW;
  const archTopY = springY - archR; // top of the arch curve
  // Outer outline: rect that extends above spring line to contain the arch
  const outline: Point[] = [
    ...linePath(outerL, baseY, outerL, archTopY - colW, 15),
    ...linePath(outerL, archTopY - colW, outerR, archTopY - colW, 20),
    ...linePath(outerR, archTopY - colW, outerR, baseY, 15),
    ...linePath(outerR, baseY, outerL, baseY, 20),
  ];
  // Inner arch opening: up left side, arch curves UP (PI to 2*PI), down right side
  const innerArch: Point[] = [
    ...linePath(cx - archR, baseY, cx - archR, springY, 15),
    ...arcPath(cx, springY, archR, Math.PI, 2 * Math.PI, 30),
    ...linePath(cx + archR, springY, cx + archR, baseY, 15),
  ];
  return [
    { type: 'path', points: outline },
    { type: 'path', points: innerArch },
  ];
}

function windowTargets(cx: number, cy: number, size: number): TargetShape[] {
  const hw = size * 0.14; // half-width
  const hh = size * 0.22; // half-height (taller than wide)
  const archR = hw;       // arch radius matches half-width
  const top = cy - hh;
  const bot = cy + hh;
  const left = cx - hw;
  const right = cx + hw;
  // Outer frame: bottom-left → up left → arch over top → down right → bottom
  const outline: Point[] = [
    ...linePath(left, bot, left, top, 20),
    ...arcPath(cx, top, archR, Math.PI, 2 * Math.PI, 30),
    ...linePath(right, top, right, bot, 20),
    ...linePath(right, bot, left, bot, 15),
  ];
  // Sill (thicker bottom ledge)
  const sill: Point[] = linePath(left - hw * 0.15, bot, right + hw * 0.15, bot, 10);
  // Vertical mullion
  const vMullion: Point[] = linePath(cx, top - archR, cx, bot, 25);
  // Horizontal mullion (slightly above center for classic proportions)
  const hMullion: Point[] = linePath(left, cy - hh * 0.1, right, cy - hh * 0.1, 20);
  return [
    { type: 'path', points: outline },
    { type: 'path', points: sill },
    { type: 'path', points: vMullion },
    { type: 'path', points: hMullion },
  ];
}

function staircaseTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const numSteps = 6;
  const stepW = s * 1.2 / numSteps;
  const stepH = s * 1.0 / numSteps;
  const startX = cx - s * 0.6;
  const startY = cy + s * 0.5;
  // Top profile: continuous zigzag
  const topProfile: Point[] = [];
  let x = startX;
  let y = startY;
  for (let i = 0; i < numSteps; i++) {
    topProfile.push(...linePath(x, y, x + stepW, y, 8));
    x += stepW;
    topProfile.push(...linePath(x, y, x, y - stepH, 8));
    y -= stepH;
  }
  topProfile.push(...linePath(x, y, x + stepW, y, 8));
  // Left wall: vertical line from bottom to first step
  const leftWall: Point[] = linePath(startX, startY, startX, startY + s * 0.3, 10);
  // Bottom: horizontal line under stairs
  const endX = x + stepW;
  const bottomY = startY + s * 0.3;
  const bottom: Point[] = linePath(startX, bottomY, endX, bottomY, 15);
  // Right wall: vertical from last step down to bottom
  const rightWall: Point[] = linePath(endX, y, endX, bottomY, 15);
  return [
    { type: 'path', points: topProfile },
    { type: 'path', points: leftWall },
    { type: 'path', points: bottom },
    { type: 'path', points: rightWall },
  ];
}

function twoPointBoxTargets(w: number, h: number): TargetShape[] {
  const vpL = { x: w * 0.05, y: h * 0.4 };
  const vpR = { x: w * 0.95, y: h * 0.4 };
  const frontTop = { x: w * 0.5, y: h * 0.25 };
  const frontBot = { x: w * 0.5, y: h * 0.75 };
  const depth = 0.3;
  const ltx = frontTop.x + (vpL.x - frontTop.x) * depth;
  const lty = frontTop.y + (vpL.y - frontTop.y) * depth;
  const lbx = frontBot.x + (vpL.x - frontBot.x) * depth;
  const lby = frontBot.y + (vpL.y - frontBot.y) * depth;
  const rtx = frontTop.x + (vpR.x - frontTop.x) * depth;
  const rty = frontTop.y + (vpR.y - frontTop.y) * depth;
  const rbx = frontBot.x + (vpR.x - frontBot.x) * depth;
  const rby = frontBot.y + (vpR.y - frontBot.y) * depth;
  // Left face: continuous quad
  const leftFace: Point[] = [
    ...linePath(frontTop.x, frontTop.y, ltx, lty, 15),
    ...linePath(ltx, lty, lbx, lby, 15),
    ...linePath(lbx, lby, frontBot.x, frontBot.y, 15),
    ...linePath(frontBot.x, frontBot.y, frontTop.x, frontTop.y, 15),
  ];
  // Right face: continuous quad
  const rightFace: Point[] = [
    ...linePath(frontTop.x, frontTop.y, rtx, rty, 15),
    ...linePath(rtx, rty, rbx, rby, 15),
    ...linePath(rbx, rby, frontBot.x, frontBot.y, 15),
    ...linePath(frontBot.x, frontBot.y, frontTop.x, frontTop.y, 15),
  ];
  // Top face: continuous quad
  const topFace: Point[] = [
    ...linePath(frontTop.x, frontTop.y, ltx, lty, 15),
    ...linePath(ltx, lty, ltx + (rtx - frontTop.x), lty + (rty - frontTop.y), 15),
    ...linePath(ltx + (rtx - frontTop.x), lty + (rty - frontTop.y), rtx, rty, 15),
    ...linePath(rtx, rty, frontTop.x, frontTop.y, 15),
  ];
  // Horizon line as reference-only
  const horizon: Point[] = linePath(w * 0.0, vpL.y, w * 1.0, vpR.y, 10);
  return [
    { type: 'path', points: leftFace },
    { type: 'path', points: rightFace },
    { type: 'path', points: topFace },
    { type: 'path', points: horizon, label: 'reference-only' },
  ];
}

function buildingTargets(cx: number, baseY: number, s: number): TargetShape[] {
  // Building body with triangular roof: continuous outline
  const roofPeak = baseY - s * 2.1;
  const bodyLeft = cx - s;
  const bodyRight = cx + s;
  const bodyTop = baseY - s * 1.4;
  const outline: Point[] = [
    ...linePath(bodyLeft, baseY, bodyLeft, bodyTop, 15),
    ...linePath(bodyLeft, bodyTop, cx - s * 1.1, bodyTop, 5),
    ...linePath(cx - s * 1.1, bodyTop, cx, roofPeak, 15),
    ...linePath(cx, roofPeak, cx + s * 1.1, bodyTop, 15),
    ...linePath(cx + s * 1.1, bodyTop, bodyRight, bodyTop, 5),
    ...linePath(bodyRight, bodyTop, bodyRight, baseY, 15),
    ...linePath(bodyRight, baseY, bodyLeft, baseY, 15),
  ];
  // Door
  const door: Point[] = rectPath(cx - s * 0.15, baseY - s * 0.55, s * 0.3, s * 0.55);
  // Windows using the Stage 9 arched window style
  const winCenterY = baseY - s * 0.95;
  const winL = windowTargets(cx - s * 0.55, winCenterY, s);
  const winR = windowTargets(cx + s * 0.55, winCenterY, s);
  return [
    { type: 'path', points: outline },
    { type: 'path', points: door },
    ...winL,
    ...winR,
  ];
}

function doorTargets(cx: number, cy: number, size: number): TargetShape[] {
  const dw = size * 0.25;
  const dh = dw * 2;
  const dx = cx - dw * 0.5, dy = cy - dh * 0.5;
  // Door frame
  const frame: Point[] = rectPath(dx, dy, dw, dh);
  // Top panel
  const topPanel: Point[] = rectPath(dx + dw * 0.12, dy + dh * 0.06, dw * 0.76, dh * 0.35);
  // Bottom panel
  const botPanel: Point[] = rectPath(dx + dw * 0.12, dy + dh * 0.48, dw * 0.76, dh * 0.4);
  // Door knob
  const knob: Point[] = circlePath(dx + dw * 0.82, cy + dh * 0.1, dw * 0.04, 15);
  return [
    { type: 'path', points: frame },
    { type: 'path', points: topPanel },
    { type: 'path', points: botPanel },
    { type: 'path', points: knob },
  ];
}

const stage9Exercises: Exercise[] = [
  {
    id: 's9-arch',
    stage: 9,
    name: 'Roman Arch',
    description: 'Draw two columns connected by a semicircular arch',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => archTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
  },
  {
    id: 's9-window',
    stage: 9,
    name: 'Window Frame',
    description: 'Draw a window with 4 panes and an arched top',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => windowTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's9-staircase',
    stage: 9,
    name: 'Staircase',
    description: 'Draw a staircase of 6 steps going up to the right',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => staircaseTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's9-two-point-box',
    stage: 9,
    name: 'Two-Point Box',
    description: 'Draw a box in two-point perspective with edges receding to both sides',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => twoPointBoxTargets(w, h),
  },
  {
    id: 's9-timed-building',
    stage: 9,
    name: 'Speed Building',
    description: 'Draw a building facade with roof, door, and windows in 45 seconds',
    type: 'timed',
    timeLimit: 45,
    accuracyThreshold: 80,
    targetGenerator: (w, h) => buildingTargets(w * 0.5, h * 0.7, Math.min(w, h) * 0.25),
  },
  {
    id: 's9-door',
    stage: 9,
    name: 'Paneled Door',
    description: 'Draw a door with recessed panels — combining rectangles with proportion',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => doorTargets(w * 0.5, h * 0.5, Math.min(w, h)),
  },
  {
    id: 's9-memory-arch',
    stage: 9,
    name: 'Memory Arch',
    description: 'Memorize the arch for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => archTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's9-freeform-facade',
    stage: 9,
    name: 'Design a Facade',
    description: 'Design a simple building facade from imagination — walls, windows, and a door',
    type: 'freeform',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const bw = w * 0.6, bh = h * 0.7;
      const bx = (w - bw) / 2, by = h * 0.15;
      // Main wall
      shapes.push({ type: 'path', points: rectPath(bx, by, bw, bh) });
      // Roof line (simple pitched)
      shapes.push({ type: 'path', points: [
        ...linePath(bx - bw * 0.05, by, w * 0.5, by - h * 0.12, 12),
        ...linePath(w * 0.5, by - h * 0.12, bx + bw + bw * 0.05, by, 12),
      ] });
      // Door (center bottom)
      const dw = bw * 0.15, dh = bh * 0.3;
      shapes.push({ type: 'path', points: rectPath(w * 0.5 - dw / 2, by + bh - dh, dw, dh) });
      // 4 windows (2x2 grid)
      const ww = bw * 0.12, wh = bh * 0.14;
      const winY1 = by + bh * 0.15, winY2 = by + bh * 0.45;
      const winX1 = bx + bw * 0.15, winX2 = bx + bw * 0.85 - ww;
      shapes.push({ type: 'path', points: rectPath(winX1, winY1, ww, wh) });
      shapes.push({ type: 'path', points: rectPath(winX2, winY1, ww, wh) });
      shapes.push({ type: 'path', points: rectPath(winX1, winY2, ww, wh) });
      shapes.push({ type: 'path', points: rectPath(winX2, winY2, ww, wh) });
      return shapes;
    },
  },
];

// ── STAGE 10: Figure Drawing Basics ──

function actionLinePath(cx: number, cy: number, size: number, steps = 100): Point[] {
  const s = size * 0.4;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx + Math.sin(t * Math.PI * 1.5) * s * 0.25;
    const y = cy - s + t * s * 2;
    points.push({ x, y });
  }
  return points;
}

function stickFigureTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.35;
  const headR = s * 0.15;
  const headY = cy - s * 0.7;
  const shoulderY = cy - s * 0.35;
  const hipY = cy + s * 0.15;
  const footY = cy + s * 0.7;
  return [
    { type: 'path', points: circlePath(cx, headY, headR, 40) },
    { type: 'path', points: linePath(cx, headY + headR, cx, hipY, 20) },
    { type: 'path', points: linePath(cx, shoulderY, cx - s * 0.35, shoulderY + s * 0.3, 15) },
    { type: 'path', points: linePath(cx, shoulderY, cx + s * 0.35, shoulderY + s * 0.3, 15) },
    { type: 'path', points: linePath(cx, hipY, cx - s * 0.25, footY, 15) },
    { type: 'path', points: linePath(cx, hipY, cx + s * 0.25, footY, 15) },
  ];
}

function fingerOvalPath(cx: number, cy: number, rx: number, ry: number, angle: number): Point[] {
  const points: Point[] = [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const ex = Math.cos(t) * rx;
    const ey = Math.sin(t) * ry;
    points.push({ x: cx + ex * cos - ey * sin, y: cy + ex * sin + ey * cos });
  }
  return points;
}

function simpleHandTargets(cx: number, cy: number, size: number): TargetShape[] {
  const s = size * 0.45;
  // Palm: continuous outline from wrist up to knuckle line, across to thumb side, thumb, back to wrist
  const palm: Point[] = [
    // Wrist left up to pinky knuckle
    ...cubicBezierPath(
      { x: cx - s * 0.22, y: cy + s * 0.48 },
      { x: cx - s * 0.24, y: cy + s * 0.3 },
      { x: cx - s * 0.30, y: cy + s * 0.05 },
      { x: cx - s * 0.28, y: cy - s * 0.12 },
      15,
    ),
    // Knuckle ridge across top of palm (left to right)
    ...cubicBezierPath(
      { x: cx - s * 0.28, y: cy - s * 0.12 },
      { x: cx - s * 0.15, y: cy - s * 0.20 },
      { x: cx + s * 0.15, y: cy - s * 0.22 },
      { x: cx + s * 0.30, y: cy - s * 0.15 },
      15,
    ),
    // Right side down to wrist
    ...cubicBezierPath(
      { x: cx + s * 0.30, y: cy - s * 0.15 },
      { x: cx + s * 0.34, y: cy + s * 0.05 },
      { x: cx + s * 0.30, y: cy + s * 0.25 },
      { x: cx + s * 0.22, y: cy + s * 0.48 },
      15,
    ),
    // Wrist bottom
    ...linePath(cx + s * 0.22, cy + s * 0.48, cx - s * 0.22, cy + s * 0.48, 8),
  ];
  // Each finger: 3 phalanx ovals (proximal, middle, distal) along its axis
  // [knuckleX, knuckleY, angle, segLens[3], widths[3]]
  const fingers: { kx: number; ky: number; a: number; lens: number[]; ws: number[] }[] = [
    { kx: -0.24, ky: -0.15, a: -0.12, lens: [0.13, 0.10, 0.08], ws: [0.055, 0.050, 0.045] }, // pinky
    { kx: -0.08, ky: -0.19, a: -0.04, lens: [0.15, 0.12, 0.10], ws: [0.060, 0.055, 0.050] }, // ring
    { kx:  0.08, ky: -0.20, a:  0.04, lens: [0.17, 0.13, 0.11], ws: [0.060, 0.055, 0.050] }, // middle
    { kx:  0.24, ky: -0.17, a:  0.12, lens: [0.15, 0.12, 0.10], ws: [0.058, 0.052, 0.046] }, // index
  ];
  const phalanxOvals: TargetShape[] = [];
  for (const { kx, ky, a, lens, ws } of fingers) {
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    let dist = 0;
    for (let i = 0; i < 3; i++) {
      const segLen = lens[i];
      const ovalCx = cx + s * kx - sinA * s * (dist + segLen * 0.5);
      const ovalCy = cy + s * ky - cosA * s * (dist + segLen * 0.5);
      phalanxOvals.push({ type: 'path', points: fingerOvalPath(ovalCx, ovalCy, s * ws[i], s * segLen * 0.55, a) });
      dist += segLen * 0.9; // slight overlap between segments
    }
  }
  // Thumb: single oval angled diagonally down and to the right
  const ta = 0.8;
  const tSin = Math.sin(ta);
  const tCos = Math.cos(ta);
  const tkx = cx + s * 0.28, tky = cy + s * 0.0;
  phalanxOvals.push({ type: 'path', points: fingerOvalPath(
    tkx + tSin * s * 0.10, tky + tCos * s * 0.10, s * 0.075, s * 0.13, ta,
  )});
  return [
    { type: 'path', points: palm },
    ...phalanxOvals,
  ];
}

const stage10Exercises: Exercise[] = [
  {
    id: 's10-gesture-line',
    stage: 10,
    name: 'Action Line',
    description: 'Draw a flowing S-curve representing the line of action through a figure',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => [{
      type: 'path',
      points: actionLinePath(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
    }],
  },
  {
    id: 's10-stick-figure',
    stage: 10,
    name: 'Stick Figure',
    description: 'Draw a proportional stick figure with head, spine, arms, and legs',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => stickFigureTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
  },
  {
    id: 's10-gesture-30s',
    stage: 10,
    name: '30-Second Gesture',
    description: 'Draw a full action line with head, ribcage mass, and pelvis mass — 30 seconds!',
    type: 'timed',
    timeLimit: 30,
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const cx = w * 0.5, s = Math.min(w, h) * 0.4;
      // Action line (flowing S-curve)
      const actionLine: Point[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        actionLine.push({
          x: cx + Math.sin(t * Math.PI * 1.5) * s * 0.15,
          y: h * 0.12 + t * h * 0.72,
        });
      }
      shapes.push({ type: 'path', points: actionLine });
      // Head (small circle at top)
      shapes.push({ type: 'path', points: circlePath(cx + s * 0.05, h * 0.14, s * 0.08, 16) });
      // Ribcage mass (oval)
      shapes.push({ type: 'path', points: ellipsePath(cx + s * 0.08, h * 0.32, s * 0.18, s * 0.22, 20) });
      // Pelvis mass (smaller oval, tilted lower)
      shapes.push({ type: 'path', points: ellipsePath(cx - s * 0.02, h * 0.58, s * 0.15, s * 0.12, 18) });
      return shapes;
    },
  },
  {
    id: 's10-action-ribcage-pelvis',
    stage: 10,
    name: 'Action Line + Masses',
    description: 'Draw the line of action, then add ribcage and pelvis ovals connected at the waist',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const cx = w * 0.5, s = Math.min(w, h) * 0.38;
      // Curved action line
      const action: Point[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        action.push({
          x: cx + Math.sin(t * Math.PI * 1.2 - 0.3) * s * 0.2,
          y: h * 0.1 + t * h * 0.76,
        });
      }
      shapes.push({ type: 'path', points: action });
      // Ribcage (egg shape — wider at top)
      const rcx = cx + s * 0.06, rcy = h * 0.3;
      shapes.push({ type: 'path', points: ellipsePath(rcx, rcy, s * 0.22, s * 0.28, 24) });
      // Pelvis (inverted trapezoid-ish oval)
      const pcx = cx - s * 0.04, pcy = h * 0.6;
      shapes.push({ type: 'path', points: ellipsePath(pcx, pcy, s * 0.18, s * 0.14, 20) });
      // Waist connection (two short lines linking ribcage bottom to pelvis top)
      shapes.push({ type: 'path', points: linePath(rcx - s * 0.08, rcy + s * 0.26, pcx - s * 0.06, pcy - s * 0.12, 8) });
      shapes.push({ type: 'path', points: linePath(rcx + s * 0.08, rcy + s * 0.26, pcx + s * 0.06, pcy - s * 0.12, 8) });
      return shapes;
    },
  },
  {
    id: 's10-hand',
    stage: 10,
    name: 'Simple Hand',
    description: 'Draw a hand shape with palm and five fingers',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => simpleHandTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.8),
  },
  {
    id: 's10-mannequin',
    stage: 10,
    name: 'Mannequin Torso',
    description: 'Draw the pelvis to match the ribcage reference, connected at the waist',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      // Loomis-style torso: ribcage 50%, waist 15%, pelvis 35% of total height
      const totalH = Math.min(w, h) * 0.7;
      const cx = w * 0.5;
      const top = (h - totalH) * 0.5;

      // --- Dimensions ---
      const ribTop = top;
      const ribBot = top + totalH * 0.50;
      const ribH = ribBot - ribTop;
      const shoulderW = totalH * 0.325;
      const ribMaxW = totalH * 0.375;
      const ribBotW = totalH * 0.28;

      const waistBot = top + totalH * 0.65;
      const waistW = totalH * 0.25;

      const pelBot = top + totalH;
      const pelH = pelBot - waistBot;
      const iliacW = totalH * 0.35;
      const pubicW = totalH * 0.175;

      // One continuous outline: shoulder → right rib → right waist →
      // right pelvis → pubic arch → left pelvis → left waist → left rib → shoulder
      const outline: Point[] = [
        // Top: shoulder curve left → right
        ...cubicBezierPath(
          { x: cx - shoulderW, y: ribTop + ribH * 0.02 },
          { x: cx - shoulderW * 0.4, y: ribTop - ribH * 0.02 },
          { x: cx + shoulderW * 0.4, y: ribTop - ribH * 0.02 },
          { x: cx + shoulderW, y: ribTop + ribH * 0.02 },
          15,
        ),
        // Right rib: shoulder → widest → xiphoid
        ...cubicBezierPath(
          { x: cx + shoulderW, y: ribTop + ribH * 0.02 },
          { x: cx + ribMaxW * 1.05, y: ribTop + ribH * 0.25 },
          { x: cx + ribMaxW * 1.08, y: ribTop + ribH * 0.55 },
          { x: cx + ribBotW, y: ribBot },
          25,
        ),
        // Right waist: rib bottom → waist
        ...cubicBezierPath(
          { x: cx + ribBotW, y: ribBot },
          { x: cx + waistW * 0.95, y: ribBot + (waistBot - ribBot) * 0.4 },
          { x: cx + waistW * 0.95, y: ribBot + (waistBot - ribBot) * 0.6 },
          { x: cx + waistW, y: waistBot },
          10,
        ),
        // Right pelvis: waist → iliac crest → pubic symphysis
        ...cubicBezierPath(
          { x: cx + waistW, y: waistBot },
          { x: cx + iliacW * 1.15, y: waistBot + pelH * 0.1 },
          { x: cx + iliacW * 1.1, y: waistBot + pelH * 0.45 },
          { x: cx + pubicW, y: pelBot },
          25,
        ),
        // Bottom: pubic arch
        ...cubicBezierPath(
          { x: cx + pubicW, y: pelBot },
          { x: cx + pubicW * 0.3, y: pelBot + pelH * 0.08 },
          { x: cx - pubicW * 0.3, y: pelBot + pelH * 0.08 },
          { x: cx - pubicW, y: pelBot },
          12,
        ),
        // Left pelvis: pubic symphysis → iliac crest → waist
        ...cubicBezierPath(
          { x: cx - pubicW, y: pelBot },
          { x: cx - iliacW * 1.1, y: waistBot + pelH * 0.45 },
          { x: cx - iliacW * 1.15, y: waistBot + pelH * 0.1 },
          { x: cx - waistW, y: waistBot },
          25,
        ),
        // Left waist: waist → rib bottom
        ...cubicBezierPath(
          { x: cx - waistW, y: waistBot },
          { x: cx - waistW * 0.95, y: ribBot + (waistBot - ribBot) * 0.6 },
          { x: cx - waistW * 0.95, y: ribBot + (waistBot - ribBot) * 0.4 },
          { x: cx - ribBotW, y: ribBot },
          10,
        ),
        // Left rib: xiphoid → widest → shoulder
        ...cubicBezierPath(
          { x: cx - ribBotW, y: ribBot },
          { x: cx - ribMaxW * 1.08, y: ribTop + ribH * 0.55 },
          { x: cx - ribMaxW * 1.05, y: ribTop + ribH * 0.25 },
          { x: cx - shoulderW, y: ribTop + ribH * 0.02 },
          25,
        ),
      ];

      // Internal line: costal arch (ribcage bottom boundary)
      const costalArch: Point[] = cubicBezierPath(
        { x: cx + ribBotW, y: ribBot },
        { x: cx + ribBotW * 0.4, y: ribBot + ribH * 0.06 },
        { x: cx - ribBotW * 0.4, y: ribBot + ribH * 0.06 },
        { x: cx - ribBotW, y: ribBot },
        15,
      );

      // Internal line: pelvis top (waist-to-pelvis boundary)
      const pelvisTop: Point[] = linePath(
        cx - waistW, waistBot, cx + waistW, waistBot, 10,
      );

      return [
        { type: 'path', points: outline, label: 'target' },
        { type: 'path', points: costalArch, label: 'target' },
        { type: 'path', points: pelvisTop, label: 'target' },
      ];
    },
  },
  {
    id: 's10-blind-figure',
    stage: 10,
    name: 'Memory Stick Figure',
    description: 'Memorize the stick figure for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => stickFigureTargets(w * 0.5, h * 0.5, Math.min(w, h) * 0.9),
  },
  {
    id: 's10-timed-gesture',
    stage: 10,
    name: 'Speed Gesture Figures',
    description: 'Draw 3 stick figures in different poses as quickly as you can — 30 seconds!',
    type: 'timed',
    accuracyThreshold: 75,
    timeLimit: 30,
    targetGenerator: (w, h) => {
      const s = Math.min(w, h) * 0.4;
      return [
        ...stickFigureTargets(w * 0.2, h * 0.5, s),
        ...stickFigureTargets(w * 0.5, h * 0.5, s),
        ...stickFigureTargets(w * 0.8, h * 0.5, s),
      ];
    },
  },
  {
    id: 's10-foot',
    stage: 10,
    name: 'Simple Foot',
    description: 'Draw a foot with heel, bridge, ball, and toes',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      // Right foot, plantar view — classic footprint silhouette.
      // One smooth body outline (ball → medial arch → heel → lateral → ball)
      // with 5 separate small oval toe prints above the ball.
      const footH = Math.min(h * 0.82, w * 2.0);
      const footW = footH / 2.4;
      const ox = (w - footW) * 0.5;
      const oy = (h - footH) * 0.5;

      const px = (frac: number) => ox + footW * frac;
      const py = (frac: number) => oy + footH * frac;

      // ── BODY OUTLINE (no toes — just ball/arch/heel/lateral) ──
      const body: Point[] = [
        // Top of ball — medial (right) side, curving down (compact ball)
        ...cubicBezierPath(
          { x: px(0.88), y: py(0.28) },
          { x: px(0.94), y: py(0.30) },
          { x: px(0.96), y: py(0.34) },
          { x: px(0.94), y: py(0.38) },
          14,
        ),
        // Ball medial into arch (shorter transition)
        ...cubicBezierPath(
          { x: px(0.94), y: py(0.38) },
          { x: px(0.90), y: py(0.42) },
          { x: px(0.82), y: py(0.46) },
          { x: px(0.74), y: py(0.50) },
          12,
        ),
        // Medial arch — wider bridge (less concave)
        ...cubicBezierPath(
          { x: px(0.74), y: py(0.50) },
          { x: px(0.64), y: py(0.56) },
          { x: px(0.60), y: py(0.62) },
          { x: px(0.60), y: py(0.68) },
          20,
        ),
        // Arch widens toward heel
        ...cubicBezierPath(
          { x: px(0.60), y: py(0.68) },
          { x: px(0.60), y: py(0.74) },
          { x: px(0.60), y: py(0.78) },
          { x: px(0.62), y: py(0.81) },
          10,
        ),

        // ── HEEL ──
        // Medial heel
        ...cubicBezierPath(
          { x: px(0.62), y: py(0.81) },
          { x: px(0.66), y: py(0.84) },
          { x: px(0.70), y: py(0.90) },
          { x: px(0.68), y: py(0.95) },
          14,
        ),
        // Heel bottom
        ...cubicBezierPath(
          { x: px(0.68), y: py(0.95) },
          { x: px(0.64), y: py(1.00) },
          { x: px(0.36), y: py(1.00) },
          { x: px(0.32), y: py(0.95) },
          16,
        ),
        // Lateral heel
        ...cubicBezierPath(
          { x: px(0.32), y: py(0.95) },
          { x: px(0.30), y: py(0.90) },
          { x: px(0.32), y: py(0.84) },
          { x: px(0.36), y: py(0.80) },
          14,
        ),

        // ── LATERAL SIDE ──
        // Lateral edge — wider bridge on this side too
        ...cubicBezierPath(
          { x: px(0.36), y: py(0.80) },
          { x: px(0.32), y: py(0.70) },
          { x: px(0.28), y: py(0.58) },
          { x: px(0.22), y: py(0.46) },
          20,
        ),
        // Lateral ball — compact (50% smaller ball)
        ...cubicBezierPath(
          { x: px(0.22), y: py(0.46) },
          { x: px(0.16), y: py(0.40) },
          { x: px(0.10), y: py(0.36) },
          { x: px(0.08), y: py(0.31) },
          14,
        ),
        // Top of ball — smooth convex arc across to medial side
        ...cubicBezierPath(
          { x: px(0.08), y: py(0.31) },
          { x: px(0.08), y: py(0.27) },
          { x: px(0.18), y: py(0.24) },
          { x: px(0.32), y: py(0.23) },
          12,
        ),
        ...cubicBezierPath(
          { x: px(0.32), y: py(0.23) },
          { x: px(0.50), y: py(0.22) },
          { x: px(0.72), y: py(0.23) },
          { x: px(0.88), y: py(0.28) },
          16,
        ),
      ];

      // ── TOE PRINTS (5 separate ovals above the ball) ──
      // Arranged in an arc: pinky (lateral/left) → big toe (medial/right)
      // Big toe — largest, clearly separated from the smaller 4
      const bigToe: Point[] = circlePath(px(0.82), py(0.10), footW * 0.10, 20);
      // 2nd toe — highest of the small toes
      const toe2: Point[] = circlePath(px(0.56), py(0.07), footW * 0.055, 14);
      // 3rd toe
      const toe3: Point[] = circlePath(px(0.40), py(0.08), footW * 0.05, 14);
      // 4th toe
      const toe4: Point[] = circlePath(px(0.26), py(0.10), footW * 0.045, 12);
      // Pinky — smallest, lowest
      const pinky: Point[] = circlePath(px(0.14), py(0.14), footW * 0.04, 12);

      return [
        { type: 'path', points: body },
        { type: 'path', points: bigToe },
        { type: 'path', points: toe2 },
        { type: 'path', points: toe3 },
        { type: 'path', points: toe4 },
        { type: 'path', points: pinky },
      ];
    },
  },
  {
    id: 's10-freeform-face',
    stage: 10,
    name: 'Draw a Face',
    description: 'Draw a face from imagination — head shape, eyes, nose, and mouth',
    type: 'freeform',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const cx = w * 0.5, cy = h * 0.45;
      const r = Math.min(w, h) * 0.25;
      // Head oval
      shapes.push({ type: 'path', points: ellipsePath(cx, cy, r * 0.8, r, 40) });
      // Left eye
      shapes.push({ type: 'path', points: ellipsePath(cx - r * 0.3, cy - r * 0.1, r * 0.12, r * 0.07, 16) });
      // Right eye
      shapes.push({ type: 'path', points: ellipsePath(cx + r * 0.3, cy - r * 0.1, r * 0.12, r * 0.07, 16) });
      // Nose (small vertical line)
      shapes.push({ type: 'path', points: linePath(cx, cy + r * 0.05, cx, cy + r * 0.25, 8) });
      // Mouth (gentle smile arc)
      const mouth: Point[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const angle = Math.PI * 0.2 + t * Math.PI * 0.6;
        mouth.push({
          x: cx + Math.cos(angle) * r * 0.25,
          y: cy + r * 0.35 + Math.sin(angle) * r * 0.08,
        });
      }
      shapes.push({ type: 'path', points: mouth });
      return shapes;
    },
  },
];

// ── STAGE 11: Composition & Layout ──

const stage11Exercises: Exercise[] = [
  {
    id: 's11-thirds-grid',
    stage: 11,
    name: 'Rule of Thirds',
    description: 'Draw the rule of thirds grid with circles at the 4 power points',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const m = 0.1; // margin
      const shapes: TargetShape[] = [];
      // 2 horizontal lines
      for (let i = 1; i <= 2; i++) {
        const y = h * (m + (i / 3) * (1 - 2 * m));
        shapes.push({ type: 'path', points: linePath(w * m, y, w * (1 - m), y) });
      }
      // 2 vertical lines
      for (let i = 1; i <= 2; i++) {
        const x = w * (m + (i / 3) * (1 - 2 * m));
        shapes.push({ type: 'path', points: linePath(x, h * m, x, h * (1 - m)) });
      }
      // 4 power points
      const r = Math.min(w, h) * 0.015;
      for (let vi = 1; vi <= 2; vi++) {
        for (let hi = 1; hi <= 2; hi++) {
          const x = w * (m + (vi / 3) * (1 - 2 * m));
          const y = h * (m + (hi / 3) * (1 - 2 * m));
          shapes.push({ type: 'path', points: circlePath(x, y, r, 20) });
        }
      }
      return shapes;
    },
  },
  {
    id: 's11-landscape',
    stage: 11,
    name: 'Landscape Layers',
    description: 'Draw 3 terrain lines — gentle background, medium midground, dramatic foreground',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      // Sun
      shapes.push({ type: 'path', points: circlePath(w * 0.75, h * 0.15, Math.min(w, h) * 0.05, 30) });
      // Background terrain (gentle rolling)
      const bg: Point[] = [];
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        bg.push({ x: w * 0.05 + t * w * 0.9, y: h * 0.35 + Math.sin(t * Math.PI * 3) * h * 0.03 });
      }
      shapes.push({ type: 'path', points: bg });
      // Midground (medium undulation)
      const mg: Point[] = [];
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        mg.push({ x: w * 0.05 + t * w * 0.9, y: h * 0.55 + Math.sin(t * Math.PI * 4 + 1) * h * 0.06 });
      }
      shapes.push({ type: 'path', points: mg });
      // Foreground (dramatic hills)
      const fg: Point[] = [];
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        fg.push({ x: w * 0.05 + t * w * 0.9, y: h * 0.78 + Math.sin(t * Math.PI * 2.5 + 2) * h * 0.1 });
      }
      shapes.push({ type: 'path', points: fg });
      return shapes;
    },
  },
  {
    id: 's11-framed-scene',
    stage: 11,
    name: 'Framed Scene',
    description: 'Draw a scene within the frame: horizon, tree, and sun placed at rule-of-thirds positions',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      // Frame
      shapes.push({ type: 'path', points: rectPath(w * 0.08, h * 0.08, w * 0.84, h * 0.84) });
      // Horizon line at lower third
      shapes.push({ type: 'path', points: linePath(w * 0.08, h * 0.6, w * 0.92, h * 0.6, 30) });
      // Tree trunk at right third
      const treeX = w * 0.7;
      const treeBase = h * 0.6;
      const ts = Math.min(w, h) * 0.005;
      const th = Math.min(w, h) * 0.05;
      shapes.push({ type: 'path', points: rectPath(treeX - ts, treeBase - th, ts * 2, th) });
      // Tree canopy
      shapes.push({ type: 'path', points: trianglePath(treeX, treeBase - th * 0.8, Math.min(w, h) * 0.06) });
      // Sun at upper-left third
      shapes.push({ type: 'path', points: circlePath(w * 0.3, h * 0.3, Math.min(w, h) * 0.04, 20) });
      return shapes;
    },
  },
  {
    id: 's11-timed-scene',
    stage: 11,
    name: 'Speed Scene',
    description: 'Draw a complete landscape scene with house, trees, and sun in 60 seconds',
    type: 'timed',
    timeLimit: 60,
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      // Horizon
      shapes.push({ type: 'path', points: linePath(w * 0.05, h * 0.55, w * 0.95, h * 0.55, 30) });
      // House at left-third
      const hx = w * 0.33;
      const hy = h * 0.55;
      const hs = Math.min(w, h) * 0.1;
      shapes.push({ type: 'path', points: rectPath(hx - hs, hy - hs, hs * 2, hs) });
      // Roof
      shapes.push({ type: 'path', points: [
        ...linePath(hx - hs * 1.1, hy - hs, hx, hy - hs * 1.5, 10),
        ...linePath(hx, hy - hs * 1.5, hx + hs * 1.1, hy - hs, 10),
      ] });
      // Foreground tree (big)
      const t1x = w * 0.7;
      const t1s = Math.min(w, h) * 0.006;
      const t1h = Math.min(w, h) * 0.08;
      shapes.push({ type: 'path', points: rectPath(t1x - t1s, h * 0.55 - t1h, t1s * 2, t1h) });
      shapes.push({ type: 'path', points: trianglePath(t1x, h * 0.55 - t1h * 0.88, Math.min(w, h) * 0.08) });
      // Background tree (small)
      const t2x = w * 0.55;
      const t2s = Math.min(w, h) * 0.004;
      const t2h = Math.min(w, h) * 0.04;
      shapes.push({ type: 'path', points: rectPath(t2x - t2s, h * 0.55 - t2h, t2s * 2, t2h) });
      shapes.push({ type: 'path', points: trianglePath(t2x, h * 0.55 - t2h * 0.83, Math.min(w, h) * 0.04) });
      // Sun
      shapes.push({ type: 'path', points: circlePath(w * 0.85, h * 0.2, Math.min(w, h) * 0.04, 20) });
      return shapes;
    },
  },
  {
    id: 's11-negative-space',
    stage: 11,
    name: 'Negative Space',
    description: 'Draw the outline of the space AROUND the vase, not the vase itself',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const cx = w * 0.5, cy = h * 0.5;
      const s = Math.min(w, h) * 0.35;
      // Vase silhouette outline
      const vasePoints: Point[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = cy - s + t * s * 2;
        const profile = 0.3 + 0.15 * Math.cos(t * Math.PI * 3) - 0.1 * t;
        vasePoints.push({ x: cx + profile * s, y });
      }
      for (let i = 60; i >= 0; i--) {
        const t = i / 60;
        const y = cy - s + t * s * 2;
        const profile = 0.3 + 0.15 * Math.cos(t * Math.PI * 3) - 0.1 * t;
        vasePoints.push({ x: cx - profile * s, y });
      }
      // Left negative space contour
      const leftSpace: Point[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = cy - s + t * s * 2;
        const profile = 0.3 + 0.15 * Math.cos(t * Math.PI * 3) - 0.1 * t;
        leftSpace.push({ x: cx - profile * s, y });
      }
      // Right negative space contour
      const rightSpace: Point[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = cy - s + t * s * 2;
        const profile = 0.3 + 0.15 * Math.cos(t * Math.PI * 3) - 0.1 * t;
        rightSpace.push({ x: cx + profile * s, y });
      }
      return [
        { type: 'path', points: vasePoints },
        { type: 'path', points: leftSpace },
        { type: 'path', points: rightSpace },
      ];
    },
  },
  {
    id: 's11-memory-landscape',
    stage: 11,
    name: 'Memory Landscape',
    description: 'Memorize the 3-layer landscape for 5 seconds, then draw it from memory',
    type: 'blind',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      // Background mountains
      const mountains: Point[] = [];
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const x = w * 0.05 + t * w * 0.9;
        const y = h * 0.35 - Math.abs(Math.sin(t * Math.PI * 2.5)) * h * 0.15;
        mountains.push({ x, y });
      }
      shapes.push({ type: 'path', points: mountains });
      // Midground hills
      const hills: Point[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const x = w * 0.05 + t * w * 0.9;
        const y = h * 0.55 - Math.sin(t * Math.PI * 1.5) * h * 0.08;
        hills.push({ x, y });
      }
      shapes.push({ type: 'path', points: hills });
      // Foreground ground line
      shapes.push({ type: 'path', points: linePath(w * 0.05, h * 0.75, w * 0.95, h * 0.75, 30) });
      return shapes;
    },
  },
];

// ── STAGE 12: Capstone Challenges ──

// Capstone helper: perspective box shapes (each edge/hatch as separate path)
function perspectiveHatchedBoxShapes(w: number, h: number): TargetShape[] {
  const cx = w * 0.5, cy = h * 0.5;
  const size = Math.min(w, h) * 0.35;
  const vp = { x: w * 0.75, y: h * 0.25 };
  const fl = { x: cx - size * 0.5, y: cy - size * 0.4 };
  const fr = { x: cx + size * 0.3, y: cy - size * 0.4 };
  const bl = { x: cx - size * 0.5, y: cy + size * 0.4 };
  const br = { x: cx + size * 0.3, y: cy + size * 0.4 };
  const depth = 0.25;
  const rrt = { x: fr.x + (vp.x - fr.x) * depth, y: fr.y + (vp.y - fr.y) * depth };
  const rrb = { x: br.x + (vp.x - br.x) * depth, y: br.y + (vp.y - br.y) * depth };
  const shapes: TargetShape[] = [];
  // Front face — continuous rectangle outline
  shapes.push({ type: 'path', points: [
    ...linePath(fl.x, fl.y, fr.x, fr.y, 15),
    ...linePath(fr.x, fr.y, br.x, br.y, 15),
    ...linePath(br.x, br.y, bl.x, bl.y, 15),
    ...linePath(bl.x, bl.y, fl.x, fl.y, 15),
  ] });
  // Receding edges (each separate to avoid stray connectors)
  shapes.push({ type: 'path', points: linePath(fr.x, fr.y, rrt.x, rrt.y, 10) });
  shapes.push({ type: 'path', points: linePath(br.x, br.y, rrb.x, rrb.y, 10) });
  shapes.push({ type: 'path', points: linePath(rrt.x, rrt.y, rrb.x, rrb.y, 10) });
  // Diagonal hatch lines on right face (each separate)
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    const topX = fr.x + (rrt.x - fr.x) * t;
    const topY = fr.y + (rrt.y - fr.y) * t;
    const botX = br.x + (rrb.x - br.x) * t;
    const botY = br.y + (rrb.y - br.y) * t;
    shapes.push({ type: 'path', points: linePath(topX, topY, botX, botY, 8) });
  }
  return shapes;
}

// Capstone helper: composed scene as separate shapes (no stray connectors)
function composedSceneShapes(w: number, h: number): TargetShape[] {
  const shapes: TargetShape[] = [];
  const ground = h * 0.65;
  // Horizon line
  shapes.push({ type: 'path', points: linePath(0, ground, w, ground, 30) });
  // House walls (continuous outline)
  const hx = w * 0.2, hy = ground, hw = w * 0.2, hh = h * 0.2;
  shapes.push({ type: 'path', points: rectPath(hx, hy - hh, hw, hh) });
  // Roof (continuous V)
  shapes.push({ type: 'path', points: [
    ...linePath(hx, hy - hh, hx + hw * 0.5, hy - hh - h * 0.12, 15),
    ...linePath(hx + hw * 0.5, hy - hh - h * 0.12, hx + hw, hy - hh, 15),
  ] });
  // Tree trunk — left side
  const tx = w * 0.7, tBase = ground;
  shapes.push({ type: 'path', points: linePath(tx - w * 0.015, tBase, tx - w * 0.015, tBase - h * 0.12, 10) });
  // Tree trunk — right side
  shapes.push({ type: 'path', points: linePath(tx + w * 0.015, tBase, tx + w * 0.015, tBase - h * 0.12, 10) });
  // Canopy triangle (continuous outline)
  const canopyBot = tBase - h * 0.1;
  const canopyTop = tBase - h * 0.3;
  shapes.push({ type: 'path', points: [
    ...linePath(tx - w * 0.08, canopyBot, tx, canopyTop, 15),
    ...linePath(tx, canopyTop, tx + w * 0.08, canopyBot, 15),
    ...linePath(tx + w * 0.08, canopyBot, tx - w * 0.08, canopyBot, 10),
  ] });
  return shapes;
}

// Capstone helper: organic vine with leaves — returns separate shapes per element
function vineWithLeavesShapes(cx: number, cy: number, size: number, steps = 100): TargetShape[] {
  const shapes: TargetShape[] = [];
  // Main S-curve vine
  const vine: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx - size * 0.4 + size * 0.8 * t;
    const y = cy + Math.sin(t * Math.PI * 2) * size * 0.15;
    vine.push({ x, y });
  }
  shapes.push({ type: 'path', points: vine });
  // Each leaf as its own path (teardrop outline)
  for (let k = 0; k < 3; k++) {
    const t = (k + 1) / 4;
    const bx = cx - size * 0.4 + size * 0.8 * t;
    const by = cy + Math.sin(t * Math.PI * 2) * size * 0.15;
    const leaf: Point[] = [];
    // Right side up
    for (let i = 0; i <= 20; i++) {
      const lt = i / 20;
      leaf.push({ x: bx + Math.sin(lt * Math.PI) * size * 0.06, y: by - lt * size * 0.12 });
    }
    // Left side down
    for (let i = 20; i >= 0; i--) {
      const lt = i / 20;
      leaf.push({ x: bx - Math.sin(lt * Math.PI) * size * 0.06, y: by - lt * size * 0.12 });
    }
    shapes.push({ type: 'path', points: leaf });
  }
  return shapes;
}

const stage12Exercises: Exercise[] = [
  {
    id: 's12-perspective-hatched-box',
    stage: 12,
    name: 'Hatched Box in Perspective',
    description: 'Draw a perspective box with diagonal hatching on the side face — combines perspective and hatching skills',
    type: 'guided',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => perspectiveHatchedBoxShapes(w, h),
  },
  {
    id: 's12-memory-scene',
    stage: 12,
    name: 'Memory Scene',
    description: 'Memorize the composed scene for 5 seconds, then draw it from memory — house, tree, and horizon',
    type: 'blind',
    accuracyThreshold: 80,
    targetGenerator: (w, h) => composedSceneShapes(w, h),
  },
  {
    id: 's12-timed-figure-scene',
    stage: 12,
    name: 'Speed Figure & Setting',
    description: 'Draw a stick figure standing on a ground line with a simple background — 45 seconds!',
    type: 'timed',
    accuracyThreshold: 80,
    timeLimit: 45,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const s = Math.min(w, h) * 0.5;
      const fx = w * 0.5;
      const fy = h * 0.5;
      // Ground line
      shapes.push({ type: 'path', points: linePath(0, h * 0.75, w, h * 0.75, 20) });
      // Stick figure — head
      shapes.push({ type: 'path', points: circlePath(fx, fy - s * 0.35, s * 0.08, 20) });
      // Stick figure — body
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.27, fx, fy + s * 0.05, 10) });
      // Stick figure — left arm
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.18, fx - s * 0.15, fy - s * 0.05, 8) });
      // Stick figure — right arm
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.18, fx + s * 0.15, fy - s * 0.05, 8) });
      // Stick figure — left leg
      shapes.push({ type: 'path', points: linePath(fx, fy + s * 0.05, fx - s * 0.12, fy + s * 0.25, 8) });
      // Stick figure — right leg
      shapes.push({ type: 'path', points: linePath(fx, fy + s * 0.05, fx + s * 0.12, fy + s * 0.25, 8) });
      // Sun
      shapes.push({ type: 'path', points: circlePath(w * 0.8, h * 0.15, Math.min(w, h) * 0.06, 30) });
      return shapes;
    },
  },
  {
    id: 's12-organic-symmetry',
    stage: 12,
    name: 'Organic Symmetry',
    description: 'Draw the mirror image of the vine with leaves on the opposite side',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const size = Math.min(w, h) * 0.4;
      // Vine on left — separate shapes for vine + each leaf
      const leftShapes = vineWithLeavesShapes(w * 0.25, h * 0.5, size);
      // Mirrored vine on right (flip x around center)
      const rightShapes: TargetShape[] = leftShapes.map(s => ({
        type: 'path' as const,
        points: s.points!.map(p => ({ x: w - p.x, y: p.y })),
      }));
      return [...leftShapes, ...rightShapes];
    },
  },
  {
    id: 's12-full-composition',
    stage: 12,
    name: 'Final Composition',
    description: 'The ultimate challenge — draw a complete scene with a ground plane, an organic form, and a figure',
    type: 'guided',
    accuracyThreshold: 75,
    targetGenerator: (w, h) => {
      const shapes: TargetShape[] = [];
      const s = Math.min(w, h) * 0.3;
      const fx = w * 0.65;
      const fy = h * 0.52;
      // Ground with perspective depth lines
      shapes.push({ type: 'path', points: linePath(0, h * 0.7, w, h * 0.7, 25) });
      shapes.push({ type: 'path', points: linePath(w * 0.1, h * 0.7, w * 0.4, h * 0.45, 15) });
      shapes.push({ type: 'path', points: linePath(w * 0.9, h * 0.7, w * 0.6, h * 0.45, 15) });
      // Tree trunk (left)
      shapes.push({ type: 'path', points: linePath(w * 0.2, h * 0.7, w * 0.2, h * 0.45, 15) });
      // Tree canopy
      shapes.push({ type: 'path', points: circlePath(w * 0.2, h * 0.38, Math.min(w, h) * 0.08, 40) });
      // Stick figure — head
      shapes.push({ type: 'path', points: circlePath(fx, fy - s * 0.35, s * 0.08, 20) });
      // Stick figure — body
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.27, fx, fy + s * 0.05, 10) });
      // Stick figure — left arm
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.18, fx - s * 0.15, fy - s * 0.05, 8) });
      // Stick figure — right arm
      shapes.push({ type: 'path', points: linePath(fx, fy - s * 0.18, fx + s * 0.15, fy - s * 0.05, 8) });
      // Stick figure — left leg
      shapes.push({ type: 'path', points: linePath(fx, fy + s * 0.05, fx - s * 0.12, fy + s * 0.25, 8) });
      // Stick figure — right leg
      shapes.push({ type: 'path', points: linePath(fx, fy + s * 0.05, fx + s * 0.12, fy + s * 0.25, 8) });
      return shapes;
    },
  },
];

export const allExercises: Exercise[] = [
  ...stage1Exercises,
  ...stage2Exercises,
  ...stage3Exercises,
  ...perspectiveExercises,
  ...freeformExercises,
  ...stage6Exercises,
  ...stage7Exercises,
  ...stage8Exercises,
  ...stage9Exercises,
  ...stage10Exercises,
  ...stage11Exercises,
  ...stage12Exercises,
];

export function getExercisesForStage(stage: number): Exercise[] {
  return allExercises.filter(e => e.stage === stage);
}

export const stageNames: Record<number, string> = {
  1: 'Basic Shapes & Lines',
  2: 'Curves & Combinations',
  3: 'Proportion & Spacing',
  4: 'Perspective & Construction',
  5: 'Freeform Challenges',
  6: 'Organic Forms & Gesture',
  7: 'Hatching & Texture',
  8: 'Symmetry & Pattern',
  9: 'Architectural Forms',
  10: 'Figure Drawing Basics',
  11: 'Composition & Layout',
  12: 'Capstone Challenges',
};

export const totalStages = 12;
