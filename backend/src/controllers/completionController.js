import pool from "../config/db.js";

import {
  getUserPreferences,
  generateEmbedding,
  vectorSearch,
  createConversationHistory,
  doRAG,
  calculateTokenCount,
  streamChatCompletion,
  saveMessage,
} from "../helpers/completionHelpers.js";

import prompts from "../prompts/prompts.js";

const { rating_screen_prompt } = prompts;

import { getOpenAIInstance } from "../config/openai.js";

/* Chat completion for rating and recommender screen */
const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName, conversationId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let systemPrompt; // Holds the modified system prompt

    // Recommender Screen Logic
    if (screenName === "recommender_screen") {
      systemPrompt = await doRAG(
        chatLog,
        userId,
        "simpleRAG",
         true
      );
    }

    // Rating Screen Logic
    else if (screenName === "rating_screen") {
      systemPrompt = rating_screen_prompt;
    }

    // Construct conversation history
    const conversation_history = createConversationHistory(
      chatLog,
      systemPrompt
    );

    // Calculate and log token count
    const tokens = calculateTokenCount(conversation_history);
    console.log(`Total Tokens: ${tokens}`);

    // Setup streaming response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    let finalAiMessage = "";

    // Stream AI response
    await streamChatCompletion(conversation_history, res, {
      onUpdate: (partial) => {
        finalAiMessage += partial;
      },
    });

    // Save AI response in database
    await saveMessage(conversationId, "ai", finalAiMessage);
  } catch (error) {
    console.error("Error in getCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default getCompletion;
