import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResumeUpload.css';

function FeedbackCard({ icon, title, colorClass, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`card feedback-card ${colorClass}`}>
      <div className="card-header">
        <span className="feedback-icon">{icon}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      <ul className="bullet-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFindJobs() {
    navigate('/jobs', { state: { resumeText: result.resumeText } });
  }

  return (
    <div className="resume-upload-page">
      <div className="page-header">
        <h1 className="page-title">Resume Analysis</h1>
        <p className="page-subtitle">Upload your PDF resume to get AI-powered feedback</p>
      </div>

      <div className="card upload-card">
        <form onSubmit={handleSubmit}>
          <div className="upload-zone" onClick={() => document.getElementById('resume-input').click()}>
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              {file ? file.name : 'Click to select your PDF resume'}
            </p>
            <p className="upload-hint">PDF files only, max 5MB</p>
          </div>
          <input
            id="resume-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary upload-btn" disabled={loading || !file}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              '✨ Analyze Resume'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="feedback-section">
          <div className="feedback-header">
            <h2 className="section-title">Your Feedback</h2>
            <button className="btn btn-primary" onClick={handleFindJobs}>
              🔍 Find Matching Jobs →
            </button>
          </div>

          <div className="feedback-grid">
            <FeedbackCard
              icon="💪"
              title="Strengths"
              colorClass="card-green"
              items={result.feedback?.strengths}
            />
            <FeedbackCard
              icon="⚠️"
              title="Areas to Improve"
              colorClass="card-orange"
              items={result.feedback?.weaknesses}
            />
            <FeedbackCard
              icon="🔑"
              title="Keyword Suggestions"
              colorClass="card-blue"
              items={result.feedback?.keywordSuggestions}
            />
            <FeedbackCard
              icon="📐"
              title="Formatting Tips"
              colorClass="card-purple"
              items={result.feedback?.formattingTips}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
