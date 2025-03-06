const { pool, jasminTable } = require("../config/db");
const {
  getParamsFromDb,
  getUserPreferences,
  generateEmbedding,
  vectorSearch,
  updatePrompt,
  createConversationHistory,
  calculateTokenCount,
  streamChatCompletion,
  saveMessage,
} = require("../helpers/completionHelpers");

/* Chat completion for rating and recommender screen */
const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName, conversationId } = req.body;
    const userId = req.user.id;

    console.log("CHAT LOG: ", chatLog);

    // Validate input
    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let updatedSystemPrompt; // Holds the modified system prompt

    // Recommender Screen Logic
    if (screenName === "recommender_screen") {
      const articleSqlQuery = `
        SELECT id, title, summary, link, published_unix
        FROM rss_embeddings
        WHERE published_unix >= (EXTRACT(EPOCH FROM NOW()) - 86400 * 7)
        ORDER BY embedding <-> $1
        LIMIT 5;
      `;

      const userSqlQuery = `
        SELECT summary
        FROM ratings
        WHERE participant_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
      `;

      // Fetch base system prompt
      const { baseSystemPrompt } = await getParamsFromDb(screenName, jasminTable);

      // Get the latest user message from chat log
      const userMessage = chatLog.filter(msg => msg.role === "user").pop()?.text || null;
      const userPreferences = await getUserPreferences(userSqlQuery, userId);

      // Generate embeddings only if data exists
      const userMessageEmbedding = userMessage ? await generateEmbedding(userMessage) : null;
      const userPreferencesEmbedding = userPreferences ? await generateEmbedding(userPreferences) : null;

      // Retrieve relevant articles
      const userMessageArticles = userMessageEmbedding ? await vectorSearch(userMessageEmbedding, articleSqlQuery) : "";
      const userPreferencesArticles = userPreferencesEmbedding ? await vectorSearch(userPreferencesEmbedding, articleSqlQuery) : "";

      // Merge retrieved articles into context
      const context = `
        ***Articles relevant to user query:***
        ${userMessageArticles}

        ***Articles similar to user preferences:***
        ${userPreferencesArticles}
      `;

      // Update system prompt with context
      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        context,
      });

      console.log(updatedSystemPrompt);
    }

    // Rating Screen Logic
    else if (screenName === "rating_screen") {
      const { baseSystemPrompt, newsForRating } = await getParamsFromDb(screenName);

      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        newsForRating,
      });
    }

    // Construct conversation history
    const conversation_history = createConversationHistory(chatLog, updatedSystemPrompt);

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

module.exports = { getCompletion };
