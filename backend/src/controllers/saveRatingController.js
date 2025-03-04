const pool = require("../config/db");
const { getOpenAIInstance } = require("../config/openai");
const { get_encoding } = require("tiktoken");

const saveRatingSummary = async (req, res) => {
  const { chatLog } = req.body;
  const participantId = req.user.id; // Get ID from authenticated user

  if (!chatLog || chatLog.length === 0) {
    return res.status(400).json({ error: "Chat log is required" });
  }

  try {
    const prompt = `
      Role:
You are an intelligent assistant specializing in information retrieval and recommendation systems. Your task is to generate a concise similarity search query based on a list of articles that a user has rated between 1 and 5.

Task:

You will receive a list of articles, each accompanied by a user rating from 1 to 5.
Your job is to generate a concise search query that retrieves articles similar to those rated 4 and 5.
The query should capture key themes, topics, and relevant metadata (e.g., keywords, concepts) of the highly-rated articles to ensure effective similarity-based search.
Requirements for the search query:

Focus on top-rated articles: Only consider articles rated 4 or 5 when generating the query.
Extract key topics: Identify the most important themes, keywords, or phrases from these articles.
Concise output: The query should be short but effective, optimizing relevance in a similarity-based search.
Generalizable format: The query should be suitable for vector-based search, keyword-based search, or hybrid retrieval methods.
Ignore low-rated content: Do not incorporate articles rated 3 or below in the query formulation.
Generate the query in English.
`;
    const openai = getOpenAIInstance();

    /*
    const conversation_history = [
      ...chatLog.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
    ];

    console.log("Conversation History:", conversation_history);
    */

    const conversation = chatLog
  .map(msg => `${msg.role === "ai" ? "assistant" : "user"}: ${msg.text}`)
  .join("\n");

    console.log('Conversation:', conversation);

    // Generate summary from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {role: 'system', content: prompt},
        {role: 'user', content: conversation}
      ]
    });


    const summaryText = response.choices[0]?.message?.content?.trim();
    if (!summaryText) {
      return res.status(500).json({ error: "Failed to generate summary" });
    }

    console.log("Generated Summary:", summaryText);

    // Check if the participant already has a rating
    const existingRating = await pool.query(
      "SELECT * FROM ratings WHERE participant_id = $1",
      [participantId]
    );

    if (existingRating.rows.length > 0) {
      // If a rating exists, update it
      await pool.query(
        "UPDATE ratings SET summary = $1 WHERE participant_id = $2",
        [summaryText, participantId]
      );
      return res.status(200).json({
        message: "Rating summary updated successfully",
        summary: summaryText,
      });
    } else {
      // If no rating exists, insert a new one
      await pool.query(
        "INSERT INTO ratings (participant_id, summary) VALUES ($1, $2)",
        [participantId, summaryText]
      );
      return res.status(201).json({
        message: "Rating summary saved successfully",
        summary: summaryText,
      });
    }
  } catch (error) {
    console.error("Error saving rating summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { saveRatingSummary };
