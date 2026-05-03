const express = require('express');
const path = require('path');
const fs = require('fs');
const geminiService = require('../services/geminiService');
const joobleService = require('../services/joobleService');

const router = express.Router();
const SAVED_JOBS_PATH = path.join(__dirname, '../data/savedJobs.json');

function readSavedJobs() {
  try {
    const raw = fs.readFileSync(SAVED_JOBS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSavedJobs(jobs) {
  fs.writeFileSync(SAVED_JOBS_PATH, JSON.stringify(jobs, null, 2), 'utf8');
}

// POST /api/jobs/search
router.post('/search', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const skills = await geminiService.extractSkills(resumeText);
    const jobs = await joobleService.searchJobs(skills);

    res.json({ skills, jobs });
  } catch (err) {
    console.error('Job search error:', err);
    res.status(500).json({ error: err.message || 'Failed to search jobs' });
  }
});

// POST /api/jobs/save
router.post('/save', (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs)) {
      return res.status(400).json({ error: 'jobs must be an array' });
    }

    const existing = readSavedJobs();
    const existingIds = new Set(existing.map((j) => j.id));
    const newJobs = jobs.filter((j) => !existingIds.has(j.id));
    const updated = [...existing, ...newJobs];

    writeSavedJobs(updated);
    res.json({ saved: updated.length, message: 'Jobs saved successfully' });
  } catch (err) {
    console.error('Save jobs error:', err);
    res.status(500).json({ error: err.message || 'Failed to save jobs' });
  }
});

// GET /api/jobs/saved
router.get('/saved', (req, res) => {
  try {
    const jobs = readSavedJobs();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read saved jobs' });
  }
});

module.exports = router;
