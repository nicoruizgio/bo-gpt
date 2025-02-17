/* eslint-disable react/prop-types */
import{  useState } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import { fetchChatCompletion } from "../../api/fetchCompletionApi";
import "./Chat.css";
import HeaderComponent from "../HeaderComponent";
import Spinner from "../Spinner";

const Chat = ({
  screenName,
  chatLog,
  setChatLog,
  maxMessages,
  handleNext,
  loading,
}) => {
  const [message, setMessage] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  async function handleSubmit() {
    if (message.trim() === "") return;
    if (maxMessages && userMessageCount >= maxMessages) return;

    const userMessage = { id: Date.now(), role: "user", text: message };
    // Add both the user message and the AI placeholder to the chat log
    const updatedChatLog = [
      ...chatLog,
      userMessage,
      { id: "ai-stream", role: "ai", text: "" }
    ];
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
      setIsFetching(true);
      setIsDisabled(true);
      let currentText = "";
      const aiResponse = await fetchChatCompletion({
        chatLog: updatedChatLog,
        screenName,
        onUpdate: (partial) => {
          currentText = partial;
          // Update only the streaming AI placeholder message:
          setChatLog((prevChatLog) => {
            const newLog = prevChatLog.filter((msg) => msg.id !== "ai-stream");
            return [
              ...newLog,
              { id: "ai-stream", role: "ai", text: currentText }
            ];
          });
        },
      });
      setIsFetching(false);
      setIsDisabled(false);
      // Replace the streaming placeholder with the final AI message
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
      <HeaderComponent isLoggedIn={true} screenName={screenName} />
      <div className="chat-log">
        <ChatMessage chatLog={chatLog} isFetching={isFetching} />
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
              disabled={isDisabled}
            ></textarea>
            <div className={isDisabled ? "button send-message disabled":"button send-message"} disabled={isDisabled} onClick={handleSubmit}>Send</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Chat;
