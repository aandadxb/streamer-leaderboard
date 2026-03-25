'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player } from '../types';
import { RankBadge } from './RankBadge';

interface PodiumProps {
  topPlayers: Player[];
  usePoints?: boolean;
  prizes?: {
    1?: string;
    2?: string;
    3?: string;
  };
}

export const Podium: React.FC<PodiumProps> = ({
  topPlayers,
  usePoints = false,
  prizes = {}
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rank1Ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const rank1El = rank1Ref.current;
    if (container && rank1El) {
      const scrollLeft = rank1El.offsetLeft - container.offsetWidth / 2 + rank1El.offsetWidth / 2;
      container.scrollLeft = scrollLeft;
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener('scroll', updateScrollState, { passive: true });
    return () => container.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const displayOrder = [
    topPlayers.find((p) => p.rank === 2),
    topPlayers.find((p) => p.rank === 1),
    topPlayers.find((p) => p.rank === 3),
  ].filter((p): p is Player => p !== undefined);

  const getBorderWrapperClass = (rank: number) => {
    if (rank === 1) return 'bg-[var(--color-brand-gold)] shadow-[0_0_40px_rgba(251,227,163,0.25)]';
    if (rank === 2) return 'bg-gradient-to-br from-[#E7EAED] to-[#616060]';
    if (rank === 3) return 'bg-gradient-to-br from-[#E8B59A] to-[#7F4025]';
    return '';
  };

  const formatPodiumAmount = (val: number) => {
    const points = Math.round(val * 5);
    return new Intl.NumberFormat('en-US').format(points);
  };

  const PodiumCard = ({ player }: { player: Player }) => {
    const isFirst = player.rank === 1;
    const widthClass = isFirst ? 'w-full max-w-[320px]' : 'w-full max-w-[240px]';
    const prizeText = prizes[player.rank as 1 | 2 | 3];
    const hasPrize = !!prizeText;

    return (
      <div className={`flex flex-col items-center ${widthClass} transition-all duration-300`}>
        <div className={`flex justify-center items-center pointer-events-none z-20 ${isFirst ? 'w-[70%]' : 'w-[70%]'}`}>
          <RankBadge rank={player.rank as 1 | 2 | 3} />
        </div>

        <div className={`w-full p-[0.9px] rounded-lg z-10 ${getBorderWrapperClass(player.rank)} ${isFirst ? `-mt-[70px] md:-mt-[70px] ${hasPrize ? 'h-[215px] md:h-[260px]' : 'h-[185px] md:h-[240px]'}` : `-mt-[60px] md:-mt-[60px] ${hasPrize ? 'h-[210px] md:h-[250px]' : 'h-[155px] md:h-[200px]'}`}`}>
          <div className={`flex flex-col items-center justify-end w-full h-full px-7 md:px-8 rounded-[calc(0.5rem-0.9px)] bg-[var(--color-surface-container)] ${isFirst ? 'pb-4 md:pb-8' : 'pb-3 md:pb-7'}`}>

            <span className="font-hero font-medium text-surface-variant tracking-[0.1em] mb-1 md:mb-2 text-[10px] md:text-[12px] uppercase opacity-60 w-full text-center">
              {player.username}
            </span>

            {prizeText && (
              <div className="mb-4 w-full px-1">
                <div className={`flex items-center justify-center py-2 rounded-lg border text-center transition-all duration-300 ${isFirst ? 'bg-brand-gold/5 border-brand-gold/40 shadow-[0_0_15px_rgba(251,227,163,0.1)]' : 'bg-white/[0.03] border-white/10'}`}>
                  <span className={`font-hero font-bold text-[9px] md:text-[10px] tracking-[0.18em] uppercase truncate px-2 ${isFirst ? 'text-brand-gold' : 'text-brand-offwhite/50'}`}>
                    {prizeText}
                  </span>
                </div>
              </div>
            )}

            <div className={`w-full rounded-lg border-[0.9px] ${isFirst ? 'border-[var(--color-brand-gold)]' : player.rank === 2 ? 'border-[#B0B8BF]' : 'border-[#C0907A]'}`} style={{ background: 'linear-gradient(76.87deg, rgba(255, 255, 255, 0.32) -7.84%, rgba(255, 255, 255, 0) 109.62%, rgba(255, 255, 255, 0.24) 109.62%)', backdropFilter: 'blur(5.4px)', WebkitBackdropFilter: 'blur(5.4px)' }}>
              <div className="rounded-[calc(0.5rem-0.9px)] px-1 sm:px-2 py-2 md:py-4 text-center w-full flex flex-col gap-0 md:gap-1">
                <span className="font-hero font-bold text-[10px] md:text-[12px] text-white tracking-widest leading-tight">
                  Points
                </span>
                <span className="font-hero font-bold text-[16px] sm:text-[18px] md:text-[22px] tabular-nums whitespace-nowrap leading-tight text-brand-gold">
                  {formatPodiumAmount(player.wagered)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative flex flex-col items-center z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 rounded-full w-full max-w-[1133px] h-[586px] bg-[#495AFF]/30 blur-[200px]" />

      <div className="hidden md:flex items-end justify-center gap-4 pt-8 pb-8 relative z-10 w-full">
        {displayOrder.map((player) => <PodiumCard key={player.id} player={player} />)}
      </div>

      <div ref={scrollRef} className="md:hidden relative z-10 flex items-end w-[100vw] -mx-4 gap-3 pt-4 pb-9 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-4">
        {displayOrder.map((player) => (
          <div key={player.id} ref={player.rank === 1 ? rank1Ref : undefined} className="snap-center shrink-0 flex justify-center w-[75%]">
            <PodiumCard player={player} />
          </div>
        ))}
      </div>

      <div className="flex md:hidden items-center justify-center gap-2 mt-2">
        {displayOrder.map((_, index) => (
          <div key={index} className={`rounded-full transition-all duration-300 ${index === activeIndex ? 'w-2 h-2 bg-white/80' : 'w-1.5 h-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
};
