import ChatPanel from "./ChatPanel";

export default function Chat({ repoData, onBack, initialQuestion, onOpenFile }) {
  return (
    <div className="chat-page-wrapper">
      <ChatPanel
        repoData={repoData}
        initialQuestion={initialQuestion}
        onOpenFile={onOpenFile}
        onBack={onBack}
      />
    </div>
  );
}