import "./InstructionScreen.css";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/header/HeaderComponent";

const Instruction = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/recommender");
  };

  return (
    <>
      <HeaderComponent isLoggedIn={true} />

      <div className="screen-container introduction">
        <h2>Lokale Nachrichtenempfehlungen</h2>
        <p className="introduction-text">
        Auf der folgenden Seite können Sie mit einem KI-Chatbot interagieren, der Ihnen auf der Grundlage Ihrer Nachrichtenpräferenzen Nachrichtenartikel aus Bochum empfiehlt.
        </p>
        <button className="button" onClick={handleStart}>
          Start
        </button>
      </div>
    </>
  );
};

export default Instruction;
