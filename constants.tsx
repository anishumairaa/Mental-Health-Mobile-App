
import React from 'react';
import { HubArticle, EmergencyContact } from './types';

export const ARTICLES: HubArticle[] = [
  {
    id: '1',
    category: 'signs',
    title: 'Warning Signs to Watch For',
    content: 'Suicide doesn\'t always have obvious "tells," but there are often behavioral changes. Look for: Talking about wanting to die, extreme mood swings, giving away prized possessions, withdrawing from friends, or sleeping too much/little. If someone is exhibiting these behaviors, especially if they are new or increased, it\'s time to reach out.'
  },
  {
    id: '2',
    category: 'myths',
    title: 'Myths vs. Facts',
    content: 'Myth: Asking someone if they are suicidal will plant the idea in their head. Fact: Research shows that asking directly about suicide actually reduces the risk and provides the individual with a sense of relief that someone noticed. Myth: Only people with mental health issues die by suicide. Fact: Many factors contribute to suicide, including stress, financial hardship, and relationship problems.'
  },
  {
    id: '3',
    category: 'helping',
    title: 'How to Help a Friend',
    content: '1. Ask directly: "Are you thinking about suicide?" 2. Listen without judgment. 3. Keep them safe: Reduce access to lethal means. 4. Help them connect: Contact a crisis line or professional. 5. Stay in touch: Follow-up matters significantly in recovery.'
  },
  {
    id: '4',
    category: 'coping',
    title: 'Immediate Coping Strategies',
    content: 'When feeling overwhelmed: 1. Try the 5-4-3-2-1 grounding technique. 2. Reach out to a trusted "safe person". 3. Delay any decisions for just 5 minutes, then another 5. 4. Use a physical distraction like holding an ice cube or taking a cold shower. 5. Remember that feelings are temporary, even if they feel permanent right now.'
  }
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: '24/7, free and confidential support for people in distress.'
  },
  {
    name: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME to 741741 to connect with a Crisis Counselor.'
  }
];

export const MOOD_EMOJIS = [
  { score: 1, label: 'Crisis', emoji: '😫', color: 'bg-blue-900' },
  { score: 2, label: 'Struggling', emoji: '😔', color: 'bg-blue-700' },
  { score: 3, label: 'Okay', emoji: '😐', color: 'bg-blue-400' },
  { score: 4, label: 'Good', emoji: '🙂', color: 'bg-cyan-500' },
  { score: 5, label: 'Great', emoji: '🌟', color: 'bg-emerald-500' },
];
