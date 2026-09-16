import { useState } from "react";
import { IconFile, IconCode, IconChevronDown, IconChevronRight, IconExternalLink } from "./Icons";

export default function SourceCard({
  source,
  repoUrl,
  onOpenFile,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const filePath = source.file || source.file_path || "Unknown source";
  const lines = source.lines ? `Lines ${source.lines}` : null;
  const sourceType = (source.type || "code").toUpperCase();

  const githubFileUrl = repoUrl && filePath !== "Unknown source"
    ? `${repoUrl.replace(/\/$/, "")}/blob/main/${filePath}${source.lines ? `#L${source.lines.split("-")[0]}` : ""}`
    : null;

  return (
    <div className={`source-reference-card ${isExpanded ? "is-expanded" : ""}`}>
      <div
        className="source-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="source-card-left">
          <IconFile size={15} className="source-type-icon" />
          <span className="source-file-name font-mono">{filePath}</span>
          {lines && <span className="source-lines-badge font-mono">{lines}</span>}
          <span className="source-kind-pill">{sourceType}</span>
        </div>

        <div className="source-card-right">
          {onOpenFile && (
            <button
              type="button"
              className="source-jump-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFile({ path: filePath, name: filePath.split("/").pop(), lines: source.lines });
              }}
              title="Open file in code viewer"
            >
              <IconCode size={13} />
              <span>Inspect</span>
            </button>
          )}

          {githubFileUrl && (
            <a
              href={githubFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="source-github-link"
              onClick={(e) => e.stopPropagation()}
              title="View on GitHub"
            >
              <IconExternalLink size={13} />
            </a>
          )}

          <span className="source-expand-toggle">
            {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="source-card-body">
          <div className="source-meta-row">
            <span>Type: <strong>{sourceType}</strong></span>
            {source.author && <span>Author: <strong>{source.author}</strong></span>}
            {source.commit && <span>Commit: <code>{source.commit.slice(0, 7)}</code></span>}
          </div>
          {source.snippet ? (
            <pre className="source-snippet-pre font-mono">
              <code>{source.snippet}</code>
            </pre>
          ) : (
            <p className="source-notice">
              Referenced in repository knowledge index ({filePath} {lines || ""}).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
