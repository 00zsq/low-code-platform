import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ComponentConfig, CanvasConfig } from '../types/editor';

interface EditorState {
  canvas: CanvasConfig;
  selectedId: string | null;
  canvasScale: number;

  // Actions
  addComponent: (component: Omit<ComponentConfig, 'id'>) => void;
  addChildComponent: (
    parentId: string,
    component: Omit<ComponentConfig, 'id'>
  ) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
  duplicateComponent: (
    id: string,
    overrides?: Partial<ComponentConfig>
  ) => void;
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

  addChildComponent: (parentId, component) => {
    const newChild = { ...component, id: nanoid() };
    const addToTree = (components: ComponentConfig[]): ComponentConfig[] => {
      return components.map((c) => {
        if (c.id === parentId) {
          const currentChildren = c.children || [];
          return { ...c, children: [...currentChildren, newChild] };
        }
        if (c.children && c.children.length > 0) {
          return { ...c, children: addToTree(c.children) };
        }
        return c;
      });
    };
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: addToTree(state.canvas.components),
      },
      selectedId: newChild.id,
    }));
  },

  removeComponent: (id) => {
    const removeFromTree = (
      components: ComponentConfig[]
    ): ComponentConfig[] => {
      return components
        .filter((comp) => comp.id !== id)
        .map((comp) =>
          comp.children && comp.children.length > 0
            ? { ...comp, children: removeFromTree(comp.children) }
            : comp
        );
    };
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: removeFromTree(state.canvas.components),
      },
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  updateComponent: (id, updates) => {
    const updateInTree = (components: ComponentConfig[]): ComponentConfig[] => {
      return components.map((comp) => {
        if (comp.id === id) return { ...comp, ...updates };
        if (comp.children && comp.children.length > 0) {
          return { ...comp, children: updateInTree(comp.children) };
        }
        return comp;
      });
    };
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: updateInTree(state.canvas.components),
      },
    }));
  },

  duplicateComponent: (id, overrides) => {
    const cloneComp = (comp: ComponentConfig): ComponentConfig => ({
      ...comp,
      id: nanoid(),
      children: comp.children?.map(cloneComp),
    });
    const findById = (
      components: ComponentConfig[]
    ): ComponentConfig | null => {
      for (const c of components) {
        if (c.id === id) return c;
        if (c.children) {
          const found = findById(c.children);
          if (found) return found;
        }
      }
      return null;
    };
    set((state) => {
      const target = findById(state.canvas.components);
      if (!target) return state;
      const cloned = { ...cloneComp(target), ...overrides };
      return {
        canvas: {
          ...state.canvas,
          components: [...state.canvas.components, cloned],
        },
        selectedId: cloned.id,
      };
    });
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
