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
- **Gesture handling**: Custom gesture system in [useGestures.ts](src/hooks/useGestures.ts) handles tap, pan, zoom, and drag operations on canvas.

### Data Flow

```
User gesture → useGestures hook → useAppStore actions → Canvas re-render
                                                      ↓
                                            usePlantation (auto-save) → Firestore
```

The canvas listens to store changes and re-renders via `useCallback`/`useEffect` pattern.

### Domain Model

- **Plantation**: Top-level entity stored in Firestore. Has ownerId, name, isPublic flag.
- **Space**: A growing area (tent/room) with a grid of cells
- **Plant**: Occupies 1/2/4 cells within a space, has lifecycle stages
- **Strain**: Plant variety with flowering/veg day durations
- **Seed**: Inventory item linked to a strain

Plant codes are auto-generated as `[ABBR]-[N]` (e.g., "GRZ-1") based on strain abbreviation.

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

Timeline calculation in [grid.ts](src/utils/grid.ts) `calculatePlantTimeline()`:
- Past is calculated based on current stage - all previous stages are shown with their standard durations
- Future is calculated from `stageStartedAt` + remaining days in current stage + future stages
- When stage changes via Inspector, `stageStartedAt` is automatically set to current date

Time View features:
- Past segments (below TODAY line): full color, based on completed stages
- Future segments (above TODAY line): 50% opacity, based on remaining time
- Stage boundaries shown as lines between segments
- Tap on empty column above TODAY with seed selected to plan future plants

### View Modes

- **Space View** (X-Y): Top-down view of all spaces and plants
- **Time View** (Cells-Time): Gantt-style timeline showing plant lifecycles with past/future visualization

## Design Constraints

From spec.md - these are intentional limitations:

- 4-color palette: dark blue background (#1A1A2E), green, orange, teal accents
- Monospace font only, two sizes (14px/18px)
- No modals, tables, or sidebars - only Hotbar, Inspector popup, and Canvas
- Text symbols (▢, ✕, ⚙) instead of SVG icons
