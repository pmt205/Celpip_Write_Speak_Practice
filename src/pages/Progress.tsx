import { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { getUserStats, getPracticeHistory, getVocabBank, saveUserStats, savePracticeHistory, saveVocabBank } from '../utils/storage';
import { UserStats, PracticeHistory, VocabularyItem } from '../types';

function Progress() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<PracticeHistory[]>([]);
  const [vocabBank, setVocabBank] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    setStats(getUserStats());
    setHistory(getPracticeHistory());
    setVocabBank(getVocabBank());
  }, []);

  // Weekly activity: last 7 days
  const getLast7Days = () => {
    const days: { date: string; practiced: boolean }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const practiced = history.some((h) => h.date === dateStr);
      days.push({ date: dateStr, practiced });
    }
    return days;
  };

  // Most repeated weak words from history
  const getTopWeakWords = () => {
    const counts: Record<string, number> = {};
    for (const entry of history) {
      for (const word of entry.weakWordsFound) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  };

  // Mastered words
  const masteredWords = vocabBank.filter((item) => item.mastered);

  // Recent activity: last 10
  const recentActivity = history.slice(0, 10);

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) return;

    const resetStats: UserStats = {
      dailyStreak: 0,
      lastPracticeDate: '',
      totalWritingDrills: 0,
      totalSpeakingDrills: 0,
      vocabularyPracticed: 0,
      averageVocabularyScore: 0,
      masteredWords: 0,
    };
    saveUserStats(resetStats);
    savePracticeHistory([]);

    const resetVocab = vocabBank.map((item) => ({
      ...item,
      mastered: false,
      timesPracticed: 0,
      lastPracticed: '',
    }));
    saveVocabBank(resetVocab);

    setStats(resetStats);
    setHistory([]);
    setVocabBank(resetVocab);
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const weekly = getLast7Days();
  const topWeakWords = getTopWeakWords();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {'\uD83D\uDCC8'} Progress
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <DashboardCard
          title="Daily Streak"
          value={stats?.dailyStreak ?? 0}
          icon={'\uD83D\uDD25'}
          onClick={() => {}}
          color="bg-orange-50"
          darkColor="dark:bg-orange-950"
        />
        <DashboardCard
          title="Writing Drills"
          value={stats?.totalWritingDrills ?? 0}
          icon={'\u270F\uFE0F'}
          onClick={() => {}}
          color="bg-blue-50"
          darkColor="dark:bg-blue-950"
        />
        <DashboardCard
          title="Speaking Drills"
          value={stats?.totalSpeakingDrills ?? 0}
          icon={'\uD83C\uDF99\uFE0F'}
          onClick={() => {}}
          color="bg-purple-50"
          darkColor="dark:bg-purple-950"
        />
        <DashboardCard
          title="Words Practiced"
          value={stats?.vocabularyPracticed ?? 0}
          icon={'\uD83D\uDCD6'}
          onClick={() => {}}
          color="bg-green-50"
          darkColor="dark:bg-green-950"
        />
        <DashboardCard
          title="Mastered Words"
          value={stats?.masteredWords ?? 0}
          icon={'\u2B50'}
          onClick={() => {}}
          color="bg-amber-50"
          darkColor="dark:bg-amber-950"
        />
        <DashboardCard
          title="Avg Score"
          value={stats?.averageVocabularyScore ? `${stats.averageVocabularyScore}/5` : '0/5'}
          icon={'\uD83D\uDCCA'}
          onClick={() => {}}
          color="bg-cyan-50"
          darkColor="dark:bg-cyan-950"
        />
      </div>

      {/* Weekly Activity */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h2>
        <div className="flex justify-between items-center">
          {weekly.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  day.practiced
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {day.practiced && (
                  <span className="text-white dark:text-gray-900 text-xs font-bold">{'\u2713'}</span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getDayLabel(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Repeated Weak Words */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Most Repeated Weak Words
        </h2>
        {topWeakWords.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No weak words detected yet. Start practicing!
          </p>
        ) : (
          <ul className="space-y-2">
            {topWeakWords.map(({ word, count }) => (
              <li
                key={word}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
              >
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {word}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {count} time{count > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mastered Words */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mastered Words
        </h2>
        {masteredWords.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No mastered words yet. Keep practicing!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {masteredWords.map((item) => (
              <span
                key={item.id}
                className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
              >
                {item.betterWord}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No practice sessions yet. Start your first session!
          </p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.type === 'writing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {entry.type === 'writing' ? 'Writing' : 'Speaking'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.mode}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      entry.vocabularyScore >= 4
                        ? 'text-green-600 dark:text-green-400'
                        : entry.vocabularyScore >= 3
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {entry.vocabularyScore}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="pt-4">
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
}

export default Progress;
