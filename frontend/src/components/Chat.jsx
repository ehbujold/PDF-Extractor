import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import "./Chat.css";

/* Chat component:
- Provides an interactive chat interface for users to ask questions about their uploaded document.
- Maintains a message history to provide context for the AI assistant.
- Handles user input, sends it to the backend API, and displays the AI's responses.
- Shows loading indicators while waiting for responses and handles errors gracefully.
*/
export default function Chat({ documentId }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("chat.greeting") }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  // Reset greeting when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("chat.greeting") }]);
  }, [i18n.language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg = { role: "user", content: question };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages
        .slice(1)
        .slice(0, -1)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question, history, language: i18n.language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("chat.errorFailed"));

      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: `⚠ ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <span className="message-tag">{msg.role === "user" ? t("chat.you") : "DocMind"}</span>
            <div className="message-content markdown">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <span className="message-tag">DocMind</span>
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder={t("chat.placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={loading}
        />
        <button
          className={`send-btn ${loading ? "loading" : ""}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? <div className="send-spinner" /> : "↑"}
        </button>
      </div>
    </div>
  );
}
