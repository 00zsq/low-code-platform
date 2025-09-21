/**
 * 代码编辑器主应用组件
 *
 * 这是一个支持双模式的代码编辑器：
 * 1. JSON模式：用于预览低代码平台导出的JSON配置
 * 2. React模式：用于编写和预览React/JSX/TSX代码
 *
 * 主要功能：
 * - 左右分栏布局，支持拖拽调整比例
 * - 代码编辑器（基于Monaco Editor）
 * - 实时预览（支持设备框架模拟）
 * - 主题切换（明暗主题）
 * - 响应式设计
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CodeEditor from './components/Editor/CodeEditor';
import Preview from './components/Preview/Preview';
import type { Language, Orientation } from './types';
import { useTheme } from './utils/theme';

// 默认的JSON示例数据 - 展示低代码平台的组件配置格式
const initialJson = JSON.stringify(
  {
    title: '示例低代码页面',
    version: '1.0.0',
    components: [
      {
        id: 'text-1',
        type: 'Text',
        props: {
          content: 'Hello, Low-code!',
          fontSize: 18,
          color: '#1677ff',
          textAlign: 'center',
        },
      },
      {
        id: 'button-1',
        type: 'CustomButton',
        props: {
          text: '自定义按钮',
          buttonType: 'primary',
          size: 'medium',
          width: '120px',
        },
      },
      {
        id: 'input-1',
        type: 'CustomInput',
        props: {
          placeholder: '请输入内容',
          width: '200px',
          borderRadius: '8px',
        },
      },
      {
        id: 'div-1',
        type: 'Div',
        props: {
          content: '这是一个容器',
          backgroundColor: '#f0f0f0',
          padding: '16px',
          borderRadius: '8px',
          width: '250px',
        },
      },
      {
        id: 'antd-button-1',
        type: 'antd.Button',
        props: {
          children: 'Antd按钮',
          type: 'primary',
          size: 'middle',
        },
      },
    ],
  },
  null,
  2
);

// 默认的React/TSX示例代码 - 展示交互式组件开发
const initialTsx = `// 定义 App 组件，预览将自动挂载 <App />
function App() {
  const [count, setCount] = React.useState(0)
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>React 预览</h1>
      <p>支持 JSX/TSX。请定义 <code>&lt;App /&gt;</code> 组件作为入口。</p>
      <button onClick={() => setCount(c => c + 1)}>点击次数：{count}</button>
      <div style={{ marginTop: 20, padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
        <h3>功能示例</h3>
        <p>这是一个交互式的 React 组件预览。</p>
        <input placeholder="输入框示例" style={{ padding: 8, marginRight: 8 }} />
        <button style={{ padding: 8 }}>提交</button>
      </div>
    </div>
  )
}
`;

/**
 * 主应用组件
 *
 * 状态管理：
 * - language: 当前编程语言模式（json/tsx）
 * - code: 当前编辑器中的代码内容
 * - orientation: 预览设备方向（portrait/landscape）
 * - leftRatio: 左侧编辑器占比（0.15-0.85）
 * - isDragging: 是否正在拖拽调整分栏
 */
export default function App(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>('json');
  const [code, setCode] = useState<string>(initialJson);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [leftRatio, setLeftRatio] = useState<number>(0.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 语言模式切换时自动更新代码内容
  useEffect(() => {
    setCode(language === 'json' ? initialJson : initialTsx);
  }, [language]);

  // 开始拖拽分栏调整
  const onMouseDownResizer = useCallback(() => {
    setIsDragging(true);
  }, []);

  // 处理分栏拖拽逻辑
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // 限制分栏比例在15%-85%之间，确保两侧都有足够空间
      const next = Math.min(0.85, Math.max(0.15, x / rect.width));
      setLeftRatio(next);
    }
    function onMouseUp() {
      if (isDragging) setIsDragging(false);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // 计算左侧编辑器宽度百分比
  const leftWidth = useMemo(
    () => `${Math.round(leftRatio * 100)}%`,
    [leftRatio]
  );

  return (
    <div className="app-root">
      <div className="topbar">
        <div className="left-controls">
          <label className="label">语言模式</label>
          <select
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="json">JSON (低代码导出)</option>
            <option value="tsx">React (JSX/TSX)</option>
          </select>
        </div>

        <div className="right-controls">
          <label className="label">预览方向</label>
          <div className="segmented">
            <button
              className={`segment ${
                orientation === 'portrait' ? 'active' : ''
              }`}
              onClick={() => setOrientation('portrait')}
              title="竖屏预览"
            >
              📱 竖屏
            </button>
            <button
              className={`segment ${
                orientation === 'landscape' ? 'active' : ''
              }`}
              onClick={() => setOrientation('landscape')}
              title="横屏预览"
            >
              💻 横屏
            </button>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`切换到${theme === 'light' ? '暗色' : '浅色'}主题`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="split" ref={containerRef}>
        <div className="pane left" style={{ width: leftWidth }}>
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>
        <div className="resizer" onMouseDown={onMouseDownResizer} />
        <div className="pane right">
          <Preview language={language} code={code} orientation={orientation} />
        </div>
      </div>
    </div>
  );
}
