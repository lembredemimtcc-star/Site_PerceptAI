import React from "react";

interface WireframeAvatarProps {
  color: string;
}

export const WireframeAvatar: React.FC<WireframeAvatarProps> = ({ color }) => (
  <svg viewBox="0 0 60 60" className="w-10 h-10">
    <circle cx="30" cy="14" r="8" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
    <line x1="30" y1="22" x2="30" y2="42" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
    <line x1="30" y1="26" x2="16" y2="36" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
    <line x1="30" y1="26" x2="44" y2="36" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
    <line x1="30" y1="42" x2="18" y2="58" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
    <line x1="30" y1="42" x2="42" y2="58" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
  </svg>
);
