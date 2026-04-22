import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { NavProps } from '../types';
import NeonButton from './ui/NeonButton';

const Navbar: React.FC<NavProps> = ({ onOpenAuth }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-6 px-4">
      <nav className="
        w-full max-w-5xl 
        bg-white/[0.03] backdrop-blur-md 
        border border-white/10 
        rounded-full 
        px-6 py-3 
        flex items-center justify-between
        shadow-lg shadow-black/50
      ">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f3ff] blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <ShieldCheck className="w-8 h-8 text-[#00f3ff] relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-wide font-['Space_Grotesk']">
            NEXUS<span className="text-[#00f3ff]">.SYS</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Analytics</a>
          <a href="#" className="hover:text-white transition-colors">Enterprise</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenAuth('login')}
            className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors px-3"
          >
            Log In
          </button>
          <NeonButton 
            variant="cyan" 
            onClick={() => onOpenAuth('register')}
            className="!py-2 !px-5 text-sm"
          >
            <Zap size={16} fill="currentColor" />
            <span>Get Started</span>
          </NeonButton>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;