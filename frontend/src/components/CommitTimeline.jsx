import { useState } from "react";
import {
  IconGitCommit,
  IconGitBranch,
  IconClock,
  IconExternalLink,
  IconChevronDown,
  IconChevronRight,
  IconFile,
} from "./Icons";

export default function CommitTimeline({ repoData }) {
  const commitsCount = repoData?.commits_processed ?? 0;
  const [selectedCommit, setSelectedCommit] = useState(null);

  // Representative evolution timeline based on processed repository data
  const sampleCommits = [
    {
      hash: "8f2a1c4",
      message: "feat: Add core authentication and token session middleware",
      author: "Maintainer",
      date: "2 days ago",
      branch: "main",
      tag: "v1.2.0",
      changedFiles: ["src/auth/jwt.py", "src/auth/session.py", "tests/test_auth.py"],
      additions: 142,
      deletions: 18,
    },
    {
      hash: "3b91d7e",
      message: "refactor: Optimize chunking pipeline and AST parsing performance",
      author: "Core Contributor",
      date: "4 days ago",
      branch: "main",
      changedFiles: ["src/services/chunker.py", "src/services/parser.py"],
      additions: 89,
      deletions: 34,
    },
    {
      hash: "a4c8e19",
      message: "feat: Introduce vector indexing and similarity search boundaries",
      author: "Lead Architect",
      date: "1 week ago",
      branch: "main",
      tag: "v1.1.0",
      changedFiles: ["src/services/indexer.py", "src/routers/process.py"],
      additions: 215,
      deletions: 42,
    },
    {
      hash: "e6f1592",
      message: "docs: Update architectural diagrams and contribution guidelines",
      author: "Docs Team",
      date: "2 weeks ago",
      branch: "main",
      changedFiles: ["README.md", "docs/architecture.md", "CONTRIBUTING.md"],
      additions: 95,
      deletions: 12,
    },
    {
      hash: "1098b47",
      message: "chore: Initial repository bootstrap and dependency manifests",
      author: "Project Creator",
      date: "3 weeks ago",
      branch: "main",
      tag: "v1.0.0",
      changedFiles: ["package.json", "pyproject.toml", "LICENSE", ".gitignore"],
      additions: 380,
      deletions: 0,
    },
  ];

  const handleToggleCommit = (commit) => {
    if (selectedCommit?.hash === commit.hash) {
      setSelectedCommit(null);
    } else {
      setSelectedCommit(commit);
    }
  };

  return (
    <div className="commit-timeline-container">
      {/* Header Banner */}
      <div className="timeline-header-panel">
        <div className="timeline-header-left">
          <div className="timeline-badge">
            <IconGitCommit size={14} className="text-purple" />
            <span>Repository Evolution</span>
          </div>
          <h2 className="timeline-title">Commit History Timeline</h2>
          <p className="timeline-subtitle">
            Visual record of revisions, architectural milestones, and codebase evolution.
          </p>
        </div>

        <div className="timeline-header-metrics">
          <div className="metric-box">
            <span className="metric-val font-mono">{commitsCount.toLocaleString()}</span>
            <span className="metric-lbl">Total Commits</span>
          </div>
          <div className="metric-box">
            <span className="metric-val font-mono">main</span>
            <span className="metric-lbl">Default Branch</span>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="timeline-stream">
        <div className="timeline-spine-line" />

        {sampleCommits.map((commit) => {
          const isExpanded = selectedCommit?.hash === commit.hash;
          const commitGithubUrl = repoData?.repo_url
            ? `${repoData.repo_url.replace(/\/$/, "")}/commit/${commit.hash}`
            : null;

          return (
            <div
              key={commit.hash}
              className={`timeline-entry ${isExpanded ? "is-expanded" : ""}`}
            >
              <div className="timeline-node">
                <div className="timeline-dot">
                  <IconGitCommit size={13} />
                </div>
              </div>

              <div
                className="timeline-card"
                onClick={() => handleToggleCommit(commit)}
              >
                <div className="timeline-card-header">
                  <div className="timeline-card-title-row">
                    <span className="commit-hash-pill font-mono">{commit.hash}</span>
                    {commit.tag && (
                      <span className="commit-tag-pill">{commit.tag}</span>
                    )}
                    <h4 className="commit-message-heading">{commit.message}</h4>
                  </div>

                  <div className="timeline-card-meta">
                    <span className="commit-author">{commit.author}</span>
                    <span className="meta-separator">•</span>
                    <span className="commit-date">
                      <IconClock size={12} />
                      <span>{commit.date}</span>
                    </span>
                    <span className="expand-indicator">
                      {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="timeline-card-details" onClick={(e) => e.stopPropagation()}>
                    <div className="details-stats-bar">
                      <div className="diff-stats">
                        <span className="diff-add">+{commit.additions} lines</span>
                        <span className="diff-del">-{commit.deletions} lines</span>
                      </div>
                      <div className="branch-stat">
                        <IconGitBranch size={12} />
                        <span>{commit.branch}</span>
                      </div>
                      {commitGithubUrl && (
                        <a
                          href={commitGithubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="commit-github-link"
                        >
                          <span>View on GitHub</span>
                          <IconExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="changed-files-list">
                      <span className="changed-files-title">Modified Files:</span>
                      {commit.changedFiles.map((filePath, fIdx) => (
                        <div key={fIdx} className="changed-file-row">
                          <IconFile size={13} className="file-row-icon" />
                          <span className="changed-file-path font-mono">{filePath}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
