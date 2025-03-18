import pool from "../config/db.js";
import { getOpenAIInstance } from "../config/openai.js";

import prompts from "../prompts/prompts.js";
const { get_user_preferences_prompt } = prompts;

import { get_encoding } from "tiktoken";

/* Save user rating summaru (user preferences) in DB */
const saveRatingSummary = async (req, res) => {
  const { chatLog } = req.body;
  const participantId = req.user.id;

  if (!chatLog || chatLog.length === 0) {
    return res.status(400).json({ error: "Chat log is required" });
  }

  try {
    const openai = getOpenAIInstance();

    const conversation = chatLog
      .map((msg) => `${msg.role === "ai" ? "assistant" : "user"}: ${msg.text}`)
      .join("\n");

    console.log("Conversation:", conversation);

    // Generate summary from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: get_user_preferences_prompt },
        { role: "user", content: conversation },
      ],
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

export default saveRatingSummary;
