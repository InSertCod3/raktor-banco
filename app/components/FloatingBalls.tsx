"use client";

import { useEffect } from "react";

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export default function FloatingBalls() {
  useEffect(() => {
    const colors = ["#3CC157", "#2AA7FF", "#1B1B1B", "#FCBC0F", "#F85F36"];
    const numBalls = 40;
    const container = document.getElementById("ball-container");

    if (!container) return;

    // Clear any existing balls
    container.innerHTML = "";

    for (let i = 0; i < numBalls; i++) {
      const ball = document.createElement("div");
      ball.classList.add("ball");
      ball.style.background = colors[Math.floor(Math.random() * colors.length)];
      ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
      ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
      ball.style.transform = `scale(${Math.random() * 1.5})`;
      ball.style.position = "absolute";
      const size = Math.random() * 1.5 + 0.3;
      ball.style.width = `${size}em`;
      ball.style.height = ball.style.width;
      ball.style.zIndex = "0";
      ball.style.borderRadius = "50%";
      ball.style.opacity = "0.6";

      const to = {
        x: Math.random() * (i % 2 === 0 ? -33 : 33),
        y: Math.random() * 32,
      };

      ball.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${to.x}rem, ${to.y}rem)` },
        ],
        {
          duration: randomIntFromInterval(
            (Math.random() + 4) * 2000,
            (Math.random() + 6) * 2000
          ),
          direction: "alternate",
          fill: "both",
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );

      container.appendChild(ball);
    }

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return null;
}
