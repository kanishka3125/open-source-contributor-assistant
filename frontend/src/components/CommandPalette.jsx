import { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconSparkles,
  IconCode,
  IconGitCommit,
  IconUsers,
  IconLayers,
  IconRefresh,
  IconX,
} from "./Icons";

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectAction,
  repoData,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    {
      id: "ask",
      label: "Ask Repository",
      description: "Chat with AI to understand code, architecture, or commits",
      icon: IconSparkles,
      color: "pink",
      action: () => onSelectAction("chat"),
    },
    {
      id: "overview",
      label: "Repository Overview",
      description: "View repository statistics, chunk metrics, and structure",
      icon: IconLayers,
      color: "blue",
      action: () => onSelectAction("overview"),
    },
    {
      id: "files",
      label: "Explore Files",
      description: "Browse directory tree and open source files in code viewer",
      icon: IconCode,
      color: "cyan",
      action: () => onSelectAction("code"),
    },
    {
      id: "commits",
      label: "View Commits",
      description: "Inspect repository evolution timeline and commit history",
      icon: IconGitCommit,
      color: "purple",
      action: () => onSelectAction("commits"),
    },
    {
      id: "contributors",
      label: "View Contributors",
      description: "Review repository contributors and maintainer insights",
      icon: IconUsers,
      color: "amber",
      action: () => onSelectAction("contributors"),
    },
    {
      id: "change",
      label: "Change Repository",
      description: "Disconnect active repository and analyze another GitHub repo",
      icon: IconRefresh,
      color: "slate",
      action: () => onSelectAction("change-repo"),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const activeIndex = selectedIndex >= filteredCommands.length ? 0 : selectedIndex;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        handleClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={handleClose}>
      <div
        className="palette-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="palette-header">
          <IconSearch size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder={
              repoData
                ? `Search commands for ${repoData.repo_name || "repository"}...`
                : "Type a command or jump to..."
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="palette-close-btn" onClick={handleClose}>
            <IconX size={16} />
          </button>
        </div>

        <div className="palette-list">
          {filteredCommands.length === 0 ? (
            <div className="palette-empty">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={cmd.id}
                  className={`palette-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    cmd.action();
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={`palette-item-icon ${cmd.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="palette-item-info">
                    <div className="palette-item-label">{cmd.label}</div>
                    <div className="palette-item-desc">{cmd.description}</div>
                  </div>
                  {isSelected && (
                    <span className="palette-item-enter">
                      Press ↵
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="palette-footer">
          <div className="palette-hint">
            <span>Use</span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="palette-hint">
            <span>Select</span>
            <kbd>↵</kbd>
          </div>
          <div className="palette-hint">
            <span>Close</span>
            <kbd>Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
