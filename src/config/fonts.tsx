import React from "react";

export const FontsAndStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');
    * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes pulseRingRed {
      0% { box-shadow: 0 0 0 0 rgba(225,69,69,0.35); }
      70% { box-shadow: 0 0 0 9px rgba(225,69,69,0); }
      100% { box-shadow: 0 0 0 0 rgba(225,69,69,0); }
    }
    @keyframes pulseDot {
      0%,100% { opacity: 1; transform: scale(1); }
      50% { opacity: .45; transform: scale(1.35); }
    }
    .pulse-critical { animation: pulseRingRed 2.2s infinite; }
    .pulse-dot { animation: pulseDot 1.6s infinite; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: #D8DEE5; border-radius: 8px; }
  `}</style>
);
