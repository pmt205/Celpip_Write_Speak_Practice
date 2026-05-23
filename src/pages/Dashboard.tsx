import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { getUserStats, getPracticeHistory } from '../utils/storage';
import { UserStats } from '../types';

function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weakWordCount, setWeakWordCount] = useState(0);

  useEffect(() => {
    const loadedStats = getUserStats();
    setStats(loadedStats);

    const history = getPracticeHistory();
    const recentHistory = history.slice(0, 10);
    const weakWords = new Set<string>();
    for (const entry of recentHistory) {
      for (const word of entry.weakWordsFound) {
        weakWords.add(word);
      }
    }
    setWeakWordCount(weakWords.size);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {getFormattedDate()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <DashboardCard
          title="Daily Streak"
          value={stats?.dailyStreak ?? 0}
          icon={'\uD83D\uDD25'}
          onClick={() => {}}
          color="bg-orange-50"
          darkColor="dark:bg-orange-950"
        />
        <DashboardCard
          title="Words Practiced"
          value={stats?.vocabularyPracticed ?? 0}
          icon={'\uD83D\uDCD6'}
          onClick={() => {}}
          color="bg-blue-50"
          darkColor="dark:bg-blue-950"
        />
        <DashboardCard
          title="Weak Words"
          value={weakWordCount}
          icon={'\u26A0\uFE0F'}
          onClick={() => {}}
          color="bg-yellow-50"
          darkColor="dark:bg-yellow-950"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          to="/daily-practice"
          className="block w-full py-4 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold text-lg shadow-md transition-colors"
        >
          {'\u23F1\uFE0F'} Start 5-Minute Practice
        </Link>
        <Link
          to="/writing"
          className="block w-full py-4 px-6 rounded-xl bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100 text-center font-semibold text-lg shadow-sm transition-colors"
        >
          {'\u270D\uFE0F'} Writing Practice
        </Link>
        <Link
          to="/speaking"
          className="block w-full py-4 px-6 rounded-xl bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-100 text-center font-semibold text-lg shadow-sm transition-colors"
        >
          {'\uD83C\uDF99\uFE0F'} Speaking Practice
        </Link>
        <Link
          to="/vocabulary"
          className="block w-full py-4 px-6 rounded-xl bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-100 text-center font-semibold text-lg shadow-sm transition-colors"
        >
          {'\uD83D\uDCDA'} Vocabulary Bank
        </Link>
        <Link
          to="/progress"
          className="block w-full py-4 px-6 rounded-xl bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-100 text-center font-semibold text-lg shadow-sm transition-colors"
        >
          {'\uD83D\uDCC8'} Progress
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
