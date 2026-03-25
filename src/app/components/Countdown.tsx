import React from 'react';

interface CountdownProps {
  startDateText?: string;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const Countdown: React.FC<CountdownProps> = ({ 
  startDateText = "30/01/2026 01:01 CET", 
  days = 24, 
  hours = 24, 
  minutes = 24, 
  seconds = 24 
}) => (
  <div className="border border-brand-offwhite/50 rounded-xl p-3 sm:p-4 md:p-6 bg-transparent w-full max-w-3xl">
    {/* Header Section */}
    <div className="flex justify-between items-center w-full mb-4 md:mb-6">
      <span className="font-hero font-medium text-sm sm:text-base md:text-xl text-brand-offwhite opacity-90">
        Ends in
      </span>
      <div className="bg-state-layer rounded-full px-2 py-1 sm:px-3 sm:py-1.5 md:px-5 md:py-2 flex items-center gap-1 md:gap-3">
        <span className="font-hero font-medium text-[8px] sm:text-[10px] md:text-[12px] text-brand-offwhite opacity-80">
          Started
        </span>
        <span className="font-hero font-medium text-[8px] sm:text-[10px] md:text-[12px] text-brand-offwhite">
          {startDateText}
        </span>
      </div>
    </div>

    {/* Timer Section */}
    <div className="flex items-center justify-between w-full">
      {[
        { label: 'days', value: days },
        { label: 'hrs', value: hours },
        { label: 'min', value: minutes },
        { label: 'sec', value: seconds },
      ].map((time, idx) => (
        <React.Fragment key={time.label}>
          {/* Number + Label */}
          <div className="flex-1 flex justify-center items-baseline gap-1 md:gap-2">
            <span className="font-hero font-bold text-lg sm:text-2xl md:text-4xl text-brand-offwhite">
              {time.value.toString().padStart(2, '0')}
            </span>
            <span className="font-hero font-bold text-[10px] sm:text-xs md:text-lg text-brand-gold">
              {time.label}
            </span>
          </div>
          
          {/* Vertical Divider  */}
          {idx !== 3 && (
            <div className="h-6 sm:h-8 md:h-14 w-[1px] bg-brand-offwhite/30" />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);