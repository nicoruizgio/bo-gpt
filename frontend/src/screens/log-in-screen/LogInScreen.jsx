import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/loginApi";
import "./LogInScreen.css";
import HeaderComponent from "../../components/header/HeaderComponent";
import Spinner from "../../components/spinner/Spinner";

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

      navigate("/questionnaire"); // Redirect after successful login
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <HeaderComponent isLoggedIn={false} />
      <div className="screen-container login">
        <h2>Anmelden</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <input
              type="text"
              className="input"
              placeholder="Benutzername"
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
              placeholder="Passwort"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </label>
          <button className="button login" type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Anmelden"}
          </button>
        </form>
        <p className="create-new-account" onClick={() => navigate("/sign-up")}>
          Neues Konto erstellen
        </p>
      </div>
    </>
  );
};

export default LogInScreen;
