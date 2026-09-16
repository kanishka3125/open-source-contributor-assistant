import { IconSparkles, IconTerminal, IconArrowRight } from "./Icons";

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
        <span className="section-tagline">NATURAL LANGUAGE EXPLORATION</span>
        <h2 className="section-heading">Ask Your Codebase Anything</h2>
        <p className="section-subheading">
          Stop manually digging through hundreds of files. Ask targeted questions and get instant architectural context.
        </p>
      </div>

      <div className="questions-grid">
        {EXAMPLE_QUESTIONS.map((item, idx) => (
          <div
            key={idx}
            className="question-card"
            onClick={() => onSelectQuestion && onSelectQuestion(item.question)}
          >
            <div className="question-card-top">
              <span className="question-cat-badge">{item.category}</span>
              <IconSparkles size={14} className="question-card-spark" />
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
        ))}
      </div>
    </section>
  );
}
