import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";
import SourceCard from "./SourceCard";
import {
  IconSparkles,
  IconSend,
  IconTerminal,
  IconAlertCircle,
  IconCheck,
  IconCopy,
} from "./Icons";

const SUGGESTED_QUESTIONS = [
  "Where is authentication implemented?",
  "Explain the project architecture.",
  "What changed in the latest commits?",
  "Which files handle database operations?",
  "Who contributed to the authentication module?",
];

/**
 * Lightweight helper to format code snippets or bold text in markdown-style responses
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split by code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="formatted-message">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const lang = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
          const codeContent = lang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div key={index} className="chat-code-block">
              <div className="chat-code-header">
                <span className="code-lang font-mono">{lang || "code"}</span>
                <CopyCodeBtn code={codeContent} />
              </div>
              <pre className="chat-code-pre font-mono">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Render standard paragraphs and inline `code`
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <p key={index} className="chat-paragraph">
            {inlineParts.map((sub, sIdx) => {
              if (sub.startsWith("`") && sub.endsWith("`")) {
                return (
                  <code key={sIdx} className="inline-code-pill font-mono">
                    {sub.slice(1, -1)}
                  </code>
                );
              }
              return sub;
            })}
          </p>
        );
      })}
    </div>
  );
}

function CopyCodeBtn({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button type="button" className="copy-code-btn" onClick={handleCopy}>
      {copied ? <IconCheck size={12} className="text-emerald" /> : <IconCopy size={12} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function ChatPanel({
  repoData,
  initialQuestion,
  onOpenFile,
  onBack,
}) {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: `Repository **${repoData?.repo_name || "codebase"}** has been analyzed. You can ask natural-language questions about source files, system architecture, commits, and module boundaries.`,
      sources: [],
    },
  ]);
  const [prevInitialQuestion, setPrevInitialQuestion] = useState(initialQuestion);
  const [input, setInput] = useState(initialQuestion || "");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // React-recommended pattern for adjusting state when prop changes
  if (initialQuestion && initialQuestion !== prevInitialQuestion) {
    setPrevInitialQuestion(initialQuestion);
    setInput(initialQuestion);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (questionToSend) => {
    const q = (typeof questionToSend === "string" ? questionToSend : input).trim();
    if (!q || isThinking) return;

    const userMessage = {
      sender: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await sendChatMessage(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: response.answer || "No answer returned.",
          sources: response.sources || [],
        },
      ]);
    } catch (err) {
      const errorText = err.message || "An error occurred while contacting repository intelligence.";
      const isUnavailable = err.status === 503 || errorText.toLowerCase().includes("unavailable");

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: isUnavailable
            ? "Repository intelligence is currently unavailable. Please try again later."
            : errorText,
          isError: true,
          isUnavailable,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectSuggested = (question) => {
    handleSend(question);
  };

  return (
    <div className="chat-panel-container">
      {/* Header */}
      <div className="chat-panel-header">
        <div className="chat-header-title-box">
          <div className="chat-ai-badge">
            <IconSparkles size={14} className="text-pink" />
            <span>AI Copilot</span>
          </div>
          <h2 className="chat-heading">Ask Your Repository</h2>
          <p className="chat-subheading">
            Understand code, architecture, commits, and documentation.
          </p>
        </div>

        <div className="chat-header-stats">
          {onBack && (
            <button type="button" className="navbar-action-btn" onClick={onBack}>
              ← Back
            </button>
          )}
          <span className="stat-pill-sm">
            {repoData?.files_processed ?? 0} files indexed
          </span>
          <span className="stat-pill-sm">
            {repoData?.chunks_created ?? 0} knowledge chunks
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="chat-stream-viewport">
        {/* Suggested Questions on first visit */}
        {messages.length <= 1 && (
          <div className="suggested-questions-panel">
            <div className="suggested-label">
              <IconTerminal size={14} />
              <span>Suggested questions for this repository:</span>
            </div>
            <div className="suggested-chips-grid">
              {SUGGESTED_QUESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggested-chip"
                  onClick={() => handleSelectSuggested(item)}
                  disabled={isThinking}
                >
                  <IconSparkles size={12} className="text-pink" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message History */}
        <div className="messages-history-list">
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={index}
                className={`message-bubble-row ${isUser ? "user-row" : "assistant-row"}`}
              >
                {!isUser && (
                  <div className="avatar-box assistant-avatar">
                    <IconSparkles size={16} />
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    isUser
                      ? "user-bubble"
                      : msg.isError
                      ? "assistant-bubble error-bubble"
                      : "assistant-bubble"
                  }`}
                >
                  {msg.isError && (
                    <div className="bubble-error-header">
                      <IconAlertCircle size={15} />
                      <span>{msg.isUnavailable ? "Service Notice" : "Query Error"}</span>
                    </div>
                  )}

                  <FormattedMessage text={msg.text} />

                  {/* Grounded Source References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources-wrapper">
                      <div className="sources-header-label">
                        <span>Grounded Sources ({msg.sources.length})</span>
                      </div>
                      <div className="sources-list-column">
                        {msg.sources.map((source, sIdx) => (
                          <SourceCard
                            key={sIdx}
                            source={source}
                            repoUrl={repoData?.repo_url}
                            onOpenFile={onOpenFile}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="avatar-box user-avatar">
                    <span>You</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isThinking && (
            <div className="message-bubble-row assistant-row">
              <div className="avatar-box assistant-avatar">
                <IconSparkles size={16} />
              </div>
              <div className="message-bubble assistant-bubble thinking-bubble">
                <div className="thinking-dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <span className="thinking-text">Assistant is analyzing the repository...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="chat-input-glass">
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            placeholder="Ask a question about the code, architecture, or commits..."
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            type="button"
            className="chat-submit-btn"
            disabled={isThinking || !input.trim()}
            onClick={() => handleSend()}
            title="Send query"
          >
            <IconSend size={16} />
          </button>
        </div>
        <div className="chat-input-hint">
          <span>Pro tip: Press ↵ Enter to submit. Use Ctrl+K anytime for command palette.</span>
        </div>
      </div>
    </div>
  );
}
