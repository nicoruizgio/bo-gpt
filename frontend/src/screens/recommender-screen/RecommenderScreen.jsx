import React, { useState } from "react";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_recommender.json";

const RecommenderScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  return (
    <div className="chat-screen">
      <Chat
        systemPrompt={config.systemPrompt}
        useOpenRouter={config.useOpenRouter}
        selectedOpenRouterModel={config.selectedOpenRouterModel}
        knowledgeDataSet={config.knowledgeDataSet}
        chatLog={chatLog}
        setChatLog={setChatLog}
      />
    </div>
  );
};

export default RecommenderScreen;
