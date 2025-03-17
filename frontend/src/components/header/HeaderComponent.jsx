/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/logoutApi";
import "./HeaderComponent.css";

const HeaderComponent = ({ isLoggedIn, screenName, setChatLog, setConversationId}) => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {

      await logoutUser();

      localStorage.clear();

      navigate("/log-in");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleNewChat = () => {
    localStorage.clear()
    localStorage.setItem("username", username)
    setConversationId(null);
    setChatLog([

    ])
  }

  return (
    <header className="header-component">
      {isLoggedIn && (
        <div className="user-info">
          <div className="sing-out-container" onClick={handleSignOut}>
            <span className="material-symbols-outlined">logout</span>
            <p className="signout-button">Abmelden</p>
          </div>

          <p>|</p>
          <div className="username-container">
            <span className="material-symbols-outlined user">person</span>
            <p className="username">{username}</p>
          </div>

        </div>

      )}

      <div className="header-title">
        <h2>Bo-GPT</h2>
        {screenName === "rating_screen" ? (
          <h3 className="sub-title">Rating</h3>
        ) : screenName === "recommender_screen" ? (
          <h3 className="sub-title">Nachrichtenassistentin</h3>
        ) : null}
      </div>
      {
        isLoggedIn && screenName == 'recommender_screen' ? (
          <div className="new-chat">
            <button className="button new-chat-btn" onClick={handleNewChat}>
              + Neuer Chat
              </button>
          </div>
        ) : null
      }
    </header>
  );
};

export default HeaderComponent;
