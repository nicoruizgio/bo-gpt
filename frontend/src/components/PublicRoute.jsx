import { Navigate, Outlet } from "react-router-dom";

// Function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/introduction" /> : <Outlet />;
};

export default PublicRoute;
