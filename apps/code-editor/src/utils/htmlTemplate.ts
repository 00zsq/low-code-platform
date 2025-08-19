export function generateReactPreviewHtml(code: string): string {
  // 安全处理脚本标签
  const safeCode = code.replace(/<\/?script>/gi, (m) =>
    m.replace('script', 'scr"+"ipt')
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body, #root { height: 100%; margin: 0; }
      body { 
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Microsoft YaHei, sans-serif; 
        overflow: hidden;
      }
      * { box-sizing: border-box; }
      .error { 
        color: #f44336; 
        white-space: pre-wrap; 
        padding: 12px; 
        font-family: Menlo, Monaco, "Courier New", monospace;
        font-size: 14px;
        background: #fff5f5;
        border-left: 4px solid #f44336;
        margin: 8px;
        border-radius: 4px;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 14px;
      }
      #root {
        position: relative;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">等待代码加载...</div>
    </div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.25.0/babel.min.js"></script>
    <script>
      // 热更新系统
      let currentRoot = null;
      let isInitialized = false;
      
      // 初始化React根节点
      function initializeRoot() {
        if (!isInitialized) {
          const rootElement = document.getElementById('root');
          currentRoot = ReactDOM.createRoot(rootElement);
          isInitialized = true;
        }
      }
      
      // 安全地编译和执行代码
      function executeCode(code) {
        try {
          if (!code || code.trim() === '') {
            renderEmptyState();
            return;
          }
          
          // 使用Babel转译代码，添加必需的filename参数
          const transformedCode = Babel.transform(code, {
            filename: 'preview.tsx',
            presets: [
              ['react', { runtime: 'classic' }],
              ['typescript', { allowNamespaces: true }]
            ],
            plugins: [],
            // 添加其他必要的配置
            parserOpts: {
              strictMode: false,
              allowImportExportEverywhere: true,
              allowReturnOutsideFunction: true
            }
          }).code;
          
          // 创建一个隔离的执行环境，避免变量声明冲突
          const AppComponent = (function() {
            try {
              // 在独立作用域中执行转译后的代码
              const executionFunction = new Function(\`
                // 执行用户代码
                \${transformedCode}
                
                // 尝试获取组件的多种方式
                if (typeof App !== 'undefined') return App;
                if (typeof Component !== 'undefined') return Component;
                if (typeof exports !== 'undefined' && exports.default) return exports.default;
                if (typeof module !== 'undefined' && module.exports) return module.exports;
                
                // 如果都没找到，返回null
                return null;
              \`);
              
              return executionFunction();
            } catch (err) {
              console.error('Execution error:', err);
              throw err;
            }
          })();
          
          if (typeof AppComponent === 'function') {
            renderComponent(AppComponent);
          } else {
            renderError('未检测到有效的 App 组件\\n\\n请确保代码中定义了组件：\\n\\nfunction App() {\\n  return <div>Hello World</div>;\\n}\\n\\n或\\n\\nconst App = () => {\\n  return <div>Hello World</div>;\\n};');
          }
          
        } catch (err) {
          console.error('Code execution error:', err);
          const errorMessage = err.name === 'SyntaxError' ? 
            \`语法错误: \${err.message}\` :
            err.message || String(err);
          renderError(errorMessage);
          
          // 通知父窗口有错误
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'PREVIEW_ERROR',
              error: err.message || String(err)
            }, '*');
          }
        }
      }
      
      // 渲染React组件
      function renderComponent(Component) {
        initializeRoot();
        try {
          currentRoot.render(React.createElement(Component));
        } catch (err) {
          console.error('Render error:', err);
          renderError('渲染错误: ' + (err.message || String(err)));
        }
      }
      
      // 渲染错误信息
      function renderError(errorMessage) {
        initializeRoot();
        const errorElement = React.createElement('div', {
          className: 'error'
        }, errorMessage);
        currentRoot.render(errorElement);
      }
      
      // 渲染空状态
      function renderEmptyState() {
        initializeRoot();
        const emptyElement = React.createElement('div', {
          className: 'loading'
        }, '请在编辑器中输入React代码...');
        currentRoot.render(emptyElement);
      }
      
      // 监听来自父窗口的消息
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'CODE_UPDATE') {
          executeCode(event.data.code);
        }
      });
      
      // 页面加载完成后的初始化
      document.addEventListener('DOMContentLoaded', function() {
        initializeRoot();
        
        // 如果有初始代码，执行它
        const initialCode = \`${safeCode}\`;
        if (initialCode.trim()) {
          executeCode(initialCode);
        } else {
          renderEmptyState();
        }
        
        // 通知父窗口页面已准备就绪
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'PREVIEW_READY'
          }, '*');
        }
      });
      
      // 全局错误处理
      window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        renderError('运行时错误: ' + (event.error?.message || event.message || '未知错误'));
      });
      
      // Promise 错误处理
      window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        renderError('Promise错误: ' + (event.reason?.message || String(event.reason)));
      });
    </script>
  </body>
</html>`;
} 