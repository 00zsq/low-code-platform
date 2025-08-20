import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper';

interface QiankunProps {
  container?: Element;
  [key: string]: unknown;
}

let root: ReturnType<typeof createRoot> | null = null;

function render(props: QiankunProps = {}) {
  const { container } = props;
  const domElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (!domElement) {
    console.error('无法找到渲染容器');
    return;
  }

  // 确保主题在应用挂载前正确设置
  const savedTheme = localStorage.getItem('code-editor-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (!root) {
    root = createRoot(domElement as HTMLElement);
  }

  root.render(<App />);
}

function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

renderWithQiankun({
  bootstrap() {
    console.log('代码编辑器应用启动');
  },
  mount(props: QiankunProps) {
    console.log('代码编辑器应用挂载', props);
    render(props);
  },
  unmount(props: QiankunProps) {
    console.log('代码编辑器应用卸载', props);
    unmount();
  },
  update(props: QiankunProps) {
    console.log('代码编辑器应用更新', props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
