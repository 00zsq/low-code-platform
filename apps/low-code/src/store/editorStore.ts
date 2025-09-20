import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ComponentConfig, CanvasConfig } from '../types/editor';

/**
 * 编辑器状态接口定义
 * 包含画布配置、选中状态、缩放比例等核心状态
 */
interface EditorState {
  /** 画布配置，包含组件列表和样式 */
  canvas: CanvasConfig;
  /** 当前选中的组件ID，null表示未选中任何组件 */
  selectedId: string | null;
  /** 画布缩放比例，1表示100%，0.5表示50% */
  canvasScale: number;

  // ==================== 状态操作方法 ====================

  /** 添加根级组件到画布 */
  addComponent: (component: Omit<ComponentConfig, 'id'>) => void;
  /** 添加子组件到指定父组件 */
  addChildComponent: (
    parentId: string,
    component: Omit<ComponentConfig, 'id'>
  ) => void;
  /** 删除指定组件（包括其所有子组件） */
  removeComponent: (id: string) => void;
  /** 更新指定组件的配置 */
  updateComponent: (id: string, updates: Partial<ComponentConfig>) => void;
  /** 复制指定组件 */
  duplicateComponent: (
    id: string,
    overrides?: Partial<ComponentConfig>
  ) => void;
  /** 选中指定组件 */
  selectComponent: (id: string | null) => void;
  /** 更新画布样式 */
  updateCanvasStyle: (style: React.CSSProperties) => void;
  /** 设置画布缩放比例 */
  setCanvasScale: (scale: number) => void;
  /** 清空画布所有组件 */
  clearCanvas: () => void;
}

/**
 * 低代码编辑器核心状态管理
 * 使用 Zustand 管理编辑器的所有状态和操作
 */
export const useEditorStore = create<EditorState>((set) => ({
  // ==================== 初始状态 ====================

  /** 画布初始配置 */
  canvas: {
    components: [], // 组件列表，支持嵌套结构
    style: {
      width: 1200, // 画布宽度
      height: 740, // 画布高度
      backgroundColor: '#ffffff', // 画布背景色
    },
  },
  /** 当前未选中任何组件 */
  selectedId: null,
  /** 画布默认100%缩放 */
  canvasScale: 1,

  // ==================== 组件操作方法 ====================

  /**
   * 添加根级组件到画布
   * @param component 组件配置（不包含id，会自动生成）
   */
  addComponent: (component) => {
    // 使用 nanoid 生成唯一ID
    const newComponent = { ...component, id: nanoid() };
    set((state) => ({
      canvas: {
        ...state.canvas,
        // 将新组件添加到根级组件列表
        components: [...state.canvas.components, newComponent],
      },
      // 自动选中新添加的组件
      selectedId: newComponent.id,
    }));
  },

  /**
   * 添加子组件到指定父组件
   * @param parentId 父组件ID
   * @param component 子组件配置
   */
  addChildComponent: (parentId, component) => {
    const newChild = { ...component, id: nanoid() };

    /**
     * 递归遍历组件树，找到目标父组件并添加子组件
     * @param components 当前层级的组件列表
     * @returns 更新后的组件列表
     */
    const addToTree = (components: ComponentConfig[]): ComponentConfig[] => {
      return components.map((c) => {
        // 找到目标父组件
        if (c.id === parentId) {
          const currentChildren = c.children || [];
          return { ...c, children: [...currentChildren, newChild] };
        }
        // 递归搜索子组件
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
      // 自动选中新添加的子组件
      selectedId: newChild.id,
    }));
  },

  /**
   * 删除指定组件及其所有子组件
   * @param id 要删除的组件ID
   */
  removeComponent: (id) => {
    /**
     * 递归删除组件树中的指定组件
     * @param components 当前层级的组件列表
     * @returns 删除指定组件后的组件列表
     */
    const removeFromTree = (
      components: ComponentConfig[]
    ): ComponentConfig[] => {
      return (
        components
          // 过滤掉目标组件
          .filter((comp) => comp.id !== id)
          // 递归处理子组件
          .map((comp) =>
            comp.children && comp.children.length > 0
              ? { ...comp, children: removeFromTree(comp.children) }
              : comp
          )
      );
    };

    set((state) => ({
      canvas: {
        ...state.canvas,
        components: removeFromTree(state.canvas.components),
      },
      // 如果删除的是当前选中的组件，则取消选中
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  /**
   * 更新指定组件的配置
   * @param id 组件ID
   * @param updates 要更新的配置项
   */
  updateComponent: (id, updates) => {
    /**
     * 递归更新组件树中的指定组件
     * @param components 当前层级的组件列表
     * @returns 更新后的组件列表
     */
    const updateInTree = (components: ComponentConfig[]): ComponentConfig[] => {
      return components.map((comp) => {
        // 找到目标组件，合并更新
        if (comp.id === id) return { ...comp, ...updates };
        // 递归处理子组件
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

  /**
   * 复制指定组件（深拷贝，包括所有子组件）
   * @param id 要复制的组件ID
   * @param overrides 可选的覆盖配置
   */
  duplicateComponent: (id, overrides) => {
    /**
     * 深度克隆组件，为所有组件生成新的ID
     * @param comp 要克隆的组件
     * @returns 克隆后的组件
     */
    const cloneComp = (comp: ComponentConfig): ComponentConfig => ({
      ...comp,
      id: nanoid(), // 生成新的唯一ID
      children: comp.children?.map(cloneComp), // 递归克隆子组件
    });

    /**
     * 在组件树中查找指定ID的组件
     * @param components 组件列表
     * @returns 找到的组件或null
     */
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
      if (!target) return state; // 未找到目标组件，不做任何操作

      // 克隆组件并应用覆盖配置
      const cloned = { ...cloneComp(target), ...overrides };
      return {
        canvas: {
          ...state.canvas,
          // 将克隆的组件添加到根级组件列表
          components: [...state.canvas.components, cloned],
        },
        // 自动选中克隆的组件
        selectedId: cloned.id,
      };
    });
  },

  /**
   * 选中指定组件
   * @param id 组件ID，null表示取消选中
   */
  selectComponent: (id) => {
    set({ selectedId: id });
  },

  /**
   * 更新画布样式
   * @param style 要更新的样式属性
   */
  updateCanvasStyle: (style) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        style: { ...state.canvas.style, ...style },
      },
    }));
  },

  /**
   * 设置画布缩放比例
   * @param scale 缩放比例（0.1-2.0）
   */
  setCanvasScale: (scale) => {
    set({ canvasScale: scale });
  },

  /**
   * 清空画布所有组件
   */
  clearCanvas: () => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        components: [], // 清空组件列表
      },
      selectedId: null, // 取消选中
    }));
  },
}));
