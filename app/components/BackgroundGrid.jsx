import React from "react";

const BackgroundGrid = ({ strokeColor = "rgba(88, 241, 255, 0.04)", gridSize = 50, strokeWidth = 1 }) => {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <pattern id="hero-grid" x="0" y="0" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
        <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
      </pattern>
      <rect width="100%" height="100%" fill="url(#hero-grid)" />
    </svg>
  );
};

export default BackgroundGrid;
