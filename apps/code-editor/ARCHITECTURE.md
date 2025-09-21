# 代码编辑器技术架构文档

## 系统概览

代码编辑器是一个现代化的 Web 应用，采用 React + TypeScript 技术栈，基于微前端架构设计。系统支持双模式代码编辑与预览，为开发者提供高效的代码开发体验。

## 架构设计原则

### 1. 模块化设计

- **组件化**：每个功能模块都封装为独立的 React 组件
- **职责分离**：编辑器、预览器、UI 组件各司其职
- **可复用性**：组件设计考虑复用性和扩展性

### 2. 性能优先

- **懒加载**：Monaco Editor 按需加载
- **防抖优化**：减少不必要的渲染和更新
- **内存管理**：及时清理 Blob URL 和事件监听器

### 3. 用户体验

- **实时反馈**：代码变更立即反映到预览
- **平滑动画**：主题切换和布局调整使用过渡动画
- **错误友好**：完善的错误处理和用户提示

### 4. 安全性

- **iframe 隔离**：预览代码在独立的 iframe 中执行
- **安全执行**：使用 Function 构造函数替代 eval
- **输入验证**：对用户输入进行适当的验证和转义

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        主应用 (App.tsx)                      │
├─────────────────────────────────────────────────────────────┤
│  状态管理 │ 布局控制 │ 主题管理 │ 事件协调                    │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
        ┌─────────────▼─────────────┐    ┌▼─────────────────────┐
        │      编辑器模块            │    │      预览模块         │
        │  ┌─────────────────────┐  │    │  ┌─────────────────┐ │
        │  │   CodeEditor.tsx    │  │    │  │  Preview.tsx    │ │
        │  │                     │  │    │  │                 │ │
        │  │ • Monaco Editor     │  │    │  │ • ReactPreview  │ │
        │  │ • 语法高亮          │  │    │  │ • JsonPreview   │ │
        │  │ • 智能补全          │  │    │  │ • DeviceFrame   │ │
        │  │ • 主题同步          │  │    │  │                 │ │
        │  └─────────────────────┘  │    │  └─────────────────┘ │
        └───────────────────────────┘    └─────────────────────┘
                      │                           │
        ┌─────────────▼─────────────┐    ┌───────▼─────────────┐
        │      工具模块              │    │     样式模块         │
        │                           │    │                     │
        │ • theme.ts (主题管理)      │    │ • CSS变量系统       │
        │ • htmlTemplate.ts         │    │ • 响应式布局        │
        │ • safeEval.ts             │    │ • 主题切换动画      │
        │                           │    │                     │
        └───────────────────────────┘    └─────────────────────┘
```

## 数据流架构

### 1. 状态管理流程

```
用户操作 → 状态更新 → 组件重渲染 → UI更新
    ↓
本地存储 ← 状态持久化
```

**核心状态流转**：

- `language` 变更 → 触发代码内容切换 → 预览器类型切换
- `code` 变更 → 防抖处理 → 预览内容更新
- `theme` 变更 → DOM 属性更新 → Monaco 主题同步
- `orientation` 变更 → 设备框架尺寸调整

### 2. 组件通信模式

```
App (状态管理)
├── CodeEditor (props down)
│   ├── value: string
│   ├── language: Language
│   └── onChange: (code) => void (callback up)
└── Preview (props down)
    ├── code: string
    ├── language: Language
    └── orientation: Orientation
```

## 核心模块详解

### 1. 编辑器模块 (Editor)

#### CodeEditor 组件架构

```typescript
interface CodeEditorProps {
  language: Language; // 编程语言模式
  value: string; // 代码内容
  onChange: (code: string) => void; // 变更回调
}
```

**内部状态管理**：

- `isEditorReady`: Monaco 编辑器就绪状态
- `currentTheme`: 当前主题状态（与全局主题同步）
- `editorRef`: Monaco 编辑器实例引用
- `monacoRef`: Monaco API 引用

**生命周期管理**：

1. **beforeMount**: 配置 Monaco 环境（主题、类型定义、编译选项）
2. **onMount**: 保存编辑器实例，标记就绪状态
3. **主题监听**: 使用 MutationObserver 监听 DOM 主题变化
4. **清理**: 组件卸载时清理监听器

#### Monaco Editor 配置

```typescript
// TypeScript编译选项
const compilerOptions = {
  target: ScriptTarget.ES2020,
  jsx: JsxEmit.React,
  allowJs: true,
  allowNonTsExtensions: true,
  moduleResolution: ModuleResolutionKind.NodeJs,
  esModuleInterop: true,
  skipLibCheck: true,
  noEmit: true,
};

