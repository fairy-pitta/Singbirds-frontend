import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../src/components/pages/HomePage';
import QuizPage from '../src/components/pages/QuizPage';
import CorrectAnswerPage from '../src/components/pages/CorrectAnswer';
import IncorrectAnswerPage from '../src/components/pages/WrongAnswer';
import ResultPage from '../src/components/pages/Result';

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