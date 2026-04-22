import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AuthModalProps } from '../types';
import GlassCard from './ui/GlassCard';
import NeonButton from './ui/NeonButton';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md z-10"
        >
          <GlassCard className="p-8 border-t border-t-[#00f3ff]/50 shadow-[0_0_50px_rgba(0,243,255,0.15)]">
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 tracking-wider">
                {mode === 'login' ? 'SYSTEM ACCESS' : 'NEW REGISTRATION'}
              </h2>
              <p className="text-xs text-[#00f3ff] uppercase tracking-[0.2em] animate-pulse">
                Secure Connection Established
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {mode === 'register' && (
                 <div className="relative group">
                 <User className="absolute left-0 top-2 text-gray-500 group-focus-within:text-[#bc13fe] transition-colors" size={20} />
                 <input
                   type="text"
                   placeholder="Full Name"
                   className="w-full bg-transparent border-b border-white/20 py-2 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-[#bc13fe] transition-all duration-300"
                 />
               </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-0 top-2 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Official Email"
                  className="w-full bg-transparent border-b border-white/20 py-2 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-0 top-2 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passcode"
                  className="w-full bg-transparent border-b border-white/20 py-2 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] transition-all duration-300"
                />
              </div>

              <NeonButton 
                variant={mode === 'login' ? 'cyan' : 'purple'} 
                className="w-full justify-center mt-8 !rounded-lg"
              >
                {mode === 'login' ? 'Authenticate' : 'Initialize Account'} 
                <ArrowRight size={16} />
              </NeonButton>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {mode === 'login' ? (
                <>
                  No access ID?{' '}
                  <button onClick={() => onSwitchMode('register')} className="text-[#bc13fe] hover:underline hover:text-white transition-colors">
                    Register Unit
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button onClick={() => onSwitchMode('login')} className="text-[#00f3ff] hover:underline hover:text-white transition-colors">
                    Login Here
                  </button>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;