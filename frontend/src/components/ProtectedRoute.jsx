import { Navigate, Outlet } from "react-router-dom";

// Function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Ensure it returns true if a token exists
};

const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/log-in" />;
};

export default ProtectedRoute;
