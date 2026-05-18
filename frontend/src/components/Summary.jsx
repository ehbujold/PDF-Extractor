import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import "./Summary.css";

/* Summary component:
- Fetches and displays the AI-generated summary for the uploaded document.
- Shows loading state while waiting for the summary.
- Handles and displays any errors that occur during the fetch process.
- Allows users to regenerate the summary on demand.
*/
export default function Summary({ documentId }) {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateSummary();
  }, [documentId]);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, language: i18n.language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("summary.errorFailed"));
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="summary-loading">
      <div className="summary-spinner">
        <div className="pulse-ring" />
        <span className="pulse-icon">∑</span>
      </div>
      <p>{t("summary.analyzing")}</p>
      <span className="loading-sub">{t("summary.analyzingSub")}</span>
    </div>
  );

  if (error) return (
    <div className="summary-error">
      <p>⚠ {error}</p>
      <button className="btn-retry" onClick={generateSummary}>{t("summary.errorRetry")}</button>
    </div>
  );

  if (!summary) return null;

  return (
    <div className="summary-wrapper">
      <div className="summary-header">
        <span className="summary-label">{t("summary.label")}</span>
        <button className="btn-ghost" onClick={generateSummary}>{t("summary.regenerate")}</button>
      </div>
      <div className="summary-body">
        <div className="markdown">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
