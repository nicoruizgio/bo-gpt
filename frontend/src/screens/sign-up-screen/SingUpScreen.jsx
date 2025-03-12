import  { useState } from "react";
import { registerUser } from "../../api/registerApi";
import { useNavigate } from "react-router-dom";
import "./SignUpScreen.css";
import HeaderComponent from "../../components/header/HeaderComponent";

const SignUpScreen = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

    try {
      await registerUser(credentials.username, credentials.password);
      setModal(true);
      setTimeout(() => {
        setModal(false);
        navigate("/log-in");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <HeaderComponent isLoggedIn={false} />
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

      {/** Modal */}
      {modal && (
        <div className="modal">
          <div className="modal-content">
            <p className="modal-title">Account created successfully!</p>
            <span className="material-symbols-outlined">task_alt</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUpScreen;
