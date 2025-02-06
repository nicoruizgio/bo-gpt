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
