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

Plantasia is a React + TypeScript plant rotation planning app built with Vite. It uses a canvas-based UI inspired by Minecraft's hotbar/tool paradigm.

### Key Architectural Decisions

- **Canvas rendering**: The main view uses HTML5 Canvas (not React components) for the grid. See [renderers.ts](src/components/canvas/renderers.ts) for Space View and Time View rendering logic.
- **State management**: Zustand with Immer middleware. All state lives in [useAppStore.ts](src/store/useAppStore.ts).
- **Data persistence**: Firebase Firestore. Each plantation is a document with all data (spaces, plants, strains, inventory). Auto-save with 1.5s debounce via [usePlantation.ts](src/hooks/usePlantation.ts).
- **Authentication**: Firebase Auth with Google Sign-In. See [useAuth.ts](src/hooks/useAuth.ts).
- **Routing**: React Router. `/` — plantation list, `/p/:id` — plantation view, `/p/:id?view=1` — read-only sharing.
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

### Plant Timeline System

Plants have two key date fields:
- `startedAt`: When the plant record was created (used for future planning)
- `stageStartedAt`: When the current stage began (auto-updated on stage change)
- `customStageDays`: Optional per-plant overrides for stage durations (partial record)

Timeline calculation uses `buildPlantTimelineSegments()` in [grid.ts](src/utils/grid.ts) as single source of truth:
- Returns array of `TimelineSegment` objects with stage, startDay, endDay (relative to today)
- Past is calculated based on current stage - all previous stages shown with their durations
- Future is calculated from `stageStartedAt` + remaining days in current stage + future stages
- Uses `customStageDays` if set, otherwise falls back to `STAGE_DAYS` defaults
- When stage changes via Inspector, `stageStartedAt` is automatically set to current date

Plant lifecycle stages (in order):
- **germinating** (GRM): Fixed 1 week, non-editable
- **seedling** (SDL): Default 14 days, editable
- **vegetative** (VEG): Default 30 days, editable
- **flowering** (FLW): Default 60 days, editable
- **harvested** (HRV): Fixed 1 week, non-editable

Time View features:
- Past segments (below TODAY line): full color, based on completed stages
- Future segments (above TODAY line): 50% opacity, based on remaining time
- Stage labels (GRM, SDL, VEG, FLW, HRV) displayed on each segment
- Stage boundaries shown as draggable handles (14px thick) for editable stages
- Tap on empty column above TODAY with seed selected to plan future plants

### Time View Drag Interactions

Drag modes (`TimeViewDragMode` in types):
- **plant-move**: Drag plant column to reposition horizontally
- **stage-resize**: Drag stage handle to adjust duration

Stage handle detection in `getPlantStageHandles()`:
- Only editable stages (seedling, vegetative, flowering) have handles
- Handles appear at stage boundaries in the future portion
- Uses `buildPlantTimelineSegments()` for consistent coordinate calculation

Important: Canvas uses Device Pixel Ratio (DPR) scaling. Handle detection must divide `canvas.height` by DPR to get CSS coordinates.

### View Modes

- **Space View** (X-Y): Top-down view of all spaces and plants
- **Time View** (Cells-Time): Gantt-style timeline showing plant lifecycles with past/future visualization

## Design Constraints

From spec.md - these are intentional limitations:

- 4-color palette: dark blue background (#1A1A2E), green, orange, teal accents
- Monospace font only, two sizes (14px/18px)
- No modals, tables, or sidebars - only Hotbar, Inspector popup, and Canvas
- Text symbols (▢, ✕, ⚙) instead of SVG icons
