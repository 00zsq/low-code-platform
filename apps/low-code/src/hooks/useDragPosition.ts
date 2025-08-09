import { useCallback, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

interface DragPositionOptions {
  componentId: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (position: { left: number; top: number }) => void;
}

export const useDragPosition = ({
  componentId,
  onDragStart,
  onDragEnd,
  onDrag,
}: DragPositionOptions) => {
  const isDraggingRef = useRef(false);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const initialStyleRef = useRef({ left: 0, top: 0 });

  const { updateComponent, canvas, canvasScale } = useEditorStore();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 获取画布容器
      const canvasContainer = document.getElementById('canvas-container');
      if (!canvasContainer) return;

      // 记录初始鼠标位置
      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // 获取当前组件的位置
      const component = canvas.components.find((c) => c.id === componentId);
      if (!component) return;

      // 解析当前组件的位置
      let currentLeft = 0;
      let currentTop = 0;

      if (component.style?.left) {
        const leftStr = component.style.left.toString();
        if (leftStr.includes('px')) {
          currentLeft = parseFloat(leftStr.replace('px', ''));
        } else if (!isNaN(Number(leftStr))) {
          currentLeft = Number(leftStr);
        }
      }

      if (component.style?.top) {
        const topStr = component.style.top.toString();
        if (topStr.includes('px')) {
          currentTop = parseFloat(topStr.replace('px', ''));
        } else if (!isNaN(Number(topStr))) {
          currentTop = Number(topStr);
        }
      }

      initialStyleRef.current = { left: currentLeft, top: currentTop };
      isDraggingRef.current = true;

      onDragStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;

        // 计算鼠标移动的距离
        const deltaX = moveEvent.clientX - startPositionRef.current.x;
        const deltaY = moveEvent.clientY - startPositionRef.current.y;

        // 计算新的位置（考虑画布缩放）
        const newLeft = initialStyleRef.current.left + deltaX / canvasScale;
        const newTop = initialStyleRef.current.top + deltaY / canvasScale;

        // 获取画布尺寸
        const canvasWidth = canvas.style.width as number;
        const canvasHeight = canvas.style.height as number;

        // 获取组件尺寸
        let componentWidth = 50; // 默认宽度
        let componentHeight = 20; // 默认高度

        if (component.style?.width) {
          const widthStr = component.style.width.toString();
          if (widthStr.includes('px')) {
            componentWidth = parseFloat(widthStr.replace('px', ''));
          } else if (!isNaN(Number(widthStr))) {
            componentWidth = Number(widthStr);
          }
        }

        if (component.style?.height) {
          const heightStr = component.style.height.toString();
          if (heightStr.includes('px')) {
            componentHeight = parseFloat(heightStr.replace('px', ''));
          } else if (!isNaN(Number(heightStr))) {
            componentHeight = Number(heightStr);
          }
        }

        // 边界检查
        const boundedLeft = Math.max(
          0,
          Math.min(newLeft, canvasWidth - componentWidth)
        );
        const boundedTop = Math.max(
          0,
          Math.min(newTop, canvasHeight - componentHeight)
        );

        // 更新组件位置
        const newPosition = { left: boundedLeft, top: boundedTop };
        onDrag?.(newPosition);

        updateComponent(componentId, {
          style: {
            ...component.style,
            left: `${boundedLeft}px`,
            top: `${boundedTop}px`,
          },
        });
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        onDragEnd?.();

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

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
    handleMouseDown,
    isDragging: isDraggingRef.current,
  };
};
