import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/api";
import "./HeaderComponent.css";

const HeaderComponent = ({ isLoggedIn }) => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Call the logout function from the API file
      await logoutUser();

      // Clear user data from localStorage
      localStorage.clear();

      // Redirect the user to the login page after signing out
      navigate("/log-in");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <header className="header-component">
      {isLoggedIn && (
        <div className="user-info">
          <div className="sing-out-container" onClick={handleSignOut}>
            <span className="material-symbols-outlined">logout</span>
            <p className="signout-button">Sign out</p>
          </div>

          <p>|</p>
          <div className="username-container">
            <span className="material-symbols-outlined user">person</span>
            <p className="username">{username}</p>
          </div>
        </div>
      )}

      <h2 className="header-title">Bo-GPT</h2>
    </header>
  );
};

export default HeaderComponent;
