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
    
    <!-- 使用国内CDN源 -->
    <script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdn.bootcdn.net/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.25.0/babel.min.js"></script>
    
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
        return currentRoot;
      }

      // 渲染组件
      function renderComponent(jsxCode) {
        try {
          if (!jsxCode || jsxCode.trim() === '') {
            const root = initializeRoot();
            root.render(React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#999',
                fontSize: '16px'
              }
            }, '暂无代码'));
            return;
          }

          // 使用Babel转换JSX
          const transformedCode = Babel.transform(jsxCode, {
            presets: ['react'],
            plugins: []
          }).code;

          // 创建函数并执行
          const componentFunction = new Function('React', 'ReactDOM', 
            'const { createElement: h, Component, useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;' +
            transformedCode +
            'return typeof App !== "undefined" ? App : (() => React.createElement("div", {}, "组件渲染失败"));'
          );

          const ComponentToRender = componentFunction(
            React, ReactDOM
          );

          const root = initializeRoot();
          root.render(React.createElement(ComponentToRender));
        } catch (error) {
          renderError('渲染错误: ' + error.message);
        }
      }

      // 渲染错误
      function renderError(message) {
        const root = initializeRoot();
        root.render(React.createElement('div', {
          className: 'error'
        }, message));
      }

      // 监听来自父窗口的消息
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'updateCode') {
          renderComponent(event.data.code);
        }
      }, false);

      // 等待所有脚本加载完成
      window.addEventListener('load', () => {
        // 通知父窗口已准备好
        if (window.parent) {
          window.parent.postMessage({ type: 'iframeReady' }, '*');
        }
      });

      // 全局错误处理
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        renderError('运行时错误: ' + (event.error?.message || event.message));
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        renderError('Promise错误: ' + (event.reason?.message || event.reason));
      });
    </script>
  </body>
</html>`;
} 