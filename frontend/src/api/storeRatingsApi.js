export async function storeRatingSummary(summary) {
  const response = await fetch("http://localhost:5000/api/rating-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Ensure cookies are sent
    body: JSON.stringify({ summary }),
  });

  if (!response.ok) {
    throw new Error("Failed to save rating summary");
  }

  return response;
}
