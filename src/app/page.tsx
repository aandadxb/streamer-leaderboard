'use client'
import React, { useState, useEffect, useRef } from 'react';
import { HeroBanner } from "./components/HeroBanner";
import { HowItWorks } from "./components/HowItWorks";
import { Podium } from "./components/Podium";
import { Leaderboard } from "./components/Leaderboard";
import { Countdown } from "./components/Countdown";
import { PrimaryButton } from "./components/PrimaryButton";
import { Player } from "./types";
import { Footer } from "./components/Footer";

export default function Home() {
  const [showSticky, setShowSticky] = useState(true);
  const bottomButtonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Observer checks if the bottom inline buttons are visible on screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the bottom buttons are intersecting (visible), hide the sticky ones
        setShowSticky(!entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    if (bottomButtonsRef.current) {
      observer.observe(bottomButtonsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const allPlayers: Player[] = [
    { id: '1', rank: 1, username: '****ren', wagered: 10996.40, deposited: 0 },
    { id: '2', rank: 2, username: '****ren', wagered: 8845.40, deposited: 0 },
    { id: '3', rank: 3, username: '****ren', wagered: 6396.38, deposited: 0 },
    { id: '4', rank: 4, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '5', rank: 5, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '6', rank: 6, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '7', rank: 7, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '8', rank: 8, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '9', rank: 9, username: '****ren', wagered: 945.80, deposited: 0 },
    { id: '10', rank: 10, username: '****ren', wagered: 945.80, deposited: 0 },
  ];

  const topThree = allPlayers.slice(0, 3); 

  return (
    <>
    {/* FIXED: Removed pb-24 so it doesn't leave a huge gap above the footer */}
    <main className="w-full max-w-screen-2xl mx-auto px-6 md:px-12 3xl:px-[200px] flex flex-col gap-5 md:gap-8 relative pb-8 lg:pb-10">
      
      {/* 1. BRANDING (DISSOLVED HEADER) */}
      <div className="w-full relative z-20 flex flex-col items-center lg:flex-row lg:justify-between gap-4 lg:gap-0 mt-6 md:mt-8">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2">
          <div className="flex flex-col items-center lg:items-start order-1 lg:order-2">
            <span className="text-[12px] lg:text-[10px] text-brand-offwhite font-bold uppercase tracking-[0.2em] leading-none">
              Presented by
            </span>
            <span className="text-lg lg:text-sm font-bold text-brand-gold leading-tight mt-1 lg:mt-[2px]">
              LUCKYDREAMS.COM
            </span>
          </div>
          <img
            src="/assets/logo.png"
            alt="Lucky Dreams"
            className="w-16 h-16 lg:w-10 lg:h-10 order-2 lg:order-1"
          />
        </div>

        <div className="hidden lg:flex gap-4">
          <PrimaryButton href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="px-6 py-2">Join Now</PrimaryButton>
          <a href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-full bg-transparent border border-brand-offwhite text-brand-offwhite font-bold text-sm hover:bg-brand-offwhite/10 transition-colors cursor-pointer inline-flex items-center justify-center">
            Log In
          </a>
        </div>
      </div>

      {/* 2. HERO BANNER */}
      <HeroBanner />

      {/* 3. HOW IT WORKS (Desktop Position Only) */}
      <div className="hidden lg:block w-full relative z-20">
        <HowItWorks ctaHref="https://Luckydreams.info/kytbkll0i" />
      </div>

      {/* 4. MAIN CONTENT GRID (Podium & Leaderboard) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-10 lg:gap-12 xl:gap-16 items-start relative z-20">
        
        {/* TOP WINNERS */}
        <div className="flex flex-col w-full min-w-0 order-1">
          <h2 className="text-xl lg:text-3xl font-medium text-white mb-2 lg:mb-5 text-center">
            Top Winners
          </h2>
          <div className="w-full flex justify-center">
            {/* Added usePoints explicitly to satisfy the new Podium props */}
            <Podium topPlayers={topThree} usePoints={false} />
          </div>
        </div>

        {/* LEADERBOARD SECTION */}
        <div className="flex flex-col w-full min-w-0 order-2">
          <h2 className="text-xl lg:text-3xl font-medium text-white mb-2 lg:mb-5 text-center lg:text-left">
            Current Leaderboard
          </h2>
          
          <div className="flex flex-col gap-4 lg:gap-8 w-full">
            <div className="flex justify-center lg:justify-start">
              <Countdown />
            </div>
            <div className="w-full">
              {/* FIXED: Passing players directly and providing the new required props */}
              <Leaderboard 
                players={allPlayers} 
                lastUpdatedISO="2026-02-11T13:32:00.000Z"
                nextUpdateISO="2026-02-11T13:47:00.000Z"
                unlockThreshold={0}
                usePoints={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. MOBILE BOTTOM SECTION (Flowchart + Buttons) */}
      {/* FIXED: Removed mb-8 so it sits flush with the footer */}
      <div ref={bottomButtonsRef} className="flex lg:hidden flex-col items-center gap-6 w-full relative z-20">
        <HowItWorks ctaHref="https://Luckydreams.info/kytbkll0i" />
        <div className="flex items-center gap-3 justify-center w-full">
          <a href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="py-3 px-8 rounded-full bg-[#212D57] text-brand-offwhite font-bold text-sm border border-white/10 cursor-pointer inline-flex items-center justify-center">
            Log In
          </a>
          <PrimaryButton href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="py-3 px-8 text-sm">
            Join Now
          </PrimaryButton>
        </div>
      </div>

      {/* 6. MOBILE STICKY BOTTOM BUTTONS (ATF) */}
      <div 
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 w-full px-4 py-4 z-50 flex justify-center gap-3
          bg-brand-dark/95 backdrop-blur-md border-t border-white/10
          transition-transform duration-300 ease-in-out
          ${showSticky ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <a href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="py-3 px-8 rounded-full bg-[#212D57] text-brand-offwhite font-bold text-sm border border-white/10 shadow-lg cursor-pointer inline-flex items-center justify-center">
          Log In
        </a>
        <PrimaryButton href="https://Luckydreams.info/kytbkll0i" target="_blank" rel="noopener noreferrer" className="py-3 px-8 text-sm shadow-lg">
          Join Now
        </PrimaryButton>
      </div>

    </main>
    <Footer />
    </>
  );
}