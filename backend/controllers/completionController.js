const { getOpenAIInstance } = require("../config/openai");
const { get_encoding } = require("tiktoken");

// Get completion from OpenAI API
const getCompletion = async (req, res) => {
  try {
    // Set headers to encourage streaming and disable caching/buffering.
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // If available, flush headers immediately.
    if (res.flushHeaders) res.flushHeaders();

    const {
      systemPrompt,
      chatLog,
      useOpenRouter,
      selectedOpenRouterModel,
      knowledgeDataSet,
    } = req.body;

    if (!chatLog) {
      throw new Error("chatLog is undefined. Please provide a valid chatLog.");
    }

    const model = useOpenRouter ? selectedOpenRouterModel : "gpt-4o";
    const dataset = knowledgeDataSet ? `\nDataset:\n${knowledgeDataSet}` : "";
    const openai = getOpenAIInstance(useOpenRouter);

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

    const encoding = get_encoding("cl100k_base");

    console.log("Conversation History:");
    console.log(conversation_history);

    const fullConversation = conversation_history
      .map((msg) => msg.content)
      .join("\n");

    const encodedConversation = encoding.encode(fullConversation);
    const tokens = encodedConversation.length;
    console.log(`Total Tokens: ${tokens}\n`);

    encoding.free();

    // Request the streaming completion from OpenAI
    const responseStream = await openai.chat.completions.create({
      model,
      stream: true,
      messages: conversation_history,
      max_tokens: 5000,
    });

    // Process the response as an async iterable.
    for await (const chunk of responseStream) {
      // Check if the stream has finished.
      if (chunk.choices[0].finish_reason === "stop") {
        res.end();
        break;
      }
      // Extract text from the current chunk.
      const text = chunk.choices[0].delta?.content;
      if (text) {
        res.write(text);
        // Flush the chunk immediately if possible.
        if (res.flush) {
          res.flush();
        }
      }
    }
  } catch (error) {
    console.error("Error in getCompletion:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCompletion };
