import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../api/authenticationApi";

const PublicRoute = () => {
  const [authenticated, setAuthenticated] = useState(null);
  useEffect(() => {
    // Check if the user is authenticated when the component mounts
    const checkAuth = async () => {
      const status = await isAuthenticated();
      setAuthenticated(status);
    };

    checkAuth();
  }, []);

  // show loading state or redirect
  if (authenticated === null) {
    return <div>Loading...</div>;
  }

  return authenticated ? <Navigate to="/questionnaire" /> : <Outlet />;
};

export default PublicRoute;
