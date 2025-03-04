import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RatingScreen.css";
import Chat from "../../components/chat/Chat";
import { storeRatingSummary } from "../../api/storeRatingsApi";
import { usePersistedState } from "../../hooks/usePersistedState";

const RatingScreen = () => {
  const [chatLog, setChatLog] = useState([{id: 'ai-stream', role: "ai", text: "Hi, I'm Bo-GPT and I'll be presenting 36 news articles for you to rate from 1 to 5. Are you ready?"}]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = usePersistedState("ratingConversationId", null)
  const navigate = useNavigate();

  // Reset conversation Id every time the screen mounts
  useEffect(() => {
    localStorage.removeItem("conversationId");
    setConversationId(null);
  }, [])

  const handleNext = async () => {
    localStorage.removeItem("conversationId");
    setConversationId(null);
    setLoading(true);
    try {
      const response = await storeRatingSummary(chatLog);

      if (!response.ok) {
        throw new Error("Failed to save rating summary");
      }

      console.log("Rating summary saved successfully");
      navigate("/instruction");
    } catch (error) {
      console.error("Error in handleNext:", error);
      alert("Failed to save rating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-screen">
      <Chat
        screenName={"rating_screen"}
        chatLog={chatLog}
        setChatLog={setChatLog}
        maxMessages={5}
        handleNext={handleNext}
        loading={loading}
        conversationId={conversationId}
        setConversationId={setConversationId}
      />
    </div>
  );
};

export default RatingScreen;
