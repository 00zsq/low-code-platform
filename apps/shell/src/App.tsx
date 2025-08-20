import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: MicroApp | null = null;
    setLoading(true);
    setError(null);

    // 当路由变化时，根据路径加载对应的微应用
    if (location.pathname.startsWith('/low-code')) {
      console.log('开始加载低代码应用...');
      try {
        app = loadMicroApp({
          name: 'low-code-app',
          entry: '//localhost:3001',
          container: '#low-code-container',
          props: {},
          sandbox: {
            strictStyleIsolation: false,
            experimentalStyleIsolation: false,
            excludeAssetFilter: (assetUrl: string) => {
              // 排除 Vite 的 HMR 相关资源
              return (
                assetUrl.includes('/@vite/') ||
                assetUrl.includes('/@react-refresh') ||
                assetUrl.includes('?import') ||
                assetUrl.includes('?t=') ||
                assetUrl.includes('undefined')
              );
            },
            // 保护DnD相关的全局变量
            patchers: {
              dynamicAppend: false,
            }
          },
        } as any);

        app.mountPromise
          .then(() => {
            console.log('低代码应用加载成功');
            setLoading(false);
          })
          .catch((err) => {
            console.error('低代码应用加载失败:', err);
            setError('低代码应用加载失败，建议使用生产构建版本');
            setLoading(false);
          });
      } catch (err) {
        console.error('微应用初始化失败:', err);
        setError('微应用初始化失败');
        setLoading(false);
      }
    } else if (location.pathname.startsWith('/code-editor')) {
      console.log('开始加载代码编辑器应用...');
      try {
        app = loadMicroApp({
          name: 'code-editor-app',
          entry: '//localhost:3002',
          container: '#code-editor-container',
          props: {},
          sandbox: {
            strictStyleIsolation: false,
            experimentalStyleIsolation: false,
            excludeAssetFilter: (assetUrl: string) => {
              return (
                assetUrl.includes('/@vite/') ||
                assetUrl.includes('/@react-refresh') ||
                assetUrl.includes('?import') ||
                assetUrl.includes('?t=') ||
                assetUrl.includes('undefined')
              );
            },
            patchers: {
              dynamicAppend: false,
            }
          },
        } as any);

        app.mountPromise
          .then(() => {
            console.log('代码编辑器应用加载成功');
            setLoading(false);
          })
          .catch((err) => {
            console.error('代码编辑器应用加载失败:', err);
            setError('代码编辑器应用加载失败，建议使用生产构建版本');
            setLoading(false);
          });
      } catch (err) {
        console.error('微应用初始化失败:', err);
        setError('微应用初始化失败');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      if (app) {
        console.log('卸载微应用');
        try {
          app.unmount();
        } catch (err) {
          console.error('卸载微应用失败:', err);
        }
      }
    };
  }, [location.pathname]);

  return (
    <div className="shell-app">
      <header className="shell-header">
        <h1>微前端平台</h1>
        <nav className="shell-nav">
          <Link to="/low-code" className="nav-button">
            前往低代码平台
          </Link>
          <Link to="/code-editor" className="nav-button">
            前往网页编辑器
          </Link>
        </nav>
      </header>

      <main className="shell-main">
        <Routes>
          <Route
            path="/low-code/*" // 使用通配符以匹配子应用内部路由
            element={
              <div className="micro-app-wrapper">
                {loading && <div className="loading">加载中...</div>}
                {error && <div className="error">{error}</div>}
                <div id="low-code-container" className="app-container" />
              </div>
            }
          />
          <Route
            path="/code-editor/*" // 使用通配符以匹配子应用内部路由
            element={
              <div className="micro-app-wrapper">
                {loading && <div className="loading">加载中...</div>}
                {error && <div className="error">{error}</div>}
                <div id="code-editor-container" className="app-container" />
              </div>
            }
          />
          <Route
            path="/"
            element={
              <div className="welcome-page">
                <h2>欢迎使用微前端平台</h2>
                <p>请选择要使用的功能：</p>
                <div className="welcome-buttons">
                  <Link to="/low-code" className="welcome-button">
                    低代码平台
                  </Link>
                  <Link to="/code-editor" className="welcome-button">
                    网页编辑器
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
