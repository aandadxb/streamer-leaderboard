import React from 'react';
import { PrimaryButton } from './PrimaryButton';

export interface Step {
  num: string;
  title: string;
  desc: string;
}

interface HowItWorksProps {
  title?: string;
  steps?: Step[];
  ctaText?: string;
  ctaHref?: string;
}

const defaultSteps: Step[] = [
  { num: '1', title: 'SIGN UP', desc: 'By clicking here' },
  { num: '2', title: 'DEPOSIT', desc: 'Using my code' },
  { num: '3', title: 'PLAY & WIN', desc: 'Sit back and enjoy' },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({
  title = "How it works?",
  steps = defaultSteps,
  ctaText = "Win Exclusive Prizes",
  ctaHref
}) => (
  <section className="w-full bg-glass-gradient backdrop-blur-md border-[1px] border-brand-gold rounded-2xl p-6 xs:p-8 md:px-10 md:py-8 flex flex-col items-center lg:flex-row lg:justify-between gap-8 lg:gap-6 shadow-xl">

    {/* Title: Medium */}
    <h3 className="font-hero font-medium text-xl md:text-2xl text-white whitespace-nowrap text-center lg:text-left">
      {title}
    </h3>

    {/* Steps Container */}
    <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-4 lg:gap-6 w-full lg:w-auto mt-2 md:mt-0">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Step Number */}
              <div className="font-hero font-bold w-8 h-8 shrink-0 rounded-full border-[1px] border-brand-offwhite/30 flex items-center justify-center text-[11px] text-white">
                {step.num}
              </div>
              {/* Title */}
              <span className="font-hero font-bold text-brand-gold text-base md:text-lg uppercase leading-none tracking-wide">
                {step.title}
              </span>
            </div>
            {/* Description */}
            <span className="font-hero font-medium text-brand-offwhite text-xs md:text-[13px] mt-1.5 md:ml-11 opacity-90">
              {step.desc}
            </span>
          </div>

          {/* Connectors */}
          {index < steps.length - 1 && (
            <>
              {/* Vertical line for Mobile (Breakpoint 4/3) */}
              <div className="md:hidden w-[1px] h-8 bg-brand-offwhite/20 my-2" />

              {/* Horizontal line for Tablet/Desktop (Breakpoint 2/1) */}
              <div className="hidden md:block w-8 lg:w-16 xl:w-20 h-[1px] bg-brand-offwhite/30 md:-mt-5" />
            </>
          )}
        </React.Fragment>
      ))}
    </div>

    {/* CTA Button */}
    <PrimaryButton
      className="font-hero font-semibold hidden lg:flex w-full lg:w-auto px-6 py-4 text-sm whitespace-nowrap shadow-none uppercase tracking-widest"
      href={ctaHref}
    >
      {ctaText}
    </PrimaryButton>
  </section>
);
