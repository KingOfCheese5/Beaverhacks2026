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
  const prompt = `Extract the top 5-8 professional skills and technologies from this resume as a comma-separated list suitable for searching internship and new graduate job openings. Focus on technical skills, tools, and technologies rather than seniority or management experience. Return ONLY the comma-separated list, nothing else.

Resume:
${resumeText}`;

  const result = await generateWithRetry(model, prompt);
  return result.response.text().trim();
}

async function generateInterviewQuestions(job, resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const prompt = `You are an expert technical interviewer.
Your primary task is to generate interview questions based on the job description, not the resume.
The resume is secondary context only and must NOT drive question generation.

Step 1 – Job-First Analysis
Extract from the job description:
- Core technical skills required
- Systems and architecture knowledge required
- Conceptual knowledge areas
- Practical engineering abilities implied by the role
The job description is the PRIMARY source of truth.

Step 2 – Technical Question Generation Rules
Generate technical questions that:
- Directly test skills required in the job description
- Assess conceptual understanding, not memorized facts
- Include applied/real-world scenarios
- Include at least 1 transfer question (apply concept in a new situation)
- Include at least 1 debugging, edge-case, or failure-mode question when relevant
DO NOT generate questions that simply restate or reword resume bullet points.
If a question can be answered by quoting the resume, it is INVALID.

Step 3 – Resume Usage Rules for Technical Questions
Use the resume ONLY to:
- Lightly adjust framing or wording (optional personalization)
- Slightly adjust difficulty based on claimed experience
- Identify gaps where deeper probing may be needed
DO NOT base questions on resume projects or bullet points alone.

Technical question mix (exactly 5):
- 1–2 system design or architecture questions (if applicable to the role)
- 2–3 core technical knowledge questions grounded in job description requirements
- 1 applied scenario question
- 1 debugging / edge-case question (if relevant)

Behavioral questions (exactly 5): generate standard behavioral questions relevant to the role and team environment.

Return ONLY a JSON object (no markdown) with this exact structure:
{
  "technicalQuestions": [
    { "question": "...", "sampleAnswer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "sampleAnswer": "..." }
  ]
}

Sample answers should be 2-3 sentences.

Job Title: ${job.title}
Job Description: ${job.description || job.snippet || 'Not provided'}

Resume (secondary context only):
${resumeText}`;

  const result = await generateWithRetry(model, prompt);
  const text = stripJsonFences(result.response.text());
  return JSON.parse(text);
}

module.exports = { analyzeResume, extractSkills, generateInterviewQuestions };
