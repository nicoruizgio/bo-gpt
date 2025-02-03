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
