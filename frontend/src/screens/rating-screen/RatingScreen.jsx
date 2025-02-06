import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RatingScreen.css";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_rating.json";
import { fetchChatCompletion } from "../../api/fetchCompletionApi";
import Spinner from "../../components/Spinner";

const RatingScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    setLoading(true);
    try {
      const ratingSummary = await fetchChatCompletion({
        chatLog,
        systemPrompt: config.ratingSummaryPrompt,
      });

      // Store rating summary in PostgreSQL (NO need to send participantId)
      const response = await fetch("http://localhost:5000/api/rating-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({ summary: ratingSummary }), // No participantId needed
      });

      if (!response.ok) {
        console.error("Failed to save rating summary");
        return;
      }

      navigate("/recommender");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="chat-screen">
      <Chat
        systemPrompt={config.systemPrompt}
        newsForRating={config.newsForRating}
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
