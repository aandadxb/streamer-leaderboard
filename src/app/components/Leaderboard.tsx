import React from 'react';
import { Player } from '../types';

interface LeaderboardProps {
  players: Player[];
  lastUpdatedISO: string;
  nextUpdateISO: string;
  unlockThreshold: number;
  usePoints: boolean;
  currentPlayer?: Player | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  lastUpdatedISO,
  nextUpdateISO,
  unlockThreshold,
  usePoints,
  currentPlayer,
}) => {
  const topTen = players.slice(0, 10);
  const currentInTopTen = currentPlayer
    ? topTen.some((p) => p.id === currentPlayer.id)
    : false;
  const highlightedId = currentPlayer?.id ?? null;
  const showYouRow = !!currentPlayer && !currentInTopTen;
  const formatAmount = (val: number): string => {
    const points = Math.round(val * 5);
    return new Intl.NumberFormat('en-US').format(points);
  };

  const formatLocalTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getRankClasses = (rank: number) => {
    if (rank === 1) return "bg-rank-1-bg";
    if (rank === 2 || rank === 3) return "bg-rank-top-bg";
    return "bg-transparent border-b border-brand-offwhite/10";
  };

  const topPlayer = players.find(p => p.rank === 1);
  const isUnlocked = topPlayer ? topPlayer.wagered >= unlockThreshold : false;
  const pointsLeft = topPlayer ? Math.max(0, unlockThreshold - topPlayer.wagered) : unlockThreshold;

  return (
    <div className="w-full flex flex-col">

      {unlockThreshold > 0 && !isUnlocked && (
        <div className="mb-4 bg-[#161F3D] border border-brand-gold/30 rounded-xl p-4 text-center">
          <p className="font-hero font-medium text-brand-gold text-sm mb-1">🔒 1st Prize Locked</p>
          <p className="font-hero font-medium text-white text-xs opacity-90">
            <span className="font-bold">{formatAmount(pointsLeft)} pts</span> left to unlock the Grand Prize!
          </p>
          <div className="w-full bg-brand-dark h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-brand-gold h-full"
              style={{ width: `${Math.min(100, ((topPlayer?.wagered || 0) / unlockThreshold) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="font-hero font-semibold grid grid-cols-[40px_1fr_auto] md:grid-cols-[70px_1fr_auto] gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-[12px] text-brand-gold tracking-[0.2em]">
        <div className="text-center">#</div>
        <div>User</div>
        <div className="text-right">Points Earned</div>
      </div>

      <div className="flex flex-col">
        {topTen.map((player, idx) => {
          const isLast = idx === topTen.length - 1;
          const isYou = highlightedId === player.id;
          const baseRowClasses = isLast && player.rank > 3
            ? 'bg-transparent'
            : getRankClasses(player.rank);
          const rowClasses = isYou
            ? 'bg-transparent border border-brand-gold rounded-xl shadow-[0_0_0_1px_rgba(251,227,163,0.4)]'
            : baseRowClasses;
          const goldText = player.rank === 1 || isYou;
          return (
            <div key={player.id} className={`grid grid-cols-[40px_1fr_auto] md:grid-cols-[70px_1fr_auto] items-center gap-2 md:gap-4 px-3 md:px-6 py-2.5 md:py-4 transition-all duration-300 ${rowClasses} ${isYou || player.rank <= 3 ? 'my-[2px] md:my-1 rounded-xl' : ''}`}>
              <div className="flex justify-center items-center">
                {!isYou && player.rank === 1 && <span className="text-xl md:text-2xl drop-shadow-[0_0_12px_rgba(251,227,163,0.9)]">👑</span>}
                {!isYou && (player.rank === 2 || player.rank === 3) && (
                  <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                    <svg viewBox="0 0 40 40" fill="none" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(180,190,210,0.4)]">
                      <path d="M20 2L25.1 13.5L37.5 15L28.3 23.5L30.8 36L20 30L9.2 36L11.7 23.5L2.5 15L14.9 13.5L20 2Z" fill={player.rank === 2 ? '#B0BEC5' : '#A0887B'} />
                    </svg>
                    <span className="relative font-hero font-bold text-sm md:text-base text-white">{player.rank}</span>
                  </div>
                )}
                {isYou && (
                  <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full border border-brand-gold font-hero font-bold text-xs md:text-sm text-brand-gold">
                    {player.rank}
                  </div>
                )}
                {!isYou && player.rank > 3 && (
                  <div className="font-hero font-bold text-gray-500">{player.rank}</div>
                )}
              </div>

              <div className={`font-hero font-bold tracking-wide text-[13px] md:text-base ${goldText ? 'text-brand-gold' : 'text-brand-offwhite'}`}>
                {isYou ? 'You' : player.username}
              </div>
              <div className={`font-hero font-bold tabular-nums text-[13px] md:text-base ${goldText ? 'text-brand-gold' : 'text-brand-offwhite'}`}>
                {formatAmount(player.wagered)}
              </div>
            </div>
          );
        })}

        {showYouRow && currentPlayer && (
          <>
            <div className="flex justify-center items-center gap-1.5 pt-1 pb-4 md:pb-6" aria-hidden="true">
              <span className="w-1 h-1 rounded-full bg-brand-offwhite/40" />
              <span className="w-1 h-1 rounded-full bg-brand-offwhite/40" />
              <span className="w-1 h-1 rounded-full bg-brand-offwhite/40" />
            </div>
            <div className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[70px_1fr_auto] items-center gap-2 md:gap-4 px-3 md:px-6 py-2.5 md:py-4 my-[2px] md:my-1 rounded-xl bg-transparent border border-brand-gold shadow-[0_0_0_1px_rgba(251,227,163,0.4)]">
              <div className="flex justify-center items-center">
                <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full border border-brand-gold font-hero font-bold text-xs md:text-sm text-brand-gold">
                  {currentPlayer.rank}
                </div>
              </div>
              <div className="font-hero font-bold tracking-wide text-[13px] md:text-base text-brand-gold">You</div>
              <div className="font-hero font-bold tabular-nums text-[13px] md:text-base text-brand-gold">
                {formatAmount(currentPlayer.wagered)}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full flex justify-center items-center gap-2 text-[10px] md:text-[11px] text-brand-offwhite/70 mt-4 md:mt-6 opacity-90 tracking-widest font-medium text-center">
        <span>Last updated: <span className="text-brand-offwhite">{formatLocalTime(lastUpdatedISO)}</span></span>
        <span className="text-brand-offwhite/30">|</span>
        <span>Next update: <span className="text-brand-offwhite">{formatLocalTime(nextUpdateISO)}</span></span>
      </div>
    </div>
  );
};
