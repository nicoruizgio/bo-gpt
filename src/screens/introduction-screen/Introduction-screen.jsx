import React from "react";
import "./introduction-screen.css";
import { useNavigate } from "react-router-dom";

const Introduction = () => {
  const navigate = useNavigate();

  const hanldeStart = () => {
    navigate("/rating");
  };

  return (
    <div className="screen-container">
      <h2>Welcome to BO-GPT</h2>
      <p className="introduction-text">
        In the following page you will interact with an AI chatbot that will
        present you with 16 news articles. <br /> Rate them from 1 to 5
        according to your preference. Prest start to begin.
      </p>
      <button className="button" onClick={hanldeStart}>
        Start
      </button>
    </div>
  );
};

export default Introduction;
