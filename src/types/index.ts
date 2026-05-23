export type Category =
  | 'Work'
  | 'School'
  | 'Family'
  | 'Technology'
  | 'Transportation'
  | 'Housing'
  | 'Shopping'
  | 'Health'
  | 'Environment'
  | 'Complaints'
  | 'Opinions'
  | 'Emotions';

export interface VocabularyItem {
  id: string;
  weakWord: string;
  betterWord: string;
  exampleSentence: string;
  category: Category;
  difficulty: 1 | 2 | 3 | 4 | 5;
  timesPracticed: number;
  lastPracticed: string;
  mastered: boolean;
}

export interface PracticeHistory {
  id: string;
  date: string;
  type: 'writing' | 'speaking';
  mode: string;
  duration: number;
  vocabularyScore: 1 | 2 | 3 | 4 | 5;
  wordsUsed: string[];
  weakWordsFound: string[];
}

export interface UserStats {
  dailyStreak: number;
  lastPracticeDate: string;
  totalWritingDrills: number;
  totalSpeakingDrills: number;
  vocabularyPracticed: number;
  averageVocabularyScore: number;
  masteredWords: number;
}

export interface Prompt {
  id: string;
  type: 'writing' | 'speaking';
  mode: string;
  topic: string;
  prompt: string;
  targetVocabulary: string[];
  suggestedIdeas: string[];
  difficulty: 1 | 2 | 3;
}

export interface FeedbackResult {
  vocabularyScore: 1 | 2 | 3 | 4 | 5;
  repeatedWords: { word: string; count: number }[];
  weakWordsFound: string[];
  suggestedUpgrades: { original: string; suggestion: string }[];
  improvedVersion: string;
  practiceTip: string;
}

export interface AudioRecording {
  id: string;
  date: string;
  prompt: string;
  duration: number;
  blobUrl: string;
}
