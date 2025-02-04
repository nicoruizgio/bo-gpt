// API call to fetch chat completion from the server
export async function fetchChatCompletion({
  chatLog,
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  knowledgeDataSet,
}) {
  try {
    const response = await fetch("http://localhost:5000/api/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatLog,
        systemPrompt,
        useOpenRouter,
        selectedOpenRouterModel,
        knowledgeDataSet,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from server");
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}

// API call to generate configuration file from the server
export async function handleDownloadConfig(config) {
  try {
    const response = await fetch("http://localhost:5000/api/generate-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error("Failed to generate config file");
    }

    // Create a Blob from the response
    const blob = await response.blob();

    // Create a temporary link to download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chatbot-config.json"; // Filename
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading config:", error);
  }
}

const API_BASE_URL = "http://localhost:5000/api"; // Adjust based on your environment

export const registerUser = async (username, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to register user.");
    }

    // Store token & user info in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("participantId", data.participantId);

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log("Raw response:", response); // Debugging step

    // **Ensure response is not empty before calling .json()**
    const textResponse = await response.text();
    console.log("Raw response text:", textResponse); // Debugging step

    if (!textResponse) {
      throw new Error("Empty response from server.");
    }

    const data = JSON.parse(textResponse);
    console.log("Parsed response data:", data); // Debugging step

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    // Store token & user info in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("participantId", data.participantId);

    return data;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};
