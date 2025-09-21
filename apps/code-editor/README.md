# 代码编辑器 (Code Editor)

## 项目概述

代码编辑器是一个基于 React 和 Monaco Editor 构建的现代化代码编辑与预览平台，支持 JSON 和 React/TSX 两种模式。该项目采用微前端架构，可以作为独立应用运行，也可以集成到 qiankun 微前端框架中。

### 核心特性

- 🎨 **双模式支持**：JSON 模式用于预览低代码平台导出的配置，React 模式用于编写和预览 JSX/TSX 代码
- 📱 **设备模拟**：支持竖屏/横屏切换，模拟移动设备预览效果
- 🌓 **主题切换**：支持明暗主题无缝切换，状态持久化
- ⚡ **实时预览**：代码变更实时反映到预览窗口
- 🔧 **智能编辑**：基于 Monaco Editor 的代码补全、语法高亮、错误检查
- 📐 **可调节布局**：左右分栏可拖拽调整比例
- 🚀 **微前端支持**：完整的 qiankun 生命周期管理

## 技术架构

### 技术栈

| 技术          | 版本   | 用途       |
| ------------- | ------ | ---------- |
| React         | 19.1.0 | 前端框架   |
| TypeScript    | 5.8.3  | 类型安全   |
| Monaco Editor | 0.52.2 | 代码编辑器 |
| Vite          | 6.3.5  | 构建工具   |
| qiankun       | -      | 微前端框架 |

### 项目结构

```
apps/code-editor/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Editor/         # 编辑器组件
│   │   │   └── CodeEditor.tsx
│   │   ├── Preview/        # 预览组件
│   │   │   ├── Preview.tsx
│   │   │   ├── ReactPreview.tsx
│   │   │   └── JsonPreview.tsx
│   │   └── UI/            # UI组件
│   │       └── DeviceFrame.tsx
│   ├── styles/            # 样式文件
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── package.json           # 依赖配置
├── vite.config.ts         # 构建配置
└── tsconfig.json          # TypeScript配置
```

## 核心组件详解

### 1. App.tsx - 主应用组件

主应用组件是整个应用的根组件，负责：

- **状态管理**：管理语言模式、代码内容、设备方向、分栏比例等状态
- **布局控制**：实现左右分栏布局和拖拽调整功能
- **主题管理**：集成主题切换功能
- **组件协调**：协调编辑器和预览组件的交互

**核心状态**：

```typescript
const [language, setLanguage] = useState<Language>('json'); // 语言模式
const [code, setCode] = useState<string>(initialJson); // 代码内容
const [orientation, setOrientation] = useState<Orientation>('portrait'); // 设备方向
const [leftRatio, setLeftRatio] = useState<number>(0.5); // 分栏比例
```

### 2. CodeEditor.tsx - Monaco 编辑器组件

基于 Monaco Editor 封装的代码编辑器，提供：

- **多语言支持**：JSON 和 TypeScript 语法高亮
- **智能补全**：代码自动补全和错误检查
- **主题同步**：与应用主题实时同步
- **React 类型支持**：内置 React 和 ReactDOM 类型定义

**关键特性**：

- 使用 MutationObserver 监听主题变化
- 预配置 TypeScript 编译选项
- 性能优化的编辑器配置

### 3. Preview 组件系列

#### Preview.tsx - 预览入口组件

统一的预览入口，根据语言模式选择对应的预览器。

#### ReactPreview.tsx - React 代码预览器

- **iframe 隔离**：使用 iframe 提供安全的代码执行环境
- **热更新**：支持代码变更的实时预览
- **错误处理**：完善的错误捕获和显示机制
- **防抖优化**：使用防抖减少不必要的更新

#### JsonPreview.tsx - JSON 配置预览器

- **低代码渲染**：完整还原低代码平台的组件效果
- **组件支持**：支持 Text、Button、Input、Image、Div、Table、Chart 等组件
- **响应式缩放**：自动计算缩放比例适配预览窗口
- **样式还原**：100%还原低代码平台的样式效果

### 4. DeviceFrame.tsx - 设备框架组件

模拟移动设备屏幕的框架组件：

- **多方向支持**：竖屏(390x844)和横屏(844x390)
- **平滑动画**：方向切换时的过渡动画
- **真实尺寸**：基于 iPhone 12 Pro 的屏幕尺寸

## 工具函数详解

### 1. theme.ts - 主题管理

