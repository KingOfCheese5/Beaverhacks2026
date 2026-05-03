const axios = require('axios');

async function searchJobs(skills) {
  const apiKey = process.env.JOOBLE_API_KEY;
  const url = `https://jooble.org/api/${apiKey}`;

  const response = await axios.post(url, {
    keywords: skills,
    location: '',
    page: '1',
    resultonpage: '10',
  });

  const jobs = (response.data.jobs || []).slice(0, 10);
  return jobs.map((job) => ({
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
}

module.exports = { searchJobs };
