import React from "react";
import { COLORS } from "./colors";

export const FontsAndStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

    html, body, button, input, select, textarea {
      font-family: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
    }

    .display {
      font-family: "Fraunces", Georgia, "Times New Roman", serif;
      letter-spacing: -0.03em;
      font-optical-sizing: auto;
    }

    .kicker {
      font-family: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .mono {
      font-family: ui-monospace, "IBM Plex Mono", "Cascadia Mono", monospace;
    }

    @keyframes pulseRingRed {
      0%, 100% { box-shadow: 0 0 0 0 rgba(225, 69, 69, 0); }
      50% { box-shadow: 0 0 0 3px rgba(225, 69, 69, 0.22); }
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .pulse-critical { animation: pulseRingRed 2.4s ease-in-out infinite; }
    .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: ${COLORS.line};
      border: 2px solid ${COLORS.bg};
    }
  `}</style>
);
