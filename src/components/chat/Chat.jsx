import React, { useState } from "react";
import ChatMessage from "../chat-message/ChatMessage";
import { fetchChatCompletion } from "../../api/api";
import "./Chat.css";

const Chat = ({
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  knowledgeDataSet,
  chatLog,
  setChatLog,
}) => {
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (message.trim() === "") return;

    // Adding user message to chat log
    const userMessage = { id: Date.now(), role: "user", text: message };
    const updatedChatLog = [...chatLog, userMessage];
    setChatLog(updatedChatLog);

    // Clear the input field
    setMessage("");

    // Fetching AI response
    try {
      const aiResponse = await fetchChatCompletion({
        chatLog: updatedChatLog,
        systemPrompt,
        useOpenRouter,
        selectedOpenRouterModel,
        knowledgeDataSet,
      });

      // Adding AI response to chat log
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { id: Date.now(), role: "ai", text: aiResponse },
      ]);
    } catch {
      // Adding fallback error message
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          id: Date.now(),
          role: "ai",
          text: "Sorry, I am not able to process your request at the moment.",
        },
      ]);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="chat-area">
      <header>
        <h1>BO-GPT</h1>
      </header>
      <div className="chat-log">
        <ChatMessage chatLog={chatLog} />
      </div>
      <div className="bottom-section">
        <div className="input-container">
          <textarea
            className="text-input"
            placeholder="Type something"
            onKeyDown={handleKeyPress}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <span className="material-symbols-outlined" onClick={handleSubmit}>
            send
          </span>
        </div>
      </div>
    </section>
  );
};

export default Chat;
