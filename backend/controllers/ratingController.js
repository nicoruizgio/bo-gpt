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
    const summaryPrompt =
      'Summarize the ratings provided so far without asking additional questions. Do not continue the conversation or ask for more ratings. Use the following format for each article:\n\nArtikel: [Title of the article]\nLabel: [Category/Label of the article]\nContent: [Short summary/content of the article]\nBewertung: [Numerical rating and corresponding description]\n\nRespect the rating scale as follows:\n\n1 = überhaupt nicht\n2 = nicht sehr interessiert\n3 = einigermaßen interessiert\n4 = sehr interessiert\n5 = äußerst interessiert\n\nExample Entry:\nArtikel: Belegschaftsversammlung bei Thyssenkrupp: "Die Leute haben geweint"\nLabel: Politik / Wirtschaft (REGIONAL)\nContent: Auf einer Belegschaftsversammlung bei Thyssenkrupp Steel in Bochum wurde es laut. Die Stahlarbeiter sind sauer und enttäuscht.\nBewertung: 4 also sehr interessiert\n\nEnsure all ratings across the conversation are included in this format.';

    const openai = getOpenAIInstance();

    const conversation_history = [
      { role: "system", content: summaryPrompt },
      ...chatLog.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
    ];

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
