# Open Source Contributor Assistant — Frontend Product Requirements Document

The Open Source Contributor Assistant is an AI-powered developer tool that helps users understand GitHub repositories through natural-language interaction. The application allows users to provide a public GitHub repository URL and explore information about source code, repository structure, documentation, commit history, contributors, and code evolution. The frontend should provide an immersive and intuitive interface where users can process a repository, explore its contents, and ask questions about the repository. The product should feel like a modern developer intelligence platform rather than a basic chatbot.

The primary target users are open-source contributors, students, developers, and project maintainers who need to quickly understand unfamiliar GitHub repositories. The application should reduce the effort required to navigate large codebases, understand project architecture, read documentation, trace when features were introduced, understand commit history, and identify contributors and their areas of work.

The main user journey should be: Landing Page → Enter GitHub Repository URL → Analyze Repository → Repository Processing → Repository Dashboard → Explore Repository → Overview / Code / Commits / Contributors / Ask AI → Ask a Question → AI-generated Answer → Source References → Explore Relevant Code. The frontend should make this journey clear, smooth, and visually engaging.

The frontend should provide a polished repository analysis experience, make repository information easy to explore, provide a dedicated AI question-and-answer experience, clearly display repository statistics, visualize repository structure and history, provide source references for future RAG answers, provide clear loading, success, error, and empty states, remain responsive across desktop, laptop, tablet, and mobile devices, maintain compatibility with the existing backend, and feel like a professional developer tool.

The visual direction should be a modern developer-tool aesthetic with a dark-first interface, deep navy or black background, subtle blue and purple gradient accents, glass-like panels, soft borders, subtle glow effects, clean typography, rounded but professional cards, code-editor-inspired elements, minimal visual clutter, and smooth transitions. The overall design should feel modern, technical, immersive, and professional. Avoid excessive neon effects, childish illustrations, excessive gradients, overly animated backgrounds, and a generic chatbot appearance. Animations should improve usability rather than distract from the product.

The landing page should immediately communicate the purpose of the product. The main heading should be "Understand Any GitHub Repository." The supporting text should be "Explore code, commits, architecture, and repository history with an AI-powered developer assistant." Provide a prominent GitHub repository URL input with the placeholder "https://github.com/owner/repository" and a primary CTA labeled "Analyze Repository →". Add clickable example repository chips such as "octocat/Hello-World" and "pallets/flask" that populate the input when clicked. Add a small badge such as "AI-POWERED REPOSITORY INTELLIGENCE" above the main heading. The landing page should include a subtle animated background using a grid, repository nodes, connected lines, particles, or code fragments while keeping the implementation lightweight and performant.

Below the hero section, add a concise explanation of how the product works using four stages: "01 — CONNECT: Connect a public GitHub repository", "02 — ANALYZE: Process source files and documentation", "03 — TRACE: Explore commits and repository evolution", and "04 — ASK: Ask questions about the repository". These stages should be visually connected with subtle lines or transitions.

Add a section titled "Ask Your Codebase Anything." Display example questions such as "Where is authentication implemented?", "How does the payment flow work?", "Who contributed most to the login module?", "When was this feature introduced?", "Explain the project architecture.", and "Which files handle database operations?" These questions should be reusable in the repository chat interface. Clicking a question should populate the chat input when appropriate.

When the user clicks "Analyze Repository", do not show only a generic spinner. Create an engaging repository processing experience showing stages such as "Connecting to GitHub", "Cloning repository", "Scanning source files", "Extracting documentation", "Extracting commit history", "Building repository knowledge", and "Ready for questions". Animate transitions between the stages. Use real values returned by the backend whenever available and never invent repository statistics.

After successful processing, display a repository intelligence dashboard. The dashboard header should contain the repository icon, repository name, repository URL or public repository indicator, processing status, an "Open GitHub" button, and a "Change Repository" button. Display repository statistics using visually distinct cards for Files, Commits, and Knowledge Chunks. These values must come from the backend response and must never be fabricated.

Create a repository overview section containing the repository name, processing status, number of files, number of commits, number of chunks, and repository URL. Provide a visual representation of the repository structure whenever the necessary data is available.

