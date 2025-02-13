const pool = require("../config/db");
const {
  getParamsFromDb,
  getUserPreferences,
  generateEmbedding,
  vectorSearch,
  updatePrompt,
  createConversationHistory,
  calculateTokenCount,
  streamChatCompletion,
} = require("../helpers/openaiHelpers");

const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName } = req.body;
    const userId = req.user.id;

    console.log("Screen Name:", JSON.stringify(screenName));
    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let updatedSystemPrompt;

    if (screenName === "recommender_screen") {
      const articleSqlQuery = `
        SELECT id, title, summary, link, published_unix
        FROM rss_embeddings
        ORDER BY embedding <-> $1 LIMIT 10;
      `;
      const userSqlQuery =
        "SELECT summary FROM ratings WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1";

      // Destructure to get the base system prompt
      const { baseSystemPrompt } = await getParamsFromDb(screenName);

      // Get the latest user message
      const userMessage = chatLog[chatLog.length - 1].text;

      // Fetch user preferences (returns the summary string)
      const userPreferences = await getUserPreferences(userSqlQuery, userId);

      // Generate embeddings for both the user message and user preferences
      console.log("User Message:", userMessage);
      console.log("User Preferences:", userPreferences);
      const userMessageEmbedding = await generateEmbedding(userMessage);
      const userPreferencesEmbedding = await generateEmbedding(userPreferences);

      // Perform vector searches based on the embeddings
      const userMessageArticles = await vectorSearch(
        userMessageEmbedding,
        articleSqlQuery
      );
      const userPreferencesArticles = await vectorSearch(
        userPreferencesEmbedding,
        articleSqlQuery
      );

      // Create the context by combining the results
      const context = `${userMessageArticles}\n\n${userPreferencesArticles}`;
      console.log("Context:", context);

      // Update the system prompt
      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        context,
      });
    } else if (screenName === "rating_screen") {
      // Destructure to get both baseSystemPrompt and newsForRating from the database
      const { baseSystemPrompt, newsForRating } = await getParamsFromDb(
        screenName
      );

      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        newsForRating: newsForRating,
      });
    }

    // Build the conversation history with the updated system prompt
    const conversation_history = createConversationHistory(
      chatLog,
      updatedSystemPrompt
    );

    // Calculate and log token count
    const tokens = calculateTokenCount(conversation_history);
    console.log(`Total Tokens: ${tokens}`);

    // Setup streaming response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    // Stream the response from OpenAI to the client
    await streamChatCompletion(conversation_history, res);
  } catch (error) {
    console.error("Error in getCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { getCompletion };
