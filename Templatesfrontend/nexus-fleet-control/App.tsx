import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Background from './components/Background';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import { AuthMode } from './types';

const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const handleOpenAuth = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  const handleCloseAuth = () => {
    setAuthMode(null);
  };

  return (
    <div className="relative min-h-screen text-white selection:bg-[#00f3ff] selection:text-black">
      {/* Global Background */}
      <Background />

      {/* Main Content */}
      <div className={`transition-all duration-500 ${authMode ? 'blur-sm scale-[0.98]' : ''}`}>
        <Navbar onOpenAuth={handleOpenAuth} />
        <main>
          <Hero onOpenAuth={handleOpenAuth} />
          <Services />
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
          <p>© 2024 NEXUS SYSTEMS. All rights reserved.</p>
        </footer>
      </div>

      {/* Floating Elements */}
      <Chatbot />

      {/* Overlays */}
      <AuthModal 
        isOpen={!!authMode} 
        mode={authMode} 
        onClose={handleCloseAuth} 
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

export default App;