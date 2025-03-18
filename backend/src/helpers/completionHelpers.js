import { getOpenAIInstance } from "../config/openai.js";
import { get_encoding } from "tiktoken";
import prompts from "../prompts/prompts.js";

const {
  recommender_screen_multiquery_prompt,
  recommender_screen_simple_prompt,
  query_transformation_prompt,
} = prompts;
import pool from "../config/db.js";

function getCurrentTimestamp() {
  return Date.now();
}

// Function to transform the user's query using OpenAI
async function transformQuery(userMessage) {
  try {
    const openai = getOpenAIInstance();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ` ${query_transformation_prompt} ${userMessage}`,
        },
        { role: "user", content: userMessage },
      ],
    });

    return response?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error during query transformation: ", error);
    return null;
  }
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

async function doRAG(chatLog, userId, ragType, queryTransformation) {
  // SQL queries for retrieving articles and user preferences
  const articleSqlQuery = `
    SELECT id, title, summary, link, published_unix
    FROM rss_embeddings
    WHERE published_unix >= (EXTRACT(EPOCH FROM NOW()) - 86400 * 7)
    ORDER BY embedding <-> $1
    LIMIT 5;
  `;

  const userSqlQuery = `
    SELECT summary
    FROM ratings
    WHERE participant_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  // Get the latest user message from chat log
  const userMessage =
    chatLog.filter((msg) => msg.role === "user").pop()?.text || null;

  console.log("\n \n", "USER MESSAGE: ", userMessage);

  // Retrieve user preferences from the database
  const userPreferences = await getUserPreferences(userSqlQuery, userId);

  // Transform the query if needed
  const transformedQuery =
    queryTransformation === true && userMessage
      ? await transformQuery(userMessage)
      : null;

  console.log("TRANSFORMED QUERY: ", transformedQuery);

  // Determine the final query to use for embeddings
  const finalQuery = transformedQuery || userMessage;

  // Generate embedding and retrieve articles based on the latest user message
  const userMessageEmbedding = finalQuery
    ? await generateEmbedding(finalQuery)
    : null;
  const userMessageArticles = userMessageEmbedding
    ? await vectorSearch(userMessageEmbedding, articleSqlQuery)
    : "";

  let systemPrompt = "";
  let context = "";

  if (ragType === "multiqueryRAG") {
    // Generate embedding and retrieve articles based on user preferences
    const userPreferencesEmbedding = userPreferences
      ? await generateEmbedding(userPreferences)
      : null;
    const userPreferencesArticles = userPreferencesEmbedding
      ? await vectorSearch(userPreferencesEmbedding, articleSqlQuery)
      : "";

    // Create a combined context for multiquery RAG
    context = `
    ***Articles Relevant for User Message:***
    ${userMessageArticles}

    ***Articles Relevant for User Preferences:***
    ${userPreferencesArticles}`;

    systemPrompt = `
    ${recommender_screen_multiquery_prompt}
    ${context}`;
  } else if (ragType === "simpleRAG") {
    // Create a simpler context only based on the user query
    context = `
    *** Todays date: ${getCurrentTimestamp()} ***
    ***Retrieved Articles:***
    ${userMessageArticles}
    `;

    systemPrompt = `
    ${recommender_screen_simple_prompt}
    ${context}

    ***User Preferences***
    ${userPreferences}
    `;
  } else {
    console.error(`Unknown RAG type: ${ragType}`);
    throw new Error(`Unsupported ragType: ${ragType}`);
  }

  console.log(
    `RAG TYPE: ${ragType === "multiqueryRAG" ? "MULTIQUERY" : "SIMPLE"}`
  );
  console.log(systemPrompt);

  return systemPrompt;
}

function calculateTokenCount(conversation_history) {
  const encoding = get_encoding("cl100k_base");
  const tokens = encoding.encode(
    conversation_history.map((msg) => msg.content).join("\n")
  ).length;
  encoding.free();
  return tokens;
}

async function streamChatCompletion(
  conversation_history,
  res,
  { onUpdate } = {}
) {
  const openai = getOpenAIInstance();
  const responseStream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: conversation_history,
  });

  try {
    for await (const chunk of responseStream) {
      if (chunk.choices[0].finish_reason === "stop") {
        break;
      }
      const text = chunk.choices[0].delta?.content;
      if (text) {
        res.write(text);
        if (onUpdate) onUpdate(text);
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

async function saveMessage(conversationId, role, message) {
  if (!conversationId) {
    throw new Error("CONVERSATION ID is required");
  }
  const query = `
    INSERT INTO messages (conversation_id, role, message)
    VALUES ($1,$2,$3)
    RETURNING id;
  `;
  const result = await pool.query(query, [conversationId, role, message]);
  return result.rows[0].id;
}

export {
  getUserPreferences,
  generateEmbedding,
  vectorSearch,
  createConversationHistory,
  doRAG,
  calculateTokenCount,
  streamChatCompletion,
  saveMessage,
};
