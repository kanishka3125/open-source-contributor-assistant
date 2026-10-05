import { IconTerminal, IconArrowRight } from "./Icons";
import TiltCard from "./TiltCard";

const EXAMPLE_QUESTIONS = [
  {
    category: "Architecture",
    question: "Explain the project architecture.",
    desc: "Understand high-level system layout, module boundaries, and execution flow.",
  },
  {
    category: "Security & Auth",
    question: "Where is authentication implemented?",
    desc: "Locate token verification, session middleware, and credential handlers.",
  },
  {
    category: "Business Logic",
    question: "How does the payment flow work?",
    desc: "Trace order processing, external webhook integration, and state machines.",
  },
  {
    category: "Storage",
    question: "Which files handle database operations?",
    desc: "Identify schemas, ORM models, migrations, and query execution layers.",
  },
  {
    category: "Git History",
    question: "When was this feature introduced?",
    desc: "Search through commit messages, changesets, and release tags.",
  },
  {
    category: "Contributors",
    question: "Who contributed most to the login module?",
    desc: "Trace authors and frequent committers across specific subdirectories.",
  },
];

export default function ExampleQuestions({ onSelectQuestion }) {
  return (
    <section className="example-questions-section">
      <div className="section-header text-center">
        <span className="section-tagline">EXPLORE QUERIES</span>
        <h2 className="section-heading">Example Questions</h2>
        <p className="section-subheading">
          Select a sample query to inspect architecture, auth flows, and historical code changes.
        </p>
      </div>

      <div className="questions-grid">
        {EXAMPLE_QUESTIONS.map((item, idx) => (
          <TiltCard
            key={idx}
            maxTilt={6}
            scale={1.02}
            className="question-tilt-frame"
            onClick={() => onSelectQuestion && onSelectQuestion(item.question)}
          >
            <div className="question-card">
              <div className="question-card-top">
                <span className="question-cat-badge">{item.category}</span>
              </div>
              <h4 className="question-card-text">"{item.question}"</h4>
              <p className="question-card-desc">{item.desc}</p>
              <div className="question-card-footer">
                <span className="ask-prompt-text">
                  <IconTerminal size={12} />
                  <span>Try this query</span>
                </span>
                <IconArrowRight size={14} className="arrow-hover" />
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
