import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts plain text from a PDF buffer.
 * @param {Buffer} buffer - The raw PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}
