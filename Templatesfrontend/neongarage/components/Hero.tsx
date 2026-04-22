import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-b from-neon-blue/20 to-transparent blur-[100px] opacity-30"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-neon-blue/30 bg-neon-blue/5 text-neon-blue text-xs tracking-[0.2em] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-blue"></span>
          LIVE GARAGE FEED
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          Automotive <br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-red">Perfection</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Experience the pinnacle of engineering. A curated collection of the world's most exclusive machines, visualized in high-fidelity liquid glass interfaces.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Button variant="primary" className="w-full md:w-auto min-w-[160px]">
            ENTER GARAGE <ArrowRight size={16} />
          </Button>
          <Button variant="ghost" className="w-full md:w-auto">
            WATCH TRAILER
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
        <ChevronDown size={24} />
      </div>
    </section>
  );
};