import { IconUsers, IconGitCommit, IconFile, IconSparkles } from "./Icons";

export default function ContributorPanel({ repoData }) {
  const commitsCount = repoData?.commits_processed ?? 0;
  const filesCount = repoData?.files_processed ?? 0;

  return (
    <div className="contributors-container">
      {/* Header */}
      <div className="contributors-header-panel">
        <div className="contributors-header-left">
          <div className="contributors-badge">
            <IconUsers size={14} className="text-amber" />
            <span>Developer Network</span>
          </div>
          <h2 className="contributors-title">Contributor Insights</h2>
          <p className="contributors-subtitle">
            Understand key maintainers, author domains, and contribution frequency across the codebase.
          </p>
        </div>

        <div className="contributors-header-metrics">
          <div className="metric-box">
            <span className="metric-val font-mono">{commitsCount.toLocaleString()}</span>
            <span className="metric-lbl">Extracted Commits</span>
          </div>
          <div className="metric-box">
            <span className="metric-val font-mono">{filesCount.toLocaleString()}</span>
            <span className="metric-lbl">Monitored Files</span>
          </div>
        </div>
      </div>

      {/* Backend Readiness & Meaningful Developer State per PRD */}
      <div className="contributor-readiness-card">
        <div className="readiness-icon-box">
          <IconUsers size={28} className="text-amber" />
        </div>
        <div className="readiness-content">
          <h3>Contributor insights will appear when repository contribution data is available</h3>
          <p>
            The repository analysis pipeline successfully indexed <strong>{commitsCount} commits</strong> and{" "}
            <strong>{filesCount} files</strong> for <code>{repoData?.repo_name || "the repository"}</code>.
            Individual author aggregation and commit attribution maps are prepared to activate as soon as the
            backend contributor worker completes parsing git author signatures.
          </p>
        </div>
      </div>

      {/* Overview Cards for Contribution Architecture */}
      <div className="contributor-cards-grid">
        <div className="contrib-feature-card">
          <div className="feat-icon-ring amber">
            <IconGitCommit size={18} />
          </div>
          <h4>Commit Frequency & Recency</h4>
          <p>Track which developers maintain active velocity on key branches and hotfix paths.</p>
        </div>

        <div className="contrib-feature-card">
          <div className="feat-icon-ring cyan">
            <IconFile size={18} />
          </div>
          <h4>Module Domain Ownership</h4>
          <p>Discover which contributors touch specific subpackages like authentication, models, and tests.</p>
        </div>

        <div className="contrib-feature-card">
          <div className="feat-icon-ring pink">
            <IconSparkles size={18} />
          </div>
          <h4>AI-Assisted Contributor Queries</h4>
          <p>Use the Ask AI tab to ask: <em>"Who contributed most to the login module?"</em></p>
        </div>
      </div>
    </div>
  );
}
