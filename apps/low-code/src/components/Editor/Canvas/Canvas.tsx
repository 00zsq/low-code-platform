import React, { useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../../store/editorStore';
import { renderComponent } from '../../renderer';
import { findMaterial } from '../../../materials';
import type { ComponentConfig } from '../../../types/editor';
import { useDragPosition } from '../../../hooks/useDragPosition';
import './Canvas.css';

// 画布上的组件项
const CanvasItem: React.FC<{
  component: ComponentConfig;
  isSelected: boolean;
}> = ({ component, isSelected }) => {
  const { selectComponent, addChildComponent } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  // 使用自定义拖拽 hook
  const { handleMouseDown } = useDragPosition({
    componentId: component.id,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  });

  const acceptsChildren =
    component.type === 'FlexContainer' || component.type === 'Div';
  const [{ isOverChildDrop }, dropChild] = useDrop(() => ({
    accept: ['MATERIAL'],
    drop: (item: { type: string }) => {
      const material = findMaterial(item.type);
      if (!material) return;
      addChildComponent(component.id, {
        type: material.type,
        name: material.name,
        props: { ...material.defaultProps },
        // 子组件在容器内部使用静态流式布局，不再使用绝对定位
        style: { position: 'static' },
      });
    },
    collect: (monitor) => ({ isOverChildDrop: monitor.isOver() }),
    canDrop: () => acceptsChildren,
  }));

  return (
    <div
      className={`canvas-item ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      style={{
        ...component.style,
        // 同步自定义组件的宽高到外层定位容器，确保尺寸修改即时生效
        ...(component.props?.width
          ? { width: component.props.width as string }
          : {}),
        ...(component.props?.height
          ? { height: component.props.height as string }
          : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={
          acceptsChildren
            ? (dropChild as unknown as React.RefObject<HTMLDivElement>)
            : undefined
        }
        style={acceptsChildren ? { width: '100%', height: '100%' } : undefined}
      >
        {renderComponent(component)}
        {/* 渲染子节点 */}
        {component.children && component.children.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {component.children.map((child) => (
              <div key={child.id} style={{ position: 'static' }}>
                {renderComponent(child)}
              </div>
            ))}
          </div>
        )}
      </div>
      {isSelected && <div className="canvas-item-label">{component.name}</div>}
    </div>
  );
};

// 网格背景现在通过CSS实现，这个函数保留以备后用
const createGridBackground = () => {
  return {};
};

// 画布组件
const Canvas: React.FC = () => {
  const { canvas, selectedId, selectComponent, canvasScale } = useEditorStore();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['MATERIAL'],
    drop: (item: { type: string }, monitor) => {
      const { canvasScale, canvas } = useEditorStore.getState();

      // 从物料列表首次拖动
      const dropPoint = monitor.getClientOffset();
      const canvasElem = document.getElementById('canvas-container');

      if (dropPoint && canvasElem) {
        const { addComponent } = useEditorStore.getState();
        const canvasRect = canvasElem.getBoundingClientRect();
        const scrollLeft = canvasElem.scrollLeft;
        const scrollTop = canvasElem.scrollTop;
        let x = (dropPoint.x - canvasRect.left + scrollLeft) / canvasScale;
        let y = (dropPoint.y - canvasRect.top + scrollTop) / canvasScale;

        const canvasWidth = canvas.style.width as number;
        const canvasHeight = canvas.style.height as number;
        x = Math.max(0, Math.min(x, canvasWidth - 50));
        y = Math.max(0, Math.min(y, canvasHeight - 20));

        const material = findMaterial(item.type);
        if (material) {
          addComponent({
            type: material.type,
            name: material.name,
            props: { ...material.defaultProps },
            style: {
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: (material.defaultProps.width as string) || 'auto',
              height: (material.defaultProps.height as string) || 'auto',
            },
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="canvas-wrapper">
      {/* 画布主区域 */}
      <div className="canvas-main-area" onClick={() => selectComponent(null)}>
        <div
          ref={drop as unknown as React.RefObject<HTMLDivElement>}
          id="canvas-container"
          className={`canvas-container ${isOver ? 'drop-active' : ''}`}
          style={{
            width: `${canvas.style.width}px`,
            height: `${canvas.style.height}px`,
            backgroundColor: canvas.style.backgroundColor || '#fff',
            transform: `scale(${canvasScale})`,
            ...createGridBackground(),
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectComponent(null);
          }}
        >
          {canvas.components.map((component) => (
            <CanvasItem
              key={component.id}
              component={component}
              isSelected={component.id === selectedId}
            />
          ))}
        </div>
        <div className="canvas-info">
          {canvas.style.width} x {canvas.style.height} (缩放:{' '}
          {Math.round(canvasScale * 100)}%)
        </div>
      </div>
    </div>
  );
};

export default Canvas;
