import React from "react";
import "./introduction-screen.css";
import { useNavigate } from "react-router-dom";

const Introduction = () => {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("participantId", data.participantId); // Store ID in local storage
        navigate("/rating");
      } else {
        console.error("Failed to create participant");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="screen-container introduction">
      <h2>Welcome to BO-GPT</h2>
      <p className="introduction-text">
        In the following page you will interact with an AI chatbot that will
        present you with 16 news articles. <br /> Rate them from 1 to 5
        according to your preference. Prest start to begin.
      </p>
      <button className="button" onClick={handleStart}>
        Start
      </button>
    </div>
  );
};

export default Introduction;
