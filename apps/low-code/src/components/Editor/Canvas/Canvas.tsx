import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../../store/editorStore';
import { renderComponent } from '../../renderer';
import { findMaterial } from '../../../materials';
import type { ComponentConfig } from '../../../types/editor';
import { useDragPosition } from '../../../hooks/useDragPosition';
import './Canvas.css';

/**
 * 画布上的单个组件项
 * 负责渲染组件、处理选中状态、拖拽定位、子组件嵌套等功能
 */
const CanvasItem: React.FC<{
  component: ComponentConfig;
  isSelected: boolean;
}> = ({ component, isSelected }) => {
  const { selectComponent, addChildComponent } = useEditorStore();

  // 组件状态：拖拽中、鼠标悬停
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 使用自定义拖拽定位 hook，实现组件在画布上的自由拖拽
  const { handleMouseDown } = useDragPosition({
    componentId: component.id,
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  });

  // 判断当前组件是否可以接受子组件（容器类组件）
  const acceptsChildren =
    component.type === 'FlexContainer' || component.type === 'Div';

  // 设置子组件拖拽放置区域（仅容器组件支持）
  const [, dropChild] = useDrop(() => ({
    accept: ['MATERIAL'], // 只接受物料类型的拖拽
    drop: (item: { type: string }) => {
      const material = findMaterial(item.type);
      if (!material) return;

      // 向当前容器添加子组件
      addChildComponent(component.id, {
        type: material.type,
        name: material.name,
        props: { ...material.defaultProps },
        // 子组件在容器内部使用静态流式布局，不使用绝对定位
        style: { position: 'static' },
      });
    },
    collect: (monitor) => ({ isOverChildDrop: monitor.isOver() }),
    canDrop: () => acceptsChildren, // 只有容器组件才能接受拖拽
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
        e.stopPropagation(); // 阻止事件冒泡，避免触发画布的取消选中
        selectComponent(component.id); // 选中当前组件
      }}
      onMouseDown={handleMouseDown} // 开始拖拽
      onMouseEnter={() => setIsHovered(true)} // 鼠标悬停效果
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 组件内容容器 */}
      <div
        ref={
          acceptsChildren
            ? (dropChild as unknown as React.RefObject<HTMLDivElement>)
            : undefined
        }
        style={acceptsChildren ? { width: '100%', height: '100%' } : undefined}
      >
        {/* 渲染组件本身 */}
        {renderComponent(component)}

        {/* 渲染子组件（仅容器组件支持） */}
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

      {/* 组件标签（选中或悬停时显示） */}
      {(isSelected || isHovered) && (
        <div
          className={`canvas-item-label ${isSelected ? 'selected' : 'hovered'}`}
        >
          {component.name}
        </div>
      )}
    </div>
  );
};

/**
 * 创建网格背景样式（预留函数，当前通过CSS实现）
 * @returns 空对象，网格背景通过CSS类实现
 */
const createGridBackground = () => {
  return {};
};

/**
 * 画布主组件
 * 负责渲染所有组件、处理物料拖拽、管理画布缩放等核心功能
 */
const Canvas: React.FC = () => {
  const { canvas, selectedId, selectComponent, canvasScale } = useEditorStore();

  // 设置画布拖拽放置区域，接受从物料面板拖拽的组件
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['MATERIAL'], // 只接受物料类型的拖拽
    drop: (item: { type: string }, monitor) => {
      const { canvasScale, canvas } = useEditorStore.getState();

      // 获取拖拽放置的鼠标位置
      const dropPoint = monitor.getClientOffset();
      const canvasElem = document.getElementById('canvas-container');

      if (dropPoint && canvasElem) {
        const { addComponent } = useEditorStore.getState();
        const canvasRect = canvasElem.getBoundingClientRect();
        const scrollLeft = canvasElem.scrollLeft;
        const scrollTop = canvasElem.scrollTop;

        // 计算相对于画布的坐标位置（考虑缩放和滚动）
        let x = (dropPoint.x - canvasRect.left + scrollLeft) / canvasScale;
        let y = (dropPoint.y - canvasRect.top + scrollTop) / canvasScale;

        // 边界检查，确保组件不会超出画布范围
        const canvasWidth = canvas.style.width as number;
        const canvasHeight = canvas.style.height as number;
        x = Math.max(0, Math.min(x, canvasWidth - 50));
        y = Math.max(0, Math.min(y, canvasHeight - 20));

        // 根据物料类型创建组件
        const material = findMaterial(item.type);
        if (material) {
          addComponent({
            type: material.type,
            name: material.name,
            props: { ...material.defaultProps },
            style: {
              position: 'absolute', // 根级组件使用绝对定位
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
      isOver: monitor.isOver(), // 收集拖拽悬停状态
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
            transform: `scale(${canvasScale})`, // 应用缩放变换
            ...createGridBackground(), // 应用网格背景
          }}
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            selectComponent(null); // 点击空白区域取消选中
          }}
        >
          {/* 渲染所有根级组件 */}
          {canvas.components.map((component) => (
            <CanvasItem
              key={component.id}
              component={component}
              isSelected={component.id === selectedId}
            />
          ))}
        </div>

        {/* 画布信息显示 */}
        <div className="canvas-info">
          {canvas.style.width} x {canvas.style.height} (缩放:{' '}
          {Math.round(canvasScale * 100)}%)
        </div>
      </div>
    </div>
  );
};

export default Canvas;
