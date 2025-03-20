import { ChatOpenAI } from "@langchain/openai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { get_encoding } from "tiktoken";
import prompts from "../prompts/prompts.js";
import { getOpenAIInstance } from "../config/openai.js";
import pool from "../config/db.js";

const {
  recommender_screen_multiquery_prompt,
  recommender_screen_simple_prompt,
  recommender_screen_mistral_prompt,
  query_transformation_prompt,
} = prompts;

function getCurrentTimestamp() {
  return Date.now();
}

function getChatModel(provider) {
  if (provider === "openai") {
    console.log("PROVIDER: OPEN AI ");
    return new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      streaming: true,
    });
  } else if (provider === "mistral") {
    console.log("PROVIDER: MISTRAL");
    return new ChatMistralAI({
      model: "mistral-large-latest", // Change here mistral model
      temperature: 0,
      maxTokens: 5000,
      streaming: true,
    });
  }
  throw new Error(`Unknown provider: ${provider}`);
}

async function transformQuery(userMessage, provider = "openai") {
  try {
    const model = getChatModel(provider);
    const transformed = await model.call([
      new SystemMessage(`${query_transformation_prompt} ${userMessage}`),
      new HumanMessage(userMessage),
    ]);

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

async function getRecentArticles(days) {
  const query = `
    SELECT title, link, summary, published_unix
    FROM rss_embeddings
    WHERE published_unix >= EXTRACT(EPOCH FROM NOW()) - (86400 * $1)
    ORDER BY published_unix DESC;
  `;

  try {
    const result = await pool.query(query, [days]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching recent articles:", error);
    throw error;
  }
}

function createConversationHistory(chatLog, updatedSystemPrompt) {
  const history = [];
  history.push(new SystemMessage(updatedSystemPrompt));
  // filter out any trailing assistant messages so the last message is from the user.
  const filteredLog = chatLog.filter((msg, index) => {
    // if it's the last message and its role is assistant, remove it.
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
  history.push(new HumanMessage(""));
  return history;
}

async function doRAG(
  chatLog,
  userId,
  ragType,
  queryTransformation,
  provider = "openai"
) {
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

  if (provider === "mistral") {
    const articles = await getRecentArticles(1);
    const formattedArticles = articles
      .map(
        (article) =>
          `**${article.title}**\n${article.summary}\n[Link](${
            article.link
          })\nDatum: ${new Date(
            article.published_unix * 1000
          ).toLocaleDateString("de-DE")}`
      )
      .join("\n\n");

    // Here we defined the context that will be embedded to Mistral by merging the user preferences, todays' date and the List of Articles
    context = `
    ***User Preferences***
    ${userPreferences}

    *** Today's date: ${getCurrentTimestamp()} ***

    ***List of Articles:***
    ${formattedArticles}
    `;

    //Then we merged the Mistral system prompt and the context to define a final system prompt
    systemPrompt = `
    ${recommender_screen_mistral_prompt}
    ${context}
    `;
  } else {
    if (ragType === "multiqueryRAG") {
      const userPreferencesEmbedding = userPreferences
        ? await generateEmbedding(userPreferences)
        : null;
      const userPreferencesArticles = userPreferencesEmbedding
        ? await vectorSearch(userPreferencesEmbedding, articleSqlQuery)
        : "";
      context = `
      *** Today's date: ${getCurrentTimestamp()} ***
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
    console.log(
      `RAG TYPE: ${ragType === "multiqueryRAG" ? "MULTIQUERY" : "SIMPLE"}`
    );
  }
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
async function streamChatCompletion(
  conversation_history,
  res,
  { onUpdate } = {},
  provider
) {
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
