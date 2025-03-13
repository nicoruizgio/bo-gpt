
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
        text: "Hallo! Mein Name ist Bo-GPT und ich bin hier, um Sie mit den neuesten Nachrichten über Bochum, Deutschland, zu versorgen. Welches Thema würden Sie gerne lesen?"
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
