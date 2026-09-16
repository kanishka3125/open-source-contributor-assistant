import { useState, useEffect } from "react";
import { IconCheckCircle2, IconGithub, IconRefresh } from "./Icons";

const STAGES = [
  { id: "connect", label: "Connecting to GitHub", desc: "Verifying repository accessibility and public permissions" },
  { id: "clone", label: "Cloning repository", desc: "Fetching tree, blobs, and references safely into sandbox" },
  { id: "scan", label: "Scanning source files", desc: "Detecting programming languages and project hierarchy" },
  { id: "docs", label: "Extracting documentation", desc: "Parsing README, architecture files, and guides" },
  { id: "commits", label: "Extracting commit history", desc: "Analyzing commit messages, authors, and timestamps" },
  { id: "knowledge", label: "Building repository knowledge", desc: "Chunking content and generating structural knowledge" },
  { id: "ready", label: "Ready for questions", desc: "Repository intelligence loaded successfully" },
];

export default function AnalysisProgress({ repoUrl, isComplete, realStats }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (isComplete) return;

    // Advance through stages smoothly while waiting for the backend response
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        // Hold at "Building repository knowledge" until the backend finishes
        if (prev < STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isComplete]);

  const currentStageIndex = isComplete ? STAGES.length - 1 : stageIndex;
  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="analysis-progress-card">
      <div className="analysis-header">
        <div className="analysis-icon-ring">
          {isComplete ? (
            <IconCheckCircle2 size={24} className="icon-success" />
          ) : (
            <IconRefresh size={24} className="icon-spin" />
          )}
        </div>
        <div className="analysis-title-box">
          <h3>Analyzing Repository</h3>
          <p className="repo-url-display">
            <IconGithub size={14} />
            <span>{repoUrl}</span>
          </p>
        </div>
        <div className="progress-percentage-badge">
          {progressPercent}%
        </div>
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="stages-list">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex || isComplete;
          const isCurrent = idx === currentStageIndex && !isComplete;
          const isPending = idx > currentStageIndex && !isComplete;

          return (
            <div
              key={stage.id}
              className={`stage-item ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""} ${isPending ? "is-pending" : ""}`}
            >
              <div className="stage-indicator">
                {isDone ? (
                  <IconCheckCircle2 size={16} className="stage-done-icon" />
                ) : isCurrent ? (
                  <span className="stage-active-pulse" />
                ) : (
                  <span className="stage-pending-dot" />
                )}
              </div>
              <div className="stage-info">
                <div className="stage-label">{stage.label}</div>
                <div className="stage-desc">{stage.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {isComplete && realStats && (
        <div className="real-stats-banner">
          <div className="stat-pill">
            <span className="stat-num">{realStats.files_processed ?? 0}</span>
            <span className="stat-lbl">Files Processed</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{realStats.commits_processed ?? 0}</span>
            <span className="stat-lbl">Commits Extracted</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{realStats.chunks_created ?? 0}</span>
            <span className="stat-lbl">Knowledge Chunks</span>
          </div>
        </div>
      )}
    </div>
  );
}
