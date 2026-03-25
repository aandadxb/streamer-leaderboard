import React from 'react';

interface HeroBannerProps {
  bannerUrl?: string;
  streamerUrl?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  bannerUrl = "/assets/banner.png",
  streamerUrl = "/assets/streamer.png"
}) => (
  <section className="w-full">
    {/* MOBILE — clip-path: top overflows, right/bottom/left clipped at card edge */}
    <div className="md:hidden relative w-full h-[214px] sm:h-[260px] rounded-[16px] border border-white/10 shadow-2xl z-20 bg-brand-dark"
      style={{ clipPath: 'inset(-200px 0px 0px 0px round 16px)' }}
    >
      {/* Background image layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-right rounded-[16px] overflow-hidden"
        style={{ backgroundImage: `url("${bannerUrl}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/60 to-brand-dark/20" />
      </div>

      {/* Streamer — clip-path cuts right/bottom, top overflows into header */}
      <img
        src={streamerUrl}
        alt="Streamer"
        className="absolute bottom-[-40px] right-[-120px] z-30 pointer-events-none w-auto object-cover object-top drop-shadow-2xl h-[295px] sm:h-[355px]"
      />

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-40 pointer-events-none">
        <span className="font-hero font-medium text-white/90 text-base tracking-wide leading-tight block mb-1">
          Streamer&apos;s<br /> Wager Race
        </span>
        <h1 className="font-hero font-bold text-[22px] leading-[1.05] sm:text-[26px] text-brand-gold uppercase drop-shadow-lg">
          EXCLUSIVE<br />
          PRIZES TO<br />
          BE WON
        </h1>
      </div>
    </div>

    {/* DESKTOP */}
    <div className="hidden md:block relative w-full h-[320px] lg:h-[400px] rounded-[24px] border border-white/10 shadow-2xl z-20 bg-brand-dark"
      style={{ clipPath: 'inset(-200px 0px 0px 0px round 24px)' }}
    >
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center rounded-[24px] overflow-hidden"
        style={{ backgroundImage: `url("${bannerUrl}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/60 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end items-start text-left p-8 lg:pl-12 xl:pl-16 lg:pb-12 z-30 pointer-events-none">
        <span className="font-hero font-medium text-white/90 text-xl mb-2 tracking-wide leading-tight">
          Streamer&apos;s Wager Race
        </span>
        <h1 className="font-hero font-bold text-4xl lg:text-[48px] leading-[1.05] text-brand-gold uppercase drop-shadow-lg">
          EXCLUSIVE PRIZES
          <br />
          TO BE WON
        </h1>
      </div>

      <img
        src={streamerUrl}
        alt="Streamer"
        className="absolute right-[-45%] lg:right-[-4%] bottom-[-40px] lg:bottom-[-14%] z-30 pointer-events-none w-auto object-cover object-top h-[460px] lg:h-[560px]"
      />
    </div>
  </section>
);
