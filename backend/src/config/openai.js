require("dotenv").config();
const { OpenAI } = require("openai");


const getOpenAIInstance = (useOpenRouter) => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  });
};


module.exports = { getOpenAIInstance};
