const pool = require("../config/db");

const saveRatingSummary = async (req, res) => {
  const { summary } = req.body;
  const participantId = req.user.id; // Get ID from authenticated user

  if (!summary) {
    return res.status(400).json({ error: "Summary is required" });
  }

  try {
    await pool.query(
      "INSERT INTO ratings (participant_id, summary) VALUES ($1, $2)",
      [participantId, summary]
    );

    res.status(201).json({ message: "Rating summary saved successfully" });
  } catch (error) {
    console.error("Error saving rating summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { saveRatingSummary };
