import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

interface QiankunProps {
  container?: Element;
  [key: string]: any;
}

function render(props: QiankunProps = {}) {
  const { container } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
}

renderWithQiankun({
  mount(props) {
    console.log('代码编辑器应用挂载', props);
    render(props);
  },
  bootstrap() {
    console.log('代码编辑器应用启动');
  },
  unmount(props) {
    console.log('代码编辑器应用卸载', props);
  },
  update(props) {
    console.log('代码编辑器应用更新', props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
