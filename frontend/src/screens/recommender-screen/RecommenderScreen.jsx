import React, { useState } from "react";
import Chat from "../../components/chat/Chat";
import config from "../../config/config_recommender.json";

const RecommenderScreen = () => {
  const [chatLog, setChatLog] = useState([]);
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
