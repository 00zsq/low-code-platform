import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'antd/dist/reset.css';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

interface QiankunProps {
  container?: Element;
  [key: string]: any;
}

function render(props: QiankunProps = {}) {
  const { container } = props;
  const root = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (root) {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

renderWithQiankun({
  mount(props) {
    console.log('低代码应用挂载', props);
    render(props);
  },
  bootstrap() {
    console.log('低代码应用启动');
  },
  unmount(props) {
    console.log('低代码应用卸载', props);
  },
  update(props) {
    console.log('低代码应用更新', props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}