
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, MoodEntry, HubArticle } from './types';
import Layout from './components/Layout';
import { MOOD_EMOJIS, ARTICLES, EMERGENCY_CONTACTS } from './constants';
import MoodAnalytics from './components/MoodAnalytics';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // State for Calendar and Timeline
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hub View States
  const [selectedArticle, setSelectedArticle] = useState<HubArticle | null>(null);

  // AI Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hello. I'm Luminar, your supportive listener. How are you feeling today? I'm here to listen without judgment." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

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

  useEffect(() => {
    localStorage.setItem('lumina_mood_logs', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMoodCheckIn = () => {
    if (currentMood === null) return;
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      timestamp: selectedDate.getTime(),
      score: currentMood,
      note: note,
      tags: []
    };
    setEntries(prev => [newEntry, ...prev]);
    setCurrentMood(null);
    setNote('');
    setCurrentView('stats');
  };

  const weekDays = useMemo(() => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay() - 7); 
    
    for (let i = 0; i < 21; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dateNum: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
        isSelected: d.toDateString() === selectedDate.toDateString(),
        fullDate: d,
        hasEntry: entries.some(e => new Date(e.timestamp).toDateString() === d.toDateString())
      });
    }
    return dates;
  }, [selectedDate, entries]);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      if (!chatInstanceRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatInstanceRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: "You are Luminar, a compassionate and non-judgmental mental health companion. Your goal is to provide a safe space for users to talk about their feelings. Use active listening, validate their emotions, and offer gentle support. If a user expresses immediate self-harm or suicidal intent, compassionately urge them to use the 'SOS Help' feature in the app or call emergency services immediately. You are a listener, not a doctor. Keep responses warm and concise.",
          }
        });
      }

      const result = await chatInstanceRef.current.sendMessageStream({ message: userMessage });
      
      let aiResponseText = "";
      setMessages(prev => [...prev, { role: 'ai', text: "" }]);

      for await (const chunk of result) {
        const chunkText = chunk.text;
        aiResponseText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponseText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting right now. Please remember I'm here for you, and if you're in crisis, please use the SOS button." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderChat = () => (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-8 pt-8 pb-4 bg-gradient-to-b from-blue-50 to-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Supportive Chat</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Safe & Judgment-Free Space</p>
          </div>
          <button 
            onClick={() => setCurrentView('sos')}
            className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-lg shadow-blue-100 uppercase tracking-widest"
          >
            SOS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 space-y-6 pt-4 min-h-[50vh]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-5 rounded-[32px] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-100' 
                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {msg.text || (isTyping && idx === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="px-8 pt-4 pb-8 bg-white sticky bottom-0 border-t border-slate-50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tell me what's on your mind..."
            className="w-full bg-slate-50 border-none rounded-[24px] py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isTyping ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {isTyping ? '...' : '→'}
          </button>
        </div>
        <p className="text-center text-[8px] text-slate-400 mt-3 font-bold uppercase tracking-[0.1em]">
          Conversations are private and encrypted.
        </p>
      </div>
    </div>
  );

  const renderHub = () => (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">The<br/>Knowledge Hub</h2>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Signs', 'Helping', 'Coping'].map(cat => (
            <button key={cat} className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap active:bg-blue-600 active:text-white transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Featured Card */}
        <div 
          onClick={() => setSelectedArticle(ARTICLES[0])}
          className="relative bg-blue-600 rounded-[48px] p-8 text-white overflow-hidden shadow-2xl shadow-blue-200 cursor-pointer group hover:scale-[1.02] transition-transform"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          <span className="text-5xl mb-6 block drop-shadow-lg">{ARTICLES[0].emoji}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 block">Featured • {ARTICLES[0].readTime}</span>
          <h3 className="text-2xl font-black leading-tight mb-4">{ARTICLES[0].title}</h3>
          <p className="text-sm opacity-80 line-clamp-2 leading-relaxed">{ARTICLES[0].content}</p>
        </div>

        {/* Regular Grid Cards */}
        <div className="grid grid-cols-2 gap-4">
          {ARTICLES.slice(1).map(art => (
            <div 
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white border border-slate-100 rounded-[40px] p-6 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {art.emoji}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 mb-1 block">{art.category}</span>
              <h4 className="text-sm font-black text-slate-800 leading-tight mb-3">{art.title}</h4>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{art.readTime} Read</span>
            </div>
          ))}
        </div>

        {/* Helpful Tip Section */}
        <div className="mt-8 bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 flex items-center">
           <div className="mr-6 text-3xl">🌿</div>
           <div>
             <h4 className="font-black text-emerald-900 text-sm mb-1 uppercase tracking-tight">Daily Mindful Moment</h4>
             <p className="text-emerald-700 text-xs leading-relaxed">Focus on your breathing for just 60 seconds. It can reset your nervous system.</p>
           </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-xl flex items-end justify-center animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-t-[60px] p-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black uppercase tracking-widest">
                  {selectedArticle.category}
                </span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="text-center mb-10">
                <span className="text-7xl mb-6 block">{selectedArticle.emoji}</span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">{selectedArticle.title}</h2>
                <div className="flex justify-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>{selectedArticle.readTime} Reading</span>
                  <span>•</span>
                  <span>Verified Safe</span>
                </div>
              </div>

              <div className="space-y-6 text-slate-600 leading-[1.8] text-sm font-medium">
                {selectedArticle.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest mt-10 hover:bg-black active:scale-95 transition-all shadow-xl"
              >
                Close Article
              </button>
           </div>
        </div>
      )}
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Journal</h2>
          <p className="text-slate-500 text-sm mt-2">Your collection of reflections.</p>
        </div>
        <button 
          onClick={() => setCurrentMood(3)}
          className="w-12 h-12 bg-blue-600 text-white rounded-[20px] flex items-center justify-center text-2xl shadow-xl shadow-blue-100"
        >
          +
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Your journey begins here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const mood = MOOD_EMOJIS.find(m => m.score === entry.score);
            return (
              <div key={entry.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex items-start group hover:border-blue-200 transition-all">
                <span className="text-4xl mr-6 shrink-0 group-hover:scale-110 transition-transform">{mood?.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium">{entry.note || "A silent reflection."}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Statistics</h2>
        <p className="text-slate-500 text-sm mt-2">Visualizing your emotional landscape.</p>
      </div>
      <MoodAnalytics entries={entries} />
    </div>
  );

  const renderSOS = () => (
    <div className="fixed inset-0 z-[120] bg-white p-10 flex flex-col animate-in fade-in slide-in-from-bottom duration-500 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-blue-900 tracking-tighter leading-none">HELP IS<br/>HERE</h2>
        <button 
          onClick={() => setCurrentView('home')}
          className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-500"
        >
          ✕
        </button>
      </div>

      <p className="text-slate-500 mb-10 leading-relaxed font-medium">
        If you are in immediate danger, please call your local emergency services immediately. Your presence here matters.
      </p>

      <div className="space-y-6 flex-1">
        {EMERGENCY_CONTACTS.map((contact, idx) => (
          <div key={idx} className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] shadow-sm">
            <h3 className="text-blue-900 font-black text-xl mb-2">{contact.name}</h3>
            <p className="text-blue-700 text-sm mb-6 font-medium leading-snug opacity-80">{contact.description}</p>
            <a 
              href={`tel:${contact.number}`}
              className="inline-flex items-center justify-center w-full bg-blue-700 text-white font-black py-5 rounded-[24px] shadow-xl shadow-blue-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              📞 Call {contact.number}
            </a>
          </div>
        ))}
      </div>

      <div className="pt-10 border-t border-slate-100 mt-8">
        <p className="text-center text-[10px] text-slate-400 mb-6 uppercase tracking-[0.2em] font-black">Grounding Exercises</p>
        <div className="grid grid-cols-2 gap-5">
          <div className="p-6 bg-slate-50 rounded-[32px] text-[10px] font-black text-slate-600 uppercase tracking-widest text-center leading-relaxed">
            HOLD AN ICE CUBE
          </div>
          <div className="p-6 bg-slate-50 rounded-[32px] text-[10px] font-black text-slate-600 uppercase tracking-widest text-center leading-relaxed">
            COUNT 5 SENSES
          </div>
        </div>
      </div>
    </div>
  );

  const renderFullCalendar = () => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const startDay = monthStart.getDay();
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));

    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{selectedDate.getFullYear()}</p>
              <h3 className="text-2xl font-black tracking-tight">{selectedDate.toLocaleDateString('en-US', { month: 'long' })}</h3>
            </div>
            <button onClick={() => setShowFullCalendar(false)} className="bg-white/20 p-2 rounded-full">✕</button>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>
              ))}
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const hasEntry = entries.some(e => new Date(e.timestamp).toDateString() === day.toDateString());
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowFullCalendar(false);
                    }}
                    className={`h-10 w-full rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${
                      isSelected ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-200' : 
                      isToday ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {day.getDate()}
                    {hasEntry && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                className="text-blue-600 font-black text-xs uppercase tracking-widest"
              >
                ← Prev
              </button>
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                className="text-blue-600 font-black text-xs uppercase tracking-widest"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => {
    const todayMonthYear = selectedDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <div className="animate-in fade-in duration-500">
        <section className="-mx-6 -mt-4 p-8 bg-gradient-to-b from-blue-50 to-white text-center">
          <div className="flex justify-between items-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🦋</div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{todayMonthYear}</h3>
            <button 
              onClick={() => setShowFullCalendar(true)} 
              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all shadow-sm"
            >
              🗓️
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto pb-6 px-2 scrollbar-hide snap-x"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {weekDays.map((day, idx) => (
              <div 
                key={idx} 
                data-selected={day.isSelected}
                onClick={() => setSelectedDate(day.fullDate)}
                className="flex flex-col items-center flex-shrink-0 snap-center cursor-pointer"
              >
                <span className={`text-[10px] font-black mb-3 uppercase tracking-widest transition-colors ${day.isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                  {day.isToday && !day.isSelected ? 'Today' : day.dayName}
                </span>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black transition-all relative ${
                  day.isSelected 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-white scale-110' 
                    : day.hasEntry 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-slate-400 border border-slate-100 bg-white'
                }`}>
                  {day.dateNum}
                  {day.hasEntry && !day.isSelected && (
                    <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="py-6">
             <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
               {selectedDate.toDateString() === new Date().toDateString() ? 'Peaceful Day' : 'Reflection'}
             </h2>
             <p className="text-slate-500 text-sm max-w-[260px] mx-auto leading-relaxed">
               {selectedDate.toDateString() === new Date().toDateString() 
                 ? "How is your heart feeling today? Take a moment." 
                 : `Reviewing your state from ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}
             </p>
          </div>

          <button 
             onClick={() => setCurrentMood(3)}
             className="mt-4 bg-white border-2 border-blue-100 text-blue-600 px-10 py-3 rounded-full text-sm font-black shadow-lg shadow-blue-50 hover:bg-blue-50 transition-all active:scale-95 uppercase tracking-widest"
          >
            {selectedDate.toDateString() === new Date().toDateString() ? 'Check-in Today' : `Log for ${selectedDate.getDate()}`}
          </button>
        </section>

        <div className="px-8 space-y-8">
          <section className="pt-2">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-slate-800 tracking-tight">Quick Tools</h3>
            </div>
            
            <div className="flex space-x-5 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
              <div onClick={() => setCurrentView('chat')} className="cursor-pointer flex-shrink-0 w-40 h-52 bg-blue-600 rounded-[40px] p-6 flex flex-col justify-between text-white shadow-xl shadow-blue-100 overflow-hidden relative">
                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Listener</span>
                <p className="text-sm font-black leading-tight">Talk to Luminar Assistant</p>
                <div className="text-3xl">💬</div>
              </div>

              <div onClick={() => setCurrentView('sos')} className="cursor-pointer flex-shrink-0 w-40 h-52 bg-red-900 rounded-[40px] p-6 flex flex-col justify-between text-white shadow-2xl shadow-blue-200 overflow-hidden relative">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Emergency</span>
                <p className="text-sm font-black leading-tight">SOS Crisis Support</p>
                <button className="mt-2 text-[10px] font-black bg-white/20 py-2 rounded-full uppercase tracking-tighter">Get Help</button>
              </div>

              <div className="flex-shrink-0 w-40 h-52 bg-slate-800 rounded-[40px] p-6 flex flex-col justify-between text-white shadow-xl overflow-hidden">
                 <span className="text-[10px] font-black uppercase opacity-40">Resources</span>
                 <p className="text-sm font-black leading-tight">Self-Care Hub</p>
                 <div className="text-3xl">🧘‍♂️</div>
              </div>
            </div>
          </section>
        </div>

        {currentMood && (
          <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
             <div className="bg-white w-full max-w-md rounded-t-[50px] p-10 space-y-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Reflection</h2>
                  <button onClick={() => setCurrentMood(null)} className="text-slate-400 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full">✕</button>
                </div>

                <div className="flex justify-between items-center py-4 px-2">
                  {MOOD_EMOJIS.map((m) => (
                    <button
                      key={m.score}
                      onClick={() => setCurrentMood(m.score)}
                      className={`flex flex-col items-center transition-all duration-300 ${
                        currentMood === m.score ? 'scale-125 -translate-y-2' : 'opacity-30 grayscale'
                      }`}
                    >
                      <span className="text-5xl mb-2 drop-shadow-sm">{m.emoji}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${currentMood === m.score ? 'text-blue-600' : 'text-slate-400'}`}>{m.label}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="w-full p-6 bg-slate-50 border-none rounded-[32px] text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all h-40 resize-none"
                />

                <button
                  onClick={handleMoodCheckIn}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-100 uppercase tracking-widest"
                >
                  Save Reflection
                </button>
             </div>
          </div>
        )}
        {showFullCalendar && renderFullCalendar()}
      </div>
    );
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {currentView === 'home' && renderHome()}
      {currentView === 'chat' && renderChat()}
      {currentView === 'hub' && renderHub()}
      {currentView === 'journal' && renderJournal()}
      {currentView === 'stats' && renderStats()}
      {currentView === 'sos' && renderSOS()}
    </Layout>
  );
};

export default App;
