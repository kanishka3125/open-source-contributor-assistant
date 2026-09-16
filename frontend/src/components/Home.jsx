import { useState } from "react";

function Home({ onProcess }) {
  const [repoUrl, setRepoUrl] = useState("");

  const handleProcess = () => {
    if (repoUrl.trim() === "") {
      alert("Please enter a GitHub repository URL");
      return;
    }

    onProcess(repoUrl);
  };

  return (
    <div className="home-container">

      <h1>RepoChat AI</h1>

      <p>Chat with any GitHub repository using AI</p>

      <input
        type="text"
        placeholder="Enter GitHub Repository URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />

      <button onClick={handleProcess}>
        Process Repository
      </button>

    </div>
  );
}

export default Home;