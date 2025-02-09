import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RatingScreen.css";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_rating.json";
import { fetchChatCompletion } from "../../api/fetchCompletionApi";
import { storeRatingSummary } from "../../api/storeRatingsApi";

const RatingScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    setLoading(true);
    try {
      const response = await storeRatingSummary(chatLog);

      if (!response.ok) {
        throw new Error("Failed to save rating summary");
      }

      console.log("Rating summary saved successfully");
      navigate("/recommender");
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
        maxMessages={2}
        handleNext={handleNext}
        loading={loading}
      />
    </div>
  );
};

export default RatingScreen;
