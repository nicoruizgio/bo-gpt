import React from "react";
import "./HeaderComponent.css";

const HeaderComponent = ({ isLoggedIn }) => {
  const username = localStorage.getItem("username");
  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };
  return (
    <header className="header-component">
      {isLoggedIn && (
        <div className="user-info">
          <div className="sing-out-container" onClick={handleSignOut}>
            <span class="material-symbols-outlined">logout</span>
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
