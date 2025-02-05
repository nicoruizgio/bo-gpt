const { getOpenAIInstance } = require("../config/openai");
const { encodingForModel, get_encoding } = require("tiktoken");

// Get completion from OpenAI API
const getCompletion = async (req, res) => {
  try {
    const {
      systemPrompt,
      chatLog,
      useOpenRouter,
      selectedOpenRouterModel,
      knowledgeDataSet,
    } = req.body;

    const model = useOpenRouter ? selectedOpenRouterModel : "gpt-4o";
    const dataset = knowledgeDataSet ? `\nDataset:\n${knowledgeDataSet}` : ""; // Include dataset if available

    const openai = getOpenAIInstance(useOpenRouter); // Get the appropriate OpenAI instance

    // Append dataset to the system prompt
    const updatedSystemPrompt = `
    ${systemPrompt}
    
    Dataset: 
    ${dataset}
    `;

    const conversation_history = [
      { role: "system", content: updatedSystemPrompt },
      ...chatLog.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
    ];

    const encoding = get_encoding("cl100k_base"); // Use the correct encoding for the model

    console.log("Conversation History:");
    console.log(conversation_history);

    // Concatenate all `content` fields into a single string
    const fullConversation = conversation_history
      .map((msg) => msg.content)
      .join("\n");

    // Encode the concatenated conversation
    const encodedConversation = encoding.encode(fullConversation);
    const tokens = encodedConversation.length; // Get the total token count

    console.log(`Total Tokens: ${tokens}\n`);

    // Free the encoding resource
    encoding.free();

    const response = await openai.chat.completions.create({
      model: model,
      messages: conversation_history,
      max_tokens: 5000,
    });

    res.status(200).json({ completion: response.choices[0].message.content });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCompletion };
