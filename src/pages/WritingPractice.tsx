import { useState } from 'react';
import PracticeTimer from '../components/PracticeTimer';
import FeedbackCard from '../components/FeedbackCard';
import { getRandomPrompt } from '../utils/promptGenerator';
import { generateFeedback } from '../utils/feedbackEngine';
import { addPracticeEntry, getUserStats, saveUserStats } from '../utils/storage';
import { Prompt, FeedbackResult } from '../types';

type WritingMode = 'sentence-upgrade' | 'mini-writing' | 'micro-sections';
type MicroSection = 'Opening' | 'Complaint' | 'Request' | 'Opinion' | 'Supporting Reason' | 'Example' | 'Closing';

function WritingPractice() {
  const [mode, setMode] = useState<WritingMode>('sentence-upgrade');

  // Sentence Upgrade state
  const [suPrompt, setSuPrompt] = useState<Prompt | null>(() => getRandomPrompt('writing', 'sentence-upgrade'));
  const [suText, setSuText] = useState('');
  const [suFeedback, setSuFeedback] = useState<FeedbackResult | null>(null);

  // Mini Writing state
  const [mwPrompt, setMwPrompt] = useState<Prompt | null>(() => getRandomPrompt('writing', 'mini-writing'));
  const [mwText, setMwText] = useState('');
  const [mwFeedback, setMwFeedback] = useState<FeedbackResult | null>(null);
  const [mwSubmitted, setMwSubmitted] = useState(false);

  // Micro Sections state
  const [selectedSection, setSelectedSection] = useState<MicroSection>('Opening');
  const [msPrompt, setMsPrompt] = useState<Prompt | null>(() => getRandomPrompt('writing', 'micro-sections'));
  const [msText, setMsText] = useState('');
  const [msFeedback, setMsFeedback] = useState<FeedbackResult | null>(null);

  const modes: { key: WritingMode; label: string }[] = [
    { key: 'sentence-upgrade', label: 'Sentence Upgrade' },
    { key: 'mini-writing', label: 'Mini Writing' },
    { key: 'micro-sections', label: 'CELPIP Sections' },
  ];

  const microSections: MicroSection[] = [
    'Opening', 'Complaint', 'Request', 'Opinion', 'Supporting Reason', 'Example', 'Closing',
  ];

  const savePracticeEntry = (text: string, practiceMode: string) => {
    const feedback = generateFeedback(text);
    addPracticeEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'writing',
      mode: practiceMode,
      duration: 0,
      vocabularyScore: feedback.vocabularyScore,
      wordsUsed: [],
      weakWordsFound: feedback.weakWordsFound,
    });
    const stats = getUserStats();
    stats.totalWritingDrills += 1;
    saveUserStats(stats);
  };

  // Sentence Upgrade handlers
  const handleSuSubmit = () => {
    if (!suText.trim()) return;
    const feedback = generateFeedback(suText);
    setSuFeedback(feedback);
    savePracticeEntry(suText, 'sentence-upgrade');
  };

  const handleSuNew = () => {
    setSuPrompt(getRandomPrompt('writing', 'sentence-upgrade'));
    setSuText('');
    setSuFeedback(null);
  };

  // Mini Writing handlers
  const handleMwSubmit = () => {
    if (!mwText.trim()) return;
    const feedback = generateFeedback(mwText);
    setMwFeedback(feedback);
    setMwSubmitted(true);
    savePracticeEntry(mwText, 'mini-writing');
  };

  const handleMwTimerComplete = () => {
    if (!mwSubmitted && mwText.trim()) {
      handleMwSubmit();
    }
  };

  const handleMwReset = () => {
    setMwPrompt(getRandomPrompt('writing', 'mini-writing'));
    setMwText('');
    setMwFeedback(null);
    setMwSubmitted(false);
  };

  // Micro Sections handlers
  const handleSectionChange = (section: MicroSection) => {
    setSelectedSection(section);
    const prompts = getRandomPrompt('writing', 'micro-sections');
    setMsPrompt(prompts);
    setMsText('');
    setMsFeedback(null);
  };

  const handleMsSubmit = () => {
    if (!msText.trim()) return;
    const feedback = generateFeedback(msText);
    setMsFeedback(feedback);
    savePracticeEntry(msText, `micro-sections-${selectedSection.toLowerCase()}`);
  };

  const wordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {'\u270D\uFE0F'} Writing Practice
      </h1>

      {/* Mode Selector */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors ${
              mode === m.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode A: Sentence Upgrade */}
      {mode === 'sentence-upgrade' && (
        <div className="space-y-4">
          {suPrompt && (
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {suPrompt.prompt}
              </p>
            </div>
          )}

          <button
            onClick={handleSuNew}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {'\uD83D\uDD04'} Get New Sentence
          </button>

          <textarea
            value={suText}
            onChange={(e) => setSuText(e.target.value)}
            placeholder="Write your improved sentence here..."
            className="w-full h-32 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {!suFeedback ? (
            <button
              onClick={handleSuSubmit}
              disabled={!suText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          ) : (
            <>
              <FeedbackCard feedback={suFeedback} />
              <button
                onClick={handleSuNew}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
              >
                Try Another
              </button>
            </>
          )}
        </div>
      )}

      {/* Mode B: Mini Writing Drill */}
      {mode === 'mini-writing' && (
        <div className="space-y-4">
          {mwPrompt && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {mwPrompt.prompt}
              </p>
            </div>
          )}

          <PracticeTimer
            duration={180}
            onComplete={handleMwTimerComplete}
            autoStart={false}
            label="3 minutes"
          />

          <div>
            <textarea
              value={mwText}
              onChange={(e) => setMwText(e.target.value)}
              placeholder="Write 2-4 sentences..."
              disabled={mwSubmitted}
              className="w-full h-36 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {wordCount(mwText)} words
            </p>
          </div>

          {!mwSubmitted ? (
            <button
              onClick={handleMwSubmit}
              disabled={!mwText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          ) : (
            <>
              {mwFeedback && <FeedbackCard feedback={mwFeedback} />}
              <button
                onClick={handleMwReset}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
              >
                Try Another
              </button>
            </>
          )}
        </div>
      )}

      {/* Mode C: CELPIP Micro Sections */}
      {mode === 'micro-sections' && (
        <div className="space-y-4">
          {/* Sub-mode selector */}
          <div className="flex flex-wrap gap-2">
            {microSections.map((section) => (
              <button
                key={section}
                onClick={() => handleSectionChange(section)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedSection === section
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {msPrompt && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300 mb-1">
                Section: {selectedSection}
              </p>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                {msPrompt.prompt}
              </p>
            </div>
          )}

          <textarea
            value={msText}
            onChange={(e) => setMsText(e.target.value)}
            placeholder={`Write your ${selectedSection.toLowerCase()} here...`}
            className="w-full h-32 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {!msFeedback ? (
            <button
              onClick={handleMsSubmit}
              disabled={!msText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          ) : (
            <>
              <FeedbackCard feedback={msFeedback} />
              <button
                onClick={() => {
                  setMsText('');
                  setMsFeedback(null);
                  setMsPrompt(getRandomPrompt('writing', 'micro-sections'));
                }}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
              >
                Try Another
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WritingPractice;
