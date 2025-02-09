import { API_URL } from "./apiurl";

export async function fetchChatCompletion({
  chatLog,
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  newsForRating,
  onUpdate, // Callback function to update UI in real-time
}) {
  try {
    const response = await fetch(`${API_URL}/api/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatLog,
        systemPrompt,
        newsForRating,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from server");
    }

    // Stream processing logic
    const reader = response.body
      .pipeThrough(new TextDecoderStream()) // Convert binary to text
      .getReader();

    let completion = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      console.log("Received: ", value);

      completion += value; // Accumulate received data

      if (onUpdate) {
        onUpdate(completion); // Update UI in real-time
      }
    }

    return completion; // Return final completion string
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}
