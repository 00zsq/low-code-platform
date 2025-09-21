# 低代码可视化编辑器 - 技术实现文档

## 📋 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [核心功能实现](#核心功能实现)
- [组件系统设计](#组件系统设计)
- [拖拽系统实现](#拖拽系统实现)
- [代码导出机制](#代码导出机制)
- [微前端集成](#微前端集成)

## 🎯 项目概述

低代码可视化编辑器是基于 React + TypeScript 构建的可视化页面构建工具，支持拖拽式组件编辑、实时预览和多格式代码导出。采用微前端架构设计，可独立运行或集成到其他平台。

### 核心功能

- **可视化编辑**: 拖拽组件到画布，实时预览效果
- **属性配置**: 动态编辑组件属性，支持多种数据类型
- **代码导出**: 生成 React JSX、HTML、JSON 三种格式代码
- **微前端支持**: 基于 qiankun 框架的微前端架构
- **组件扩展**: 支持自定义组件和第三方组件库集成

## 🏗️ 技术架构

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    低代码编辑器架构                           │
├─────────────────────────────────────────────────────────────┤
│  UI 层                                                     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │  Toolbar    │MaterialPanel│   Canvas    │PropertyPanel│  │
│  │  工具栏      │   物料面板    │    画布      │   属性面板   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  业务逻辑层                                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ DnD System  │ Component   │ Renderer    │ Exporter    │  │
│  │ 拖拽系统     │ 组件系统     │ 渲染引擎     │ 导出系统     │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  状态管理层                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Zustand Store                            │ │
│  │  ┌─────────────┬─────────────┬─────────────────────────┐ │ │
│  │  │ Canvas State│ Component   │ Selection & UI State    │ │ │
│  │  │ 画布状态     │ 组件树状态   │ 选中状态和UI状态         │ │ │
│  │  └─────────────┴─────────────┴─────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 技术分类     | 技术选型              | 实现功能             |
| ------------ | --------------------- | -------------------- |
| **前端框架** | React 19 + TypeScript | 组件化开发，类型安全 |
| **状态管理** | Zustand               | 轻量级状态管理       |
| **拖拽功能** | React DnD             | 组件拖拽和定位       |
| **UI 组件**  | Ant Design            | 基础 UI 组件         |
| **构建工具** | Vite 6                | 开发构建和热更新     |
| **微前端**   | qiankun               | 微前端应用集成       |

## 🧩 核心功能实现

### 1. 编辑器主容器

**实现文件**: `src/components/Editor/index.tsx`

编辑器采用四区域布局设计：工具栏 + 物料面板 + 画布 + 属性面板。通过 React DnD 提供全局拖拽上下文。

```typescript
const Editor: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.editorContainer}>
        <Toolbar />
        <div className={styles.contentContainer}>
          <MaterialPanel />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>
    </DndProvider>
  );
};
```

### 2. 状态管理实现

**实现文件**: `src/store/editorStore.ts`

基于 Zustand 实现轻量级状态管理，支持组件树的增删改查操作：

```typescript
interface EditorState {
  canvas: {
    components: ComponentConfig[];
    style: React.CSSProperties;
  };
  selectedId: string | null;
  canvasScale: number;

  addComponent: (component) => void;
  updateComponent: (id, updates) => void;
  removeComponent: (id) => void;
}
```

### 3. 工具栏功能

**实现文件**: `src/components/Editor/Toolbar/Toolbar.tsx`

- **画布尺寸控制**: 通过 InputNumber 组件动态调整画布宽高
- **缩放功能**: 提供 50%-150% 的缩放选项
- **代码导出**: 触发导出模态框
- **画布清空**: 一键清除所有组件

### 4. 物料面板实现

**实现文件**: `src/components/Editor/MaterialPanel/MaterialPanel.tsx`

物料面板展示可用组件，支持拖拽到画布。组件按分类组织：

- **自定义组件**: Text, Image, Div, FlexContainer, CustomButton, CustomInput, CustomTable, BarChart
- **Ant Design 组件**: antd.Button, antd.Input

每个物料项通过 useDrag Hook 实现拖拽功能：

```typescript
const [{ isDragging }, drag] = useDrag(() => ({
  type: 'MATERIAL',
  item: { type: material.type },
  collect: (monitor) => ({ isDragging: monitor.isDragging() }),
}));
```

### 5. 画布系统实现

**实现文件**: `src/components/Editor/Canvas/Canvas.tsx`

画布采用双层布局系统：

- **根级组件**: 使用绝对定位，支持自由拖拽
- **子组件**: 使用流式布局，在容器内自动排列

拖拽接收逻辑处理坐标计算、边界检查和组件创建：

```typescript
const [{ isOver }, drop] = useDrop(() => ({
  accept: ['MATERIAL'],
  drop: (item, monitor) => {
    const dropPoint = monitor.getClientOffset();
    // 计算相对画布坐标，考虑缩放和滚动
    let x = (dropPoint.x - canvasRect.left + scrollLeft) / canvasScale;
    let y = (dropPoint.y - canvasRect.top + scrollTop) / canvasScale;

    addComponent({
      type: material.type,
      style: { position: 'absolute', left: `${x}px`, top: `${y}px` },
    });
  },
}));
```

### 6. 属性面板实现

**实现文件**: `src/components/Editor/PropertyPanel/PropertyPanel.tsx`

根据组件类型动态渲染属性编辑器，支持多种数据类型：

- **string**: Input 文本输入
- **number**: InputNumber 数字输入
- **boolean**: Switch 开关
- **select**: Select 下拉选择
- **color**: ColorPicker 颜色选择

特殊组件提供专门的编辑界面：

- **BarChart**: 数组格式的数据编辑
- **CustomTable**: 表格结构编辑

### 7. 拖拽定位系统

**实现文件**: `src/hooks/useDragPosition.ts`

自定义 Hook 实现组件在画布上的精确定位：

```typescript
const handleMouseMove = (moveEvent: MouseEvent) => {
  const deltaX = moveEvent.clientX - startPositionRef.current.x;
  const deltaY = moveEvent.clientY - startPositionRef.current.y;

  // 考虑画布缩放比例
  const newLeft = initialStyleRef.current.left + deltaX / canvasScale;
  const newTop = initialStyleRef.current.top + deltaY / canvasScale;

  // 边界检查并更新位置
  updateComponent(componentId, {
    style: { left: `${boundedLeft}px`, top: `${boundedTop}px` },
  });
};
```

## 🎨 组件系统设计

### 组件数据结构

```typescript
interface ComponentConfig {
  id: string; // 唯一标识
  type: string; // 组件类型
  name: string; // 显示名称
  props: ComponentProps; // 组件属性
  children?: ComponentConfig[]; // 子组件（支持嵌套）
  style?: React.CSSProperties; // 样式配置
}

interface ComponentDefinition {
  type: string; // 组件类型标识
  name: string; // 显示名称
  category: ComponentType; // 分类
  defaultProps: ComponentProps; // 默认属性
  propConfig: PropConfig[]; // 属性配置
}
```

### 组件分类体系

```
组件系统
├── 基础组件 (basic)
│   ├── Text - 文本组件
│   ├── Image - 图片组件
│   └── Div - 容器组件
├── 布局组件 (container)
│   └── FlexContainer - Flex布局容器
├── 交互组件 (basic)
│   ├── CustomButton - 自定义按钮
│   └── CustomInput - 自定义输入框
├── 高级组件 (advanced)
│   ├── CustomTable - 数据表格
│   └── BarChart - 柱状图
└── 第三方组件 (antd)
    ├── antd.Button - Ant Design按钮
    └── antd.Input - Ant Design输入框
```

### 渲染器系统

**实现文件**: `src/components/renderer/index.tsx`

统一的组件渲染入口，支持自定义组件和第三方组件：

```typescript
const componentMap = {
  Text: TextRenderer,
  Image: ImageRenderer,
  CustomButton: CustomButtonRenderer,
  // ...
};

export const renderComponent = (config: ComponentConfig) => {
  const { type, props } = config;

  // 渲染自定义组件
  if (componentMap[type]) {
    const Component = componentMap[type];
    return <Component props={props} />;
  }

  // 渲染 Ant Design 组件
  if (type.startsWith('antd.')) {
    const componentName = type.split('.')[1];
    switch (componentName) {
      case 'Button':
        return <Button {...props} />;
      case 'Input':
        return <Input {...props} />;
    }
  }

  return <div>未知组件: {type}</div>;
};
```

## 🎯 拖拽系统实现

### React DnD 架构

```
拖拽系统架构
├── DndProvider (HTML5Backend)
│   ├── 物料面板 (Drag Source)
│   │   └── MaterialItem (useDrag)
│   ├── 画布 (Drop Target)
│   │   ├── Canvas (useDrop) - 根级拖放
│   │   └── CanvasItem (useDrop) - 嵌套拖放
│   └── 组件定位 (Drag Source)
│       └── CanvasItem (useDragPosition)
```

### 拖拽类型定义

```typescript
// 拖拽类型
type DragType = 'MATERIAL';

// 拖拽数据
interface DragItem {
  type: string; // 组件类型
}

// 拖拽状态
interface DragCollectedProps {
  isDragging: boolean;
  isOver: boolean;
}
```

### 坐标计算逻辑

考虑画布缩放、滚动和边界检查的精确坐标计算：

```typescript
const calculatePosition = (dropPoint, canvasElement, canvasScale) => {
  const canvasRect = canvasElement.getBoundingClientRect();
  const scrollLeft = canvasElement.scrollLeft;
  const scrollTop = canvasElement.scrollTop;

  let x = (dropPoint.x - canvasRect.left + scrollLeft) / canvasScale;
  let y = (dropPoint.y - canvasRect.top + scrollTop) / canvasScale;

  // 边界检查
  x = Math.max(0, Math.min(x, canvasWidth - componentWidth));
  y = Math.max(0, Math.min(y, canvasHeight - componentHeight));

  return { x, y };
};
```

## 📤 代码导出机制

### 导出格式支持

| 格式          | 用途              | 特点                       |
| ------------- | ----------------- | -------------------------- |
| **React JSX** | 集成到 React 项目 | 完整的组件代码，支持交互   |
| **HTML**      | 静态页面部署      | 包含内联样式，可直接运行   |
| **JSON**      | 数据交换          | 纯数据格式，便于存储和传输 |

### 导出实现

**实现文件**: `src/utils/exporters/`

JSX 导出核心逻辑：

```typescript
export const exportToReactCode = () => {
  const { canvas } = useEditorStore.getState();

  // 生成组件代码
  const componentCode = canvas.components
    .map((component) => generateComponentJSX(component))
    .join('\n');

  // 生成完整的 React 组件
  return `
import React from 'react';

const GeneratedPage = () => {
  return (
    <div style={${serializeStyleForJsx(canvas.style)}}>
      ${componentCode}
    </div>
  );
};

export default GeneratedPage;
  `;
};
```

### 样式序列化

**实现文件**: `src/utils/styleSerialize.ts`

支持 JSX 和 HTML 两种样式格式：

```typescript
// JSX 样式序列化
export const serializeStyleForJsx = (style?: StyleLike): string => {
  return Object.entries(style || {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'number') return `${k}: ${v}`;
      return `${k}: '${String(v).replace(/'/g, "\\'")}'`;
    })
    .join(', ');
};

