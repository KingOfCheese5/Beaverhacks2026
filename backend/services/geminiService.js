const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Maximum time (ms) we are willing to wait on a 429 retry-after hint.
const MAX_RETRY_WAIT_MS = 65_000;
// Number of automatic retries before giving up.
const MAX_RETRIES = 2;

function stripJsonFences(text) {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

/**
 * Parse the retry delay (in seconds) from a Gemini 429 error message.
 * The API embeds "Please retry in <N>s" in the message text.
 */
function parseRetryDelay(err) {
  const match = String(err?.message || '').match(/retry in (\d+(?:\.\d+)?)s/i);
  return match ? Math.ceil(parseFloat(match[1])) * 1000 : null;
}

/**
 * Calls model.generateContent(prompt) and retries up to MAX_RETRIES times
 * when a 429 rate-limit error is returned, honouring the suggested retry delay.
 * Throws a user-friendly error if the daily quota is exhausted or retries fail.
 */
async function generateWithRetry(model, prompt) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      const is429 = String(err?.message || '').includes('429');
      if (!is429) throw err;

      const delayMs = parseRetryDelay(err);

      // If the suggested wait exceeds our cap, or we're out of retries, bail out.
      if (!delayMs || delayMs > MAX_RETRY_WAIT_MS || attempt === MAX_RETRIES) {
        const friendly = new Error(
          'The AI service is temporarily unavailable due to rate limits. ' +
          'Please try again in a few minutes.'
        );
        friendly.status = 429;
        throw friendly;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
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

  const result = await generateWithRetry(model, prompt);
  const text = stripJsonFences(result.response.text());
  return JSON.parse(text);
}

async function extractSkills(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const prompt = `Extract the top 5-8 professional skills and technologies from this resume as a comma-separated list suitable for job searching. Return ONLY the comma-separated list, nothing else.

Resume:
${resumeText}`;

  const result = await generateWithRetry(model, prompt);
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

  const result = await generateWithRetry(model, prompt);
  const text = stripJsonFences(result.response.text());
  return JSON.parse(text);
}

module.exports = { analyzeResume, extractSkills, generateInterviewQuestions };
