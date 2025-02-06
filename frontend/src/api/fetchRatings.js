export async function fetchUserRating() {
  const response = await fetch(
    "http://localhost:5000/api/ratings/get-ratings",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensure cookies are sent with the request
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user ratings");
  }

  const summary = await response.json();
  return summary;
}
