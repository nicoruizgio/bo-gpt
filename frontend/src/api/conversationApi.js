import { API_URL } from "./apiurl";

export async function createConversation({ conversationType }) {
  const response = await fetch(`${API_URL}/api/create-conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversationType }),
  });

  if (!response.ok) {
    throw new Error("Failed to create a new conversation");
  }
  return response.json();
}