// React全局类型定义
const reactGlobals = [
  'declare const React: any;',
  'declare const ReactDOM: any;',
  // JSX运行时模块声明
];
```

### 2. 预览模块 (Preview)

#### 预览器选择逻辑

```typescript
function Preview({ language, code, orientation }) {
  return (
    <DeviceFrame orientation={orientation}>
      {language === 'json' ? (
        <JsonPreview code={code} />
      ) : (
        <ReactPreview code={code} />
      )}
    </DeviceFrame>
  );
}
```

#### ReactPreview 架构

**iframe 沙箱执行机制**：

ReactPreview 使用 iframe 提供安全的代码执行环境，具有以下特点：

1. **安全隔离**：用户代码在独立的 iframe 中执行，无法访问主应用
2. **沙箱限制**：使用 sandbox 属性限制危险操作
3. **通信机制**：通过 postMessage 进行安全的跨框架通信

**iframe 通信协议**：

```typescript
// 父窗口 → iframe：发送代码更新
window.postMessage(
  {
    type: 'updateCode',
    code: userCode,
  },
  '*'
);

// iframe → 父窗口：环境就绪通知
parent.postMessage(
  {
    type: 'iframeReady',
  },
  '*'
);

// iframe → 父窗口：错误报告
parent.postMessage(
  {
    type: 'error',
    error: errorMessage,
  },
  '*'
);
```

**热更新系统实现**：

```typescript
// iframe 内部的热更新处理
function renderComponent(jsxCode) {
  try {
    // 使用 Babel 转换 JSX
    const transformedCode = Babel.transform(jsxCode, {
      presets: ['react'],
    }).code;

    // 创建执行函数
    const componentFunction = new Function(
      'React',
      'ReactDOM',
      transformedCode + 'return typeof App !== "undefined" ? App : null;'
    );

    // 执行并渲染
    const Component = componentFunction(React, ReactDOM);
    if (Component) {
      root.render(React.createElement(Component));
    }
  } catch (error) {
    // 错误处理和上报
    parent.postMessage({ type: 'error', error: error.message }, '*');
  }
}
```

**生命周期管理详解**：

1. **初始化阶段**：

   ```typescript
   // 创建 HTML 模板
   const srcDoc = generateReactPreviewHtml('');

   // 创建 Blob URL（避免 srcdoc 的兼容性问题）
   const blob = new Blob([srcDoc], { type: 'text/html' });
   const url = URL.createObjectURL(blob);
   iframe.src = url;
   ```

2. **就绪检测阶段**：

   ```typescript
   // 监听 iframe 加载完成
   iframe.onload = () => setIsLoaded(true);

   // 监听环境就绪消息
   window.addEventListener('message', (event) => {
     if (event.data.type === 'iframeReady') {
       setIsReady(true);
       // 立即发送当前代码
       updateCode(currentCode);
     }
   });
   ```

3. **代码更新阶段**：

   ```typescript
   // 防抖处理，减少更新频率
   const debouncedCode = useDebounce(code, 300);

   // 发送代码更新
   const updateCode = (code) => {
     iframe.contentWindow.postMessage(
       {
         type: 'updateCode',
         code,
       },
       '*'
     );
   };
   ```

4. **错误处理阶段**：

   ```typescript
   // 监听执行错误
   window.addEventListener('message', (event) => {
     if (event.data.type === 'error') {
       setError(event.data.error);
       // 显示错误 UI
     }
   });
   ```

5. **资源清理阶段**：
   ```typescript
   useEffect(() => {
     return () => {
       // 清理 Blob URL，防止内存泄漏
       if (blobUrl) {
         URL.revokeObjectURL(blobUrl);
       }
     };
   }, [blobUrl]);
   ```

**性能优化策略**：

1. **防抖优化**：使用 300ms 防抖减少高频更新
2. **iframe 复用**：避免重复创建 iframe 实例
3. **Blob URL 缓存**：复用 HTML 模板，减少重复生成
4. **错误边界**：完善的错误捕获，避免崩溃
5. **内存管理**：及时清理 Blob URL 和事件监听器

#### JsonPreview 架构

**组件渲染引擎**：

JsonPreview 实现了一个完整的低代码组件渲染引擎，支持多种组件类型：

```typescript
function renderComponentContent(component: LowCodeNode) {
  switch (component.type) {
    case 'Text': // 文本组件，支持h1-h6、p、span等HTML标签
      return <TextRenderer {...component.props} />;
    case 'CustomButton': // 自定义按钮，支持多种主题样式
      return <ButtonRenderer {...component.props} />;
    case 'CustomInput': // 输入框组件，支持多种输入类型
      return <InputRenderer {...component.props} />;
    case 'CustomTable': // 表格组件，支持动态列配置
      return <TableRenderer {...component.props} />;
    case 'BarChart': // 柱状图组件，简单数据可视化
      return <ChartRenderer {...component.props} />;
    case 'FlexContainer': // 弹性布局容器
      return <FlexRenderer {...component.props} />;
    // ... 更多组件类型
  }
}
```

**支持的组件类型详解**：

1. **Text 组件**：

   - 支持多种 HTML 标签类型（h1-h6, p, span, strong, em）
   - 可配置字体大小、颜色、对齐方式
   - 保持语义化的 HTML 结构

2. **CustomButton 组件**：

   - 支持多种主题：primary、danger、success、warning、ghost
   - 可自定义背景色、文字色、边框色
   - 支持禁用状态和交互效果

3. **CustomInput 组件**：

   - 支持多种输入类型：text、password、email 等
   - 可配置样式：边框、背景、圆角等
   - 支持禁用状态和占位符

4. **CustomTable 组件**：

   - 动态列配置，支持 JSON 格式数据
   - 可配置边框显示
   - 自适应表格布局

5. **BarChart 组件**：
   - 简单的柱状图数据可视化
   - 支持自定义柱子颜色
   - 自动计算比例和布局

**响应式缩放算法**：

```typescript
// 计算容器可用空间
const availableWidth = containerRect.width - 22; // 减去padding和边框
const availableHeight = containerRect.height - 22;

