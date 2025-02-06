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
