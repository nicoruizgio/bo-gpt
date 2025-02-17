import React from "react";
import "./Introduction-screen.css";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent";

const Introduction = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/rating");
  };

  return (
    <>
      <HeaderComponent isLoggedIn={true} />

      <div className="screen-container introduction">
        <h2>Welcome to BO-GPT</h2>
        <p className="introduction-text">
          In the following page you will interact with an AI chatbot that will
          present you with 16 news articles. <br /> Rate them from 1 to 5
          according to your preference. Press start to begin.
        </p>
        <button className="button" onClick={handleStart}>
          Start
        </button>
      </div>
    </>
  );
};

export default Introduction;
