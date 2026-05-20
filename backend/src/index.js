import express from "express";
import cors from "cors";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { extractTextFromPDF } from "./pdfService.js";
import { generateSummary, askQuestion } from "./claudeService.js";
import rateLimit from "express-rate-limit";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

app.use(cors({
  origin: "https://pdf-extractor-ehbujold-s-projects.vercel.app/"
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use(express.json());

// In-memory store for extracted PDF text (keyed by a simple session id)
// In a real SaaS, this would be a database
const documentStore = new Map();

// POST /api/upload — accepts a PDF, extracts text, returns a documentId
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded." });

    const text = await extractTextFromPDF(req.file.buffer);
    if (!text || text.trim().length === 0) {
      return res.status(422).json({ error: "Could not extract text from this PDF. It may be scanned/image-based." });
    }

    // Generate a simple unique id
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    documentStore.set(documentId, { text, filename: req.file.originalname });

    res.json({ documentId, filename: req.file.originalname, charCount: text.length });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process PDF." });
  }
});

// POST /api/summarize — generates a structured summary
app.post("/api/summarize", async (req, res) => {
  const { documentId, language } = req.body;
  const doc = documentStore.get(documentId);
  if (!doc) return res.status(404).json({ error: "Document not found. Please re-upload." });

  try {
    const summary = await generateSummary(doc.text, language || "en");
    res.json({ summary });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

// POST /api/chat — answers a question about the document
app.post("/api/chat", async (req, res) => {
  const { documentId, question, history, language } = req.body;
  const doc = documentStore.get(documentId);
  if (!doc) return res.status(404).json({ error: "Document not found. Please re-upload." });
  if (!question?.trim()) return res.status(400).json({ error: "Question is required." });

  try {
    const answer = await askQuestion(doc.text, question, history || [], language || "en");
    res.json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to answer question." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`DocMind backend running on http://localhost:${PORT}`));
