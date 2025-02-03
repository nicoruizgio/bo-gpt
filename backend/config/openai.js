require("dotenv").config();
const { OpenAI } = require("openai");

const getOpenAIInstance = (useOpenRouter) => {
  return new OpenAI({
    apiKey: useOpenRouter
      ? process.env.OPENROUTER_API_KEY
      : process.env.OPENAI_API_KEY,
    baseURL: useOpenRouter
      ? "https://openrouter.ai/api/v1"
      : "https://api.openai.com/v1",
  });
};

// Export the function to dynamically create the OpenAI instance
module.exports = { getOpenAIInstance };
