import { API_URL } from "./apiurl";

console.log("Using API_URL:", API_URL);

export const resetPassword = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const textResponse = await response.text();

    if (!textResponse) {
      throw new Error("Empty response from server.");
    }

    const data = JSON.parse(textResponse);

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }
    return data;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};
