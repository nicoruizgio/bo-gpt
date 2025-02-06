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
      // Generate rating summary using chat completion API.
      const ratingSummary = await fetchChatCompletion({
        chatLog,
        systemPrompt: config.ratingSummaryPrompt,
      });

      // Store the rating summary via the new module.
      await storeRatingSummary(ratingSummary);

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
