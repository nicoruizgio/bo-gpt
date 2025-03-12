const {pool} = require("../config/db")

/* Insert new conversation record in DB */
const createConversation = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({error: "Not authenticated"});
    }

    const query = `
      INSERT INTO conversations (participant_id)
      VALUES ($1)
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    res.status(201).json({id: result.rows[0].id}); // return the conversation id to reference it in the fronted.
  } catch (error) {
    console.error("Error creating conversation", error);
    res.status(500).json({error: "internal server error"})
  }
};

module.exports = { createConversation}