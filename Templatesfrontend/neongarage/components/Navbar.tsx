import React from 'react';
import { Menu, Search, User } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick, onLogoClick }) => {
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-neon-red to-neon-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,0,51,0.5)]">
            <div className="w-4 h-4 bg-black rounded rotate-45"></div>
          </div>
          <span className="text-2xl font-display font-bold tracking-wider text-white group-hover:text-neon-blue transition-colors duration-300">
            NEON<span className="font-light text-white/70">GARAGE</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest text-white/70">
          {['COLLECTION', 'CONCEPTS', 'VISUALIZER'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="hover:text-white transition-colors relative py-2 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-neon-blue group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
            <Search className="w-4 h-4 text-white/50" />
            <input 
              type="text" 
              placeholder="SEARCH VIN..." 
              className="bg-transparent border-none outline-none text-xs ml-2 w-24 text-white placeholder-white/30"
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onLoginClick}>
              LOGIN
            </Button>
            <Button variant="primary" onClick={onRegisterClick}>
              REGISTER
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};