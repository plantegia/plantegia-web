import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  Space,
  Plant,
  PlantSegment,
  Strain,
  Seed,
  Selection,
  Tool,
  ViewMode,
  Point,
  Stage,
  PlantSize,
  Generation,
  Plantation,
  SlotId,
  StrainType,
  Photoperiod,
  TimeViewPlacementPreview,
  PlantDragPreview,
  LongPressPreview,
} from '../types';
import { generateAbbreviation, generatePlantCode } from '../utils/abbreviation';
import { DEFAULT_ZOOM, DEFAULT_TIMELINE_ZOOM, CURSORS, CELL_SIZE } from '../constants';
import { getCurrentSegment } from '../utils/migration';
import { TIME_VIEW_CONSTANTS, buildSlotList } from '../utils/grid';

interface DataSnapshot {
  spaces: Space[];
  plants: Plant[];
  strains: Strain[];
  inventory: Seed[];
}

interface HistoryState {
  past: DataSnapshot[];
  future: DataSnapshot[];
}

export interface AppState {
  currentPlantationId: string | null;
  spaces: Space[];
  plants: Plant[];
  strains: Strain[];
  inventory: Seed[];

  viewMode: ViewMode;
  activeTool: Tool | null;
  selectedSeedId: string | null;
  selection: Selection | null;

  pan: Point;
  zoom: number;

  dragPreview: { startX: number; startY: number; endX: number; endY: number } | null;

  canvasCursor: string;

  splitPreview: { x: number; plantId: string; segmentId: string } | null;

  placementPreview: { worldX: number; worldY: number; canPlace: boolean; abbreviation: string } | null;

  timeViewPlacementPreview: TimeViewPlacementPreview | null;

  plantDragPreview: PlantDragPreview | null;

  longPressPreview: LongPressPreview | null;

  timelineOffset: number;
  timelineHorizontalOffset: number;
  timelineZoom: number;

  expandedHotbarSection: 'toolbox' | 'inventory';

  history: HistoryState;

  loadPlantation: (plantation: Plantation) => void;
  resetStore: () => void;

  createSpace: (space: Omit<Space, 'id'>) => string;
  updateSpace: (id: string, updates: Partial<Omit<Space, 'id'>>, skipHistory?: boolean) => void;
  deleteSpace: (id: string) => void;

  createPlant: (data: {
    spaceId: string | null;
    strainId: string | null;
    gridX: number;
    gridY: number;
    size?: PlantSize;
    stage?: Stage;
    generation?: Generation;
    startedAt?: string;
  }) => string;
  updatePlant: (id: string, updates: Partial<Omit<Plant, 'id' | 'code'>>, skipHistory?: boolean) => void;
  deletePlant: (id: string) => void;

  // Segment operations
  splitSegment: (plantId: string, segmentId: string, splitDate: Date) => void;
  mergeSegments: (plantId: string, segmentIndex: number) => void;
  moveSegmentToSlot: (plantId: string, segmentId: string, slot: SlotId) => void;
  shiftPlantInTime: (plantId: string, daysDelta: number) => void;
  resizeSegment: (plantId: string, segmentId: string, edge: 'start' | 'end', newDate: Date) => void;
  movePlantInSpaceView: (plantId: string, newSpaceId: string | null, newGridX: number, newGridY: number) => void;

  createStrain: (data: { name: string; floweringDays?: number; vegDays?: number; strainType?: StrainType; photoperiod?: Photoperiod }) => string;
  updateStrain: (id: string, updates: Partial<Omit<Strain, 'id'>>) => void;
  deleteStrain: (id: string) => void;

  addSeed: (strainId: string, quantity: number, isClone?: boolean) => void;
  consumeSeed: (seedId: string) => void;
  updateSeedQuantity: (seedId: string, quantity: number) => void;

  setViewMode: (mode: ViewMode) => void;
  setActiveTool: (tool: Tool | null) => void;
  selectSeed: (seedId: string | null) => void;
  setSelection: (selection: Selection | null) => void;

  setPan: (pan: Point) => void;
  setZoom: (zoom: number) => void;

  setDragPreview: (preview: { startX: number; startY: number; endX: number; endY: number } | null) => void;

