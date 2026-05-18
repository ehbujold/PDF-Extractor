import 'dotenv/config';
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_CHARS = 80_000;

const LANGUAGE_NAMES = { en: "English", fr: "French" };

function truncate(text) {
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS) + "\n\n[Document truncated due to length...]";
}

/**
 * Generates a structured, detailed summary of the document.
 * @param {string} text - The full document text
 * @param {string} language - Language code e.g. "en" | "fr"
 */
export async function generateSummary(text, language = "en") {
  const lang = LANGUAGE_NAMES[language] || "English";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: `You are an expert document analyst. When given a document, you produce a clear, 
structured, and detailed summary. Format your response in clear sections using markdown:
- **Overview**: 2-3 sentence high-level description
- **Key Points**: The most important ideas, arguments, or findings (bullet points)
- **Details**: Elaboration on the most significant sections
- **Conclusion / Takeaways**: What the reader should remember

Be thorough but concise. Use plain language.
IMPORTANT: You must respond entirely in ${lang}. All section headers, labels, and content must be in ${lang}.`,
    messages: [
      {
        role: "user",
        content: `Please summarize the following document:\n\n${truncate(text)}`,
      },
    ],
  });

  return message.content[0].text;
}

/**
 * Answers a question about the document, maintaining conversation history.
 * @param {string} text - The full document text
 * @param {string} question - The user's current question
 * @param {Array} history - Array of {role, content} previous messages
 * @param {string} language - Language code e.g. "en" | "fr"
 */
export async function askQuestion(text, question, history, language = "en") {
  const lang = LANGUAGE_NAMES[language] || "English";

  const messages = [
    {
      role: "user",
      content: `Here is the document I will be asking you questions about:\n\n<document>\n${truncate(text)}\n</document>\n\nPlease confirm you've read it and are ready for questions.`,
    },
    {
      role: "assistant",
      content: "I've read the document and I'm ready to answer your questions about it.",
    },
    ...history,
    { role: "user", content: question },
  ];

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: `You are a helpful document assistant. Answer questions based strictly on the 
provided document. If the answer isn't in the document, say so clearly. 
Be concise, accurate, and cite relevant parts of the document when helpful.
IMPORTANT: You must respond entirely in ${lang}. Always reply in ${lang} regardless of the language of the question.`,
    messages,
  });

  return message.content[0].text;
}
