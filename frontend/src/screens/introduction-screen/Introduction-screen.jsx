import "./Introduction-screen.css";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/header/HeaderComponent";

const Introduction = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/rating");
  };

  return (
    <>
      <HeaderComponent isLoggedIn={true} />

      <div className="screen-container introduction">
        <h2>Willkommen bei BO-GPT</h2>
        <p className="introduction-text">
        Auf der folgenden Seite werden Sie mit einem KI-Chatbot interagieren, der Ihnen 16 Nachrichtenartikel präsentiert.
        Bewerten Sie diese je nach Ihren Vorlieben von 1 bis 5. Drücken Sie auf Start, um zu beginnen.
        </p>
        <button className="button" onClick={handleStart}>
          Start
        </button>
      </div>
    </>
  );
};

export default Introduction;
