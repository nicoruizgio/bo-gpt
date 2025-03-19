import { ChatOpenAI } from "@langchain/openai";
import { ChatMistralAI } from "@langchain/mistralai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { get_encoding } from "tiktoken";
import prompts from "../prompts/prompts.js";
import { getOpenAIInstance } from "../config/openai.js";
import pool from "../config/db.js";

const {
  recommender_screen_multiquery_prompt,
  recommender_screen_simple_prompt,
  query_transformation_prompt,
  rating_screen_prompt,
} = prompts;

function getCurrentTimestamp() {
  return Date.now();
}

// Unified function to create a chat model instance based on the provider.
function getChatModel(provider) {
  if (provider === "openai") {
    return new ChatOpenAI({
      model: "gpt-4o",
      temperature:  0,
      streaming: true,
    });
  } else if (provider === "mistral") {
    // ChatMistral should implement the same interface as ChatOpenAI.
    return new ChatMistralAI({
      model: "mistral-large-latest", // Adjust to your Mistral model identifier
      temperature:  0,
      streaming: true,
    });
  }
  throw new Error(`Unknown provider: ${provider}`);
}

// Transform the user's query using the selected provider
async function transformQuery(userMessage, provider = "openai") {
  try {
    const model = getChatModel(provider);
    const transformed = await model.call([
      new SystemMessage(`${query_transformation_prompt} ${userMessage}`),
      new HumanMessage(userMessage),
    ]);
    // Return the content of the AIMessage response.
    return transformed.content;
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

// Build conversation history using LangChain message classes.
function createConversationHistory(chatLog, updatedSystemPrompt) {
  const history = [];
  history.push(new SystemMessage(updatedSystemPrompt));
  // Filter out any trailing assistant messages so the last message is from the user.
  const filteredLog = chatLog.filter((msg, index) => {
    // If it's the last message and its role is assistant, remove it.
    if (index === chatLog.length - 1 && msg.role === "ai") {
      return false;
    }
    return true;
  });
  filteredLog.forEach((msg) => {
    if (msg.role === "user") {
      history.push(new HumanMessage(msg.text));
    } else if (msg.role === "ai") {
      history.push(new AIMessage(msg.text));
    }
  });
  // Optionally, if you need to prompt the model, you could append a new empty user message.
  history.push(new HumanMessage(""));
  return history;
}

async function doRAG(chatLog, userId, ragType, queryTransformation, provider = "openai") {
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
  const userMessage =
    chatLog.filter((msg) => msg.role === "user").pop()?.text || null;
  console.log("\n \n", "USER MESSAGE: ", userMessage);

  const userPreferences = await getUserPreferences(userSqlQuery, userId);
  const transformedQuery =
    queryTransformation === true && userMessage
      ? await transformQuery(userMessage, provider)
      : null;
  console.log("TRANSFORMED QUERY: ", transformedQuery);

  const finalQuery = transformedQuery || userMessage;
  const userMessageEmbedding = finalQuery
    ? await generateEmbedding(finalQuery)
    : null;
  const userMessageArticles = userMessageEmbedding
    ? await vectorSearch(userMessageEmbedding, articleSqlQuery)
    : "";

  let systemPrompt = "";
  let context = "";

  if (ragType === "multiqueryRAG") {
    const userPreferencesEmbedding = userPreferences
      ? await generateEmbedding(userPreferences)
      : null;
    const userPreferencesArticles = userPreferencesEmbedding
      ? await vectorSearch(userPreferencesEmbedding, articleSqlQuery)
      : "";
    context = `
    ***Articles Relevant for User Message:***
    ${userMessageArticles}

    ***Articles Relevant for User Preferences:***
    ${userPreferencesArticles}`;
    systemPrompt = `
    ${recommender_screen_multiquery_prompt}
    ${context}`;
  } else if (ragType === "simpleRAG") {
    context = `
    *** Today's date: ${getCurrentTimestamp()} ***
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
  console.log(`RAG TYPE: ${ragType === "multiqueryRAG" ? "MULTIQUERY" : "SIMPLE"}`);
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

// Stream chat completion using the unified message format.
async function streamChatCompletion(conversation_history, res, { onUpdate } = {}, provider) {
  const model = getChatModel(provider);
  try {
    const stream = await model.stream(conversation_history);
    for await (const chunk of stream) {
      const text = chunk.content;
      if (text) {
        res.write(text);
        if (onUpdate) onUpdate(text);
        if (res.flush) res.flush();
      }
    }
  } catch (error) {
    console.error("Error during streaming:", error);
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
    VALUES ($1, $2, $3)
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

