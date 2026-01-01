
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'home', label: 'Today', icon: '🗓️' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'hub', label: 'Hub', icon: '📚' },
    { id: 'journal', label: 'Journal', icon: '✍️' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Dynamic Header */}
      {currentView !== 'home' && currentView !== 'chat' && (
        <header className="px-8 py-5 flex justify-between items-center border-b bg-white sticky top-0 z-20">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Luminar</h1>
          <button 
            onClick={() => setView('sos')}
            className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-blue-100 uppercase tracking-widest"
          >
            SOS
          </button>
        </header>
      )}

      {/* Main Content with generous margins */}
      <main className={`flex-1 overflow-y-auto ${currentView === 'home' || currentView === 'chat' ? 'pb-28' : 'px-8 py-6 pb-28'}`}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t px-6 py-5 flex justify-between items-center z-20 rounded-t-[40px] shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center transition-all duration-300 ${
              currentView === item.id ? 'text-blue-600 -translate-y-1' : 'text-slate-400 opacity-60'
            }`}
          >
            <span className={`text-2xl mb-1 ${currentView === item.id ? 'scale-110 drop-shadow-md' : ''}`}>{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
