import { IconGithub, IconExternalLink, IconCommand, IconSearch, IconSparkles, IconSun, IconMoon } from "./Icons";

export default function Navbar({
  repoData,
  onBackToHome,
  onOpenCommandPalette,
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
}) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "code", label: "Code" },
    { id: "commits", label: "Commits" },
    { id: "contributors", label: "Contributors" },
    { id: "chat", label: "Ask AI", isAi: true },
  ];

  return (
    <header className="global-navbar">
      <div className="navbar-container">
        {/* Left: Branding */}
        <div className="navbar-left">
          <button type="button" className="brand-logo-btn" onClick={onBackToHome}>
            <div className="brand-icon-box">
              <IconSparkles size={18} className="brand-sparkle" />
            </div>
            <div className="brand-text">
              <span className="brand-name">RepoIntel</span>
              <span className="brand-tag">v1.0</span>
            </div>
          </button>

          {repoData && (
            <div className="navbar-repo-badge">
              <span className="repo-status-dot" />
              <span className="repo-badge-name">{repoData.repo_name || "Repository"}</span>
              <span className="repo-badge-type">public</span>
            </div>
          )}
        </div>

        {/* Center: Tabs when repo is active */}
        {repoData && (
          <nav className="navbar-tabs" aria-label="Repository Navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab-btn ${activeTab === tab.id ? "is-active" : ""} ${tab.isAi ? "ai-tab" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.isAi && <IconSparkles size={13} className="tab-ai-icon" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="navbar-right">
          <button
            type="button"
            className="navbar-search-btn"
            onClick={onOpenCommandPalette}
            title="Open Command Palette (Ctrl+K)"
          >
            <IconSearch size={14} />
            <span className="search-placeholder">Search repository...</span>
            <span className="search-shortcut">
              <IconCommand size={11} />
              <span>K</span>
            </span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-track">
              <span className={`theme-toggle-thumb ${theme === "light" ? "is-light" : ""}`} />
              <span className="theme-icon theme-icon-moon">
                <IconMoon size={11} />
              </span>
              <span className="theme-icon theme-icon-sun">
                <IconSun size={11} />
              </span>
            </span>
          </button>

          {repoData?.repo_url && (
            <a
              href={repoData.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-action-btn github-link"
              title="Open on GitHub"
            >
              <IconGithub size={16} />
              <span className="action-text">GitHub</span>
              <IconExternalLink size={12} className="link-ext" />
            </a>
          )}

          {repoData && (
            <button
              type="button"
              className="navbar-action-btn change-repo-btn"
              onClick={onBackToHome}
              title="Change repository"
            >
              <span>Change Repo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
