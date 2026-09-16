import { useState } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = {
      sender: "user",
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="chat-container">

      <h1>RepoChat AI</h1>

      <div className="messages-container">

        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "user"
                ? "user-message"
                : "assistant-message"
            }
          >
            {message.text}
          </div>
        ))}

      </div>

      <div className="chat-input-area">

        <input
          type="text"
          placeholder="Ask something about the repository..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}

export default Chat;