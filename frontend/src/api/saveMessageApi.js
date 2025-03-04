import { API_URL } from "./apiurl";

export const saveMessage = async (conversationId, role, text) => {
  try {
    const response = await fetch(`${API_URL}/api/save-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ conversationId, role, text}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save message");
    }
    return await response.json();
  } catch (error) {
    console.error("Error saving message", error);
    throw error;
  }
};