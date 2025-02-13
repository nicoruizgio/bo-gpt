import React from "react";
import "./InstructionScreen.css";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent";

const Instruction = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/recommender");
  };

  return (
    <>
      <HeaderComponent isLoggedIn={true} />

      <div className="screen-container introduction">
        <h2>Local News Recommender</h2>
        <p className="introduction-text">
          In the following page you will interact with an AI chatbot that will
          recommend you news articles from Bochum based on your news
          preferences.
        </p>
        <button className="button" onClick={handleStart}>
          Start
        </button>
      </div>
    </>
  );
};

export default Instruction;
