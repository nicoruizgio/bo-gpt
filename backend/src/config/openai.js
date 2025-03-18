import { OpenAI } from "openai";
import "dotenv/config";

export function getOpenAIInstance(useOpenRouter) {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  });
}
