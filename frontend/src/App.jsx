import { useState, useEffect } from "react";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import CommandPalette from "./components/CommandPalette";

function App() {
  const [page, setPage] = useState("home");
  const [repoData, setRepoData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [prefilledQuestion, setPrefilledQuestion] = useState("");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("repointel-theme");
    return stored === "light" ? "light" : "dark";
  });

  // Apply theme to <html> data attribute whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("repointel-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleProcessSuccess = (data, question = "") => {
    setRepoData(data);
    setPrefilledQuestion(question);
    setActiveTab(question ? "chat" : "overview");
    setPage("dashboard");
  };

  const handleBackToHome = () => {
    setPage("home");
  };

  const handlePaletteAction = (actionId) => {
    if (actionId === "change-repo") {
      setPage("home");
    } else if (["overview", "code", "commits", "contributors", "chat"].includes(actionId)) {
      if (repoData) {
        setPage("dashboard");
        setActiveTab(actionId);
      } else {
        setPage("home");
      }
    }
  };

  return (
    <div className="app-root">
      {page === "home" ? (
        <Home
          onProcessSuccess={handleProcessSuccess}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Dashboard
          repoData={repoData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackToHome={handleBackToHome}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          prefilledQuestion={prefilledQuestion}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handlePaletteAction}
        repoData={repoData}
      />
    </div>
  );
}

export default App;