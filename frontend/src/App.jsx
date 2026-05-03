import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ResumeUpload from './pages/ResumeUpload';
import JobMatches from './pages/JobMatches';
import InterviewPrep from './pages/InterviewPrep';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ResumeUpload />} />
          <Route path="/jobs" element={<JobMatches />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
