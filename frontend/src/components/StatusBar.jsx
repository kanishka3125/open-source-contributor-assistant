import { IconGitBranch, IconTerminal, IconCommand } from "./Icons";

export default function StatusBar({ repoData, onOpenCommandPalette }) {
  if (!repoData) return null;

  return (
    <footer className="dev-status-bar">
      <div className="status-bar-left">
        <div className="status-item status-ready">
          <span className="status-indicator-dot" />
          <span>Repository Ready</span>
        </div>
        <div className="status-item">
          <IconGitBranch size={13} />
          <span>main</span>
        </div>
        {typeof repoData.files_processed === "number" && (
          <div className="status-item">
            <span>Files: <strong>{repoData.files_processed}</strong></span>
          </div>
        )}
        {typeof repoData.commits_processed === "number" && (
          <div className="status-item">
            <span>Commits: <strong>{repoData.commits_processed}</strong></span>
          </div>
        )}
        {typeof repoData.chunks_created === "number" && (
          <div className="status-item">
            <span>Chunks: <strong>{repoData.chunks_created}</strong></span>
          </div>
        )}
      </div>

      <div className="status-bar-right">
        <button
          type="button"
          className="status-item-btn"
          onClick={onOpenCommandPalette}
        >
          <IconCommand size={12} />
          <span>Ctrl+K Palette</span>
        </button>
        <div className="status-item">
          <IconTerminal size={12} />
          <span>UTF-8</span>
        </div>
      </div>
    </footer>
  );
}
