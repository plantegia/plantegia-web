# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture Overview

Plantegia is a React + TypeScript plant rotation planning app built with Vite. It uses a canvas-based UI inspired by Minecraft's hotbar/tool paradigm.

### Key Architectural Decisions

- **Canvas rendering**: The main view uses HTML5 Canvas (not React components) for the grid. See [renderers.ts](src/components/canvas/renderers.ts) for Space View and Time View rendering logic.
- **State management**: Zustand with Immer middleware. All state lives in [useAppStore.ts](src/store/useAppStore.ts).
- **Data persistence**: Firebase Firestore. Each plantation is a document with all data (spaces, plants, strains, inventory). Auto-save with 1.5s debounce via [usePlantation.ts](src/hooks/usePlantation.ts).
- **Authentication**: Firebase Auth with Google Sign-In. See [useAuth.ts](src/hooks/useAuth.ts).
- **Routing**: React Router. `/p/` — plantation list, `/p/:id` — plantation view, `/p/:id?view=1` — read-only sharing. See "Routing Architecture" section below.
- **Mobile-first**: Hardcoded 390px viewport width (`VIEWPORT_WIDTH` in constants). Even on desktop, the app renders in mobile dimensions.
- **Gesture handling**: Custom gesture system in [useGestures.ts](src/hooks/useGestures.ts) handles tap, pan, zoom, drag-to-move, and drag-to-resize operations on canvas.

### Data Flow

```
User gesture → useGestures hook → useAppStore actions → Canvas re-render
                                                      ↓
                                            usePlantation (auto-save) → Firestore
```

The canvas listens to store changes and re-renders via `useCallback`/`useEffect` pattern.

### Domain Model

- **Plantation**: Top-level entity stored in Firestore. Has ownerId, name, isPublic flag.
- **Space**: A growing area (tent/room) with a grid of cells. Has optional `lightSchedule` (18/6, 12/12, 20/4, 24/0).
- **Plant**: Occupies 1/2/4 cells within a space, has lifecycle stages
- **Strain**: Plant variety with flowering/veg day durations
- **Seed**: Inventory item linked to a strain

Plant codes are auto-generated as `[ABBR]-[N]` (e.g., "GRZ-1") based on strain abbreviation.

### Space Editing

Spaces can be edited via the Inspector (tap on space to select):
- **Name**: Text input field
- **Size**: Width × Height number inputs (arbitrary values like 1×5, 3×2)
- **Light schedule**: Dropdown (18/6, 12/12, 20/4, 24/0 hours light/dark)

Drag interactions on selected spaces:
- **Move**: Drag from body to reposition
- **Resize**: Drag from edges/corners to resize

Resize validation: prevents shrinking if plants would be cut off. Edge detection in [grid.ts](src/utils/grid.ts) `findSpaceEdgeAt()`.

### Undo/Redo System

History-based undo/redo with 50-state limit:
- **Keyboard**: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo)
- **UI**: ↶ and ↷ buttons in Header

Implementation:
- [useAppStore.ts](src/store/useAppStore.ts): `history` state with `past`/`future` snapshots, `saveToHistory()`, `undo()`, `redo()`
- [useKeyboardShortcuts.ts](src/hooks/useKeyboardShortcuts.ts): Keyboard event handling
- `saveToHistory()` called before each mutation (create/update/delete for spaces, plants, strains, seeds)

### Firebase Structure

```
Firestore:
  plantations/{plantationId}
    ├── ownerId: string
    ├── name: string
    ├── isPublic: boolean
    ├── createdAt, updatedAt: timestamp
    ├── spaces: Space[]
    ├── plants: Plant[]
    ├── strains: Strain[]
    └── inventory: Seed[]
```

Key files:
- [firebase.ts](src/lib/firebase.ts) — Firebase config and initialization
- [firestore.ts](src/lib/firestore.ts) — CRUD operations for plantations

### Plant Segments (Rotation Planning)

Plants can move between spaces over their lifecycle (e.g., VEG box → FLOWER box). This is modeled with **segments**:

```typescript
interface PlantSegment {
  id: string;
  spaceId: string;
  gridX: number;
  gridY: number;
  startDate: string;  // absolute ISO date
  endDate: string | null;  // null = until end of lifecycle
}
```

Key concepts:
- **Plant** has `segments: PlantSegment[]` array ordered by `startDate`
- Each segment represents where the plant is located during a time period
- **Split tool** (`/` in Hotbar, Time View only) divides a segment at a date, creating two segments
- Bezier curves connect segments visually when plant moves between slots
- Backward compat fields (`spaceId`, `gridX`, `gridY`) synced with current segment via `getCurrentSegment()`

Migration: Old plants without segments are auto-migrated on load via `migratePlantation()` in [migration.ts](src/utils/migration.ts).

### Plant Timeline System

Plants have key date fields:
- `startedAt`: When the plant lifecycle started
- `stageStartedAt`: When the current stage began (auto-updated on stage change)
- `customStageDays`: Optional per-plant overrides for stage durations (partial record)

