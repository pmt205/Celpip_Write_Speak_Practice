import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PracticeTimer from '../components/PracticeTimer';
import FeedbackCard from '../components/FeedbackCard';
import AudioRecorder from '../components/AudioRecorder';
import { getVocabBank, updateStreak, addPracticeEntry, getUserStats, saveUserStats, markWordPracticed } from '../utils/storage';
import { getRandomPrompt } from '../utils/promptGenerator';
import { generateFeedback } from '../utils/feedbackEngine';
import { VocabularyItem, Prompt, FeedbackResult } from '../types';

function DailyPractice() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
  const [needPracticeWords, setNeedPracticeWords] = useState<Set<string>>(new Set());

  // Step 2 state
  const [sentencePrompt, setSentencePrompt] = useState<Prompt | null>(null);
  const [sentenceText, setSentenceText] = useState('');
  const [sentenceFeedback, setSentenceFeedback] = useState<FeedbackResult | null>(null);

  // Step 3 state
  const [writingPrompt, setWritingPrompt] = useState<Prompt | null>(null);
  const [writingText, setWritingText] = useState('');
  const [writingSubmitted, setWritingSubmitted] = useState(false);

  // Step 4 state
  const [speakingPrompt, setSpeakingPrompt] = useState<Prompt | null>(null);
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [hasRecorded, setHasRecorded] = useState(false);

  // Step 5 state
  const [sessionFeedback, setSessionFeedback] = useState<FeedbackResult | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Load vocab items for step 1
    const bank = getVocabBank();
    const unmastered = bank.filter((item) => !item.mastered);
    const shuffled = [...unmastered].sort(() => Math.random() - 0.5);
    setVocabItems(shuffled.slice(0, 5));

    // Load prompts for steps 2-4
    setSentencePrompt(getRandomPrompt('writing', 'sentence-upgrade'));
    setWritingPrompt(getRandomPrompt('writing', 'mini-writing'));
    setSpeakingPrompt(getRandomPrompt('speaking', 'sprint'));
  }, []);

  const flipCard = (id: string) => {
    setFlippedCards((prev) => new Set(prev).add(id));
  };

  const markKnown = (id: string) => {
    setKnownWords((prev) => new Set(prev).add(id));
    setNeedPracticeWords((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const markNeedPractice = (id: string) => {
    setNeedPracticeWords((prev) => new Set(prev).add(id));
    setKnownWords((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    markWordPracticed(id);
  };

  const allVocabReviewed = vocabItems.every(
    (item) => knownWords.has(item.id) || needPracticeWords.has(item.id)
  );

  const submitSentence = () => {
    if (sentenceText.trim()) {
      const feedback = generateFeedback(sentenceText);
      setSentenceFeedback(feedback);
    }
  };

  const handleWritingTimerComplete = useCallback(() => {
    if (!writingSubmitted && writingText.trim()) {
      setWritingSubmitted(true);
    }
  }, [writingSubmitted, writingText]);

  const submitWriting = () => {
    setWritingSubmitted(true);
  };

  const handleRecordingComplete = (_blob: Blob, _duration: number) => {
    setHasRecorded(true);
  };

  const goToStep = (step: number) => {
    if (step === 5) {
      // Generate session feedback
      const combinedText = [sentenceText, writingText, speakingTranscript]
        .filter(Boolean)
        .join(' ');
      if (combinedText.trim()) {
        setSessionFeedback(generateFeedback(combinedText));
      }
    }
    setCurrentStep(step);
  };

  const completeSession = () => {
    updateStreak();

    const duration = Math.round((Date.now() - startTime) / 1000);
    const combinedText = [sentenceText, writingText, speakingTranscript].filter(Boolean).join(' ');
    const feedback = combinedText.trim() ? generateFeedback(combinedText) : null;

    addPracticeEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'writing',
      mode: 'daily-practice',
      duration,
      vocabularyScore: feedback?.vocabularyScore ?? 3,
      wordsUsed: vocabItems.filter((v) => knownWords.has(v.id)).map((v) => v.betterWord),
      weakWordsFound: feedback?.weakWordsFound ?? [],
    });

    const stats = getUserStats();
    stats.totalWritingDrills += 1;
    stats.totalSpeakingDrills += 1;
    stats.vocabularyPracticed += vocabItems.length;
    if (feedback) {
      const previousTotal = (stats.totalWritingDrills - 1) + (stats.totalSpeakingDrills - 1);
      const previousSessionCount = Math.floor(previousTotal / 2);
      const newSessionCount = previousSessionCount + 1;
      stats.averageVocabularyScore = Math.round(
        ((stats.averageVocabularyScore * previousSessionCount + feedback.vocabularyScore) / newSessionCount) * 10
      ) / 10;
    }
    saveUserStats(stats);

    navigate('/');
  };

  const progressPercent = (currentStep / 5) * 100;

  return (
    <div className="p-4 space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Step {currentStep} of 5</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Back Button */}
      {currentStep > 1 && (
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {'\u2190'} Back
        </button>
      )}

      {/* Step 1: Vocabulary Burst */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {'\uD83D\uDCA5'} Vocabulary Burst
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tap each card to reveal the better word. Mark if you know it or need practice.
          </p>

          <div className="space-y-3">
            {vocabItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 line-through">
                      {item.weakWord}
                    </span>
                    {flippedCards.has(item.id) && (
                      <span className="ml-3 font-bold text-green-600 dark:text-green-400">
                        {'\u2192'} {item.betterWord}
                      </span>
                    )}
                  </div>
                  {!flippedCards.has(item.id) && (
                    <button
                      onClick={() => flipCard(item.id)}
                      className="px-3 py-1 text-sm rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200"
                    >
                      Reveal
                    </button>
                  )}
                </div>

                {flippedCards.has(item.id) && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => markKnown(item.id)}
                      className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                        knownWords.has(item.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {'\u2705'} I know this
                    </button>
                    <button
                      onClick={() => markNeedPractice(item.id)}
                      className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                        needPracticeWords.has(item.id)
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800'
                      }`}
                    >
                      {'\uD83D\uDD04'} Need practice
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {allVocabReviewed && (
            <button
              onClick={() => goToStep(2)}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Next Step {'\u2192'}
            </button>
          )}
        </div>
      )}

      {/* Step 2: Sentence Upgrade */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {'\u2B06\uFE0F'} Sentence Upgrade
          </h2>

          {sentencePrompt && (
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {sentencePrompt.prompt}
              </p>
            </div>
          )}

          <textarea
            value={sentenceText}
            onChange={(e) => setSentenceText(e.target.value)}
            placeholder="Write your improved sentence here..."
            className="w-full h-32 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {!sentenceFeedback && (
            <button
              onClick={submitSentence}
              disabled={!sentenceText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}

          {sentenceFeedback && (
            <FeedbackCard feedback={sentenceFeedback} />
          )}

          <button
            onClick={() => goToStep(3)}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
          >
            Next Step {'\u2192'}
          </button>
        </div>
      )}

      {/* Step 3: Mini Writing */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {'\u270F\uFE0F'} Mini Writing
          </h2>

          {writingPrompt && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {writingPrompt.prompt}
              </p>
            </div>
          )}

          <PracticeTimer
            duration={180}
            onComplete={handleWritingTimerComplete}
            autoStart={false}
            label="3 minutes"
          />

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="Write 2-4 sentences..."
            disabled={writingSubmitted}
            className="w-full h-36 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60"
          />

          {!writingSubmitted && (
            <button
              onClick={submitWriting}
              disabled={!writingText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}

          {writingSubmitted && writingText.trim() && (
            <FeedbackCard feedback={generateFeedback(writingText)} />
          )}

          <button
            onClick={() => goToStep(4)}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
          >
            Next Step {'\u2192'}
          </button>
        </div>
      )}

      {/* Step 4: Speaking Sprint */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {'\uD83C\uDF99\uFE0F'} Speaking Sprint
          </h2>

          {speakingPrompt && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {speakingPrompt.prompt}
              </p>
            </div>
          )}

          <AudioRecorder maxDuration={30} onRecordingComplete={handleRecordingComplete} />

          <textarea
            value={speakingTranscript}
            onChange={(e) => setSpeakingTranscript(e.target.value)}
            placeholder="Optional: Type what you said for feedback..."
            className="w-full h-24 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {hasRecorded && (
            <button
              onClick={() => goToStep(5)}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Next Step {'\u2192'}
            </button>
          )}

          {!hasRecorded && (
            <button
              onClick={() => goToStep(5)}
              className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold transition-colors"
            >
              Skip {'\u2192'}
            </button>
          )}
        </div>
      )}

      {/* Step 5: Feedback Summary */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {'\uD83C\uDF89'} Session Complete!
          </h2>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {vocabItems.length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Words Reviewed</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round((Date.now() - startTime) / 1000)}s
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Time Spent</p>
            </div>
          </div>

          {sessionFeedback && (
            <FeedbackCard feedback={sessionFeedback} />
          )}

          <button
            onClick={completeSession}
            className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors shadow-md"
          >
            {'\u2705'} Complete Session
          </button>
        </div>
      )}
    </div>
  );
}

export default DailyPractice;
