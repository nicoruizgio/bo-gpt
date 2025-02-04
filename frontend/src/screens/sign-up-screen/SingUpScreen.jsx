import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpScreen.css";

const SignUpScreen = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (
      !credentials.username ||
      !credentials.password ||
      !credentials.confirmPassword
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (credentials.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (credentials.password !== credentials.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Simulated API call
    setTimeout(() => {
      console.log("User registered:", credentials);
      navigate("/introduction"); // Redirect to dashboard after successful registration
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      <header>
        <h1>BO-GPT</h1>
      </header>
      <div className="screen-container login">
        <h2>Create New Account</h2>
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
          <label>
            <input
              type="password"
              className="input"
              name="confirmPassword"
              placeholder="Repeat password"
              value={credentials.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
          <button className="button login" type="submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Create Account"}
          </button>
        </form>
      </div>
    </>
  );
};

export default SignUpScreen;
