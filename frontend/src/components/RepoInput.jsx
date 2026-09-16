import { IconArrowRight, IconGithub, IconAlertCircle } from "./Icons";

export default function RepoInput({
  repoUrl,
  setRepoUrl,
  onSubmit,
  isLoading,
  errorMessage,
  setErrorMessage,
}) {
  const exampleRepos = [
    { name: "octocat/Hello-World", url: "https://github.com/octocat/Hello-World" },
    { name: "pallets/flask", url: "https://github.com/pallets/flask" },
    { name: "expressjs/express", url: "https://github.com/expressjs/express" },
  ];

  const handleQuickFill = (url) => {
    setRepoUrl(url);
    if (setErrorMessage) setErrorMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="repo-input-wrapper">
      <div className={`repo-input-box ${errorMessage ? "has-error" : ""}`}>
        <div className="input-prefix">
          <IconGithub size={20} className="input-github-icon" />
        </div>
        <input
          type="text"
          className="repo-text-input"
          placeholder="https://github.com/owner/repository"
          value={repoUrl}
          disabled={isLoading}
          onChange={(e) => {
            setRepoUrl(e.target.value);
            if (errorMessage && setErrorMessage) setErrorMessage("");
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
        />
        <button
          type="button"
          className="analyze-cta-btn"
          disabled={isLoading || !repoUrl.trim()}
          onClick={onSubmit}
        >
          <span>{isLoading ? "Analyzing..." : "Analyze Repository"}</span>
          <IconArrowRight size={16} />
        </button>
      </div>

      {errorMessage && (
        <div className="input-error-alert" role="alert">
          <IconAlertCircle size={16} className="error-icon" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="example-chips-row">
        <span className="chips-label">Try an example:</span>
        <div className="chips-list">
          {exampleRepos.map((repo) => (
            <button
              key={repo.name}
              type="button"
              className="repo-chip"
              disabled={isLoading}
              onClick={() => handleQuickFill(repo.url)}
            >
              <IconGithub size={13} />
              <span>{repo.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
