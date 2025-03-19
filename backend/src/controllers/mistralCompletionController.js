import { Mistral } from '@mistralai/mistralai';
import "dotenv/config";

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const result = await client.chat.stream({
  model: "mistral-small-latest",
  messages: [{role: 'user', content: 'What is the best French cheese?'}],
});

for await (const chunk of result) {
  const streamText = chunk.data.choices[0].delta.content;
  process.stdout.write(streamText);
}

