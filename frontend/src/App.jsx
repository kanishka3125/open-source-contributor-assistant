import { useState } from "react";
import Home from "./components/Home";
import Chat from "./components/Chat";

function App() {
  const [page, setPage] = useState("home");
  const [repoUrl, setRepoUrl] = useState("");

  const handleProcessRepository = (url) => {
    setRepoUrl(url);
    setPage("chat");
  };

  return (
    <>
      {page === "home" ? (
        <Home onProcess={handleProcessRepository} />
      ) : (
        <Chat />
      )}
    </>
  );
}

export default App;