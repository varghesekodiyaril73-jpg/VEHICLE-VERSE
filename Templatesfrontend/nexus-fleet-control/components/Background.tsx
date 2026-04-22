import React from 'react';
import { motion } from 'framer-motion';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020202]">
      {/* Top Left Blob - Cyan - Smaller & more subtle */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[5%] -left-[5%] w-[30vw] h-[30vw] rounded-full bg-[#00f3ff] opacity-[0.04] blur-[100px]"
      />

      {/* Bottom Right Blob - Purple - Smaller & more subtle */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[5%] -right-[5%] w-[35vw] h-[35vw] rounded-full bg-[#bc13fe] opacity-[0.03] blur-[100px]"
      />

      {/* Center Moving Accent - Very faint */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[40%] left-[40%] w-[15vw] h-[15vw] rounded-full bg-blue-900 opacity-[0.05] blur-[80px]"
      />
      
      {/* Grid Overlay for Texture - Enhanced visibility for deep black feel */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
};

export default Background;