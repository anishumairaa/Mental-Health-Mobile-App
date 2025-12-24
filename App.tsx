
import React, { useState, useEffect } from 'react';
import { View, MoodEntry } from './types';
import Layout from './components/Layout';
import { MOOD_EMOJIS, ARTICLES, EMERGENCY_CONTACTS } from './constants';
import MoodAnalytics from './components/MoodAnalytics';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load from localStorage on mount (Offline Access)
  useEffect(() => {
    const saved = localStorage.getItem('lumina_mood_logs');
    if (saved) {
      setEntries(JSON.parse(saved));
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('lumina_mood_logs', JSON.stringify(entries));
  }, [entries]);

  const handleMoodCheckIn = () => {
    if (currentMood === null) return;
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      score: currentMood,
      note: note,
      tags: []
    };
    setEntries(prev => [newEntry, ...prev]);
    setCurrentMood(null);
    setNote('');
    // After checking in, maybe redirect to stats to see progress
    setCurrentView('stats');
  };

  const renderHome = () => {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {isOffline && (
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs flex items-center border border-amber-200">
            <span className="mr-2">🛜</span> Offline Mode: All your data is saved locally on your device.
          </div>
        )}

        <section>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{today}</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Hello, Friend.</h2>
          <p className="text-slate-500 text-sm">How are you feeling right now?</p>
          
          <div className="flex justify-between items-center mt-6">
            {MOOD_EMOJIS.map((m) => (
              <button
                key={m.score}
                onClick={() => setCurrentMood(m.score)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                  currentMood === m.score 
                    ? `${m.color} text-white scale-110 shadow-lg` 
                    : 'bg-slate-100 text-slate-400 grayscale'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-[10px] font-bold uppercase">{m.label}</span>
              </button>
            ))}
          </div>

          {currentMood && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Want to write about it? (Optional)"
                className="w-full p-4 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                rows={3}
              />
              <button
                onClick={handleMoodCheckIn}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
              >
                Save Check-in
              </button>
            </div>
          )}
        </section>

        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-xl">
          <h3 className="font-bold text-lg mb-2">Weekly Summary</h3>
          <p className="text-sm opacity-90 mb-4">You've logged {entries.length} moments this month. Keep going, small steps matter.</p>
          <button 
            onClick={() => setCurrentView('stats')}
            className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/30 transition-all"
          >
            View Full Report
          </button>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Suicide Awareness Hub</h3>
            <button onClick={() => setCurrentView('hub')} className="text-indigo-600 text-xs font-semibold">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ARTICLES.slice(0, 2).map(art => (
              <button 
                key={art.id}
                onClick={() => setCurrentView('hub')}
                className="p-4 bg-white border rounded-2xl text-left hover:border-indigo-200 transition-colors"
              >
                <span className="text-xs text-indigo-500 font-bold uppercase block mb-1">Article</span>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{art.title}</h4>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Knowledge Hub</h2>
        <p className="text-slate-500 text-sm">Learn how to protect yourself and others.</p>
      </div>

      <div className="space-y-4">
        {ARTICLES.map(art => (
          <div key={art.id} className="bg-white border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center mb-2">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                art.category === 'signs' ? 'bg-red-400' :
                art.category === 'myths' ? 'bg-blue-400' :
                art.category === 'helping' ? 'bg-green-400' : 'bg-purple-400'
              }`} />
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                {art.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{art.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{art.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Journal</h2>
          <p className="text-slate-500 text-sm">Reflect on your journey.</p>
        </div>
        <button 
          onClick={() => setCurrentView('home')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold"
        >
          New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📔</div>
          <p className="text-slate-400">Your journal is empty. Start by checking in on the home screen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const mood = MOOD_EMOJIS.find(m => m.score === entry.score);
            return (
              <div key={entry.id} className="bg-white border p-5 rounded-2xl shadow-sm hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{mood?.emoji}</span>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 uppercase tracking-tight">{mood?.label}</span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {entry.note ? (
                  <p className="text-sm text-slate-600 italic">"{entry.note}"</p>
                ) : (
                  <p className="text-sm text-slate-300 italic">No notes added for this check-in.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Mood Analysis</h2>
        <p className="text-slate-500 text-sm">Patterns and AI insights from your logs.</p>
      </div>
      <MoodAnalytics entries={entries} />
    </div>
  );

  const renderSOS = () => (
    <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-red-600">GET HELP NOW</h2>
        <button 
          onClick={() => setCurrentView('home')}
          className="bg-slate-100 p-2 rounded-full"
        >
          ✕
        </button>
      </div>

      <p className="text-slate-600 mb-8 leading-relaxed">
        If you are in immediate danger, please call your local emergency services (like 911) immediately. You are not alone.
      </p>

      <div className="space-y-4 flex-1 overflow-y-auto pb-4">
        {EMERGENCY_CONTACTS.map((contact, idx) => (
          <div key={idx} className="p-6 bg-red-50 border border-red-100 rounded-3xl">
            <h3 className="text-red-900 font-bold text-lg mb-1">{contact.name}</h3>
            <p className="text-red-700 text-sm mb-4">{contact.description}</p>
            <a 
              href={`tel:${contact.number}`}
              className="inline-flex items-center justify-center w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              📞 Call {contact.number}
            </a>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t mt-4">
        <p className="text-center text-xs text-slate-400 mb-4 uppercase tracking-widest font-bold">Safety Plan Quick Tips</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl text-[10px] font-medium text-slate-600">
            Hold something cold (ice cube) to ground yourself.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-[10px] font-medium text-slate-600">
            Focus on taking 5 slow breaths.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {currentView === 'home' && renderHome()}
      {currentView === 'hub' && renderHub()}
      {currentView === 'journal' && renderJournal()}
      {currentView === 'stats' && renderStats()}
      {currentView === 'sos' && renderSOS()}
    </Layout>
  );
};

export default App;
