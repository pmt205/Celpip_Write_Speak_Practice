import { VocabularyItem, PracticeHistory, UserStats, AudioRecording } from '../types';
import { defaultVocabulary } from '../data/vocabulary';

const KEYS = {
  vocabBank: 'celpip_vocab_bank',
  practiceHistory: 'celpip_practice_history',
  userStats: 'celpip_user_stats',
  savedAudio: 'celpip_saved_audio',
} as const;

export function getVocabBank(): VocabularyItem[] {
  const stored = localStorage.getItem(KEYS.vocabBank);
  if (stored) {
    return JSON.parse(stored) as VocabularyItem[];
  }
  saveVocabBank(defaultVocabulary);
  return [...defaultVocabulary];
}

export function saveVocabBank(items: VocabularyItem[]): void {
  localStorage.setItem(KEYS.vocabBank, JSON.stringify(items));
}

export function getPracticeHistory(): PracticeHistory[] {
  const stored = localStorage.getItem(KEYS.practiceHistory);
  if (stored) {
    return JSON.parse(stored) as PracticeHistory[];
  }
  return [];
}

export function savePracticeHistory(history: PracticeHistory[]): void {
  localStorage.setItem(KEYS.practiceHistory, JSON.stringify(history));
}

export function addPracticeEntry(entry: PracticeHistory): void {
  const history = getPracticeHistory();
  history.unshift(entry);
  savePracticeHistory(history);
}

export function getUserStats(): UserStats {
  const stored = localStorage.getItem(KEYS.userStats);
  if (stored) {
    return JSON.parse(stored) as UserStats;
  }
  const initial: UserStats = {
    dailyStreak: 0,
    lastPracticeDate: '',
    totalWritingDrills: 0,
    totalSpeakingDrills: 0,
    vocabularyPracticed: 0,
    averageVocabularyScore: 0,
    masteredWords: 0,
  };
  saveUserStats(initial);
  return initial;
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem(KEYS.userStats, JSON.stringify(stats));
}

export function updateStreak(): void {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = stats.lastPracticeDate;

  if (lastDate === today) {
    return;
  }

  if (lastDate) {
    const last = new Date(lastDate);
    const now = new Date(today);
    const diffTime = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.dailyStreak += 1;
    } else {
      stats.dailyStreak = 1;
    }
  } else {
    stats.dailyStreak = 1;
  }

  stats.lastPracticeDate = today;
  saveUserStats(stats);
}

export function getSavedAudio(): AudioRecording[] {
  const stored = localStorage.getItem(KEYS.savedAudio);
  if (stored) {
    return JSON.parse(stored) as AudioRecording[];
  }
  return [];
}

export function saveAudio(recording: AudioRecording): void {
  const recordings = getSavedAudio();
  recordings.unshift(recording);
  localStorage.setItem(KEYS.savedAudio, JSON.stringify(recordings));
}

export function markWordMastered(wordId: string): void {
  const bank = getVocabBank();
  const index = bank.findIndex((item) => item.id === wordId);
  if (index !== -1) {
    bank[index].mastered = true;
    saveVocabBank(bank);

    const stats = getUserStats();
    stats.masteredWords = bank.filter((item) => item.mastered).length;
    saveUserStats(stats);
  }
}

export function markWordPracticed(wordId: string): void {
  const bank = getVocabBank();
  const index = bank.findIndex((item) => item.id === wordId);
  if (index !== -1) {
    bank[index].timesPracticed += 1;
    bank[index].lastPracticed = new Date().toISOString().split('T')[0];
    saveVocabBank(bank);
  }
}
