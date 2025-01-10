import React, { useState } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import { fetchChatCompletion } from "../../api/api";
import "./Chat.css";

const Chat = ({
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  knowledgeDataSet,
  chatLog,
  setChatLog,
  maxNumberOfMessages,
}) => {
  const [message, setMessage] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);

  async function handleSubmit() {
    if (message.trim() === "" || userMessageCount >= maxNumberOfMessages)
      return;

    // Adding user message to chat log
    const userMessage = { id: Date.now(), role: "user", text: message };
    const updatedChatLog = [...chatLog, userMessage];
    setChatLog(updatedChatLog);

    // Increment user message count
    if ([1, 2, 3, 4, 5].includes(parseInt(message, 10))) {
      setUserMessageCount((prevCount) => prevCount + 1);
    }

    // Clear the input field
    setMessage("");

    // **Stop fetching AI response if the user has reached the limit**
    if (userMessageCount + 1 >= maxNumberOfMessages) return;

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
        {userMessageCount >= maxNumberOfMessages ? (
          <button className="button next">Next</button>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default Chat;
