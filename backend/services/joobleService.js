const axios = require('axios');

const SENIOR_TITLE_PATTERN = /\b(senior|sr\.?|lead|principal|staff|director|manager|head of|vp|vice president)\b/i;

async function searchJobs(skills) {
  const apiKey = process.env.JOOBLE_API_KEY;
  const url = `https://jooble.org/api/${apiKey}`;
  const keywords = skills ? `${skills} internship OR new grad` : 'internship new grad';

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

  const entryLevel = allJobs.filter((job) => !SENIOR_TITLE_PATTERN.test(job.title));
  return (entryLevel.length > 0 ? entryLevel : allJobs).slice(0, 10);
}

module.exports = { searchJobs };
