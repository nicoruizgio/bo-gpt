import pool from "../config/db.js";

/* Insert new conversation record in DB */
const createConversation = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { conversationType } = req.body;

    // Validate the conversationTYpe
    if (!["rating", "recommender"].includes(conversationType)) {
      return res.status(400).json({ error: "invalid conversation type" });
    }
    const query = `
      INSERT INTO conversations (participant_id, conversation_type)
      VALUES ($1, $2)
      RETURNING id
    `;

    const values = [userId, conversationType];

    const result = await pool.query(query, values);
    res.status(201).json({ id: result.rows[0].id }); // return the conversation id to reference it in the fronted.
  } catch (error) {
    console.error("Error creating conversation", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export default createConversation;
