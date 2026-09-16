import { useState } from "react";
import Navbar from "./Navbar";
import OverviewTab from "./OverviewTab";
import FileExplorer from "./FileExplorer";
import CodeViewer from "./CodeViewer";
import CommitTimeline from "./CommitTimeline";
import ContributorPanel from "./ContributorPanel";
import ChatPanel from "./ChatPanel";
import StatusBar from "./StatusBar";

export default function Dashboard({
  repoData,
  activeTab,
  setActiveTab,
  onBackToHome,
  onOpenCommandPalette,
  prefilledQuestion,
  theme,
  onToggleTheme,
}) {
  // Representative file tree structure adhering to repository patterns
  const initialTree = [
    {
      name: "src",
      path: "src",
      type: "folder",
      children: [
        {
          name: "auth",
          path: "src/auth",
          type: "folder",
          children: [
            {
              name: "jwt.py",
              path: "src/auth/jwt.py",
              type: "file",
              lang: "Python",
              content: `"""
Authentication & JWT Session Handler
Provides secure token issuance, payload signature validation,
and middleware enforcement.
"""

import time
import hmac
import hashlib

SECRET_KEY = "os-assistant-session-secret"

def create_access_token(subject: str, expires_in: int = 3600) -> str:
    """Issue signed token for authenticated repository session."""
    payload = {
        "sub": subject,
        "exp": int(time.time()) + expires_in,
        "iss": "repo-intel"
    }
    return f"bearer_{subject}_{payload['exp']}"

def verify_access_token(token: str) -> bool:
    """Validate token lifetime and cryptographic signature."""
    if not token or not token.startswith("bearer_"):
        return False
    parts = token.split("_")
    return len(parts) >= 3 and int(parts[2]) > int(time.time())
`,
            },
            {
              name: "login.py",
              path: "src/auth/login.py",
              type: "file",
              lang: "Python",
              content: `"""
Login Router & User Authentication Endpoints
"""

from .jwt import create_access_token

def handle_login(credentials: dict) -> dict:
    username = credentials.get("username")
    password = credentials.get("password")
    
    if username and password:
        token = create_access_token(username)
        return {"status": "authenticated", "token": token}
    return {"status": "failed", "error": "Invalid credentials"}
`,
            },
          ],
        },
        {
          name: "services",
          path: "src/services",
          type: "folder",
          children: [
            {
              name: "chunker.py",
              path: "src/services/chunker.py",
              type: "file",
              lang: "Python",
              content: `"""
AST Code Chunker & Semantic Splitter
Breaks down large source files into semantically coherent code blocks.
"""

def chunk_file(file_path: str, max_chunk_tokens: int = 500) -> list[dict]:
    """Parse AST nodes and generate chunk boundaries."""
    chunks = []
    # Reads source and groups functions and classes
    return chunks
`,
            },
            {
              name: "git_service.py",
              path: "src/services/git_service.py",
              type: "file",
              lang: "Python",
              content: `"""
Git Service — Clone, inspect commit log, and validate repository limits.
"""

import subprocess
import os

def clone_repository(repo_url: str, target_dir: str):
    """Safely clone shallow copy for fast analysis."""
    cmd = ["git", "clone", "--depth", "100", repo_url, target_dir]
    return subprocess.run(cmd, check=True)
`,
            },
          ],
        },
        {
          name: "utils.py",
          path: "src/utils.py",
          type: "file",
          lang: "Python",
          content: `"""
Shared Utility Functions
"""

def sanitize_path(path: str) -> str:
    return path.strip().replace("\\\\", "/")
`,
        },
      ],
    },
    {
      name: "tests",
      path: "tests",
      type: "folder",
      children: [
        {
          name: "test_auth.py",
          path: "tests/test_auth.py",
          type: "file",
          lang: "Python",
          content: `def test_token_issuance():
    assert True
`,
        },
      ],
    },
    {
      name: "README.md",
      path: "README.md",
      type: "file",
      lang: "Markdown",
      content: `# ${repoData?.repo_name || "Repository"}

An intelligent open-source codebase indexed with RepoIntel.

## Features
- Natural language repository intelligence
- AST code chunking
- Commit evolution tracking
`,
    },
    {
      name: "requirements.txt",
      path: "requirements.txt",
      type: "file",
      lang: "Config",
      content: `fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0
GitPython>=3.1.42
`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState(initialTree[0].children[0].children[0]);
  const [highlightLines, setHighlightLines] = useState(null);

  const handleOpenFileFromSource = (fileRef) => {
    // Switch to Code tab
    setActiveTab("code");
    setHighlightLines(fileRef.lines || null);

    // Find in tree or build representation
    let found = null;
    const searchTree = (nodes) => {
      for (const n of nodes) {
        if (n.type === "file" && (n.path === fileRef.path || n.name === fileRef.name)) {
          found = n;
          return;
        }
        if (n.children) searchTree(n.children);
      }
    };
    searchTree(initialTree);

    if (found) {
      setSelectedFile(found);
    } else {
      setSelectedFile({
        name: fileRef.name || fileRef.path.split("/").pop(),
        path: fileRef.path,
        lang: "Code",
      });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Global Header */}
      <Navbar
        repoData={repoData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToHome={onBackToHome}
        onOpenCommandPalette={onOpenCommandPalette}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Workspace Area */}
      <main className="dashboard-main-content">
        {activeTab === "overview" && (
          <OverviewTab repoData={repoData} onNavigateTab={setActiveTab} />
        )}

        {activeTab === "code" && (
          <div className="code-split-view">
            <FileExplorer
              treeData={initialTree}
              selectedFile={selectedFile}
              onSelectFile={(f) => {
                setSelectedFile(f);
                setHighlightLines(null);
              }}
              repoName={repoData?.repo_name || "repository"}
            />
            <CodeViewer
              file={selectedFile}
              repoUrl={repoData?.repo_url}
              highlightLines={highlightLines}
            />
          </div>
        )}

        {activeTab === "commits" && (
          <CommitTimeline repoData={repoData} />
        )}

        {activeTab === "contributors" && (
          <ContributorPanel repoData={repoData} />
        )}

        {activeTab === "chat" && (
          <ChatPanel
            repoData={repoData}
            initialQuestion={prefilledQuestion}
            onOpenFile={handleOpenFileFromSource}
          />
        )}
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        repoData={repoData}
        onOpenCommandPalette={onOpenCommandPalette}
      />
    </div>
  );
}
