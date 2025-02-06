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

    localStorage.setItem("username", data.username);

    return data;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};