// 计算缩放比例
const scaleX = availableWidth / canvasWidth;
const scaleY = availableHeight / canvasHeight;
const scale = Math.min(scaleX, scaleY, 1); // 等比缩放，最大不超过1

// 应用CSS transform缩放
const canvasStyle = {
  transform: `scale(${scale})`,
  transformOrigin: 'top left',
};
```

**绝对定位布局系统**：

```typescript
// 为每个组件创建定位容器
const containerStyle = {
  position: 'absolute',
  left: component.style?.left || '0px',
  top: component.style?.top || '0px',
  width: component.style?.width || 'auto',
  height: component.style?.height || 'auto',
};
```

### 3. 设备框架模块 (DeviceFrame)

**尺寸计算逻辑**：

```typescript
const size =
  orientation === 'portrait'
    ? { width: 390, height: 844 } // iPhone 12 Pro竖屏
    : { width: 844, height: 390 }; // iPhone 12 Pro横屏
```

**动画过渡**：

- 使用 CSS transition 实现平滑的尺寸切换
- 过渡时间：300ms ease-in-out

## 工具模块设计

### 1. 主题管理 (theme.ts)

**设计模式**：单例模式 + 观察者模式

```typescript
// 状态初始化（防闪烁）
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem(THEME_KEY);
  const initial = saved || 'dark';
  document.documentElement.setAttribute('data-theme', initial);
  return initial;
});

