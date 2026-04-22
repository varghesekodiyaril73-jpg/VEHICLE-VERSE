import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 bg-[#020202]/90 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00f3ff] blur-sm opacity-50"></div>
                  <div className="w-2 h-2 rounded-full bg-[#00f3ff] relative z-10 animate-pulse" />
                </div>
                <span className="font-['Space_Grotesk'] font-bold text-sm tracking-widest text-white">NEXUS AI</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="h-80 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="flex justify-start">
                <div className="bg-white/5 text-gray-300 text-sm p-3 rounded-2xl rounded-tl-none max-w-[85%] border border-white/5 shadow-sm">
                  System Online. I am Nexus. How can I assist with your fleet operations today?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[#00f3ff]/10 text-[#00f3ff] text-sm p-3 rounded-2xl rounded-tr-none max-w-[85%] border border-[#00f3ff]/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                   I need to schedule an emergency breakdown service for Unit Alpha-9.
                </div>
              </div>
               <div className="flex justify-start">
                <div className="bg-white/5 text-gray-300 text-sm p-3 rounded-2xl rounded-tl-none max-w-[85%] border border-white/5 shadow-sm">
                  <span className="text-[#ff2a6d] font-bold text-xs uppercase block mb-1">Priority Alert</span>
                  Locating Unit Alpha-9... Coordinates locked. Nearest recovery drone dispatched. ETA: 8 minutes.
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/40">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter command..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]/40 focus:bg-white/[0.05] transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00f3ff] hover:text-white transition-colors p-1 rounded-md hover:bg-[#00f3ff]/10">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full 
          backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] border
          transition-all duration-300
          ${isOpen 
            ? 'bg-red-500/10 border-red-500/40 text-red-500 rotate-90' 
            : 'bg-[#00f3ff]/10 border-[#00f3ff]/40 text-[#00f3ff] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default Chatbot;