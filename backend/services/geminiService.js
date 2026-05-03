const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function stripJsonFences(text) {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

async function analyzeResume(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const prompt = `You are an expert career counselor. Analyze the following resume and return ONLY a JSON object (no markdown) with these exact keys:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "keywordSuggestions": ["..."],
  "formattingTips": ["..."]
}

Each array should contain 3-5 concise, actionable items.

Resume:
${resumeText}`;

  const result = await model.generateContent(prompt);
  const text = stripJsonFences(result.response.text());
  return JSON.parse(text);
}

async function extractSkills(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const prompt = `Extract the top 5-8 professional skills and technologies from this resume as a comma-separated list suitable for job searching. Return ONLY the comma-separated list, nothing else.

Resume:
${resumeText}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function generateInterviewQuestions(job, resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const prompt = `You are an expert technical interviewer. Based on the job listing and candidate's resume below, generate interview questions and sample answers. Return ONLY a JSON object (no markdown) with this exact structure:
{
  "technicalQuestions": [
    { "question": "...", "sampleAnswer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "sampleAnswer": "..." }
  ]
}

Generate exactly 5 technical questions and 5 behavioral questions. Sample answers should be 2-3 sentences.

Job Title: ${job.title}
Job Description: ${job.description || job.snippet || 'Not provided'}

Resume:
${resumeText}`;

  const result = await model.generateContent(prompt);
  const text = stripJsonFences(result.response.text());
  return JSON.parse(text);
}

module.exports = { analyzeResume, extractSkills, generateInterviewQuestions };