Create an interactive file explorer with a developer-friendly tree structure. Example structure: repository → src → auth → login.py / jwt.py, src → payments, src → utils.py, tests, README.md, requirements.txt. The file tree should support expand and collapse, highlight the selected file, provide hover states, and remain ready for future integration with actual repository file data.

Create a Code Explorer inspired by VS Code. The code viewer should support file path, file name, programming language, syntax highlighting, line numbers, copy button, scrollable code, and selected-line highlighting. If the backend does not currently provide file content through an API, build the UI structure without fabricating repository content.

Create a dedicated "Repository Evolution" section showing commit history as a visual timeline. Each commit should be able to display commit message, author, date, commit hash, and changed files when available. Example commit timeline items can visually represent events such as "Add authentication system", "Refactor login service", and "Add database layer", but actual repository data must be used whenever available. Each commit should be clickable and capable of showing more details.

Create a "Contribution Insights" section displaying contributor information when available. Potential information includes contributor name, number of commits, files changed, and areas or modules touched. Use cards or visualizations where appropriate. If contributor aggregation is not currently available from the backend, show a meaningful placeholder state rather than fabricated numbers, such as "Contributor insights will appear when repository contribution data is available."

The AI chat is a core feature of the application and should become the central interaction point after repository processing. Use the heading "Ask Your Repository" and supporting text "Understand code, architecture, commits, and documentation." The interface should feel like a developer-focused AI assistant rather than a generic chatbot. Display suggested questions before the first user question, such as "Where is authentication implemented?", "Explain the project architecture.", "What changed in the latest commits?", "Which files handle database operations?", and "Who contributed to the authentication module?"

The chat interface should support user messages, assistant messages, Markdown, code blocks, file references, line ranges, source cards, loading states, typing indicators, and error states. The frontend should be prepared to display grounded AI answers once the RAG pipeline is integrated.

Assistant responses may contain source references such as "src/auth.py — Lines 42–87 — CODE". Source cards should be expandable and clickable. Future behavior should allow the user to select a source card, open the referenced file, and highlight the relevant lines.

The RAG implementation is handled separately by another team member. The frontend must NOT implement embeddings, vector databases, semantic retrieval, LLM inference, ChromaDB, Qdrant, or any RAG pipeline. The frontend should only consume the existing or future API response. An expected chat response is:

{
  "success": true,
  "answer": "Authentication is implemented in src/auth.py.",
  "sources": [
    {
      "file": "src/auth.py",
      "lines": "10-45",
      "type": "code"
    }
  ]
}

If RAG is not available yet, show a clear state such as "Repository intelligence is connecting..." or another professional status message. Do not display fake AI answers.

Add a repository search interface with a placeholder such as "Search files, symbols, commits...". The initial implementation should provide the UI and interaction structure and remain ready for future semantic search or RAG integration.

Add a keyboard-accessible command palette using Ctrl + K. Commands should include Ask Repository, Search Repository, Explore Files, View Commits, View Contributors, Repository Overview, and Change Repository. The command palette should have smooth transitions and a professional developer-tool appearance.

Use consistent global navigation. Possible navigation items are Overview, Code, Commits, Contributors, and Ask AI. The right side can contain Open GitHub and Change Repository actions. Navigation should adapt based on whether a repository has been processed.

Add a subtle developer-style status bar that can display information such as "● Repository Ready", "Branch: main", "Files: 42", and "Commits: 100". Only display values that are actually available.

Every asynchronous operation should have an appropriate loading state. Repository processing should use animated analysis stages. Chat requests should display a state such as "Assistant is analyzing the repository..." and dashboard loading should use skeleton components where appropriate.

Errors should be understandable and actionable. For an invalid repository URL, display "Please enter a valid GitHub repository URL." For an inaccessible repository, display "Repository could not be found or accessed. Please check the URL." For a repository that exceeds the supported processing limit, display "This repository exceeds the supported processing limit." For unavailable repository intelligence, display "Repository intelligence is currently unavailable. Please try again later." Do not expose unnecessary technical stack traces to users.

Avoid large empty areas. Every section without available data should have a meaningful empty state. For example, "No repository selected. Enter a GitHub repository URL to begin." or "No contributor data available yet."

