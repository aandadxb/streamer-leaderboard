'use client'
import { useState, useEffect } from 'react';
import { PrimaryButton } from '../components/PrimaryButton';

interface StickyBarProps {
  joinHref: string;
  loginHref: string;
}

export function StickyBar({ joinHref, loginHref }: StickyBarProps) {
  const [showSticky, setShowSticky] = useState(true);

  useEffect(() => {
    const target = document.getElementById('mobile-inline-buttons');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { rootMargin: '0px', threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 w-full px-4 py-4 z-50 flex gap-4 bg-brand-dark/95 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
      <a href={loginHref} className="flex-1 py-3 rounded-full bg-[#212D57] text-brand-offwhite text-sm border border-white/10 shadow-lg text-center">Log In</a>
      <PrimaryButton href={joinHref} className="flex-1 py-3 text-sm shadow-lg">Join Now</PrimaryButton>
    </div>
  );
}
