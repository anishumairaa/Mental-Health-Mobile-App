
export interface MoodEntry {
  id: string;
  timestamp: number;
  score: number; // 1-5 scale
  note: string;
  tags: string[];
}

export interface HubArticle {
  id: string;
  category: 'signs' | 'myths' | 'helping' | 'coping';
  title: string;
  content: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
}

export type View = 'home' | 'hub' | 'journal' | 'stats' | 'sos';
