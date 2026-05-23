import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DailyPractice from './pages/DailyPractice';
import WritingPractice from './pages/WritingPractice';
import SpeakingPractice from './pages/SpeakingPractice';
import VocabularyBank from './pages/VocabularyBank';
import Progress from './pages/Progress';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('celpip_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('celpip_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary-700 dark:text-primary-300">
            CELPIP Micro Trainer
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>
        </header>

        {/* Main Content */}
        <main className="pb-20 max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily-practice" element={<DailyPractice />} />
            <Route path="/writing" element={<WritingPractice />} />
            <Route path="/speaking" element={<SpeakingPractice />} />
            <Route path="/vocabulary" element={<VocabularyBank />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl">{'\uD83C\uDFE0'}</span>
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/writing"
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl">{'\u270D\uFE0F'}</span>
              <span>Writing</span>
            </NavLink>
            <NavLink
              to="/speaking"
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl">{'\uD83C\uDF99\uFE0F'}</span>
              <span>Speaking</span>
            </NavLink>
            <NavLink
              to="/vocabulary"
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl">{'\uD83D\uDCDA'}</span>
              <span>Vocab</span>
            </NavLink>
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl">{'\uD83D\uDCC8'}</span>
              <span>Progress</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;
