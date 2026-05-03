import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './InterviewPrep.css';

function QuestionCard({ index, question, sampleAnswer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="question-card">
      <button className="question-toggle" onClick={() => setOpen(!open)}>
        <span className="question-number">Q{index + 1}</span>
        <span className="question-text">{question}</span>
        <span className="toggle-icon">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="answer-body">
          <p className="answer-label">💡 Sample Answer</p>
          <p className="answer-text">{sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}

function QuestionSection({ title, icon, questions, colorClass }) {
  if (!questions || questions.length === 0) return null;
  return (
    <div className={`question-section ${colorClass}`}>
      <h3 className="section-heading">
        {icon} {title}
      </h3>
      <div className="questions-list">
        {questions.map((q, i) => (
          <QuestionCard key={i} index={i} question={q.question} sampleAnswer={q.sampleAnswer} />
        ))}
      </div>
    </div>
  );
}

function InterviewPrep() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  const resumeText = location.state?.resumeText || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState(null);

  async function generateQuestions() {
    if (!job || !resumeText) return;
    setLoading(true);
    setError('');
    setQuestions(null);

    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          snippet: job.snippet,
          resumeText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!job) {
    return (
      <div className="interview-prep-page">
        <div className="page-header">
          <h1 className="page-title">Interview Prep</h1>
        </div>
        <div className="alert alert-info">
          No job selected.{' '}
          <button className="link-btn" onClick={() => navigate('/jobs')}>
            Go to Job Matches →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-prep-page">
      <div className="page-header">
        <h1 className="page-title">Interview Prep</h1>
        <p className="page-subtitle">AI-generated questions for your target role</p>
      </div>

      <div className="card job-context-card">
        <div className="job-context-header">
          <div>
            <h2 className="job-context-title">{job.title}</h2>
            <p className="job-context-company">
              {job.company} · {job.location}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>
            ← Back to Jobs
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn btn-primary generate-btn"
        onClick={generateQuestions}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Generating Questions...
          </>
        ) : (
          '🤖 Generate Interview Questions'
        )}
      </button>

      {loading && (
        <div className="loading-state">
          <span className="spinner large-spinner" />
          <p>Crafting personalized questions...</p>
        </div>
      )}

      {questions && (
        <div className="questions-container">
          <QuestionSection
            title="Technical Questions"
            icon="⚙️"
            questions={questions.technicalQuestions}
            colorClass="section-technical"
          />
          <QuestionSection
            title="Behavioral Questions"
            icon="🤝"
            questions={questions.behavioralQuestions}
            colorClass="section-behavioral"
          />
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;
