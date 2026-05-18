import { useState } from "react";
import { useTranslation } from "react-i18next";
import Upload from "./components/Upload.jsx";
import Summary from "./components/Summary.jsx";
import Chat from "./components/Chat.jsx";
import "./App.css";

export default function App() {
  const { t, i18n } = useTranslation();
  const [doc, setDoc] = useState(null);
  const [view, setView] = useState("summary");

  function handleUploaded(docInfo) {
    setDoc(docInfo);
    setView("summary");
  }

  function handleReset() {
    setDoc(null);
  }

  function toggleLanguage() {
    const next = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("docmind-lang", next);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">PDFExtractor</span>
        </div>
        <div className="header-right">
          {doc && (
            <>
              <span className="filename-badge">{doc.filename}</span>
              <button className="btn-ghost" onClick={handleReset}>
                {t("header.newDocument")}
              </button>
            </>
          )}
          <button className="btn-lang" onClick={toggleLanguage}>
            {i18n.language === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
          </button>
        </div>
      </header>

      <main className="app-main">
        {!doc ? (
          <Upload onUploaded={handleUploaded} />
        ) : (
          <>
            <div className="mode-tabs">
              <button
                className={`tab ${view === "summary" ? "active" : ""}`}
                onClick={() => setView("summary")}
              >
                {t("tabs.summary")}
              </button>
              <button
                className={`tab ${view === "chat" ? "active" : ""}`}
                onClick={() => setView("chat")}
              >
                {t("tabs.chat")}
              </button>
            </div>

            {view === "summary" ? (
              <Summary documentId={doc.documentId} />
            ) : (
              <Chat documentId={doc.documentId} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
