import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./Upload.css";

export default function Upload({ onUploaded }) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  /* Handles the file upload process:
   - Validates that the file is a PDF.
   - Shows loading state while uploading and extracting text.
   - Sends the file to the backend API.
   - Handles success and error responses appropriately.
  */
  async function handleFile(file) {
    if (!file || file.type !== "application/pdf") {
      setError(t("upload.errorNotPdf"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("upload.errorGeneric"));
      onUploaded({ documentId: data.documentId, filename: data.filename });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  const titleLines = t("upload.title").split("\n");

  return (
    <div className="upload-wrapper">
      <div className="upload-hero">
        <h1 className="upload-title">
          {titleLines[0]}<br />{titleLines[1]}
        </h1>
        <p className="upload-subtitle">{t("upload.subtitle")}</p>
      </div>

      <div
        className={`dropzone ${dragging ? "dragging" : ""} ${loading ? "loading" : ""}`}
        onClick={() => !loading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {loading ? (
          <div className="upload-loading">
            <div className="spinner" />
            <span>{t("upload.extracting")}</span>
          </div>
        ) : (
          <>
            <div className="dropzone-icon">⬆</div>
            <div className="dropzone-label">{t("upload.dropLabel")}</div>
            <div className="dropzone-sub">{t("upload.dropSub")}</div>
          </>
        )}
      </div>

      {error && <div className="upload-error">⚠ {error}</div>}

      <div className="upload-features">
        <div className="feature">
          <span className="feature-icon">∑</span>
          <span>{t("upload.featureSummary")}</span>
        </div>
        <div className="feature">
          <span className="feature-icon">◎</span>
          <span>{t("upload.featureChat")}</span>
        </div>
        <div className="feature">
          <span className="feature-icon">◈</span>
          <span>{t("upload.featurePowered")}</span>
        </div>
      </div>
    </div>
  );
}
