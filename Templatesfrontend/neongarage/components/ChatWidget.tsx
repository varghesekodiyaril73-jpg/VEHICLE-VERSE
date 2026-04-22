
import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      <div 
        className={`
          w-[350px] h-[500px] glass-panel rounded-2xl border border-neon-blue/30 overflow-hidden flex flex-col transition-all duration-500 origin-bottom-right shadow-[0_0_40px_rgba(0,0,0,0.8)]
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none absolute bottom-0 right-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.2)]">
              <Bot size={18} className="text-neon-blue" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-wider">NEON ASSISTANT</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-white/50 font-mono">ONLINE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin">
          {/* Bot Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
              <Bot size={14} className="text-white/60" />
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 leading-relaxed shadow-sm max-w-[85%]">
              <p>Welcome to the Garage. I can assist you with vehicle specs, financing options, or schedule a private viewing.</p>
            </div>
          </div>

          {/* User Message (Simulation) */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="bg-neon-blue/10 border border-neon-blue/30 p-3 rounded-2xl rounded-tr-none text-xs text-white leading-relaxed shadow-[0_0_15px_rgba(0,243,255,0.1)] max-w-[85%]">
              <p>Tell me more about the LaFerrari specs.</p>
            </div>
          </div>

           {/* Bot Response (Simulation) */}
           <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
              <Bot size={14} className="text-white/60" />
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-white/80 leading-relaxed shadow-sm max-w-[85%]">
              <p>The LaFerrari features a 6.3L V12 hybrid engine producing <span className="text-neon-red font-bold">949 HP</span>. It accelerates from 0-60 in under 2.4 seconds.</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ASK ANYTHING..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all font-sans"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-neon-blue/10 text-neon-blue flex items-center justify-center border border-neon-blue/30 hover:bg-neon-blue hover:text-black transition-all duration-300">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group
          ${isOpen ? 'bg-white text-black rotate-90' : 'glass-panel border-neon-blue/50 text-neon-blue hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:border-neon-blue'}
        `}
      >
        {/* Button Glow Effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border border-neon-blue opacity-50 animate-ping"></div>
        )}
        
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-red rounded-full border border-black animate-pulse"></div>
          </div>
        )}
      </button>
    </div>
  );
};
