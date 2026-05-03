# InternAI 

An AI-powered career assistant for students. Upload your resume, discover matching internships and jobs, and prepare for interviews — all powered by Google Gemini AI and the Jooble job API.

## Features

- **Resume Analysis** — Upload a PDF resume and receive AI feedback on strengths, weaknesses, keyword suggestions, and formatting tips.
- **Job Matching** — Automatically extract skills from your resume and find 5–10 relevant job listings via Jooble.
- **Interview Prep** — Select a job and generate 5 technical + 5 behavioral interview questions with sample answers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI | Google Gemini 1.5 Flash |
| Jobs | Jooble API |
| File Upload | Multer |
| PDF Parsing | pdf-parse |
| Storage | JSON file (no database needed) |

## Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [Jooble API key](https://jooble.org/api/about) (free registration)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/KingOfCheese5/Beaverhacks2026.git
cd Beaverhacks2026
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JOOBLE_API_KEY=your_jooble_api_key_here
PORT=5000
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Start the backend

```bash
cd backend
npm run dev       # development (nodemon, auto-restart)
# or
npm start         # production
```

The backend will run at **http://localhost:5000**.

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will run at **http://localhost:5173**.

Open **http://localhost:5173** in your browser.

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF, extract text, get Gemini feedback |
| POST | `/api/jobs/search` | Search Jooble jobs based on resume skills |
| POST | `/api/jobs/save` | Save selected jobs to `data/savedJobs.json` |
| GET | `/api/jobs/saved` | Retrieve previously saved jobs |
| POST | `/api/interview/generate` | Generate interview questions for a job |
| GET | `/api/health` | Health check |

## Project Structure

```
Beaverhacks2026/
├── backend/
│   ├── routes/
│   │   ├── resume.js        # Resume upload & analysis
│   │   ├── jobs.js          # Job search & save
│   │   └── interview.js     # Interview question generation
│   ├── services/
│   │   ├── geminiService.js # Google Gemini API wrapper
│   │   ├── joobleService.js # Jooble API wrapper
│   │   └── resumeParser.js  # PDF text extraction
│   ├── data/
│   │   └── savedJobs.json   # Persisted saved jobs
│   ├── uploads/             # Uploaded PDF files
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── ResumeUpload.jsx
    │   │   ├── JobMatches.jsx
    │   │   └── InterviewPrep.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key into `backend/.env`

### Jooble API Key
1. Go to [Jooble API](https://jooble.org/api/about)
2. Enter your email to receive a free API key
3. Copy the key into `backend/.env`
