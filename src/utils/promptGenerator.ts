import { Prompt, VocabularyItem } from '../types';
import { defaultPrompts } from '../data/prompts';
import { getVocabBank } from './storage';

export function getRandomPrompt(
  type?: 'writing' | 'speaking',
  mode?: string,
  difficulty?: 1 | 2 | 3
): Prompt {
  let filtered = [...defaultPrompts];

  if (type) {
    filtered = filtered.filter((p) => p.type === type);
  }
  if (mode) {
    filtered = filtered.filter((p) => p.mode === mode);
  }
  if (difficulty) {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }

  if (filtered.length === 0) {
    filtered = [...defaultPrompts];
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

export function getDailyPrompts(): {
  vocabBurst: VocabularyItem[];
  sentenceUpgrade: Prompt;
  miniWriting: Prompt;
  speakingSprint: Prompt;
} {
  const bank = getVocabBank();
  const unmastered = bank.filter((item) => !item.mastered);

  // Pick 5 random vocabulary items for the burst
  const shuffled = [...unmastered].sort(() => Math.random() - 0.5);
  const vocabBurst = shuffled.slice(0, 5);

  const sentenceUpgrade = getRandomPrompt('writing', 'sentence-upgrade');
  const miniWriting = getRandomPrompt('writing', 'mini-writing');
  const speakingSprint = getRandomPrompt('speaking', 'sprint');

  return {
    vocabBurst,
    sentenceUpgrade,
    miniWriting,
    speakingSprint,
  };
}

export function getPromptsByCategory(type: string, mode: string): Prompt[] {
  return defaultPrompts.filter((p) => p.type === type && p.mode === mode);
}
