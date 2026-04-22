import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden
        bg-white/[0.03] 
        backdrop-blur-[16px] 
        border border-white/10 
        shadow-[0_4px_30px_rgba(0,0,0,0.1)]
        rounded-2xl
        ${className}
      `}
      whileHover={hoverEffect ? { 
        scale: 1.02,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(0, 243, 255, 0.3)",
        boxShadow: "0 0 20px rgba(0, 243, 255, 0.1)"
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Glossy reflection gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;