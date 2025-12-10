import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ReviewPage from './pages/ReviewPage';
import SubmitPage from './pages/SubmitPage';
import './styles/App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
