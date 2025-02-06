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

const fetchRatings = async (req, res) => {
  try {
    const participantId = req.user.id;

    const query = `
      SELECT summary
      FROM ratings
      WHERE participant_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [participantId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No ratings found for this user." });
    }

    res.status(200).json({ ratings: rows });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { saveRatingSummary, fetchRatings };
