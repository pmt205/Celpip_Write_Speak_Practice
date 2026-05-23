import { useState } from 'react';
import PracticeTimer from '../components/PracticeTimer';
import FeedbackCard from '../components/FeedbackCard';
import AudioRecorder from '../components/AudioRecorder';
import { getRandomPrompt } from '../utils/promptGenerator';
import { generateFeedback } from '../utils/feedbackEngine';
import { addPracticeEntry, getUserStats, saveUserStats } from '../utils/storage';
import { Prompt, FeedbackResult } from '../types';

type SpeakingMode = 'sprint' | 'vocabulary-challenge' | 'idea-burst';

function SpeakingPractice() {
  const [mode, setMode] = useState<SpeakingMode>('sprint');

  // Sprint state
  const [sprintPrompt, setSprintPrompt] = useState<Prompt | null>(() => getRandomPrompt('speaking', 'sprint'));
  const [sprintTranscript, setSprintTranscript] = useState('');
  const [sprintFeedback, setSprintFeedback] = useState<FeedbackResult | null>(null);
  const [sprintRecorded, setSprintRecorded] = useState(false);

  // Vocabulary Challenge state
  const [vcPrompt, setVcPrompt] = useState<Prompt | null>(() => getRandomPrompt('speaking', 'vocabulary-challenge'));
  const [vcTranscript, setVcTranscript] = useState('');
  const [vcFeedback, setVcFeedback] = useState<FeedbackResult | null>(null);
  const [vcRecorded, setVcRecorded] = useState(false);

  // Idea Burst state
  const [ibPrompt, setIbPrompt] = useState<Prompt | null>(() => getRandomPrompt('speaking', 'idea-burst'));
  const [ibText, setIbText] = useState('');
  const [ibFeedback, setIbFeedback] = useState<FeedbackResult | null>(null);
  const [ibSubmitted, setIbSubmitted] = useState(false);

  const modes: { key: SpeakingMode; label: string }[] = [
    { key: 'sprint', label: '30-Second Sprint' },
    { key: 'vocabulary-challenge', label: 'Vocabulary Challenge' },
    { key: 'idea-burst', label: 'Idea Burst' },
  ];

  const savePracticeEntry = (text: string, practiceMode: string) => {
    const feedback = generateFeedback(text);
    addPracticeEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'speaking',
      mode: practiceMode,
      duration: 30,
      vocabularyScore: feedback.vocabularyScore,
      wordsUsed: [],
      weakWordsFound: feedback.weakWordsFound,
    });
    const stats = getUserStats();
    stats.totalSpeakingDrills += 1;
    saveUserStats(stats);
  };

  // Sprint handlers
  const handleSprintAnalyze = () => {
    if (!sprintTranscript.trim()) return;
    const feedback = generateFeedback(sprintTranscript);
    setSprintFeedback(feedback);
    savePracticeEntry(sprintTranscript, 'sprint');
  };

  const handleSprintNew = () => {
    setSprintPrompt(getRandomPrompt('speaking', 'sprint'));
    setSprintTranscript('');
    setSprintFeedback(null);
    setSprintRecorded(false);
  };

  // Vocabulary Challenge handlers
  const handleVcAnalyze = () => {
    if (!vcTranscript.trim()) return;
    const feedback = generateFeedback(vcTranscript);

    // Check if target vocabulary was used
    const targetWords = vcPrompt?.targetVocabulary ?? [];
    const usedTargets = targetWords.filter((word) =>
      vcTranscript.toLowerCase().includes(word.toLowerCase())
    );

    if (usedTargets.length < targetWords.length) {
      const missed = targetWords.filter(
        (word) => !vcTranscript.toLowerCase().includes(word.toLowerCase())
      );
      feedback.practiceTip = `You missed these target words: ${missed.join(', ')}. Try to incorporate them naturally in your speech. ${feedback.practiceTip}`;
    } else {
      feedback.practiceTip = `Great job using all target vocabulary! ${feedback.practiceTip}`;
    }

    setVcFeedback(feedback);
    savePracticeEntry(vcTranscript, 'vocabulary-challenge');
  };

  const handleVcNew = () => {
    setVcPrompt(getRandomPrompt('speaking', 'vocabulary-challenge'));
    setVcTranscript('');
    setVcFeedback(null);
    setVcRecorded(false);
  };

  // Idea Burst handlers
  const handleIbSubmit = () => {
    if (!ibText.trim()) return;
    const lines = ibText.split('\n').filter((l) => l.trim());
    const feedback = generateFeedback(ibText);
    feedback.practiceTip = `You listed ${lines.length} idea(s). Try to reach at least 3 ideas in 60 seconds. ${feedback.practiceTip}`;
    setIbFeedback(feedback);
    setIbSubmitted(true);
    savePracticeEntry(ibText, 'idea-burst');
  };

  const handleIbTimerComplete = () => {
    if (!ibSubmitted && ibText.trim()) {
      handleIbSubmit();
    }
  };

  const handleIbNew = () => {
    setIbPrompt(getRandomPrompt('speaking', 'idea-burst'));
    setIbText('');
    setIbFeedback(null);
    setIbSubmitted(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {'\uD83C\uDF99\uFE0F'} Speaking Practice
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

      {/* Mode A: 30-Second Sprint */}
      {mode === 'sprint' && (
        <div className="space-y-4">
          {sprintPrompt && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {sprintPrompt.prompt}
              </p>
            </div>
          )}

          <button
            onClick={handleSprintNew}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {'\uD83D\uDD04'} New Prompt
          </button>

          <AudioRecorder
            maxDuration={30}
            onRecordingComplete={(_blob: Blob, _duration: number) => setSprintRecorded(true)}
          />

          {sprintRecorded && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type what you said (for feedback):
              </label>
              <textarea
                value={sprintTranscript}
                onChange={(e) => setSprintTranscript(e.target.value)}
                placeholder="Type your transcript here..."
                className="w-full h-24 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              {!sprintFeedback ? (
                <button
                  onClick={handleSprintAnalyze}
                  disabled={!sprintTranscript.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              ) : (
                <>
                  <FeedbackCard feedback={sprintFeedback} />
                  <button
                    onClick={handleSprintNew}
                    className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                  >
                    Try Another
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Mode B: Vocabulary Challenge */}
      {mode === 'vocabulary-challenge' && (
        <div className="space-y-4">
          {vcPrompt && (
            <>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-600 dark:text-green-300 mb-1">
                  Topic: {vcPrompt.topic}
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {vcPrompt.prompt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {vcPrompt.targetVocabulary.map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                Speak 2-3 sentences using the words above.
              </p>
            </>
          )}

          <AudioRecorder
            maxDuration={30}
            onRecordingComplete={(_blob: Blob, _duration: number) => setVcRecorded(true)}
          />

          {vcRecorded && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type what you said (for feedback):
              </label>
              <textarea
                value={vcTranscript}
                onChange={(e) => setVcTranscript(e.target.value)}
                placeholder="Type your transcript here..."
                className="w-full h-24 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              {!vcFeedback ? (
                <button
                  onClick={handleVcAnalyze}
                  disabled={!vcTranscript.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze
                </button>
              ) : (
                <>
                  <FeedbackCard feedback={vcFeedback} />
                  <button
                    onClick={handleVcNew}
                    className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                  >
                    Try Another
                  </button>
                </>
              )}
            </>
          )}

          {!vcRecorded && (
            <button
              onClick={handleVcNew}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              {'\uD83D\uDD04'} New Challenge
            </button>
          )}
        </div>
      )}

      {/* Mode C: Idea Burst */}
      {mode === 'idea-burst' && (
        <div className="space-y-4">
          {ibPrompt && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {ibPrompt.prompt}
              </p>
            </div>
          )}

          <PracticeTimer
            duration={60}
            onComplete={handleIbTimerComplete}
            autoStart={false}
            label="60 seconds"
          />

          <textarea
            value={ibText}
            onChange={(e) => setIbText(e.target.value)}
            placeholder={"1. \n2. \n3. "}
            disabled={ibSubmitted}
            className="w-full h-32 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono disabled:opacity-60"
          />

          {!ibSubmitted ? (
            <button
              onClick={handleIbSubmit}
              disabled={!ibText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          ) : (
            <>
              {ibFeedback && <FeedbackCard feedback={ibFeedback} />}
              <button
                onClick={handleIbNew}
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

export default SpeakingPractice;
