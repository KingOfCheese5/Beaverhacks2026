const express = require('express');
const geminiService = require('../services/geminiService');

const router = express.Router();

// POST /api/interview/generate
router.post('/generate', async (req, res) => {
  try {
    const { jobTitle, jobDescription, snippet, resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    if (!jobTitle) {
      return res.status(400).json({ error: 'jobTitle is required' });
    }

    const job = {
      title: jobTitle,
      description: jobDescription || snippet || '',
    };

    const questions = await geminiService.generateInterviewQuestions(job, resumeText);
    res.json(questions);
  } catch (err) {
    console.error('Interview generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate interview questions' });
  }
});

module.exports = router;
