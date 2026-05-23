import { FeedbackResult } from '../types';

export const WEAK_WORDS: string[] = [
  'good',
  'bad',
  'very',
  'nice',
  'thing',
  'stuff',
  'big',
  'small',
  'happy',
  'sad',
  'many',
  'important',
  'problem',
];

export const REPLACEMENTS: Record<string, string[]> = {
  good: ['excellent', 'outstanding', 'remarkable', 'exceptional'],
  bad: ['inadequate', 'substandard', 'unacceptable', 'dreadful'],
  very: ['extremely', 'exceptionally', 'remarkably', 'incredibly'],
  nice: ['delightful', 'thoughtful', 'pleasant', 'supportive'],
  thing: ['aspect', 'element', 'factor', 'concept'],
  stuff: ['materials', 'belongings', 'resources', 'items'],
  big: ['substantial', 'significant', 'considerable', 'enormous'],
  small: ['modest', 'compact', 'minimal', 'slight'],
  happy: ['thrilled', 'delighted', 'ecstatic', 'elated'],
  sad: ['disappointed', 'devastated', 'heartbroken', 'disheartened'],
  many: ['numerous', 'countless', 'several', 'a multitude of'],
  important: ['crucial', 'essential', 'vital', 'paramount'],
  problem: ['challenge', 'obstacle', 'issue', 'concern'],
};

export function analyzeSentence(text: string): {
  weakWords: string[];
  repeatedWords: { word: string; count: number }[];
} {
  const words = text.toLowerCase().split(/\s+/);
  const weakWordsFound: string[] = [];
  const wordCounts: Record<string, number> = {};

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (!cleanWord) continue;

    if (WEAK_WORDS.includes(cleanWord) && !weakWordsFound.includes(cleanWord)) {
      weakWordsFound.push(cleanWord);
    }

    wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
  }

  const repeatedWords = Object.entries(wordCounts)
    .filter(([, count]) => count > 1)
    .filter(([word]) => word.length > 3)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return { weakWords: weakWordsFound, repeatedWords };
}

export function calculateVocabularyScore(text: string): 1 | 2 | 3 | 4 | 5 {
  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return 1;

  let weakCount = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (WEAK_WORDS.includes(cleanWord)) {
      weakCount++;
    }
  }

  const weakRatio = weakCount / totalWords;

  if (weakRatio === 0) return 5;
  if (weakRatio < 0.05) return 4;
  if (weakRatio < 0.1) return 3;
  if (weakRatio < 0.2) return 2;
  return 1;
}

export function generateImprovedVersion(text: string): string {
  let improved = text;
  for (const [weak, replacements] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    improved = improved.replace(regex, replacements[0]);
  }
  return improved;
}

export function generateFeedback(text: string, _mode?: string): FeedbackResult {
  const { weakWords, repeatedWords } = analyzeSentence(text);
  const vocabularyScore = calculateVocabularyScore(text);

  const suggestedUpgrades = weakWords.map((word) => ({
    original: word,
    suggestion: REPLACEMENTS[word]
      ? REPLACEMENTS[word].slice(0, 2).join(' or ')
      : 'a more specific word',
  }));

  const improvedVersion = generateImprovedVersion(text);

  let practiceTip = '';
  if (vocabularyScore <= 2) {
    practiceTip =
      'Try replacing common words like "good", "bad", and "very" with more descriptive alternatives. This will make your writing sound more professional.';
  } else if (vocabularyScore <= 3) {
    practiceTip =
      'You are making progress! Focus on eliminating the remaining weak words and varying your sentence structure.';
  } else if (vocabularyScore <= 4) {
    practiceTip =
      'Great vocabulary usage! Try incorporating more advanced connectors like "furthermore", "consequently", and "nevertheless".';
  } else {
    practiceTip =
      'Excellent work! Your vocabulary is strong. Keep practicing to maintain this level and explore even more sophisticated expressions.';
  }

  return {
    vocabularyScore,
    repeatedWords,
    weakWordsFound: weakWords,
    suggestedUpgrades,
    improvedVersion,
    practiceTip,
  };
}

export async function analyzeWithAI(
  text: string,
  mode: string
): Promise<FeedbackResult> {
  // Placeholder: falls back to rule-based analysis
  // In the future, this could integrate with an AI API
  return generateFeedback(text, mode);
}