  setCanvasCursor: (cursor: string) => void;

  setSplitPreview: (preview: { x: number; plantId: string; segmentId: string } | null) => void;

  setPlacementPreview: (preview: { worldX: number; worldY: number; canPlace: boolean; abbreviation: string } | null) => void;

  setTimeViewPlacementPreview: (preview: TimeViewPlacementPreview | null) => void;

  setPlantDragPreview: (preview: PlantDragPreview | null) => void;

  setLongPressPreview: (preview: LongPressPreview | null) => void;

  setTimelineOffset: (offset: number) => void;
  setTimelineHorizontalOffset: (offset: number) => void;
  setTimelineZoom: (zoom: number) => void;

  setExpandedHotbarSection: (section: 'toolbox' | 'inventory') => void;

  centerView: (canvasWidth: number, canvasHeight: number) => void;
  getIdealCenter: (canvasWidth: number, canvasHeight: number) => { pan: Point; timelineOffset: number; timelineHorizontalOffset: number };

  // Save current state to history (call before starting a drag operation)
  saveSnapshot: () => void;

  undo: () => void;
  redo: () => void;
}

const initialState = {
  currentPlantationId: null as string | null,
  spaces: [] as Space[],
  plants: [] as Plant[],
  strains: [] as Strain[],
  inventory: [] as Seed[],

  viewMode: 'space' as ViewMode,
  activeTool: null as Tool | null,
  selectedSeedId: null as string | null,
  selection: null as Selection | null,

  pan: { x: 20, y: 20 },
  zoom: DEFAULT_ZOOM,

  dragPreview: null as { startX: number; startY: number; endX: number; endY: number } | null,

  canvasCursor: CURSORS.default,

  splitPreview: null as { x: number; plantId: string; segmentId: string } | null,

  placementPreview: null as { worldX: number; worldY: number; canPlace: boolean; abbreviation: string } | null,

  timeViewPlacementPreview: null as TimeViewPlacementPreview | null,

  plantDragPreview: null as PlantDragPreview | null,

  longPressPreview: null as LongPressPreview | null,

  timelineOffset: 0,
  timelineHorizontalOffset: 0,
  timelineZoom: DEFAULT_TIMELINE_ZOOM,

  expandedHotbarSection: 'toolbox' as 'toolbox' | 'inventory',

  history: {
    past: [],
    future: [],
  } as HistoryState,
};

const HISTORY_LIMIT = 50;

