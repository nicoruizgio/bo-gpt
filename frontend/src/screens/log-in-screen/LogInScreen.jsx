import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogInScreen.css";

const LogInScreen = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credentials.username || !credentials.password) {
      setError("Both fields are required.");
      setLoading(false);
      return;
    }

    // Placeholder logic for login
    setTimeout(() => {
      if (credentials.username === "nico" && credentials.password === "123") {
        navigate("/introduction"); // Simulate successful login
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleCreateAccount = () => {
    navigate("/sign-up");
  };

  return (
    <>
      <header>
        <h1>BO-GPT</h1>
      </header>
      <div className="screen-container login">
        <h2>Log In</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <input
              type="text"
              className="input"
              placeholder="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <input
              type="password"
              className="input"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </label>
          <button className="button login" type="submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Log in"}
          </button>
        </form>

        <button
          className="button login signup"
          type="button"
          onClick={handleCreateAccount}
        >
          Create new account
        </button>
      </div>
    </>
  );
};

export default LogInScreen;
