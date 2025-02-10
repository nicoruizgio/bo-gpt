const { getOpenAIInstance } = require("../config/openai");
const { get_encoding } = require("tiktoken");
const pool = require("../config/db"); // PostgreSQL connection pool

const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName } = req.body;
    console.log("Screen Name:", JSON.stringify(screenName));

    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log("🔹 User Request:", req.user); // Debug user authentication

    // Fetch system prompt from the database
    const result = await pool.query(
      "SELECT system_prompt, news_for_rating FROM chat_contexts WHERE screen_name = $1",
      [screenName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Screen configuration not found" });
    }

    // Save the base system prompt separately so we can rebuild the prompt on each request
    const baseSystemPrompt = result.rows[0].system_prompt;
    let updatedSystemPrompt = baseSystemPrompt;
    let retrievedArticles = "";
    let userPreferences = "No preferences available.";

    // 🟢 **RAG Mode: News Recommendations**
    if (screenName === "recommender_screen") {
      // Get the latest user message
      const userMessage = chatLog[chatLog.length - 1]?.text || "";

      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        // console.error("❌ User authentication failed! No user ID found.");
        return res.status(403).json({ error: "User not authenticated" });
      }

      // Fetch user preference summary
      const userPrefQuery = await pool.query(
        "SELECT summary FROM ratings WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );

      if (userPrefQuery.rows.length > 0) {
        userPreferences = userPrefQuery.rows[0].summary;
      } else {
        // console.error("❌ No user preferences found for User ID:", req.user.id);
      }

      // Generate embedding for query (user preferences + latest user message)
      const openai = getOpenAIInstance();
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: ` ${userMessage}`,
      });

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Convert the embedding array into the required string format (with square brackets)
      const embeddingStr = `[${queryEmbedding.join(",")}]`;

      // Perform vector search for relevant news articles using the proper vector literal
      const articlesQuery = await pool.query(
        `SELECT id, title, text, sender, link, created_date FROM news_articles_flexible 
         ORDER BY embedding <-> $1 LIMIT 5;`,
        [embeddingStr]
      );

      console.log("🔹 Retrieved Articles Count:", articlesQuery.rows.length);

      if (articlesQuery.rows.length > 0) {
        retrievedArticles = articlesQuery.rows
          .map((article) => {
            console.log(
              `Title: ${article.title}\nContent: ${article.text} \nSender: ${article.sender}\nLink: ${article.link}\nDate: ${article.created_date}`
            );
            return `Title: ${article.title}\nContent: ${article.text} \nSender: ${article.sender}\nLink: ${article.link}\nDate: ${article.created_date}`;
          })
          .join("\n\n");
      } else {
        retrievedArticles = "No relevant articles found.";
      }

      updatedSystemPrompt = `${baseSystemPrompt}\n\nUser Preferences: ${userPreferences}\n\nRelevant Articles:\n${retrievedArticles}`;
    }

    if (screenName === "rating_screen") {
      updatedSystemPrompt = `${baseSystemPrompt}\n\n News for Rating: ${result.rows[0].news_for_rating}`;
    }

    const conversation_history = [
      { role: "system", content: updatedSystemPrompt },
      ...chatLog
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role === "ai" ? "assistant" : "user",
          content: msg.text,
        })),
    ];

    // Token Calculation
    const encoding = get_encoding("cl100k_base");
    const tokens = encoding.encode(
      conversation_history.map((msg) => msg.content).join("\n")
    ).length;
    encoding.free();

    console.log(`🔹 Total Tokens: ${tokens}`);

    // Setup response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    // 🟢 **Request streaming completion from OpenAI**
    const responseStream = await getOpenAIInstance().chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: conversation_history,
      max_tokens: 5000,
    });

    try {
      for await (const chunk of responseStream) {
        if (chunk.choices[0].finish_reason === "stop") {
          break;
        }
        const text = chunk.choices[0].delta?.content;
        if (text) {
          res.write(text);
          if (res.flush) res.flush();
        }
      }
    } catch (streamError) {
      console.error("❌ Error during OpenAI stream:", streamError);
      res.write("\n[Error occurred in AI response]");
    } finally {
      res.end();
    }
  } catch (error) {
    console.error("❌ Error in getCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { getCompletion };
