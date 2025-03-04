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

/* Chat completion for rating and recommender screen */
const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName, conversationId } = req.body;
    const userId = req.user.id;

    console.log("CHAT LOG: ", chatLog)

    // Check if screen name and chat log exists
    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Define the variable that will store the updated system prompt (base promppt + time + retrieved articles)
    let updatedSystemPrompt;

    // Logic for recommender screen
    if (screenName === "recommender_screen") {

      // Query to retrieve the articles (only from the last 7 days)
      const articleSqlQuery = `
        SELECT id, title, summary, link, published_unix
        FROM rss_embeddings
        WHERE published_unix >= (EXTRACT(EPOCH FROM NOW()) - 86400 * 7)
        ORDER BY embedding <-> $1
        LIMIT 5;
      `;

      // Query to retrieve the user preferences from DB
      const userSqlQuery =
        "SELECT summary FROM ratings WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1";


      const { baseSystemPrompt } = await getParamsFromDb(screenName); // get the base system prompt from DB
      const userMessage = chatLog.filter((msg) => msg.role === 'user').pop()?.text || null // get the user message from the chat log
      const userPreferences = await getUserPreferences(userSqlQuery, userId); // get user preferences
      const userMessageEmbedding = await generateEmbedding(userMessage); // generate embeddings for the user message
      const userPreferencesEmbedding = await generateEmbedding(userPreferences); // generate embeddings for the user preferences. TODO: save the embeddings to not generate it everytime
      const userMessageArticles = await vectorSearch( // retrieve articles based on user message
        userMessageEmbedding,
        articleSqlQuery
      );
      const userPreferencesArticles = await vectorSearch( // retrieve articles based on user preferences
        userPreferencesEmbedding,
        articleSqlQuery
      );

      const context = `***Articles relevent for user query:*** \n ${userMessageArticles}\n\n ***Articles similar to user preferences***: \n${userPreferencesArticles}`; // Merge the retrieve articles

      // Update system prommpt (base prompt + context)
      updatedSystemPrompt = updatePrompt({
        screenName,
        baseSystemPrompt,
        context,
      });
       console.log(updatedSystemPrompt);
    }

    // Logic for rating screen
    else if (screenName === "rating_screen") {
      const { baseSystemPrompt, newsForRating } = await getParamsFromDb( // get base prompt and list of news articles to rate
        screenName
      );

      // update system prompt
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

    let finalAiMessage = "";
    // Stream the response from OpenAI to the client
    await streamChatCompletion(conversation_history, res, {
      onUpdate: (partial) => {
        finalAiMessage += partial;
      }
    });

    // Save response from AI into the DB
    await saveMessage(conversationId, "ai", finalAiMessage);

  } catch (error) {
    console.error("Error in getCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { getCompletion };
