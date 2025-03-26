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
        <h2>Bewerte Nachrichten aus Bochum</h2>
        <p className="introduction-text">
          Stell dir vor, du möchtest dich über die aktuellen Nachrichten aus
          deiner Stadt informieren. Im Chat werden dir verschiedene Nachrichten
          gezeigt. Deine Aufgabe ist es, jede Nachricht danach zu bewerten, wie
          sehr sie dich interessiert oder nicht.
        </p>
        <button className="button" onClick={handleStart}>
          Start
        </button>
      </div>
    </>
  );
};

export default Introduction;
