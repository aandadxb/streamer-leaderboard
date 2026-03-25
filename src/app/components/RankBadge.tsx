import React from 'react';

interface RankBadgeProps {
  rank: 1 | 2 | 3;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, className = '' }) => {
  const images = {
    1: '/assets/rank-1-pentagon-md.png',
    2: '/assets/rank-2-pentagon-md.png',
    3: '/assets/rank-3-pentagon-md.png',
  };

  const shadowClass = {
    1: 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]',
    2: 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]',
    3: 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]',
  };

  const glowColor = {
    1: 'rgba(0,0,0,0.4)',
    2: 'rgba(0,0,0,0.4)',
    3: 'rgba(0,0,0,0.4)',
  };

  return (
    <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
      {/* Glow pool beneath the badge */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] w-[60%] h-[40%] rounded-full blur-[25px] pointer-events-none"
        style={{ backgroundColor: glowColor[rank] }}
      />
      <img
        src={images[rank]}
        alt={`Rank ${rank} badge`}
        className={`relative z-10 w-full h-full object-contain pointer-events-none transition-all duration-300 ${shadowClass[rank]}`}
      />
    </div>
  );
};
