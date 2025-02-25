/* eslint-disable react/prop-types */
import{  useState } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import { fetchChatCompletion } from "../../api/fetchCompletionApi";
import "./Chat.css";
import HeaderComponent from "../HeaderComponent";
import Spinner from "../Spinner";
import {createConversation} from "../../api/conversationApi";

const Chat = ({
  screenName,
  chatLog,
  setChatLog,
  maxMessages,
  handleNext,
  loading,
  conversationId,
  setConversationId
}) => {
  const [message, setMessage] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  async function handleSubmit() {
    if (message.trim() === "") return;
    if (maxMessages && userMessageCount >= maxMessages) return;

    if(!conversationId) {
      try {
        const conversation = await createConversation();
        setConversationId(conversation.id);
      } catch (error) {
      console.error("Error creating conversation", error);

      }}

    const userMessage = { id: Date.now(), role: "user", text: message };

    const updatedChatLog = [
      ...chatLog,
      userMessage,
      { id: "ai-stream", role: "ai", text: "" }
    ];
    setChatLog(updatedChatLog);


    const parsedMessage = parseInt(message, 10);

    const isValidRating = [1, 2, 3, 4, 5].includes(parsedMessage);


    let newCount = userMessageCount;
    if (maxMessages && isValidRating) {
      newCount = userMessageCount + 1;
      setUserMessageCount(newCount);
    }

    setMessage("");

    // Only stop fetching AI response if the valid message limit is reached.
    if (maxMessages && isValidRating && newCount >= maxMessages) {
      setIsFetching(false)

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
      <HeaderComponent isLoggedIn={true} screenName={screenName} setChatLog={setChatLog} setConversationId={setConversationId} />
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
