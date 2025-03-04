const { saveMessage } = require("../helpers/openaiHelpers")

/* Insert new message record in DB*/
const saveMessageController = async (req, res) => {
  try {
    const { conversationId, role, text} = req.body;
    if (!conversationId || !role || !text ) {
      return res.status(400).json( { error: "Missing required parameters"})
    }
    await saveMessage(conversationId, role, text);
    return res.status(200).json({ message: "Message saved successfully"});
  } catch (error) {
    console.error("Error saving message", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

module.exports = { saveMessageController};
