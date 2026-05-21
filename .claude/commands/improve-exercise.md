---
name: improve-exercise
description: Improve, redraw, or create a new variation of a drawing exercise — researches better shapes, replaces path functions and SVGs, and fixes stray lines
argument-hint: "<exercise name or description>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Agent
  - WebSearch
  - WebFetch
---

You are improving or replacing a drawing exercise in this project. The user has specified: $ARGUMENTS

## Step 1: Find the current exercise

- Search `src/exercises.ts` for the exercise by name/id (grep for the exercise name, stage, or shape keyword).
- Read the path function that generates the guide points.
- Read the SVG reference in `public/references/` if one exists.
- Understand how the exercise definition in `src/exercises.ts` wires up to the path function (the `targetGenerator` field).

## Step 2: Research a better shape

- Use the Agent tool to web-search for reference geometry, official specifications, or SVG path data for the shape. For example, the Canadian flag maple leaf has an official government specification with exact coordinates.
- Prefer official/canonical/recognizable versions of shapes over freehand approximations.
- If the shape is geometric, find exact vertex coordinates. If organic, find high-quality SVG paths (bezier curves).

## Step 3: Build the new path function

- Convert the reference geometry into the project's format: a function returning `Point[]` using the existing helpers (`linePath`, `cubicBezierPath`, `quadBezierPath`, `circlePath`, `arcPath`, etc.).
- Scale coordinates to fit a normalized space and use `cx`, `cy`, `size` parameters for positioning.
- **CRITICAL — No overlapping shapes**: Never draw composite shapes as separate overlapping primitives (e.g., rect + triangle). Always trace the full outer outline as a single continuous path to avoid stray dotted lines from shared internal edges.
- **CRITICAL — No stray connecting lines**: If the shape has multiple disconnected parts (e.g., an outline + a center vein), they MUST be returned as separate targets in the `targetGenerator`, NOT concatenated into one `Point[]` array. The canvas renderer draws all points with `lineTo` in sequence, so concatenated disconnected paths create visible stray lines between the last point of one part and the first point of the next.

## Step 4: Update the SVG reference (if one exists)

- Replace the SVG in `public/references/` with the new geometry.
- Use the project's standard SVG style classes: `.dotted` for outlines, `.vein` for internal lines, `.guide-dot` for key points.
- Always include `<rect width="400" height="400" fill="white" />` as background so the shape is visible in all viewers.
- Use a single `<polygon>` or `<path>` for the outline — never separate overlapping `<rect>` + `<polygon>` elements.

## Step 5: Replace the exercise

- Replace the old path function in `src/exercises.ts` with the new one.
- Update the exercise's `targetGenerator` if the shape now needs multiple targets (e.g., outline + separate decorative lines).
- Keep the exercise `id`, `stage`, `name`, and `accuracyThreshold` unless specifically asked to change them.
- Run `npx tsc --noEmit` to verify the build.

## Step 6: Verify

- Open the SVG reference with `open public/references/<name>.svg` so the user can visually confirm.
- Summarize what changed and ask the user to check the exercise in the app.

## Quality checklist (run mentally before finishing)

- [ ] No composite overlapping shapes — single continuous outlines only
- [ ] No concatenated disconnected paths in a single Point[] array
- [ ] SVG has white background rect
- [ ] SVG uses .dotted class for outlines
- [ ] Path function uses cx/cy/size parameters for positioning
- [ ] TypeScript compiles cleanly
