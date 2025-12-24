
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry } from '../types';
import { analyzeMoodTrend } from '../services/geminiService';

interface MoodAnalyticsProps {
  entries: MoodEntry[];
}

const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ entries }) => {
  const [insight, setInsight] = useState<string>("Analyzing your mood patterns...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entries.length > 0) {
      setLoading(true);
      analyzeMoodTrend(entries.slice(-7)).then(res => {
        setInsight(res);
        setLoading(false);
      });
    }
  }, [entries]);

  const chartData = entries.slice(-14).map(e => ({
    date: new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: e.score,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-[32px]">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Mood Trends</h3>
        <p className="text-sm text-blue-700 mb-4">Tracking the last 14 entries</p>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[1, 5]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ fill: '#2563eb', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-blue-100 p-6 rounded-[32px] shadow-sm">
        <h4 className="font-bold text-slate-800 flex items-center mb-2">
          <span className="mr-2">💡</span> Lumina AI Insights
        </h4>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        ) : (
          <p className="text-slate-600 text-sm italic leading-relaxed">
            "{insight}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-5 rounded-[24px] text-center">
          <span className="block text-2xl font-black text-slate-800">{entries.length}</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Logs</span>
        </div>
        <div className="bg-slate-50 p-5 rounded-[24px] text-center">
          <span className="block text-2xl font-black text-slate-800">
            {entries.length > 0 ? (entries.reduce((a, b) => a + b.score, 0) / entries.length).toFixed(1) : '0'}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Avg</span>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
