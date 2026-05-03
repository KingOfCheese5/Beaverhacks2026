import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './JobMatches.css';

function JobCard({ job, isSelected, onToggle, onInterview }) {
  return (
    <div className={`card job-card ${isSelected ? 'selected' : ''}`}>
      <div className="job-card-header">
        <label className="job-select-label">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(job)}
            className="job-checkbox"
          />
          <div className="job-info">
            <h3 className="job-title">{job.title}</h3>
            <div className="job-meta">
              <span className="job-company">🏢 {job.company}</span>
              <span className="job-location">📍 {job.location}</span>
              {job.salary && job.salary !== 'Not specified' && (
                <span className="job-salary">💰 {job.salary}</span>
              )}
            </div>
          </div>
        </label>
      </div>
      {job.snippet && (
        <p className="job-snippet" dangerouslySetInnerHTML={{ __html: job.snippet }} />
      )}
      <div className="job-actions">
        {job.link && job.link !== '#' && (
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Apply ↗
          </a>
        )}
        <button className="btn btn-primary" onClick={() => onInterview(job)}>
          🎯 Prep Interview
        </button>
      </div>
    </div>
  );
}

function JobMatches() {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeText = location.state?.resumeText || '';

  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState('');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (resumeText) {
      searchJobs();
    }
  }, []);

  async function searchJobs() {
    if (!resumeText) {
      setError('Please upload your resume first to find matching jobs.');
      return;
    }

    setLoading(true);
    setError('');
    setSaveMessage('');
    setJobs([]);
    setSelectedJobs([]);
    setHasSearched(true);

    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Job search failed');
      setJobs(data.jobs || []);
      setSkills(data.skills || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleJob(job) {
    setSelectedJobs((prev) =>
      prev.find((j) => j.id === job.id) ? prev.filter((j) => j.id !== job.id) : [...prev, job]
    );
  }

  async function saveSelected() {
    if (selectedJobs.length === 0) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: selectedJobs }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed');
      setSaveMessage(`✅ ${selectedJobs.length} job(s) saved successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleInterview(job) {
    navigate('/interview', { state: { job, resumeText } });
  }

  return (
    <div className="job-matches-page">
      <div className="page-header">
        <h1 className="page-title">Job Matches</h1>
        <p className="page-subtitle">AI-matched opportunities based on your resume</p>
      </div>

      {!resumeText && (
        <div className="alert alert-info">
          No resume loaded. <button className="link-btn" onClick={() => navigate('/')}>Upload your resume first →</button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

      <div className="jobs-toolbar">
        <button className="btn btn-primary" onClick={searchJobs} disabled={loading || !resumeText}>
          {loading ? <><span className="spinner" /> Searching...</> : '🔍 Search Jobs'}
        </button>
        {selectedJobs.length > 0 && (
          <button className="btn btn-success" onClick={saveSelected} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : `💾 Save ${selectedJobs.length} Job(s)`}
          </button>
        )}
      </div>

      {skills && (
        <div className="skills-banner">
          <span className="skills-label">Detected skills:</span>
          {skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <span className="spinner large-spinner" />
          <p>Finding matching jobs...</p>
        </div>
      )}

      {!loading && hasSearched && jobs.length === 0 && (
        <div className="alert alert-info">No jobs found. Try searching again or adjusting your resume.</div>
      )}

      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={!!selectedJobs.find((j) => j.id === job.id)}
            onToggle={toggleJob}
            onInterview={handleInterview}
          />
        ))}
      </div>
    </div>
  );
}

export default JobMatches;
