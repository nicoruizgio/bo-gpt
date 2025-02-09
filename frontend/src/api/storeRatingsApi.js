import { API_URL } from "./apiurl";

export async function storeRatingSummary(chatLog) {
  const response = await fetch(`${API_URL}/api/rating-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Ensure cookies are sent
    body: JSON.stringify({ chatLog }),
  });

  if (!response.ok) {
    throw new Error("Failed to save rating summary");
  }

  return response;
}
