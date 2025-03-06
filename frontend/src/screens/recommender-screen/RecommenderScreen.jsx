
import { useEffect } from "react";
import Chat from "../../components/chat/Chat";
import { usePersistedState } from "../../hooks/usePersistedState";

const RecommenderScreen = () => {
  const [chatLog, setChatLog] = usePersistedState(
    "recommenderChatLog",
    [
      {
        id: "ai-stream",
        role: "ai",
        text: "Hello! I'm here to provide you with the latest news about Bochum, Germany. How can I assist you today?"
      }
    ],
    true
  );
  const [conversationId, setConversationId] = usePersistedState(
    "recommenderConversationId",
    null,
    true
  );


  useEffect(() => {
    return () => {
      sessionStorage.removeItem("recommenderChatLog");
      sessionStorage.removeItem("recommenderConversationId");
    };
  }, []);

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
