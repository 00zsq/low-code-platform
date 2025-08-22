import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './components/Editor';
import { PreviewPage } from './pages';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const App: React.FC = () => {
  // 在微前端环境中使用 /low-code 作为 basename
  const basename = qiankunWindow.__POWERED_BY_QIANKUN__ ? '/low-code' : '/';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;