// HTML 样式序列化
export const serializeStyleForHtml = (style?: StyleLike): string => {
  return Object.entries(style || {})
    .map(([k, v]) => {
      const property = camelToKebab(k);
      const value = typeof v === 'number' ? `${v}px` : String(v);
      return `${property}: ${value}`;
    })
    .join('; ');
};
```

## 🔧 微前端集成

### qiankun 生命周期

**实现文件**: `src/main.tsx`

微前端生命周期配置，支持独立运行和集成运行：

```typescript
renderWithQiankun({
  bootstrap() {
    console.log('低代码应用启动');
  },

  mount(props: QiankunProps) {
    console.log('低代码应用挂载', props);
    render(props);
  },

  unmount(props: QiankunProps) {
    console.log('低代码应用卸载', props);
    unmount();
  },

  update(props: QiankunProps) {
    console.log('低代码应用更新', props);
  },
});

// 独立运行模式
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
```

### 构建配置

**实现文件**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [
    react(),
    qiankun('low-code-app', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 3001,
    cors: true,
    origin: 'http://localhost:3001',
  },
});
```

### 状态清理机制

React DnD 在微前端环境中的状态清理：

```typescript
function unmount() {
  if (root) {
    // 清理 react-dnd 相关的全局状态
    try {
      if (window.__REACT_DND_CONTEXT_INSTANCE__) {
        delete window.__REACT_DND_CONTEXT_INSTANCE__;
      }
    } catch (error) {
      console.warn('清理DnD状态时出现警告:', error);
    }

    root.unmount();
    root = null;
  }
}
```

---

## 📝 总结

低代码可视化编辑器采用现代化的前端技术栈，实现了完整的可视化页面构建功能。通过模块化的架构设计，系统具备良好的扩展性和维护性。

### 技术亮点

1. **React DnD 拖拽系统**: 实现精确的组件拖拽和定位
2. **Zustand 状态管理**: 轻量级状态管理，简化复杂状态操作
3. **组件化架构**: 支持自定义组件和第三方组件库集成
4. **多格式代码导出**: 支持 React JSX、HTML、JSON 三种导出格式
5. **微前端集成**: 基于 qiankun 的微前端架构，支持独立运行和集成部署

### 核心功能

- **可视化编辑**: 拖拽式组件编辑，实时预览效果
- **属性配置**: 动态编辑组件属性，支持多种数据类型
- **布局系统**: 双层布局设计，支持绝对定位和流式布局
- **代码生成**: 自动生成可执行的前端代码
- **扩展机制**: 支持自定义组件和属性类型扩展
