import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../api/api";

const PublicRoute = () => {
  const [authenticated, setAuthenticated] = useState(null); // Start with null (to handle loading state)

  useEffect(() => {
    // Check if the user is authenticated when the component mounts
    const checkAuth = async () => {
      const status = await isAuthenticated(); // Call the async function
      setAuthenticated(status); // Update the state
    };

    checkAuth();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // Show loading state or redirect based on authentication
  if (authenticated === null) {
    return <div>Loading...</div>; // Or show a spinner, depending on your preference
  }

  return authenticated ? <Navigate to="/introduction" /> : <Outlet />;
};

export default PublicRoute;
