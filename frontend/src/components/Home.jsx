import { useState } from "react";
import Hero from "./Hero";
import RepoInput from "./RepoInput";
import AnalysisProgress from "./AnalysisProgress";
import HowItWorks from "./HowItWorks";
import ExampleQuestions from "./ExampleQuestions";
import Navbar from "./Navbar";
import { processRepository } from "../services/api";

export default function Home({ onProcessSuccess, onOpenCommandPalette, theme, onToggleTheme }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingResult, setProcessingResult] = useState(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState("");

  const handleProcess = async () => {
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a GitHub repository URL");
      return;
    }

    if (!trimmed.toLowerCase().includes("github.com/")) {
      setErrorMessage("Please enter a valid GitHub repository URL.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setIsAnalysisComplete(false);
    setProcessingResult(null);

    try {
      const result = await processRepository(trimmed);
      setProcessingResult(result);
      setIsAnalysisComplete(true);

      // Give a brief moment for the user to see the completed "Ready for questions" animation
      setTimeout(() => {
        onProcessSuccess(result, activeQuestion);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setIsAnalysisComplete(false);
      setErrorMessage(err.message || "Failed to process repository.");
    }
  };

  const handleSelectQuestion = (question) => {
    setActiveQuestion(question);
    if (!repoUrl) {
      setRepoUrl("https://github.com/octocat/Hello-World");
    }
    const inputEl = document.querySelector(".repo-text-input");
    if (inputEl) {
      inputEl.focus();
    }
    setErrorMessage(`Sample query queued: "${question}". Click Analyze Repository to begin.`);
  };

  return (
    <div className="landing-layout">
      {/* Top Navigation */}
      <Navbar
        onBackToHome={() => {}}
        onOpenCommandPalette={onOpenCommandPalette}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="landing-main-content">
        {/* Hero Section */}
        <Hero />

        {/* Input or Live Processing Card */}
        <div className="landing-action-container">
          {isLoading ? (
            <AnalysisProgress
              repoUrl={repoUrl}
              isComplete={isAnalysisComplete}
              realStats={processingResult}
            />
          ) : (
            <RepoInput
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              onSubmit={handleProcess}
              isLoading={isLoading}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
        </div>

        {/* How It Works Pipeline */}
        <HowItWorks />

        {/* Ask Your Codebase Anything */}
        <ExampleQuestions onSelectQuestion={handleSelectQuestion} />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <p className="footer-credit">
            RepoIntel — Open Source Contributor Assistant • AI Developer Intelligence Platform
          </p>
          <div className="footer-links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
            <span className="footer-separator">•</span>
            <span className="footer-version">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}