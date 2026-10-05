import { IconTerminal, IconGithub } from "./Icons";
import ThreeDHeroScene from "./ThreeDHeroScene";
import TiltCard from "./TiltCard";

export default function Hero({ children, theme, isLoading, repoUrl }) {
  if (isLoading) {
    // ── ANALYZING MODE ────────────────────────────────────────────────────────
    // Full-width layout: Analysis progress takes the main stage.
    // The 3D logo floats up to a compact panel beside the repo URL.
    return (
      <div className="hero-analyzing-layout">
        <div className="analyzing-main-area">
          {/* Compact repo identity banner with floating logo */}
          <div className="analyzing-repo-header">
            <div className="analyzing-logo-mini">
              <ThreeDHeroScene theme={theme} />
            </div>
            <div className="analyzing-repo-identity">
              <div className="analyzing-badge">
                <span className="analyzing-pulse-dot" />
                <span>Analyzing Repository</span>
              </div>
              <p className="analyzing-repo-url-text">
                <IconGithub size={14} />
                <span>{repoUrl}</span>
              </p>
            </div>
          </div>

          {/* Full-width progress card */}
          <div className="analyzing-progress-full">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── IDLE MODE ─────────────────────────────────────────────────────────────
  // Normal two-column hero layout
  return (
    <div className="hero-showcase-container">
      <div className="hero-grid">
        {/* Left Column: Headline, Description & Input Action */}
        <div className="hero-messaging-col">
          <div className="hero-badge">
            <IconTerminal size={14} className="hero-badge-icon" />
            <span>OPEN SOURCE CONTRIBUTOR ASSISTANT</span>
          </div>

          <h1 className="hero-title">
            Understand Any <span className="title-highlight">GitHub Repository</span>
          </h1>

          <p className="hero-subtitle">
            Explore source files, trace commit histories, understand architecture, and ask questions directly grounded in code.
          </p>

          <div className="hero-action-slot">
            {children}
          </div>
        </div>

        {/* Right Column: Interactive 3D GitHub Logo */}
        <div className="hero-three-d-col">
          <TiltCard maxTilt={5} scale={1.01} className="hero-scene-tilt-card">
            <ThreeDHeroScene theme={theme} />
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