Use subtle animations for button hover, card hover, page transitions, repository processing, file tree expansion, source expansion, chat typing indicators, command palette transitions, and smooth scrolling. Animations should remain professional and should not reduce performance.

The application must be fully responsive across desktop, laptop, tablet, and mobile. There must be no horizontal overflow. Navigation, dashboard cards, file explorer, chat interface, and code viewer should adapt appropriately to smaller screens.

The frontend must remain compatible with the existing backend APIs. The existing health endpoint is GET /health and returns {"status":"ok"}. Repository processing uses POST /api/process with the request:

{
  "repo_url": "https://github.com/owner/repository"
}

The response includes success, message, repo_name, repo_url, files_processed, commits_processed, and chunks_created. Chat uses POST /api/chat with the request:

{
  "question": "Where is authentication implemented?"
}

The response includes success, answer, and sources. Do not modify these API contracts.

Keep API communication separated from UI components using a frontend API/service layer. Use an environment variable for the backend base URL rather than hardcoding the backend URL throughout components.

Use a modular frontend architecture where practical. A possible structure is:

frontend/
├── src/
│   ├── components/
│   │   ├── Navbar
│   │   ├── Hero
│   │   ├── RepoInput
│   │   ├── AnalysisProgress
│   │   ├── RepoStats
│   │   ├── FileExplorer
│   │   ├── CodeViewer
│   │   ├── ChatPanel
│   │   ├── SourceCard
│   │   ├── CommitTimeline
│   │   ├── ContributorPanel
│   │   └── CommandPalette
│   ├── pages/
│   │   ├── Home
│   │   └── Repository
│   ├── services/
│   │   └── api
│   └── ...
├── public/
├── package.json
└── ...

This structure is a guideline. Inspect the existing frontend first and reuse existing components and architecture where practical instead of blindly restructuring or rewriting the project.

The frontend should avoid unnecessary dependencies, excessive animations, unnecessary API calls, and rendering huge repository datasets at once. Heavy components should be lazy-loaded when appropriate. The interface should remain smooth on normal laptops.

Never expose backend secrets or API keys in client-side code. Never commit .env files containing secrets. Use environment variables appropriately.

The complete demo experience should follow this sequence: open the landing page, enter a GitHub repository URL, click Analyze Repository, show repository analysis animation, display the Repository Dashboard, show real repository statistics, explore repository structure, view commits and repository evolution, open Ask Repository, ask a natural-language question, display the AI response when RAG is connected, display source references, and open the referenced file or code when supported.

The frontend should follow the principles of clarity, discoverability, consistency, feedback, trust, and developer-first design. Users should immediately understand what the product does. Important functionality should be easy to find. Buttons, cards, typography, spacing, and interactions should follow a consistent design system. Every user action should provide appropriate feedback. AI answers should eventually be connected to visible repository sources. The interface should feel familiar to developers through code viewers, file trees, commit timelines, repository statistics, and keyboard interactions.

The following are out of scope for the frontend implementation: user authentication, payment systems, OAuth, PostgreSQL, Redis, Celery, Kubernetes, microservices, VS Code extension, GitHub pull-request analysis, advanced repository permissions, RAG implementation, embedding generation, vector database implementation, and LLM implementation.

The frontend will be considered complete when the landing page is polished and responsive, GitHub repository input works, repository processing works with the existing backend, processing states are clearly displayed, repository statistics use real backend values, a repository dashboard is implemented, the file explorer UI is implemented, the code viewer UI is implemented, the commit timeline UI is implemented, the contributor section is implemented or has a proper empty state, the AI chat interface is polished, suggested questions work, source reference UI is implemented, loading states are implemented, error states are implemented, empty states are implemented, the command palette is implemented, the repository search UI is implemented, responsive design works, no horizontal overflow exists, no console errors remain, existing backend API integration continues to work, no backend files are modified, no RAG implementation is added, and no fake AI answers or fabricated repository data are added.

The final product should communicate that the repository is no longer just a maze of files but an explorable knowledge system. Users should be able to move naturally between Repository → Structure → Code → Commits → Contributors → Evolution → AI Questions → Grounded Sources. The final interface should feel like a professional AI-powered developer intelligence platform rather than a simple GitHub chatbot.