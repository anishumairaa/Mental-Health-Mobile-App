
import React from 'react';
import { HubArticle, EmergencyContact } from './types';

export const ARTICLES: HubArticle[] = [
  {
    id: '1',
    category: 'signs',
    emoji: '🚩',
    readTime: '3 min',
    title: 'Warning Signs to Watch For',
    content: 'Suicide doesn\'t always have obvious "tells," but there are often behavioral changes. \n\nLook for: \n\nTalking about wanting to die, extreme mood swings, giving away prized possessions, withdrawing from friends, or sleeping too much/little. \n\n\nIf someone is exhibiting these behaviors, especially if they are new or increased, it\'s time to reach out.'
  },
  {
    id: '2',
    category: 'myths',
    emoji: '🔍',
    readTime: '2 min',
    title: 'Myths vs. Facts',
    content: 'Myth: Asking someone if they are suicidal will plant the idea in their head. \n\nFact: Research shows that asking directly about suicide actually reduces the risk and provides the individual with a sense of relief that someone noticed. \n\nMyth: Only people with mental health issues die by suicide. \n\nFact: Many factors contribute to suicide, including stress, financial hardship, and relationship problems.'
  },
  {
    id: '3',
    category: 'helping',
    emoji: '🤝',
    readTime: '4 min',
    title: 'How to Help a Friend',
    content: '\n1. Ask directly: "Are you thinking about suicide?" \n\n2. Listen without judgment. \n\n3. Keep them safe: Reduce access to lethal means. \n\n4. Help them connect: Contact a crisis line or professional. \n\n5. Stay in touch: Follow-up matters significantly in recovery.'
  },
  {
    id: '4',
    category: 'coping',
    emoji: '🧘‍♀️',
    readTime: '3 min',
    title: 'Immediate Coping Strategies',
    content: 'When feeling overwhelmed: \n\n1. Try the 5-4-3-2-1 grounding technique. \n\n2. Reach out to a trusted "safe person". \n\n3. Delay any decisions for just 5 minutes, then another 5. \n\n4. Use a physical distraction like holding an ice cube. \n\n5. Remember that feelings are temporary, even if they feel permanent right now.'
  }
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Mental Illness Awareness & Support Lifeline',
    number: '1800 180 066',
    description: '24/7, free and confidential support by MIASA Association.'
  },
  {
    name: 'Talian Kasih Lifeline',
    number: '15999',
    description: 'Or text +6019 261 5999 to connect using WhatsApp Messenger.'
  }
];

export const MOOD_EMOJIS = [
  { score: 1, label: 'Crisis', emoji: '😫', color: 'bg-blue-900' },
  { score: 2, label: 'Struggling', emoji: '😔', color: 'bg-blue-700' },
  { score: 3, label: 'Okay', emoji: '😐', color: 'bg-blue-400' },
  { score: 4, label: 'Good', emoji: '🙂', color: 'bg-cyan-500' },
  { score: 5, label: 'Great', emoji: '🌟', color: 'bg-emerald-500' },
];