Plant lifecycle stages (in order):
- **germinating** (GRM): Fixed 7 days, non-editable
- **seedling** (SDL): Default 14 days, editable
- **vegetative** (VEG): Default 30 days, editable
- **flowering** (FLW): Default 60 days, editable
- **harvested** (HRV): Fixed 7 days, non-editable

Stage duration calculation via `getStageDuration()` in [grid.ts](src/utils/grid.ts):
1. Check `plant.customStageDays[stage]`
2. Check `strain.vegDays` / `strain.floweringDays` for veg/flowering
3. Fall back to `STAGE_DAYS` defaults

### View Modes

- **Space View** (X-Y): Top-down view of all spaces and plants. Shows only current segment position.
- **Time View** (Horizontal Timeline): Premiere Pro-style Gantt chart for rotation planning.

### Time View (Horizontal Timeline)

Coordinate system (see `TIME_VIEW_CONSTANTS` in grid.ts):
- **X-axis**: Calendar dates (infinite scroll). `dayWidth: 4px` per day.
- **Y-axis**: Slots grouped by space. Each space has header + cell rows.
- **TODAY line**: Orange vertical line at current date.

Layout constants:
```typescript
TIME_VIEW_CONSTANTS = {
  dayWidth: 4,           // px per day
  slotHeight: 32,        // px per slot row
  spaceHeaderHeight: 24, // space name header
  leftMargin: 100,       // space for slot labels
  topMargin: 40,         // space for date labels
  segmentHeight: 24,     // visual height of segment bar
  handleWidth: 8,        // resize handle width
}
```

Rendering in [renderers.ts](src/components/canvas/renderers.ts) `renderTimeView()`:
1. Draw week grid lines (vertical)
2. Draw slot rows with labels (Y-axis)
3. Draw TODAY line
4. Draw date labels (X-axis)
5. Draw plant segments with stage colors
6. Draw Bezier connections between segments
7. Draw resize handles at stage boundaries

### Time View Drag Interactions

Drag modes (`TimeViewDragMode` in useGestures.ts):
- **segment-move-x**: Drag segment body horizontally → shifts entire plant in time (`shiftPlantInTime`)
- **segment-move-y**: Drag segment body vertically → moves segment to different slot (`moveSegmentToSlot`)
- **stage-resize**: Drag stage boundary handle → adjusts stage duration (`customStageDays`)
- **pan**: Drag empty area → scrolls timeline

Direction detection: Starts as `segment-move-x`, switches to `segment-move-y` if vertical movement exceeds threshold.

Stage handles:
- Only editable stages (seedling, vegetative, flowering) have handles
- Handles appear at stage boundaries (teal color with grip lines)
- Dragging handle modifies `plant.customStageDays[stage]`
- Hit detection in `findSegmentAtHorizontal()` returns `hitZone: 'stage-handle'` with `stage` field

### Store Segment Actions

In [useAppStore.ts](src/store/useAppStore.ts):
- `splitSegment(plantId, segmentId, splitDate)`: Divide segment into two at date
- `moveSegmentToSlot(plantId, segmentId, slot)`: Change segment's space/cell location
- `shiftPlantInTime(plantId, daysDelta)`: Move entire plant timeline by days

## Routing Architecture

The project consists of two parts: Astro marketing site and React app.

### URL Structure (Production)
- `plantegia.com/` — Marketing homepage (Astro)
- `plantegia.com/guides/`, `/tools/`, `/de/` — Marketing pages (Astro)
- `plantegia.com/p/` — Plantation list (React app)
- `plantegia.com/p/:id` — Plantation view (React app)

### Build & Deploy
- `npm run build:all` — Builds both marketing and React app, merges into `dist-final/`
- React app assets are at `/app/` (Vite `base: '/app/'`)
- Vercel rewrites `/p/*` and `/tutorial/*` to `/app/index.html`
- See [vercel.json](vercel.json) for rewrite rules
- See [scripts/merge-dist.js](scripts/merge-dist.js) for build merge logic

### Local Development
- `npm run dev` — Starts Vite dev server, opens `/p/`
- Custom Vite plugin rewrites `/p/*` to `/app/index.html` (mimics Vercel)
- `npm run dev:marketing` — Starts Astro dev server for marketing site
- Marketing dev server runs on port 4321, React app on port 5173

### React Router Setup
Routes in [App.tsx](src/app/App.tsx):
- `/p/` → PlantationList
- `/p/:id` → PlantationView
- `*` → Redirect to `/p/` (catch-all fallback)

## Design Constraints

From spec.md - these are intentional limitations:

- 4-color palette: dark blue background (#1A1A2E), green, orange, teal accents
- Monospace font only, two sizes (14px/18px)
- No modals, tables, or sidebars - only Hotbar, Inspector popup, and Canvas
- Icons: lucide-react library for SVG icons
