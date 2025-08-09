import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ComponentConfig, CanvasConfig } from '../types/editor';

interface EditorState {
  canvas: CanvasConfig;
  selectedId: string | null;
  canvasScale: number;
  
  // Actions
  addComponent: (component: Omit<ComponentConfig, 'id'>) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
  selectComponent: (id: string | null) => void;
  updateCanvasStyle: (style: React.CSSProperties) => void;
  setCanvasScale: (scale: number) => void;
  clearCanvas: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  canvas: {
    components: [],
    style: {
      width: 1200,
      height: 740,
      backgroundColor: '#ffffff',
    },
  },
  selectedId: null,
  canvasScale: 1,

  addComponent: (component) => {
    const newComponent = { ...component, id: nanoid() };
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: [...state.canvas.components, newComponent],
      },
      selectedId: newComponent.id,
    }));
  },

  removeComponent: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: state.canvas.components.filter((comp) => comp.id !== id),
      },
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: state.canvas.components.map((comp) => 
          comp.id === id ? { ...comp, ...updates } : comp
        ),
      },
    }));
  },

  selectComponent: (id) => {
    set({ selectedId: id });
  },

  updateCanvasStyle: (style) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        style: { ...state.canvas.style, ...style },
      },
    }));
  },

  setCanvasScale: (scale) => {
    set({ canvasScale: scale });
  },

  clearCanvas: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: [],
      },
      selectedId: null,
    }));
  },
}));