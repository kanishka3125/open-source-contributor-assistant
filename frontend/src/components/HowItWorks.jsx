import { IconGithub, IconFile, IconGitCommit, IconSparkles } from "./Icons";

const STEPS = [
  {
    step: "01",
    tag: "CONNECT",
    title: "Connect a public GitHub repository",
    desc: "Provide any open-source GitHub URL. The platform securely inspects the tree and references.",
    icon: IconGithub,
    color: "cyan",
  },
  {
    step: "02",
    tag: "ANALYZE",
    title: "Process source files and documentation",
    desc: "Source files, README, architecture guidelines, and configs are structured into intelligent chunks.",
    icon: IconFile,
    color: "blue",
  },
  {
    step: "03",
    tag: "TRACE",
    title: "Explore commits and repository evolution",
    desc: "Inspect the commit timeline, file modifications, and historical patterns across development branches.",
    icon: IconGitCommit,
    color: "purple",
  },
  {
    step: "04",
    tag: "ASK",
    title: "Ask questions about the repository",
    desc: "Query code architecture, implementation details, dependencies, and author contributions with AI.",
    icon: IconSparkles,
    color: "pink",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="section-header text-center">
        <span className="section-tagline">INTELLIGENCE PIPELINE</span>
        <h2 className="section-heading">How Repository Intelligence Works</h2>
        <p className="section-subheading">
          Transform opaque codebases into transparent, explorable knowledge systems in four seamless stages.
        </p>
      </div>

      <div className="steps-container">
        <div className="steps-connection-line" />
        <div className="steps-grid">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="step-card">
                <div className={`step-icon-wrapper ${step.color}`}>
                  <Icon size={20} />
                  <span className="step-num-badge">{step.step}</span>
                </div>
                <div className="step-tag-pill">{step.tag}</div>
                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
