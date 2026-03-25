'use client';

import React, { useEffect, useRef } from 'react';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  html: string;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, html }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a1e3d] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-hero text-lg font-bold text-brand-offwhite">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable HTML content */}
        <div
          className="overflow-y-auto px-6 py-5 terms-content text-sm text-white/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-brand-gold text-brand-dark font-bold text-sm hover:brightness-110 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
