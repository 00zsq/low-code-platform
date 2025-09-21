/**
 * 代码编辑器应用入口文件
 *
 * 这个文件负责：
 * 1. 配置qiankun微前端框架集成
 * 2. 处理应用的挂载、卸载生命周期
 * 3. 支持独立运行和微前端模式
 * 4. 主题初始化和状态管理
 */
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper';

// qiankun微前端框架的属性接口定义
interface QiankunProps {
  container?: Element; // 微前端挂载容器
  [key: string]: unknown; // 其他可能的配置属性
}

// React 18的根节点实例，用于应用的挂载和卸载
let root: ReturnType<typeof createRoot> | null = null;

/**
 * 渲染应用到指定容器
 * @param props qiankun传递的属性，包含容器元素等
 */
function render(props: QiankunProps = {}) {
  const { container } = props;
  // 优先使用微前端提供的容器，否则使用默认的root元素
  const domElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (!domElement) {
    console.error('无法找到渲染容器');
    return;
  }

  // 确保主题在应用挂载前正确设置，避免闪烁
  const savedTheme = localStorage.getItem('code-editor-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 创建React根节点（只创建一次）
  if (!root) {
    root = createRoot(domElement as HTMLElement);
  }

  root.render(<App />);
}

/**
 * 卸载应用，清理资源
 */
function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

// 配置qiankun微前端生命周期钩子
renderWithQiankun({
  // 应用启动时调用，用于初始化全局资源
  bootstrap() {
    console.log('代码编辑器应用启动');
  },
  // 应用挂载时调用
  mount(props: QiankunProps) {
    console.log('代码编辑器应用挂载', props);
    render(props);
  },
  // 应用卸载时调用，清理资源
  unmount(props: QiankunProps) {
    console.log('代码编辑器应用卸载', props);
    unmount();
  },
  // 应用更新时调用（可选）
  update(props: QiankunProps) {
    console.log('代码编辑器应用更新', props);
  },
});

// 如果不是在qiankun环境中运行，则直接渲染（独立运行模式）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
