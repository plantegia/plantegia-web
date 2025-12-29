import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  Space,
  Plant,
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
} from '../types';
import { generateAbbreviation, generatePlantCode } from '../utils/abbreviation';
import { DEFAULT_ZOOM } from '../constants';

interface AppState {
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

  timelineOffset: number;
  timelineHorizontalOffset: number;

  loadPlantation: (plantation: Plantation) => void;
  resetStore: () => void;

  createSpace: (space: Omit<Space, 'id'>) => string;
  updateSpace: (id: string, updates: Partial<Omit<Space, 'id'>>) => void;
  deleteSpace: (id: string) => void;

  createPlant: (data: {
    spaceId: string;
    strainId: string | null;
    gridX: number;
    gridY: number;
    size?: PlantSize;
    stage?: Stage;
    generation?: Generation;
    startedAt?: string;
  }) => string;
  updatePlant: (id: string, updates: Partial<Omit<Plant, 'id' | 'code'>>) => void;
  deletePlant: (id: string) => void;

  createStrain: (data: { name: string; floweringDays?: number; vegDays?: number }) => string;
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

  setTimelineOffset: (offset: number) => void;
  setTimelineHorizontalOffset: (offset: number) => void;
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

  timelineOffset: 0,
  timelineHorizontalOffset: 0,
};

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
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
      });
    },

    resetStore: () => {
      set(() => ({ ...initialState }));
    },

    createSpace: (spaceData) => {
      const id = nanoid();
      set((state) => {
        state.spaces.push({ ...spaceData, id });
      });
      return id;
    },

    updateSpace: (id, updates) => {
      set((state) => {
        const space = state.spaces.find((s) => s.id === id);
        if (space) {
          Object.assign(space, updates);
        }
      });
    },

    deleteSpace: (id) => {
      set((state) => {
        state.spaces = state.spaces.filter((s) => s.id !== id);
        state.plants = state.plants.filter((p) => p.spaceId !== id);
        if (state.selection?.type === 'space' && state.selection.id === id) {
          state.selection = null;
        }
      });
    },

    createPlant: (data) => {
      const id = nanoid();
      const state = get();

      const strain = data.strainId
        ? state.strains.find((s) => s.id === data.strainId)
        : null;
      const abbreviation = strain?.abbreviation || 'PLT';
      const existingCodes = state.plants.map((p) => p.code);
      const code = generatePlantCode(abbreviation, existingCodes);

      const now = new Date().toISOString();
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
          startedAt: data.startedAt || now,
          stageStartedAt: data.startedAt || now,
        });
      });

      return id;
    },

    updatePlant: (id, updates) => {
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
      set((state) => {
        state.plants = state.plants.filter((p) => p.id !== id);
        if (state.selection?.type === 'plant' && state.selection.id === id) {
          state.selection = null;
        }
      });
    },

    createStrain: (data) => {
      const id = nanoid();
      const abbreviation = generateAbbreviation(data.name);

      set((state) => {
        state.strains.push({
          id,
          name: data.name,
          abbreviation,
          floweringDays: data.floweringDays || 60,
          vegDays: data.vegDays || 30,
        });
      });

      return id;
    },

    updateStrain: (id, updates) => {
      set((state) => {
        const strain = state.strains.find((s) => s.id === id);
        if (strain) {
          Object.assign(strain, updates);
        }
      });
    },

    deleteStrain: (id) => {
      set((state) => {
        state.strains = state.strains.filter((s) => s.id !== id);
      });
    },

    addSeed: (strainId, quantity, isClone = false) => {
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
  }))
);
