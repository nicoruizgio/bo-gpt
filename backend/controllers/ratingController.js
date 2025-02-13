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
    const summaryPrompt = `
      'Generate a list of articles that have been rated only with a 4 or 5. Do not include articles rated below 4. Do not continue the conversation or ask for additional ratings. Present the results using the exact format below:
Format:
Artikel: [Title of the article]
Label: [Category/Label of the article]
Content: [Short summary/content of the article]
Bewertung: [Numerical rating and corresponding description]
Example Entry:
Artikel: Belegschaftsversammlung bei Thyssenkrupp: "Die Leute haben geweint"
Label: Politik / Wirtschaft (REGIONAL)
Content: Auf einer Belegschaftsversammlung bei Thyssenkrupp Steel in Bochum wurde es laut. Die Stahlarbeiter sind sauer und enttäuscht.
IMPORTANT: Ensure that every article rated 4 or 5 across the conversation is included in this format. If the user has rated 16 articles, all 16 must be listed.
`;
    const openai = getOpenAIInstance();

    const conversation_history = [
      { role: "system", content: summaryPrompt },
      ...chatLog.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
    ];

    console.log("Conversation History:", conversation_history);

    // Token limit check
    const encoding = get_encoding("cl100k_base");
    const tokens = encoding.encode(
      conversation_history.map((msg) => msg.content).join("\n")
    ).length;
    encoding.free();

    console.log(`Total Tokens: ${tokens}`);

    // 🆕 Generate summary from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation_history,
      max_tokens: 500,
    });

    const summaryText = response.choices[0]?.message?.content?.trim();
    if (!summaryText) {
      return res.status(500).json({ error: "Failed to generate summary" });
    }

    console.log("Generated Summary:", summaryText);

    // 🆕 Check if the participant already has a rating
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
