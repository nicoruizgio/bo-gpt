import  { useState } from "react";
import Chat from "../../components/chat/Chat";

const RecommenderScreen = () => {
  const [chatLog, setChatLog] = useState([{id: 'ai-stream', role: "ai", text: "Hello! I'm here to provide you with the latest news about Bochum, Germany. How can I assist you today?"}]);
  const [conversationId, setConversationId] = useState(null);

  return (
    <div className="chat-screen">
      <Chat
        chatLog={chatLog}
        setChatLog={setChatLog}
        screenName={"recommender_screen"}
        conversationId={conversationId}
        setConversationId={setConversationId}
      />
    </div>
  );
};

export default RecommenderScreen;
