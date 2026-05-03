const express = require('express');
const multer = require('multer');
const path = require('path');
const resumeParser = require('../services/resumeParser');
const geminiService = require('../services/geminiService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeText = await resumeParser.extractText(req.file.path);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract meaningful text from the PDF' });
    }

    const feedback = await geminiService.analyzeResume(resumeText);

    res.json({ resumeText, feedback });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to process resume' });
  }
});

module.exports = router;
