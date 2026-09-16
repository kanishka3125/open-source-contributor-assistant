import {
  IconFile,
  IconGitCommit,
  IconLayers,
  IconGithub,
  IconExternalLink,
  IconSparkles,
  IconCode,
  IconFolder,
  IconCheckCircle2,
  IconArrowRight,
} from "./Icons";

export default function OverviewTab({ repoData, onNavigateTab }) {
  if (!repoData) {
    return (
      <div className="empty-state-box">
        <IconLayers size={36} className="empty-icon" />
        <h3>No Repository Selected</h3>
        <p>Enter a GitHub repository URL to analyze and explore repository intelligence.</p>
      </div>
    );
  }

  const filesCount = repoData.files_processed ?? 0;
  const commitsCount = repoData.commits_processed ?? 0;
  const chunksCount = repoData.chunks_created ?? 0;

  return (
    <div className="overview-container">
      {/* Top Banner */}
      <div className="overview-hero-card">
        <div className="overview-hero-content">
          <div className="repo-status-pill">
            <IconCheckCircle2 size={14} className="text-emerald" />
            <span>Repository Processed & Ready</span>
          </div>
          <h2 className="overview-repo-name">{repoData.repo_name || "Repository"}</h2>
          <p className="overview-repo-url">
            <IconGithub size={15} />
            <a
              href={repoData.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-link"
            >
              <span>{repoData.repo_url}</span>
              <IconExternalLink size={12} />
            </a>
          </p>
        </div>

        <div className="overview-hero-actions">
          <button
            type="button"
            className="action-pill primary"
            onClick={() => onNavigateTab("chat")}
          >
            <IconSparkles size={15} />
            <span>Ask Repository AI</span>
          </button>
          <button
            type="button"
            className="action-pill secondary"
            onClick={() => onNavigateTab("code")}
          >
            <IconCode size={15} />
            <span>Browse Files</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-metric-card cyan-glow">
          <div className="stat-card-header">
            <span className="stat-card-title">SOURCE FILES</span>
            <div className="stat-icon-wrapper cyan">
              <IconFile size={18} />
            </div>
          </div>
          <div className="stat-card-value">{filesCount.toLocaleString()}</div>
          <p className="stat-card-hint">Parsed and structured for search</p>
        </div>

        <div className="stat-metric-card purple-glow">
          <div className="stat-card-header">
            <span className="stat-card-title">GIT COMMITS</span>
            <div className="stat-icon-wrapper purple">
              <IconGitCommit size={18} />
            </div>
          </div>
          <div className="stat-card-value">{commitsCount.toLocaleString()}</div>
          <p className="stat-card-hint">Historical revisions extracted</p>
        </div>

        <div className="stat-metric-card blue-glow">
          <div className="stat-card-header">
            <span className="stat-card-title">KNOWLEDGE CHUNKS</span>
            <div className="stat-icon-wrapper blue">
              <IconLayers size={18} />
            </div>
          </div>
          <div className="stat-card-value">{chunksCount.toLocaleString()}</div>
          <p className="stat-card-hint">Granular units indexed for AI</p>
        </div>
      </div>

      {/* Architecture & Visual Structure Map */}
      <div className="overview-split-row">
        <div className="overview-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <IconFolder size={18} className="text-cyan" />
              <h3>Repository Structure Topology</h3>
            </div>
            <button
              type="button"
              className="panel-action-link"
              onClick={() => onNavigateTab("code")}
            >
              <span>Open Tree</span>
              <IconArrowRight size={13} />
            </button>
          </div>
          <div className="topology-tree-preview">
            <div className="topology-node root">
              <span className="node-icon">📦</span>
              <span className="node-label font-mono">{repoData.repo_name}</span>
            </div>
            <div className="topology-branch">
              <div className="topology-node branch-node">
                <span className="node-icon">📁</span>
                <span className="node-label font-mono">src /</span>
                <span className="node-meta">Core implementation logic</span>
              </div>
              <div className="topology-leafs">
                <div className="topology-node leaf">
                  <span className="node-icon">📄</span>
                  <span className="node-label font-mono">auth /</span>
                  <span className="node-meta">Authentication & sessions</span>
                </div>
                <div className="topology-node leaf">
                  <span className="node-icon">📄</span>
                  <span className="node-label font-mono">models /</span>
                  <span className="node-meta">Data entities & schemas</span>
                </div>
                <div className="topology-node leaf">
                  <span className="node-icon">📄</span>
                  <span className="node-label font-mono">utils.py</span>
                  <span className="node-meta">Shared helper routines</span>
                </div>
              </div>
              <div className="topology-node branch-node">
                <span className="node-icon">📁</span>
                <span className="node-label font-mono">tests /</span>
                <span className="node-meta">Unit & integration suites</span>
              </div>
              <div className="topology-node branch-node">
                <span className="node-icon">📄</span>
                <span className="node-label font-mono">README.md</span>
                <span className="node-meta">Project overview & guides</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <IconSparkles size={18} className="text-pink" />
              <h3>Intelligence Capabilities</h3>
            </div>
          </div>
          <div className="capabilities-list">
            <div className="capability-card" onClick={() => onNavigateTab("chat")}>
              <div className="cap-icon-box pink">
                <IconSparkles size={16} />
              </div>
              <div className="cap-content">
                <h4>Natural Language Question Answering</h4>
                <p>Query codebase architecture, functions, and workflows directly.</p>
              </div>
              <IconArrowRight size={14} className="cap-arrow" />
            </div>

            <div className="capability-card" onClick={() => onNavigateTab("commits")}>
              <div className="cap-icon-box purple">
                <IconGitCommit size={16} />
              </div>
              <div className="cap-content">
                <h4>Commit Evolution Timeline</h4>
                <p>Trace when features were merged and inspect change history.</p>
              </div>
              <IconArrowRight size={14} className="cap-arrow" />
            </div>

            <div className="capability-card" onClick={() => onNavigateTab("code")}>
              <div className="cap-icon-box cyan">
                <IconCode size={16} />
              </div>
              <div className="cap-content">
                <h4>VS Code-Style Source Viewer</h4>
                <p>Browse directories and inspect source files with line highlighting.</p>
              </div>
              <IconArrowRight size={14} className="cap-arrow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