// 状态同步
useEffect(() => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

**同步机制**：

1. **localStorage** ↔ **React State** ↔ **DOM Attribute**
2. 三者保持实时同步，确保主题一致性

### 2. HTML 模板生成 (htmlTemplate.ts)

**模板结构**：

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- 样式定义 -->
    <style>
      /* 基础样式和错误样式 */
    </style>
  </head>
  <body>
    <div id="root">加载中...</div>

    <!-- React运行时 -->
    <script src="react.min.js"></script>
    <script src="react-dom.min.js"></script>
    <script src="babel.min.js"></script>

    <!-- 热更新系统 -->
    <script>
      // 代码执行和错误处理逻辑
    </script>
  </body>
</html>
```

**安全特性**：

- 脚本标签转义防止 XSS
- 使用国内 CDN 提高加载速度
- 完善的错误边界处理

### 3. 安全执行 (safeEval.ts)

**安全策略**：

```typescript
// 使用Function构造函数替代eval
const fn = new Function('event', 'state', 'setState', 'console', code);

// 限制执行上下文
return (event, state, setState) => fn(event, state, setState, console);
```

**安全边界**：

- 不使用 eval 或 new Function 的字符串拼接
- 限制可访问的全局对象
- 异常捕获和安全兜底

## 样式架构

### 1. CSS 变量系统

**主题变量定义**：

```css
:root {
  /* 颜色系统 */
  --primary: #1677ff;
  --success: #52c41a;
  --warning: #faad14;
  --error: #ff4d4f;

  /* 尺寸系统 */
  --radius: 6px;
  --radius-lg: 8px;
  --spacing: 8px;

  /* 主题相关 */
  --bg: var(--bg-light);
  --text: var(--text-light);
}

[data-theme='dark'] {
  --bg: var(--bg-dark);
  --text: var(--text-dark);
}
```

### 2. 响应式设计

**断点系统**：

```css
/* 移动端 */
@media (max-width: 768px) {
  .split {
    flex-direction: column;
  }
  .resizer {
    display: none;
  }
}

/* 平板端 */
@media (min-width: 769px) and (max-width: 1024px) {
  .topbar {
    padding: 8px 16px;
  }
}
```

### 3. 组件样式隔离

**BEM 命名规范**：

```css
.code-editor {
  /* 块 */
}
.code-editor__toolbar {
  /* 元素 */
}
.code-editor__toolbar--active {
  /* 修饰符 */
}
```

## 性能优化策略

### 1. 渲染优化

**React 优化技巧**：

```typescript
// 使用useCallback缓存函数
const handleChange = useCallback(
  (code: string) => {
    onChange(code);
  },
  [onChange]
);

// 使用useMemo缓存计算结果
const leftWidth = useMemo(() => `${Math.round(leftRatio * 100)}%`, [leftRatio]);

// 防抖优化
const debouncedCode = useDebounce(code, 300);
```

### 2. 内存管理

**资源清理策略**：

```typescript
useEffect(() => {
  const blobUrl = URL.createObjectURL(blob);

  return () => {
    URL.revokeObjectURL(blobUrl); // 清理Blob URL
    observer.disconnect(); // 清理观察者
    window.removeEventListener('message', handler); // 清理事件监听
  };
}, []);
```

### 3. 加载优化

**代码分割**：

- Monaco Editor 按需加载
- 使用动态 import 分割代码块
- CDN 资源并行加载

**缓存策略**：

- 浏览器缓存 Monaco Editor 资源
- localStorage 缓存用户偏好设置
- 合理的 HTTP 缓存头设置

## 错误处理机制

### 1. 错误边界

**React 错误边界**：

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
    // 错误上报逻辑
  }
}
```

### 2. 异步错误处理

**Promise 错误捕获**：

```typescript
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // 显示用户友好的错误信息
});
```

### 3. 用户友好的错误显示

**错误 UI 组件**：

- 语法错误：在编辑器中高亮显示
- 运行时错误：在预览区显示错误信息
- 网络错误：显示重试按钮

## 微前端集成架构

### 1. qiankun 生命周期

```typescript
interface QiankunLifecycle {
  bootstrap(): void; // 应用启动
  mount(props): void; // 应用挂载
  unmount(props): void; // 应用卸载
  update(props): void; // 应用更新
}
```

### 2. 沙箱隔离

**样式隔离**：

- 使用 CSS Module 或 styled-components
- 避免全局样式污染

**JavaScript 隔离**：

- qiankun 提供的 JS 沙箱
- 避免全局变量冲突

### 3. 通信机制

**父子应用通信**：

```typescript
// 接收主应用传递的props
function mount(props) {
  const { container, ...otherProps } = props;
  // 使用props中的配置
}
```

## 测试策略

### 1. 单元测试

**组件测试**：

```typescript
describe('CodeEditor', () => {
  it('should render with correct language', () => {
    render(<CodeEditor language="json" value="" onChange={jest.fn()} />);
    // 断言逻辑
  });
});
```

### 2. 集成测试

**端到端测试**：

- 使用 Cypress 或 Playwright
- 测试完整的用户交互流程
- 测试微前端集成场景

### 3. 性能测试

**性能指标**：

- 首屏加载时间
- 代码编辑响应时间
- 预览更新延迟
- 内存使用情况

## 部署架构

### 1. 构建优化

**Vite 构建配置**：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### 2. CDN 部署

**资源分离**：

- 静态资源部署到 CDN
- 代码包部署到应用服务器
- 合理的缓存策略

### 3. 监控告警

**性能监控**：

- 页面加载性能
- 用户交互响应时间
- 错误率统计
- 资源加载成功率

## 扩展性设计

### 1. 插件系统

**预留扩展点**：

- 编辑器插件接口
- 预览器扩展机制
- 主题扩展系统

### 2. 配置化

**可配置项**：

- 编辑器选项
- 预览器设置
- 主题变量
- 快捷键映射

### 3. 国际化

**i18n 支持**：

- 多语言文本
- 日期时间格式
- 数字格式化
- 从右到左语言支持

## 组件预览系统对比

### JsonPreview vs ReactPreview

| 特性           | JsonPreview          | ReactPreview         |
| -------------- | -------------------- | -------------------- |
| **执行环境**   | 主应用内直接渲染     | iframe 沙箱隔离      |
| **安全性**     | 相对安全（静态渲染） | 高安全性（完全隔离） |
| **性能**       | 高性能（无通信开销） | 中等（有通信开销）   |
| **错误隔离**   | 可能影响主应用       | 完全隔离             |
| **功能复杂度** | 简单（组件映射）     | 复杂（代码执行）     |
| **扩展性**     | 需要手动添加组件类型 | 支持任意 React 代码  |
| **调试难度**   | 容易调试             | 相对困难（跨框架）   |

### 技术选型考量

**JsonPreview 选择直接渲染的原因**：

1. 低代码配置是静态的，不包含可执行代码
2. 组件类型有限且可控，安全风险较低
3. 需要精确还原低代码平台的视觉效果
4. 性能要求高，需要实时响应配置变更

**ReactPreview 选择 iframe 隔离的原因**：

1. 用户代码不可控，可能包含任意逻辑
2. 需要完全的安全隔离，防止影响主应用
3. 支持完整的 React 生态和第三方库
4. 提供真实的 React 运行环境

## 总结

代码编辑器项目采用现代化的前端架构设计，具有良好的可维护性、可扩展性和性能表现。通过模块化设计、组件化开发、性能优化等手段，为用户提供了优秀的代码编辑和预览体验。

**双预览系统的设计亮点**：

1. **差异化处理**：针对不同类型的代码采用最适合的预览方案
2. **安全性保障**：React 代码使用 iframe 隔离，确保主应用安全
3. **性能优化**：JSON 配置直接渲染，提供最佳性能体验
4. **用户体验**：统一的预览接口，无缝的模式切换

项目的架构设计充分考虑了：

- **用户体验**：实时预览、平滑动画、错误友好
- **开发体验**：类型安全、热更新、调试友好
- **系统性能**：懒加载、防抖、内存管理
- **安全性**：代码隔离、输入验证、错误边界
- **可维护性**：模块化、组件化、文档完善
- **可扩展性**：插件系统、配置化、国际化

这些设计原则和实现细节确保了项目能够在复杂的业务场景中稳定运行，并为后续的功能扩展提供了良好的基础。
