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
          textAlign: 'center'
        } 
      },
      {
        id: 'button-1',
        type: 'CustomButton',
        props: { 
          text: '自定义按钮', 
          buttonType: 'primary',
          size: 'medium',
          width: '120px'
        },
      },
      {
        id: 'input-1',
        type: 'CustomInput',
        props: { 
          placeholder: '请输入内容',
          width: '200px',
          borderRadius: '8px'
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
          width: '250px'
        },
      },
      {
        id: 'antd-button-1',
        type: 'antd.Button',
        props: { 
          children: 'Antd按钮',
          type: 'primary',
          size: 'middle'
        },
      }
    ],
  },
  null,
  2
);

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

export default function App(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>('json');
  const [code, setCode] = useState<string>(initialJson);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [leftRatio, setLeftRatio] = useState<number>(0.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    setCode(language === 'json' ? initialJson : initialTsx);
  }, [language]);

  const onMouseDownResizer = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
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
              className={`segment ${orientation === 'portrait' ? 'active' : ''}`}
              onClick={() => setOrientation('portrait')}
              title="竖屏预览"
            >
              📱 竖屏
            </button>
            <button
              className={`segment ${orientation === 'landscape' ? 'active' : ''}`}
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
