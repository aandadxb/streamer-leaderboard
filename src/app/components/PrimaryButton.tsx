import React from 'react';

type PrimaryButtonProps = {
  href?: string;
  className?: string;
  children: React.ReactNode;
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
);

const sharedClasses = "cursor-pointer rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-dark font-semibold text-sm hover:brightness-110 hover:scale-105 transition-all shadow-[0_4px_14px_rgba(186,157,100,0.3)]";

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ href, className = '', children, ...props }) => {
  if (href) {
    return (
      <a
        href={href}
        className={`${sharedClasses} inline-flex items-center justify-center ${className}`}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${sharedClasses} ${className}`}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};
