// API call to fetch chat completion from the server
// API call to fetch chat completion from the server with streaming
export async function fetchChatCompletion({
  chatLog,
  systemPrompt,
  useOpenRouter,
  selectedOpenRouterModel,
  knowledgeDataSet,
  onUpdate, // Callback function to update UI in real-time
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

export const registerUser = async (username, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to register user.");
    }

    // Store token & user info in localStorage
    localStorage.setItem("username", data.username);

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
      credentials: "include",
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

// Function to check if user is authenticated based on server response
export const isAuthenticated = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/check-auth", {
      method: "GET",
      credentials: "include", // Make sure cookies are sent
    });

    if (response.status === 401) {
      return false; // Token is missing or invalid, user is not authenticated
    }

    const data = await response.json();
    return data.authenticated; // Return true or false based on the response
  } catch (error) {
    console.error("Auth check error:", error);
    return false; // Handle fetch or network errors gracefully
  }
};

// API call to log out user (clear token cookie)
export const logoutUser = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    // If successful, return a message (optional)
    return { message: "Logged out successfully" };
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};
