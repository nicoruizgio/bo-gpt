import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RatingScreen.css";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_rating.json";
import { fetchChatCompletion } from "../../api/api";

const RatingScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  const navigate = useNavigate();

  const handleNext = async () => {
    try {
      const ratingSummary = await fetchChatCompletion({
        chatLog,
        systemPrompt: config.ratingSummaryPrompt,
        useOpenRouter: config.useOpenRouter,
        selectedOpenRouterModel: config.selectedOpenRouterModel,
      });
      console.log(ratingSummary);
      navigate("/recommender");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chat-screen">
      <Chat
        systemPrompt={config.systemPrompt}
        useOpenRouter={config.useOpenRouter}
        selectedOpenRouterModel={config.selectedOpenRouterModel}
        knowledgeDataSet={config.knowledgeDataSet}
        chatLog={chatLog}
        setChatLog={setChatLog}
        maxMessages={2}
        handleNext={handleNext}
      />
    </div>
  );
};

export default RatingScreen;
