import React, { useState } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import { fetchChatCompletion } from "../../api/api";
import "./Chat.css";
import HeaderComponent from "../HeaderComponent";
import Spinner from "../Spinner";

const Chat = ({
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  knowledgeDataSet,
  chatLog,
  setChatLog,
  maxMessages,
  handleNext,
  loading,
}) => {
  const [message, setMessage] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);

  async function handleSubmit() {
    if (message.trim() === "") return;
    if (maxMessages && userMessageCount >= maxMessages) return;

    const userMessage = { id: Date.now(), role: "user", text: message };
    const updatedChatLog = [...chatLog, userMessage];
    setChatLog(updatedChatLog);

    const parsedMessage = parseInt(message, 10);
    const isValidRating = [1, 2, 3, 4, 5].includes(parsedMessage);

    // Use a local variable to track the new count
    let newCount = userMessageCount;
    if (maxMessages && isValidRating) {
      newCount = userMessageCount + 1;
      setUserMessageCount(newCount);
    }

    setMessage("");

    // Only stop fetching AI response if the valid message limit is reached.
    if (maxMessages && isValidRating && newCount >= maxMessages) {
      console.log("User has reached the message limit", newCount);
      return;
    }

    try {
      let currentText = "";
      const aiResponse = await fetchChatCompletion({
        chatLog: updatedChatLog,
        systemPrompt,
        useOpenRouter,
        selectedOpenRouterModel,
        knowledgeDataSet,
        onUpdate: (partial) => {
          currentText = partial;
          // Optionally update a temporary "streaming" message in your UI
          setChatLog((prevChatLog) => {
            const aiMessage = {
              id: "ai-stream",
              role: "ai",
              text: currentText,
            };
            // Remove previous streaming message (if exists) and add new one
            const newLog = prevChatLog.filter((msg) => msg.id !== "ai-stream");
            return [...newLog, aiMessage];
          });
        },
      });

      // Once complete, update with the final text
      setChatLog((prevChatLog) => [
        ...prevChatLog.filter((msg) => msg.id !== "ai-stream"),
        { id: Date.now(), role: "ai", text: aiResponse },
      ]);
    } catch {
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
      <HeaderComponent isLoggedIn={true} />
      <div className="chat-log">
        <ChatMessage chatLog={chatLog} />
      </div>
      <div className="bottom-section">
        {maxMessages && userMessageCount >= maxMessages ? (
          <button className="button next" onClick={handleNext}>
            {loading ? <Spinner /> : "Next"}
          </button>
        ) : (
          <div className="input-container">
            <textarea
              className="text-input"
              placeholder="Type something"
              onKeyDown={handleKeyPress}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div className="button send-message">Send</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Chat;
