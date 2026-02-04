import React from "react";
import "./GlowEffect.css"; // Make sure to create this CSS file

const GlowEffect = () => {
  return (
    <div className="glow-container">
      <div className="ball"></div>
      <div className="ball" style={{ "--delay": "-12s", "--size": "0.65", "--speed": "25s" }}></div>
      <div className="ball" style={{ "--delay": "-10s", "--size": "0.3", "--speed": "15s" }}></div>
      <div className="ball" style={{ "--delay": "-10s", "--size": "0.5", "--speed": "24s" }}></div>
      <div className="ball" style={{ "--delay": "-10s", "--size": "0.3", "--speed": "15s" }}></div>
    </div>
  );
};

export default GlowEffect;
