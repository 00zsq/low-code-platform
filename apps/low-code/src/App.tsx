import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './components/Editor';
import { PreviewPage } from './pages';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;