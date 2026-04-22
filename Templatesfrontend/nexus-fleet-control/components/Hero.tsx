import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import NeonButton from './ui/NeonButton';
import { NavProps } from '../types';

const Hero: React.FC<NavProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
      
      {/* 3D Orb Effect behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-full bg-gradient-to-tr from-[#00f3ff] to-[#bc13fe] blur-[80px] opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-gray-300">System v4.0 Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            Next-Gen <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#bc13fe]">
              Fleet Control
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate vehicle management interface. Real-time telemetry, 
            predictive AI maintenance, and holographic driver analytics in one 
            liquid glass ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NeonButton onClick={() => onOpenAuth('register')} variant="cyan" className="w-full sm:w-auto h-12">
              Start Free Trial <ArrowRight size={18} />
            </NeonButton>
            <NeonButton onClick={() => onOpenAuth('login')} variant="outline" className="w-full sm:w-auto h-12">
              System Demo <ChevronRight size={18} />
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;