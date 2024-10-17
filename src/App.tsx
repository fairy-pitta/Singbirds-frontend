import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import CorrectAnswerPage from './pages/CorrectAnswer';
import IncorrectAnswerPage from './pages/WrongAnswer';
import ResultPage from './pages/Result';

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/right" element={<CorrectAnswerPage />} /> {/* 正解ページ */}
          <Route path="/wrong" element={<IncorrectAnswerPage />} /> {/* 不正解ページ */}
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Router>
    );
  }

export default App;