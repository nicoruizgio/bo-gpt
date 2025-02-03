const pool = require("../config/db");

// Create a new participant and return the ID
const createParticipant = async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO participants DEFAULT VALUES RETURNING id"
    );
    res.status(201).json({ participantId: result.rows[0].id });
  } catch (error) {
    console.error("Error creating participant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createParticipant };
