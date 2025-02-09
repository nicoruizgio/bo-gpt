const { getOpenAIInstance } = require("../config/openai");
const { get_encoding } = require("tiktoken");
const pool = require("../config/db"); // PostgreSQL connection pool

const getCompletion = async (req, res) => {
  try {
    const { chatLog, screenName } = req.body;

    if (!screenName || !chatLog) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Fetch system prompt and news from the database
    const result = await pool.query(
      "SELECT system_prompt, news_for_rating FROM chat_contexts WHERE screen_name = $1",
      [screenName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Screen configuration not found" });
    }

    const { system_prompt, news_for_rating } = result.rows[0];

    const model = "gpt-4o";
    const openai = getOpenAIInstance();

    const updatedSystemPrompt = `${system_prompt}\n\nDataset:\n${
      news_for_rating || "No dataset available"
    }`;

    const conversation_history = [
      { role: "system", content: updatedSystemPrompt },
      ...chatLog.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
    ];

    const encoding = get_encoding("cl100k_base");
    const tokens = encoding.encode(
      conversation_history.map((msg) => msg.content).join("\n")
    ).length;
    encoding.free();

    console.log(`Total Tokens: ${tokens}`);

    // **🛑 Move headers setup here only if no errors happened so far**
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    // Request streaming completion from OpenAI
    const responseStream = await openai.chat.completions.create({
      model,
      stream: true,
      messages: conversation_history,
      max_tokens: 5000,
    });

    try {
      for await (const chunk of responseStream) {
        if (chunk.choices[0].finish_reason === "stop") {
          break;
        }
        const text = chunk.choices[0].delta?.content;
        if (text) {
          res.write(text);
          if (res.flush) res.flush();
        }
      }
    } catch (streamError) {
      console.error("Error during OpenAI stream:", streamError);
      // If an error occurs **during** streaming, terminate the response properly
      res.write("\n[Error occurred in AI response]");
    } finally {
      res.end(); // End the response **only once**
    }
  } catch (error) {
    console.error("Error in getCompletion:", error);
    // Ensure we do not attempt to send headers if they were already sent
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { getCompletion };
