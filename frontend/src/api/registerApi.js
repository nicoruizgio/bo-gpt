import { API_URL } from "./apiurl";

export const registerUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to register user.");
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
