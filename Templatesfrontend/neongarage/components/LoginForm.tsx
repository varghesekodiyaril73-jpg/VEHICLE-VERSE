import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';
import { Button } from './Button';

interface LoginFormProps {
  type: 'login' | 'register';
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ type, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const isLogin = type === 'login';

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative background blurs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-blue/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-neon-red/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 backdrop-blur-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-wide">
            {isLogin ? 'WELCOME BACK' : 'JOIN THE ELITE'}
          </h2>
          <p className="text-white/40 text-sm">
            {isLogin ? 'Authenticate to access your garage.' : 'Begin your journey with NeonGarage.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="group relative">
              <UserIcon className="absolute top-3 left-3 text-white/30 w-5 h-5 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="text"
                placeholder="DRIVER NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all font-sans"
              />
            </div>
          )}

          <div className="group relative">
            <Mail className="absolute top-3 left-3 text-white/30 w-5 h-5 group-focus-within:text-neon-blue transition-colors" />
            <input
              type="email"
              placeholder="EMAIL ACCESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all font-sans"
            />
          </div>

          <div className="group relative">
            <Lock className="absolute top-3 left-3 text-white/30 w-5 h-5 group-focus-within:text-neon-blue transition-colors" />
            <input
              type="password"
              placeholder="SECURITY KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all font-sans"
            />
          </div>

          <Button 
            variant="primary" 
            className="w-full py-4 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {isLogin ? 'INITIATE SESSION' : 'CREATE ID'}
          </Button>

          <div className="text-center mt-6">
            <a href="#" className="text-xs text-white/30 hover:text-neon-blue transition-colors underline decoration-white/10 underline-offset-4">
              {isLogin ? 'FORGOT SECURITY KEY?' : 'ALREADY HAVE ACCESS?'}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};