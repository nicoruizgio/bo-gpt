import React, { useState } from "react";
import "./ChatScreen.css";
import Chat from "../components/chat/Chat";
import config from "../config/config.json";

const ChatScreen = () => {
  const [chatLog, setChatLog] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] =
    useState("GPT-4o");
  const [knowledgeDataSet, setKnowledgeDataSet] = useState("");

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

export default ChatScreen;
