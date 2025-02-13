const { getOpenAIInstance } = require("../config/openai");
const { get_encoding } = require("tiktoken");
const pool = require("../config/db");

async function getParamsFromDb(screenName) {
  const result = await pool.query(
    "SELECT system_prompt, news_for_rating FROM chat_contexts WHERE screen_name = $1",
    [screenName]
  );

  if (result.rows.length === 0) {
    throw new Error("Screen configuration not found");
  }

  const baseSystemPrompt = result.rows[0].system_prompt;
  if (screenName === "rating_screen") {
    const newsForRating = result.rows[0].news_for_rating;
    return { baseSystemPrompt, newsForRating };
  }
  return { baseSystemPrompt };
}

async function getUserPreferences(sqlQuery, userId) {
  const result = await pool.query(sqlQuery, [userId]);
  if (result.rows.length > 0) {
    return result.rows[0].summary;
  } else {
    console.error("User preferences not found.");
    return "No preferences available.";
  }
}

async function generateEmbedding(text) {
  const openai = getOpenAIInstance();
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  const response = embeddingResponse.data[0].embedding;
  return `[${response.join(",")}]`;
}

async function vectorSearch(embedding, sqlQuery) {
  const articlesQuery = await pool.query(sqlQuery, [embedding]);
  let retrievedArticles;
  if (articlesQuery.rows.length > 0) {
    retrievedArticles = articlesQuery.rows
      .map((article) => {
        return `Title: ${article.title}\nContent: ${article.summary}\nLink: ${article.link}\nDate: ${article.published_unix}`;
      })
      .join("\n\n");
  } else {
    retrievedArticles = "No relevant articles found.";
  }
  return retrievedArticles;
}

function updatePrompt({
  baseSystemPrompt,
  context,
  screenName,
  newsForRating,
}) {
  if (screenName === "recommender_screen") {
    return `${baseSystemPrompt}\n\nSelected Articles:\n${context}`;
  } else if (screenName === "rating_screen") {
    return `${baseSystemPrompt}\n\nNews for Rating: ${newsForRating}`;
  }
  return baseSystemPrompt;
}

function createConversationHistory(chatLog, updatedSystemPrompt) {
  return [
    { role: "system", content: updatedSystemPrompt },
    ...chatLog
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      })),
  ];
}

function calculateTokenCount(conversation_history) {
  const encoding = get_encoding("cl100k_base");
  const tokens = encoding.encode(
    conversation_history.map((msg) => msg.content).join("\n")
  ).length;
  encoding.free();
  return tokens;
}

async function streamChatCompletion(conversation_history, res) {
  const openai = getOpenAIInstance();
  const responseStream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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
    res.write("\n[Error occurred in AI response]");
  } finally {
    res.end();
  }
}

module.exports = {
  getParamsFromDb,
  getUserPreferences,
  generateEmbedding,
  vectorSearch,
  updatePrompt,
  createConversationHistory,
  calculateTokenCount,
  streamChatCompletion,
};
