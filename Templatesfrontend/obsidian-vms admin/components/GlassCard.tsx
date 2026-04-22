import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div 
      className={`
        relative overflow-hidden
        bg-neutral-900/40 
        backdrop-blur-2xl 
        border border-white/5 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] 
        rounded-2xl
        transition-all duration-300
        hover:border-white/10 hover:bg-neutral-900/50 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]
        ${noPadding ? '' : 'p-6'} 
        ${className}
      `}
    >
      {/* Subtle shine effect top right */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {children}
    </div>
  );
};