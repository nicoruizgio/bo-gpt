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
  saveMessage,
} = require("../helpers/openaiHelpers");

const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName, conversationId } = req.body;
    const userId = req.user.id;

    console.log("Screen Name:", JSON.stringify(screenName));
    console.log("CHAT LOG: ", chatLog)
    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let updatedSystemPrompt;

    if (screenName === "recommender_screen") {
      const userMsg = chatLog.filter((msg) => msg.role === 'user').pop();
      if (userMsg) {
        await saveMessage(conversationId, userMsg.role, userMsg.text);
        }
      const articleSqlQuery = `
        SELECT id, title, summary, link, published_unix
        FROM rss_embeddings
        ORDER BY embedding <-> $1 LIMIT 5;
      `;
      const userSqlQuery =
        "SELECT summary FROM ratings WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1";

      const { baseSystemPrompt } = await getParamsFromDb(screenName);
      const userMessage = chatLog.filter((msg) => msg.role === 'user').pop()?.text || null
      const userPreferences = await getUserPreferences(userSqlQuery, userId);
      const userMessageEmbedding = await generateEmbedding(userMessage);
      const userPreferencesEmbedding = await generateEmbedding(userPreferences);
      const userMessageArticles = await vectorSearch(
        userMessageEmbedding,
        articleSqlQuery
      );
      const userPreferencesArticles = await vectorSearch(
        userPreferencesEmbedding,
        articleSqlQuery
      );
      const context = `***Articles relevent for user query:*** \n ${userMessageArticles}\n\n ***Articles similar to user preferences***: \n${userPreferencesArticles}`;
      // console.log(context);
      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        context,
      });
       console.log(updatedSystemPrompt);
    }
    else if (screenName === "rating_screen") {
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

    //console.log(conversation_history)

    // Calculate and log token count
    const tokens = calculateTokenCount(conversation_history);
    console.log(`Total Tokens: ${tokens}`);

    // Setup streaming response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    let finalAiMessage = "";
    // Stream the response from OpenAI to the client
    await streamChatCompletion(conversation_history, res, {
      onUpdate: (partial) => {
        finalAiMessage += partial;
      }
    });
    console.log("Final AI message:", finalAiMessage);
    await saveMessage(conversationId, "ai", finalAiMessage);

  } catch (error) {
    console.error("Error in getCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { getCompletion };
