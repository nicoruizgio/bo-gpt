import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../api/authenticationApi";

const ProtectedRoute = () => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {

    const checkAuth = async () => {
      const status = await isAuthenticated();
      setAuthenticated(status);
    };

    checkAuth();
  }, []);

  if (authenticated === null) {
    return <div>Loading...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/log-in" />;
};

export default ProtectedRoute;
