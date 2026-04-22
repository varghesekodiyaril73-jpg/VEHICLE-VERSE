
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CarShowcase } from './components/CarShowcase';
import { LoginForm } from './components/LoginForm';
import { ChatWidget } from './components/ChatWidget';

// Types for navigation state
enum PageState {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

const App: React.FC = () => {
  const [page, setPage] = useState<PageState>(PageState.HOME);

  const navigateToHome = () => setPage(PageState.HOME);
  const navigateToLogin = () => setPage(PageState.LOGIN);
  const navigateToRegister = () => setPage(PageState.REGISTER);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon-blue selection:text-black overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-red/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          onLoginClick={navigateToLogin} 
          onRegisterClick={navigateToRegister} 
          onLogoClick={navigateToHome}
        />
        
        <main className="flex-grow flex flex-col">
          {page === PageState.HOME && (
            <>
              <Hero />
              <CarShowcase />
            </>
          )}

          {(page === PageState.LOGIN || page === PageState.REGISTER) && (
            <div className="flex-grow flex items-center justify-center p-4">
              <LoginForm type={page === PageState.LOGIN ? 'login' : 'register'} onClose={navigateToHome} />
            </div>
          )}
        </main>

        <footer className="py-8 border-t border-white/5 glass-panel mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-white/40 text-sm font-light">
            <p>&copy; 2024 NEON GARAGE. DESIGNED FOR THE ELITE.</p>
          </div>
        </footer>
      </div>

      {/* AI Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};

export default App;
