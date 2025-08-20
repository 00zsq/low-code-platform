import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'antd/dist/reset.css';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

// 扩展Window接口以支持react-dnd的全局状态
declare global {
  interface Window {
    __REACT_DND_CONTEXT_INSTANCE__?: unknown;
  }
}

interface QiankunProps {
  container?: Element;
  [key: string]: unknown;
}

let root: ReactDOM.Root | null = null;

function render(props: QiankunProps = {}) {
  const { container } = props;
  const domElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (!domElement) {
    console.error('无法找到渲染容器');
    return;
  }

  if (!root) {
    root = ReactDOM.createRoot(domElement as HTMLElement);
  }
  
  root.render(<App />);
}

function unmount() {
  if (root) {
    // 清理react-dnd相关的全局状态
    try {
      // 获取所有可能的DnD管理器实例并清理
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

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}