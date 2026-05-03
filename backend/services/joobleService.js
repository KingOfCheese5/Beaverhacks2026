const axios = require('axios');

// Title keywords that indicate a senior / non-entry-level role.
const SENIOR_TITLE_PATTERN = /\b(senior|sr\.?|lead|principal|staff|director|manager|head of|vp|vice president)\b/i;

async function searchJobs(skills) {
  const apiKey = process.env.JOOBLE_API_KEY;
  const url = `https://jooble.org/api/${apiKey}`;

  // Append internship/new-grad terms so the Jooble search skews entry-level.
  const keywords = skills ? `${skills} internship OR new grad` : 'internship new grad';

  // Request more results than needed so filtering doesn't leave us empty-handed.
  const response = await axios.post(url, {
    keywords,
    location: '',
    page: '1',
    resultonpage: '20',
  });

  const allJobs = (response.data.jobs || []).map((job) => ({
    id: job.id || String(Math.random()),
    title: job.title || 'Untitled',
    company: job.company || 'Unknown Company',
    location: job.location || 'Remote',
    snippet: job.snippet || '',
    link: job.link || '#',
    salary: job.salary || 'Not specified',
    type: job.type || '',
    updated: job.updated || '',
  }));

  // Prefer entry-level / internship results; fall back to the full list if
  // filtering removes everything.
  const entryLevel = allJobs.filter((job) => !SENIOR_TITLE_PATTERN.test(job.title));
  return (entryLevel.length > 0 ? entryLevel : allJobs).slice(0, 10);
}

module.exports = { searchJobs };
