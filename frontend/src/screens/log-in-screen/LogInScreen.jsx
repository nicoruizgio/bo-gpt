import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api";
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

    try {
      const data = await loginUser(credentials.username, credentials.password); // Capture the returned data

      // Store token & user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("participantId", data.participantId);

      navigate("/introduction"); // Redirect after successful login
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
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
          onClick={() => navigate("/sign-up")}
        >
          Create New Account
        </button>
      </div>
    </>
  );
};

export default LogInScreen;
