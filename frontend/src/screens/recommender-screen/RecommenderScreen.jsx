import React, { useState } from "react";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_recommender.json";

const RecommenderScreen = () => {
  const [chatLog, setChatLog] = useState([{id: 'ai-stream', role: "ai", text: "Hello! I'm here to provide you with the latest news about Bochum, Germany. How can I assist you today?"}]);
  return (
    <div className="chat-screen">
      <Chat
        chatLog={chatLog}
        setChatLog={setChatLog}
        screenName={"recommender_screen"}
      />
    </div>
  );
};

export default RecommenderScreen;
