import  { useState } from "react";
import { resetPassword } from "../../api/resetPassword";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/header/HeaderComponent";

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
      username: "",
      password: "",
      confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);



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
        setError("Alle Felder sind erforderlich.");
        setLoading(false);
        return;
      }

      if (credentials.password.length < 6) {
        setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
        setLoading(false);
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setError("Die Kennwörter stimmen nicht überein.");
        setLoading(false);
        return;
      }

      try {
        await resetPassword(credentials.username, credentials.password);
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
        <h2>Passwort zurücksetzen</h2>
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
              placeholder="Neues Passwort"
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
              placeholder="Neues Passwort wiederholen"
              value={credentials.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
          <button className="button login" type="submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Zurücksetzen"}
          </button>
        </form>
      </div>

      {/** Modal */}
      {modal && (
        <div className="modal">
          <div className="modal-content">
            <p className="modal-title">Passwort erfolgreich zurückgesetzt!</p>
            <span className="material-symbols-outlined">task_alt</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordScreen;
