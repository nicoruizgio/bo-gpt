import { config } from "dotenv";
config({ path: require("path").resolve(__dirname, "../../.env") });

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("❌ MISTRAL_API_KEY is missing! Check your .env file.");
}

// Set the key in process.env explicitly before the import
process.env.MISTRAL_API_KEY = process.env.MISTRAL_API_KEY.trim();

async function getMistralResponse() {
  const { Mistral } = await import("@mistralai/mistralai");

  const apiKey = process.env.MISTRAL_API_KEY;
  console.log("DEBUG: Passing API Key to Mistral:", apiKey);

  const client = new Mistral({ apiKey });

  const mistralResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: "What is the best French cheese?" }],
  });

  console.log("Chat:", mistralResponse.choices[0].message.content);
  return mistralResponse;
}

getMistralResponse();
