import React, { useState } from "react";
import "./RatingScreen.css";
import Chat from "../../components/chat/Chat";
import config from "../../config/config.json";

const RatingScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  const maxNumberOfMessages = 3;

  return (
    <div className="chat-screen">
      <Chat
        systemPrompt={config.systemPrompt}
        useOpenRouter={config.useOpenRouter}
        selectedOpenRouterModel={config.selectedOpenRouterModel}
        knowledgeDataSet={config.knowledgeDataSet}
        chatLog={chatLog}
        setChatLog={setChatLog}
        maxNumberOfMessages={maxNumberOfMessages}
      />
    </div>
  );
};

export default RatingScreen;
