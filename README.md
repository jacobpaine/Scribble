# Drawing Practice

An interactive web app for building tablet drawing skills through structured, progressive exercises. Practice basic shapes, curves, proportion, and freeform drawing with real-time accuracy feedback.

## Tech Stack

- React 19 + TypeScript
- Vite
- HTML5 Canvas (no external drawing libraries)
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

## Features

- **23 exercises** across 4 progressive stages
- **Progressive unlocking** — pass each exercise to advance
- **Accuracy scoring** with two-way distance metrics (precision + coverage)
- **Heatmap feedback** — green for accurate, red for off-target
- **Undo/Redo/Clear** stroke controls
- **Pressure sensitivity** support via pointer events
- **Timer mode** for speed drills
- **Blind contour mode** — study the shape, then draw from memory
- **Sidebar navigation** for quick exercise access
- **Progress persistence** via localStorage

## Exercise Stages

### Stage 1: Basic Shapes & Lines
Horizontal line, vertical line, diagonal line, circle, square, triangle. Guided exercises with 80% accuracy threshold.

### Stage 2: Curves & Combinations
S-curve, arc, spiral, figure-8, star, pentagon, arrow. Accuracy thresholds of 70-75% as complexity increases.

### Stage 3: Proportion & Spacing
Parallel lines, simple grid, evenly spaced dots, mirror triangle, mirror circle. Introduces proportion-type exercises with reference and target areas.

### Stage 4: Freeform Challenges
Draw a house (freeform), speed circles (30s), speed lines (20s), blind contour, blind spiral. Mixes freeform, timed, and memorization exercises.

## Project Structure

```
src/
  App.tsx            — Main app state, exercise flow, UI
  DrawingCanvas.tsx  — Canvas rendering, pointer events, stroke management
  exercises.ts       — All 23 exercise definitions with path generators
  scoring.ts         — Accuracy calculation and heatmap generation
  storage.ts         — localStorage persistence
  types.ts           — TypeScript interfaces
```
