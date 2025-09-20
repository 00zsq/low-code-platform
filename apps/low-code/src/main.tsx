import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'antd/dist/reset.css';
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper';

/**
 * 扩展 Window 接口以支持 react-dnd 的全局状态
 * 这是为了在微前端环境中正确清理 DnD 相关的全局状态
 */
declare global {
  interface Window {
    __REACT_DND_CONTEXT_INSTANCE__?: unknown;
  }
}

/**
 * qiankun 微前端生命周期函数的 props 类型定义
 */
interface QiankunProps {
  /** 微前端挂载的容器元素 */
  container?: Element;
  /** 其他可能的配置参数 */
  [key: string]: unknown;
}

/** React 18 的根实例，用于应用的挂载和卸载 */
let root: ReactDOM.Root | null = null;

/**
 * 渲染应用到指定容器
 * @param props qiankun 传入的配置参数
 */
function render(props: QiankunProps = {}) {
  const { container } = props;

  // 确定渲染容器：优先使用 qiankun 提供的容器，否则使用默认的 #root
  const domElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (!domElement) {
    console.error('无法找到渲染容器');
    return;
  }

  // 创建 React 18 的根实例（如果尚未创建）
  if (!root) {
    root = ReactDOM.createRoot(domElement as HTMLElement);
  }

  // 渲染应用
  root.render(<App />);
}

/**
 * 卸载应用并清理相关资源
 * 特别处理 react-dnd 在微前端环境中的状态清理问题
 */
function unmount() {
  if (root) {
    // 清理 react-dnd 相关的全局状态
    // 这是为了避免在微前端切换时出现 DnD 状态污染
    try {
      if (window.__REACT_DND_CONTEXT_INSTANCE__) {
        delete window.__REACT_DND_CONTEXT_INSTANCE__;
      }
    } catch (error) {
      console.warn('清理DnD状态时出现警告:', error);
    }

    // 卸载 React 应用
    root.unmount();
    root = null;
  }
}

/**
 * 配置 qiankun 微前端生命周期
 * 定义应用在微前端环境中的启动、挂载、卸载、更新行为
 */
renderWithQiankun({
  /**
   * 应用启动时调用，只会调用一次
   * 可以在这里进行一些全局的初始化工作
   */
  bootstrap() {
    console.log('低代码应用启动');
  },

  /**
   * 应用挂载时调用，每次进入应用都会调用
   * @param props 主应用传递的参数
   */
  mount(props: QiankunProps) {
    console.log('低代码应用挂载', props);
    render(props);
  },

  /**
   * 应用卸载时调用，每次离开应用都会调用
   * @param props 主应用传递的参数
   */
  unmount(props: QiankunProps) {
    console.log('低代码应用卸载', props);
    unmount();
  },

  /**
   * 应用更新时调用（可选）
   * @param props 主应用传递的参数
   */
  update(props: QiankunProps) {
    console.log('低代码应用更新', props);
  },
});

/**
 * 独立运行模式
 * 当应用不在 qiankun 环境中时，直接渲染到页面
 */
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
