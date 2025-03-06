import "./ChatMessage.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Spinner from "../../spinner/Spinner";

const ChatMessage = ({ chatLog, isFetching }) => {
  return (
    <>
      {chatLog.map((message) => (
        <div key={message.id} className={`chat-item ${message.role}`}>
          {message.role === "ai" && (
            <span className="material-symbols-outlined ai-avatar">
              smart_toy
            </span>
          )}
          <div className="chat-item-message-content">
            {message.id === "ai-stream" && message.text.trim() === "" ? (
              isFetching && <Spinner />
            ) : message.role === "ai" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer">
                      {props.children}
                    </a>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatMessage;
