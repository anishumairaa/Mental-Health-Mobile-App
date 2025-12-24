
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'hub', label: 'Hub', icon: '📚' },
    { id: 'journal', label: 'Journal', icon: '✍️' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b bg-white sticky top-0 z-20">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Lumina</h1>
        <button 
          onClick={() => setView('sos')}
          className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-bold animate-pulse hover:bg-red-200 transition-colors"
        >
          SOS HELP
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t px-6 py-3 flex justify-between items-center z-20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center transition-all ${
              currentView === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
