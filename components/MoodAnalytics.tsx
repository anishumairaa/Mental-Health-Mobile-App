
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
      <div className="bg-indigo-50 p-4 rounded-2xl">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">Mood Trends</h3>
        <p className="text-sm text-indigo-700 mb-4">Tracking the last 14 entries</p>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[1, 5]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ fill: '#6366f1', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border p-4 rounded-2xl shadow-sm">
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
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <span className="block text-2xl font-bold text-slate-800">{entries.length}</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Total Check-ins</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <span className="block text-2xl font-bold text-slate-800">
            {entries.length > 0 ? (entries.reduce((a, b) => a + b.score, 0) / entries.length).toFixed(1) : '0'}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Avg. Mood</span>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
