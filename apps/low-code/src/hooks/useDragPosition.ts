import { useCallback, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

/**
 * 拖拽定位配置选项
 */
interface DragPositionOptions {
  /** 要拖拽的组件ID */
  componentId: string;
  /** 拖拽开始时的回调 */
  onDragStart?: () => void;
  /** 拖拽结束时的回调 */
  onDragEnd?: () => void;
  /** 拖拽过程中的回调，返回当前位置 */
  onDrag?: (position: { left: number; top: number }) => void;
}

/**
 * 自定义拖拽定位 Hook
 * 实现组件在画布上的自由拖拽定位功能
 * 支持画布缩放、边界检查、实时位置更新等特性
 *
 * @param options 拖拽配置选项
 * @returns 拖拽处理函数和状态
 */
export const useDragPosition = ({
  componentId,
  onDragStart,
  onDragEnd,
  onDrag,
}: DragPositionOptions) => {
  // 使用 useRef 保存拖拽状态，避免闭包问题
  const isDraggingRef = useRef(false); // 是否正在拖拽
  const startPositionRef = useRef({ x: 0, y: 0 }); // 拖拽开始时的鼠标位置
  const initialStyleRef = useRef({ left: 0, top: 0 }); // 拖拽开始时的组件位置

  const { updateComponent, canvas, canvasScale } = useEditorStore();

  /**
   * 处理鼠标按下事件，开始拖拽
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation(); // 阻止事件冒泡

      // 获取画布容器元素
      const canvasContainer = document.getElementById('canvas-container');
      if (!canvasContainer) return;

      // 记录拖拽开始时的鼠标位置
      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // 查找当前要拖拽的组件
      const component = canvas.components.find((c) => c.id === componentId);
      if (!component) return;

      // 解析当前组件的位置（支持px单位和纯数字）
      let currentLeft = 0;
      let currentTop = 0;

      // 解析 left 位置
      if (component.style?.left) {
        const leftStr = component.style.left.toString();
        if (leftStr.includes('px')) {
          currentLeft = parseFloat(leftStr.replace('px', ''));
        } else if (!isNaN(Number(leftStr))) {
          currentLeft = Number(leftStr);
        }
      }

      // 解析 top 位置
      if (component.style?.top) {
        const topStr = component.style.top.toString();
        if (topStr.includes('px')) {
          currentTop = parseFloat(topStr.replace('px', ''));
        } else if (!isNaN(Number(topStr))) {
          currentTop = Number(topStr);
        }
      }

      // 保存初始位置和拖拽状态
      initialStyleRef.current = { left: currentLeft, top: currentTop };
      isDraggingRef.current = true;

      // 触发拖拽开始回调
      onDragStart?.();

      /**
       * 处理鼠标移动事件，实时更新组件位置
       */
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;

        // 计算鼠标相对于起始位置的移动距离
        const deltaX = moveEvent.clientX - startPositionRef.current.x;
        const deltaY = moveEvent.clientY - startPositionRef.current.y;

        // 计算新的位置（考虑画布缩放比例）
        const newLeft = initialStyleRef.current.left + deltaX / canvasScale;
        const newTop = initialStyleRef.current.top + deltaY / canvasScale;

        // 获取画布尺寸用于边界检查
        const canvasWidth = canvas.style.width as number;
        const canvasHeight = canvas.style.height as number;

        // 解析组件尺寸（用于边界检查）
        let componentWidth = 50; // 默认宽度
        let componentHeight = 20; // 默认高度

        // 解析组件宽度
        if (component.style?.width) {
          const widthStr = component.style.width.toString();
          if (widthStr.includes('px')) {
            componentWidth = parseFloat(widthStr.replace('px', ''));
          } else if (!isNaN(Number(widthStr))) {
            componentWidth = Number(widthStr);
          }
        }

        // 解析组件高度
        if (component.style?.height) {
          const heightStr = component.style.height.toString();
          if (heightStr.includes('px')) {
            componentHeight = parseFloat(heightStr.replace('px', ''));
          } else if (!isNaN(Number(heightStr))) {
            componentHeight = Number(heightStr);
          }
        }

        // 边界检查：确保组件不会超出画布范围
        const boundedLeft = Math.max(
          0,
          Math.min(newLeft, canvasWidth - componentWidth)
        );
        const boundedTop = Math.max(
          0,
          Math.min(newTop, canvasHeight - componentHeight)
        );

        // 触发拖拽过程回调
        const newPosition = { left: boundedLeft, top: boundedTop };
        onDrag?.(newPosition);

        // 更新组件在状态中的位置
        updateComponent(componentId, {
          style: {
            ...component.style,
            left: `${boundedLeft}px`,
            top: `${boundedTop}px`,
          },
        });
      };

      /**
       * 处理鼠标释放事件，结束拖拽
       */
      const handleMouseUp = () => {
        isDraggingRef.current = false;

        // 触发拖拽结束回调
        onDragEnd?.();

        // 移除全局事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      // 添加全局事件监听器（确保在整个文档范围内都能响应）
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [
      componentId,
      updateComponent,
      canvas,
      canvasScale,
      onDragStart,
      onDragEnd,
      onDrag,
    ]
  );

  return {
    /** 鼠标按下处理函数，用于绑定到组件的 onMouseDown 事件 */
    handleMouseDown,
    /** 当前是否正在拖拽（注意：由于使用 useRef，这个值可能不会实时更新） */
    isDragging: isDraggingRef.current,
  };
};
