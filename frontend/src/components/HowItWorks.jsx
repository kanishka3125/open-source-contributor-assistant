import { IconGithub, IconFile, IconGitCommit, IconTerminal } from "./Icons";
import TiltCard from "./TiltCard";

const STEPS = [
  {
    step: "01",
    tag: "CONNECT",
    title: "Connect a public GitHub repository",
    desc: "Provide any open-source GitHub URL. The backend clones the repository into an isolated sandbox.",
    icon: IconGithub,
  },
  {
    step: "02",
    tag: "EXTRACT",
    title: "Process source files and documentation",
    desc: "Source files, README, and configuration files are chunked into searchable units with line ranges.",
    icon: IconFile,
  },
  {
    step: "03",
    tag: "TRACE",
    title: "Extract git commits & history",
    desc: "Commit messages, authors, timestamps, and touched files are indexed for chronological context.",
    icon: IconGitCommit,
  },
  {
    step: "04",
    tag: "QUERY",
    title: "Ask questions & inspect code",
    desc: "Search implementation details, dependencies, and architecture with direct file references.",
    icon: IconTerminal,
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="section-header text-center">
        <span className="section-tagline">PIPELINE OVERVIEW</span>
        <h2 className="section-heading">How It Works</h2>
        <p className="section-subheading">
          A structured workflow to clone, index, and explore open source repositories.
        </p>
      </div>

      <div className="steps-container">
        <div className="steps-connection-line" />
        <div className="steps-grid">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <TiltCard key={step.step} maxTilt={8} scale={1.02} className="step-tilt-frame">
                <div className="step-card">
                  <div className="step-icon-wrapper neutral">
                    <Icon size={20} />
                    <span className="step-num-badge">{step.step}</span>
                  </div>
                  <div className="step-tag-pill">{step.tag}</div>
                  <h3 className="step-card-title">{step.title}</h3>
                  <p className="step-card-desc">{step.desc}</p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
