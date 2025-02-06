import React from "react";
import "./ChatMessage.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Supports GitHub-flavored Markdown (tables, links)
import rehypeRaw from "rehype-raw"; // Allows rendering raw HTML

const ChatMessage = ({ chatLog }) => {
  return (
    <>
      {chatLog.map((message) => (
        <div key={message.id} className={`chat-item ${message.role}`}>
          {message.role === "ai" && ( // If role is AI, then display AI avatar
            <span className="material-symbols-outlined ai-avatar">
              smart_toy
            </span>
          )}
          <div className="chat-item-message-content">
            {message.role === "ai" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
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
