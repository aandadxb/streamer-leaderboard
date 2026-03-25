'use client';

import React, { useState } from 'react';
import { TermsModal } from './TermsModal';
import { DEFAULT_TERMS_HTML } from './defaultTermsHtml';

interface FooterProps {
  termsHtml?: string;
}

export const Footer: React.FC<FooterProps> = ({ termsHtml }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="w-full bg-surface-default mt-auto border-t border-white/5">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col lg:flex-row items-center justify-between
          px-4 py-4 gap-4
          md:px-12 md:py-4 md:gap-6
          lg:px-12 lg:py-12">

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
            <button
              onClick={() => setShowTerms(true)}
              className="font-hero font-medium text-sm text-surface-variant transition-colors hover:text-white hover:underline"
            >
              Terms and Conditions
            </button>
            <a href="#" className="font-hero font-medium text-sm text-surface-variant transition-colors hover:text-white hover:underline">
              Privacy Policy
            </a>
            <a href="https://www.luckydreams.com/responsible-gaming" target="_blank" rel="noopener noreferrer" className="font-hero font-medium text-sm text-surface-variant transition-colors hover:text-white hover:underline">
              18+ Play Responsibly
            </a>
          </nav>

          <div className="flex items-center justify-center gap-6">
            <a href="#" aria-label="Facebook" className="opacity-70 transition-opacity hover:opacity-100 text-white/70">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.101 24v-11.063H5.378v-4.29h3.723V5.477c0-3.693 2.256-5.707 5.554-5.707 1.58 0 2.937.117 3.334.17v3.864h-2.287c-1.792 0-2.14.852-2.14 2.098v2.747h4.275l-.556 4.29H12.71V24h-3.61z" />
              </svg>
            </a>
            <a href="#" aria-label="X (Twitter)" className="opacity-70 transition-opacity hover:opacity-100 text-white/70">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="opacity-70 transition-opacity hover:opacity-100 text-white/70">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        html={termsHtml || DEFAULT_TERMS_HTML}
      />
    </>
  );
};