提供完整的主题管理功能：

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 初始化逻辑，防止主题闪烁
  });

  const toggleTheme = () => {
    // 主题切换逻辑
  };

  return { theme, toggleTheme };
}
```

**特性**：

- 本地存储持久化
- DOM 属性同步更新
- 防止主题闪烁
- 服务端渲染兼容

### 2. htmlTemplate.ts - HTML 模板生成

为 React 预览生成 iframe 的 HTML 模板：

```typescript
export function generateReactPreviewHtml(code: string): string {
  // 生成包含React运行环境的HTML模板
}
```

**特性**：

- 使用国内 CDN 源提高加载速度
- 内置 React 18 支持
- 完善的错误处理机制
- 热更新系统

### 3. safeEval.ts - 安全代码执行

提供安全的代码执行环境：

```typescript
export function safeEvalFunction(
  code: string | undefined
): Function | undefined {
  // 创建安全的执行函数
}
```

**安全特性**：

- 使用 Function 构造函数而非 eval
- 限制执行上下文
- 异常处理和兜底机制

## 样式系统

### CSS 架构

项目采用模块化 CSS 架构，包含：

- **reset.css**：样式重置
- **variables.css**：CSS 变量定义
- **base.css**：基础样式
- **layout.css**：布局样式
- **editor.css**：编辑器样式
- **preview.css**：预览区样式
- **responsive.css**：响应式样式

### 主题系统

通过 CSS 变量实现主题切换：

```css
:root[data-theme='light'] {
  --bg: #ffffff;
  --text: #1f2937;
  --border: #e5e7eb;
}

:root[data-theme='dark'] {
  --bg: #1f2937;
  --text: #f9fafb;
  --border: #374151;
}
```

## 微前端集成

### qiankun 配置

项目完整支持 qiankun 微前端框架：

```typescript
// main.tsx
renderWithQiankun({
  bootstrap() {
    /* 应用启动 */
  },
  mount(props) {
    /* 应用挂载 */
  },
  unmount(props) {
    /* 应用卸载 */
  },
  update(props) {
    /* 应用更新 */
  },
});
```

### 生命周期管理

- **bootstrap**：应用启动时的初始化
- **mount**：应用挂载时的渲染逻辑
- **unmount**：应用卸载时的清理工作
- **update**：应用更新时的处理逻辑

## 构建配置

### Vite 配置特点

```typescript
export default defineConfig({
  plugins: [react(), qiankun('code-editor-app', { useDevMode: true })],
  server: {
    port: 3002,
    cors: true,
    // CORS头配置支持微前端
  },
  build: {
    // 优化的构建配置
  },
});
```

### 关键配置

- **端口**：3002（避免与其他应用冲突）
- **CORS**：完整的跨域支持
- **构建优化**：合理的代码分割和资源命名
- **依赖优化**：预构建 React 相关依赖

## 性能优化

### 1. 编辑器优化

- 使用 useCallback 缓存事件处理函数
- MutationObserver 高效监听主题变化
- 避免不必要的 Monaco 实例重建

### 2. 预览优化

- iframe 复用减少重建开销
- 防抖处理减少更新频率
- Blob URL 管理避免内存泄漏

### 3. 渲染优化

- useMemo 缓存计算结果
- 合理的组件拆分避免过度渲染
- CSS 变量实现高效主题切换

## 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 集成到微前端

1. 确保主应用已配置 qiankun
2. 注册子应用：

```javascript
registerMicroApps([
  {
    name: 'code-editor-app',
    entry: 'http://localhost:3002',
    container: '#code-editor-container',
    activeRule: '/code-editor',
  },
]);
```

### 扩展开发

#### 添加新的预览模式

1. 在`types/index.ts`中扩展`Language`类型
2. 在`Preview.tsx`中添加新的预览器组件
3. 在`App.tsx`中添加对应的初始代码

#### 添加新的组件类型（JSON 模式）

1. 在`JsonPreview.tsx`的`renderComponentContent`中添加新的 case
2. 实现组件的渲染逻辑
3. 确保样式与低代码平台保持一致

## 部署说明

### 独立部署

项目可以作为独立应用部署：

```bash
pnpm build
# 将dist目录部署到静态服务器
```

### 微前端部署

作为微前端子应用部署时：

1. 确保构建配置正确
2. 配置正确的 publicPath
3. 确保 CORS 头设置正确
4. 在主应用中正确注册子应用

## 故障排除

### 常见问题

1. **主题闪烁**：确保 localStorage 和 DOM 属性同步
2. **Monaco 加载失败**：检查 CDN 资源是否可访问
3. **预览不更新**：检查 iframe 通信和防抖设置
4. **微前端集成问题**：检查 qiankun 配置和生命周期函数

### 调试技巧

- 使用浏览器开发者工具查看网络请求
- 检查控制台错误信息
- 使用 React DevTools 调试组件状态
- 检查 iframe 内部的错误信息

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 创建 Pull Request

请确保：

- 代码符合 TypeScript 规范
- 添加适当的注释
- 更新相关文档
- 通过所有测试

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。