export const useAppStore = create<AppState>()(
  immer((set, get) => {
    const saveToHistory = () => {
      const { spaces, plants, strains, inventory } = get();
      const snapshot: DataSnapshot = {
        spaces: JSON.parse(JSON.stringify(spaces)),
        plants: JSON.parse(JSON.stringify(plants)),
        strains: JSON.parse(JSON.stringify(strains)),
        inventory: JSON.parse(JSON.stringify(inventory)),
      };

      set((state) => {
        state.history.past.push(snapshot);
        if (state.history.past.length > HISTORY_LIMIT) {
          state.history.past.shift();
        }
        state.history.future = [];
      });
    };

    return {
      ...initialState,

      loadPlantation: (plantation) => {
        set((state) => {
          state.currentPlantationId = plantation.id;
          state.spaces = plantation.spaces;
          state.plants = plantation.plants;
          state.strains = plantation.strains;
          state.inventory = plantation.inventory;
          // Reset UI state
          state.viewMode = 'space';
          state.activeTool = null;
          state.selectedSeedId = null;
          state.selection = null;
          state.pan = { x: 20, y: 20 };
          state.zoom = DEFAULT_ZOOM;
          state.dragPreview = null;
          state.timelineOffset = 0;
          state.timelineHorizontalOffset = 0;
          state.timelineZoom = DEFAULT_TIMELINE_ZOOM;
          // Clear history on plantation load
          state.history = { past: [], future: [] };
        });
      },

      resetStore: () => {
        set(() => ({ ...initialState }));
      },

      createSpace: (spaceData) => {
        saveToHistory();
        const id = nanoid();
        set((state) => {
          state.spaces.push({ ...spaceData, id });
        });
        return id;
      },

      updateSpace: (id, updates, skipHistory = false) => {
        if (!skipHistory) saveToHistory();
        set((state) => {
          const space = state.spaces.find((s) => s.id === id);
          if (space) {
            Object.assign(space, updates);
          }
        });
      },

      deleteSpace: (id) => {
        saveToHistory();
        set((state) => {
          state.spaces = state.spaces.filter((s) => s.id !== id);
          // Detach plants from deleted space instead of deleting them
          state.plants.forEach((plant) => {
            if (plant.spaceId === id) {
              plant.spaceId = null;
            }
            // Also detach segments belonging to this space
            plant.segments?.forEach((segment) => {
              if (segment.spaceId === id) {
                segment.spaceId = null;
              }
            });
          });
          if (state.selection?.type === 'space' && state.selection.id === id) {
            state.selection = null;
          }
        });
      },

      createPlant: (data) => {
        saveToHistory();
        const id = nanoid();
        const state = get();

        const strain = data.strainId
          ? state.strains.find((s) => s.id === data.strainId)
          : null;
        const abbreviation = strain?.abbreviation || 'PLT';
        const existingCodes = state.plants.map((p) => p.code);
        const code = generatePlantCode(abbreviation, existingCodes);

        const now = new Date().toISOString();
        const startDate = data.startedAt || now;

        // Create initial segment
        const initialSegment: PlantSegment = {
          id: nanoid(),
          spaceId: data.spaceId,
          gridX: data.gridX,
          gridY: data.gridY,
          startDate,
          endDate: null,
        };

        set((s) => {
          s.plants.push({
            id,
            code,
            strainId: data.strainId,
            spaceId: data.spaceId,
            gridX: data.gridX,
            gridY: data.gridY,
            size: data.size || 1,
            stage: data.stage || 'germinating',
            generation: data.generation || 'seed',
            startedAt: startDate,
            stageStartedAt: startDate,
            segments: [initialSegment],
          });
        });

        return id;
      },

      updatePlant: (id, updates, skipHistory = false) => {
        if (!skipHistory) saveToHistory();
        set((state) => {
          const plant = state.plants.find((p) => p.id === id);
          if (plant) {
            if (updates.stage && updates.stage !== plant.stage) {
              updates.stageStartedAt = new Date().toISOString();
            }
            Object.assign(plant, updates);
          }
        });
      },

      deletePlant: (id) => {
        saveToHistory();
        set((state) => {
          state.plants = state.plants.filter((p) => p.id !== id);
          if (state.selection?.type === 'plant' && state.selection.id === id) {
            state.selection = null;
          }
        });
      },

      splitSegment: (plantId, segmentId, splitDate) => {
        saveToHistory();
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          const segmentIndex = plant.segments.findIndex((s) => s.id === segmentId);
          if (segmentIndex === -1) return;

          const segment = plant.segments[segmentIndex];
          const splitDateStr = splitDate.toISOString().split('T')[0];

          // Original segment ends at split point
          const newSegment1: PlantSegment = {
            ...segment,
            endDate: splitDateStr,
          };

          // New segment starts at split point (same location initially)
          const newSegment2: PlantSegment = {
            id: nanoid(),
            spaceId: segment.spaceId,
            gridX: segment.gridX,
            gridY: segment.gridY,
            startDate: splitDateStr,
            endDate: segment.endDate,
          };

          // Replace original with two segments
          plant.segments.splice(segmentIndex, 1, newSegment1, newSegment2);
        });
      },

      mergeSegments: (plantId, segmentIndex) => {
        saveToHistory();
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          // segmentIndex is the index of the first segment to merge
          if (segmentIndex < 0 || segmentIndex >= plant.segments.length - 1) return;

          const seg1 = plant.segments[segmentIndex];
          const seg2 = plant.segments[segmentIndex + 1];

          // Merge: keep seg1's start, take seg2's end
          const mergedSegment: PlantSegment = {
            id: seg1.id,
            spaceId: seg1.spaceId,
            gridX: seg1.gridX,
            gridY: seg1.gridY,
            startDate: seg1.startDate,
            endDate: seg2.endDate,
          };

          // Replace both segments with merged one
          plant.segments.splice(segmentIndex, 2, mergedSegment);
        });
      },

      moveSegmentToSlot: (plantId, segmentId, slot) => {
        saveToHistory();
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          const segment = plant.segments.find((s) => s.id === segmentId);
          if (!segment) return;

          segment.spaceId = slot.spaceId;
          segment.gridX = slot.gridX;
          segment.gridY = slot.gridY;

          // Sync backward compat fields with current segment
          const currentSeg = getCurrentSegment(plant);
          if (currentSeg) {
            plant.spaceId = currentSeg.spaceId;
            plant.gridX = currentSeg.gridX;
            plant.gridY = currentSeg.gridY;
          }
        });
      },

      shiftPlantInTime: (plantId, daysDelta) => {
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          const addDays = (dateStr: string, days: number): string => {
            const date = new Date(dateStr);
            date.setDate(date.getDate() + days);
            return date.toISOString();
          };

          // Shift startedAt
          plant.startedAt = addDays(plant.startedAt, daysDelta);
          plant.stageStartedAt = addDays(plant.stageStartedAt, daysDelta);

          // Shift all segment dates
          plant.segments.forEach((segment) => {
            segment.startDate = addDays(segment.startDate, daysDelta);
            if (segment.endDate) {
              segment.endDate = addDays(segment.endDate, daysDelta);
            }
          });
        });
      },

      resizeSegment: (plantId, segmentId, edge, newDate) => {
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          const segmentIndex = plant.segments.findIndex((s) => s.id === segmentId);
          if (segmentIndex === -1) return;

          const segment = plant.segments[segmentIndex];
          const newDateStr = newDate.toISOString().split('T')[0];

          if (edge === 'start') {
            // Moving start date
            // If this is the first segment, also update plant.startedAt
            if (segmentIndex === 0) {
              plant.startedAt = newDate.toISOString();
              plant.stageStartedAt = newDate.toISOString();
            }
            // Update previous segment's endDate if exists
            if (segmentIndex > 0) {
              plant.segments[segmentIndex - 1].endDate = newDateStr;
            }
            segment.startDate = newDateStr;
          } else {
            // Moving end date
            segment.endDate = newDateStr;
            // Update next segment's startDate if exists
            if (segmentIndex < plant.segments.length - 1) {
              plant.segments[segmentIndex + 1].startDate = newDateStr;
            }
          }
        });
      },

      movePlantInSpaceView: (plantId, newSpaceId, newGridX, newGridY) => {
        saveToHistory();
        set((state) => {
          const plant = state.plants.find((p) => p.id === plantId);
          if (!plant || !plant.segments) return;

          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];

          // Find current segment (the one active today)
          const currentSegment = getCurrentSegment(plant, today);
          if (!currentSegment) return;

          // Check if already at the same position
          if (currentSegment.spaceId === newSpaceId &&
              currentSegment.gridX === newGridX &&
              currentSegment.gridY === newGridY) {
            return;
          }

          const segmentIndex = plant.segments.findIndex((s) => s.id === currentSegment.id);
          if (segmentIndex === -1) return;

          // Check if today is at the start of current segment (no need to split)
          const segmentStartStr = currentSegment.startDate.split('T')[0];
          if (segmentStartStr === todayStr) {
            // Just update the current segment's location
            currentSegment.spaceId = newSpaceId;
            currentSegment.gridX = newGridX;
            currentSegment.gridY = newGridY;
          } else {
            // Split: end current segment yesterday, create new segment starting today
            currentSegment.endDate = todayStr;

            const newSegment: PlantSegment = {
              id: nanoid(),
              spaceId: newSpaceId,
              gridX: newGridX,
              gridY: newGridY,
              startDate: todayStr,
              endDate: null,
            };

            // Insert new segment after current
            plant.segments.splice(segmentIndex + 1, 0, newSegment);
          }

          // Update backward compat fields
          plant.spaceId = newSpaceId;
          plant.gridX = newGridX;
          plant.gridY = newGridY;
        });
      },

      createStrain: (data) => {
        saveToHistory();
        const id = nanoid();
        const abbreviation = generateAbbreviation(data.name);

        set((state) => {
          state.strains.push({
            id,
            name: data.name,
            abbreviation,
            floweringDays: data.floweringDays || 60,
            vegDays: data.vegDays || 30,
            strainType: data.strainType,
            photoperiod: data.photoperiod,
          });
        });

        return id;
      },

      updateStrain: (id, updates) => {
        saveToHistory();
        set((state) => {
          const strain = state.strains.find((s) => s.id === id);
          if (strain) {
            Object.assign(strain, updates);
          }
        });
      },

      deleteStrain: (id) => {
        saveToHistory();
        set((state) => {
          state.strains = state.strains.filter((s) => s.id !== id);
        });
      },

      addSeed: (strainId, quantity, isClone = false) => {
        saveToHistory();
        set((state) => {
          const existing = state.inventory.find(
            (s) => s.strainId === strainId && s.isClone === isClone
          );
          if (existing) {
            existing.quantity += quantity;
          } else {
            state.inventory.push({
              id: nanoid(),
              strainId,
              quantity,
              isClone,
            });
          }
        });
      },

      consumeSeed: (seedId) => {
        saveToHistory();
        set((state) => {
          const seed = state.inventory.find((s) => s.id === seedId);
          if (seed && seed.quantity > 0) {
            seed.quantity -= 1;
            if (seed.quantity === 0) {
              state.inventory = state.inventory.filter((s) => s.id !== seedId);
              if (state.selectedSeedId === seedId) {
                state.selectedSeedId = null;
              }
            }
          }
        });
      },

      updateSeedQuantity: (seedId, quantity) => {
        saveToHistory();
        set((state) => {
          const seed = state.inventory.find((s) => s.id === seedId);
          if (seed) {
            seed.quantity = Math.max(0, quantity);
            if (seed.quantity === 0) {
              state.inventory = state.inventory.filter((s) => s.id !== seedId);
              if (state.selectedSeedId === seedId) {
                state.selectedSeedId = null;
              }
            }
          }
        });
      },

      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
          state.selection = null;
        });
      },

      setActiveTool: (tool) => {
        set((state) => {
          state.activeTool = tool;
          state.selectedSeedId = null;
          state.selection = null;
        });
      },

      selectSeed: (seedId) => {
        set((state) => {
          state.selectedSeedId = seedId;
          state.activeTool = null;
          state.selection = null;
        });
      },

      setSelection: (selection) => {
        set((state) => {
          state.selection = selection;
        });
      },

      setPan: (pan) => {
        set((state) => {
          state.pan = pan;
        });
      },

      setZoom: (zoom) => {
        set((state) => {
          state.zoom = zoom;
        });
      },

      setDragPreview: (preview) => {
        set((state) => {
          state.dragPreview = preview;
        });
      },

      setCanvasCursor: (cursor) => {
        set((state) => {
          state.canvasCursor = cursor;
        });
      },

      setSplitPreview: (preview) => {
        set((state) => {
          state.splitPreview = preview;
        });
      },

      setPlacementPreview: (preview) => {
        set((state) => {
          state.placementPreview = preview;
        });
      },

      setTimeViewPlacementPreview: (preview) => {
        set((state) => {
          state.timeViewPlacementPreview = preview;
        });
      },

      setPlantDragPreview: (preview) => {
        set((state) => {
          state.plantDragPreview = preview;
        });
      },

      setLongPressPreview: (preview) => {
        set((state) => {
          state.longPressPreview = preview;
        });
      },

      setTimelineOffset: (offset) => {
        set((state) => {
          state.timelineOffset = offset;
        });
      },

      setTimelineHorizontalOffset: (offset) => {
        set((state) => {
          state.timelineHorizontalOffset = offset;
        });
      },

      setTimelineZoom: (zoom) => {
        set((state) => {
          state.timelineZoom = zoom;
        });
      },

      setExpandedHotbarSection: (section) => {
        set((state) => {
          state.expandedHotbarSection = section;
        });
      },

      getIdealCenter: (canvasWidth, canvasHeight) => {
        const { spaces, plants, viewMode, zoom } = get();

        if (viewMode === 'space') {
          // Calculate bounds of all spaces
          if (spaces.length === 0) {
            return {
              pan: { x: canvasWidth / 2, y: canvasHeight / 2 },
              timelineOffset: 0,
              timelineHorizontalOffset: 0,
            };
          }

          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          spaces.forEach(space => {
            minX = Math.min(minX, space.originX);
            minY = Math.min(minY, space.originY);
            maxX = Math.max(maxX, space.originX + space.gridWidth * CELL_SIZE);
            maxY = Math.max(maxY, space.originY + space.gridHeight * CELL_SIZE);
          });

          const contentCenterX = (minX + maxX) / 2;
          const contentCenterY = (minY + maxY) / 2;

          // Center content on screen (ignoring header/hotbar - they overlay the canvas)
          const newPanX = canvasWidth / 2 - contentCenterX * zoom;
          const newPanY = canvasHeight / 2 - contentCenterY * zoom;

          return {
            pan: { x: newPanX, y: newPanY },
            timelineOffset: 0,
            timelineHorizontalOffset: 0,
          };
        } else {
          // Time View: TODAY in the middle horizontally, content centered vertically
          const { topMargin, slotHeight, spaceHeaderHeight } = TIME_VIEW_CONSTANTS;

          // Calculate total content height
          const slots = buildSlotList(spaces, plants);
          let totalContentHeight = 0;
          slots.forEach(slot => {
            totalContentHeight += slot.isSpaceHeader ? spaceHeaderHeight : slotHeight;
          });

          // TODAY should be in the center of the screen
          const idealHorizontalOffset = canvasWidth / 2;

          // Center content vertically on screen
          // Content renders at: topMargin + yOffset - timelineOffset
          // Visual center of content = topMargin + totalContentHeight / 2
          // We want this at canvasHeight / 2
          const contentVisualCenter = topMargin + totalContentHeight / 2;
          const idealVerticalOffset = contentVisualCenter - canvasHeight / 2;

          return {
            pan: { x: 0, y: 0 },
            timelineOffset: Math.max(0, idealVerticalOffset),
            timelineHorizontalOffset: idealHorizontalOffset,
          };
        }
      },

      centerView: (canvasWidth, canvasHeight) => {
        const ideal = get().getIdealCenter(canvasWidth, canvasHeight);
        const { viewMode } = get();

        set((state) => {
          if (viewMode === 'space') {
            state.pan = ideal.pan;
          } else {
            state.timelineOffset = ideal.timelineOffset;
            state.timelineHorizontalOffset = ideal.timelineHorizontalOffset;
          }
        });
      },

      saveSnapshot: () => {
        saveToHistory();
      },

      undo: () => {
        const { history, spaces, plants, strains, inventory } = get();
        if (history.past.length === 0) return;

        const currentSnapshot: DataSnapshot = {
          spaces: JSON.parse(JSON.stringify(spaces)),
          plants: JSON.parse(JSON.stringify(plants)),
          strains: JSON.parse(JSON.stringify(strains)),
          inventory: JSON.parse(JSON.stringify(inventory)),
        };

        const previousSnapshot = history.past[history.past.length - 1];

        set((state) => {
          state.spaces = previousSnapshot.spaces;
          state.plants = previousSnapshot.plants;
          state.strains = previousSnapshot.strains;
          state.inventory = previousSnapshot.inventory;
          state.history.past.pop();
          state.history.future.push(currentSnapshot);
          state.selection = null;
        });
      },

      redo: () => {
        const { history, spaces, plants, strains, inventory } = get();
        if (history.future.length === 0) return;

        const currentSnapshot: DataSnapshot = {
          spaces: JSON.parse(JSON.stringify(spaces)),
          plants: JSON.parse(JSON.stringify(plants)),
          strains: JSON.parse(JSON.stringify(strains)),
          inventory: JSON.parse(JSON.stringify(inventory)),
        };

        const nextSnapshot = history.future[history.future.length - 1];

        set((state) => {
          state.spaces = nextSnapshot.spaces;
          state.plants = nextSnapshot.plants;
          state.strains = nextSnapshot.strains;
          state.inventory = nextSnapshot.inventory;
          state.history.future.pop();
          state.history.past.push(currentSnapshot);
          state.selection = null;
        });
      },

    };
  })
);
