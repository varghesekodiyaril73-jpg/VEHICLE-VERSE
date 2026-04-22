import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'purple' | 'outline';
  children: React.ReactNode;
  className?: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  variant = 'cyan', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 relative overflow-hidden group";
  
  const variants = {
    cyan: "bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/50 hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]",
    purple: "bg-[#bc13fe]/10 text-[#bc13fe] border border-[#bc13fe]/50 hover:bg-[#bc13fe] hover:text-white hover:shadow-[0_0_20px_rgba(188,19,254,0.6)]",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/80 hover:bg-white/5"
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default NeonButton;