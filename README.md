
# DocMind — AI Document Assistant

Upload a PDF. Get an instant AI summary or chat with it directly.  
Built with React, Node.js, and the Anthropic Claude API.
=======
# PDF-Extractor
Application qui permet d'analyser rapidement un document PDF, d'en faire un résumé élaboré ainsi que de lui pauser des questions directement.

---

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`)
- **PDF parsing**: `pdf-parse`

---

## Setup

### 1. Get an Anthropic API key

Sign up at https://console.anthropic.com and create an API key.

### 2. Backend

```bash
cd backend
npm install

# Create a .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

npm run dev
# Runs on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
docmind/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server + API routes
│   │   ├── pdfService.js     # PDF text extraction
│   │   └── claudeService.js  # Claude API calls (summary + chat)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main app shell + routing between views
    │   ├── components/
    │   │   ├── Upload.jsx     # PDF upload with drag & drop
    │   │   ├── Summary.jsx    # Auto-generated summary view
    │   │   └── Chat.jsx       # Chat interface
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a PDF, returns `documentId` |
| POST | `/api/summarize` | Generate a summary for a `documentId` |
| POST | `/api/chat` | Ask a question, with conversation history |



---

## Improvement Ideas

- Display the pdf on the left side and summary / chat pannel on the right side
- Not reset the summary / chat when switching between chat and summary
- Changing language automatically calls for another summary / chat
