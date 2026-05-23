import { useState, useEffect, useCallback, useRef } from 'react';

interface PracticeTimerProps {
  duration: number;
  onComplete: () => void;
  autoStart?: boolean;
  label?: string;
}

function PracticeTimer({ duration, onComplete, autoStart = false, label }: PracticeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            setIsComplete(true);
            onCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [isRunning, clearTimer]);

  const toggleRunning = () => {
    if (isComplete) return;
    setIsRunning((prev) => !prev);
  };

  const reset = () => {
    clearTimer();
    setTimeLeft(duration);
    setIsRunning(false);
    setIsComplete(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const isLow = timeLeft <= 10 && timeLeft > 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
      )}

      {/* Circular Progress */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              isLow ? 'text-red-500' : 'text-primary-500 dark:text-primary-400'
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-3xl font-mono font-bold ${
              isLow
                ? 'text-red-500 animate-pulse'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Time's Up Message */}
      {isComplete && (
        <p className="text-lg font-bold text-red-500 animate-pulse">Time's up!</p>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={toggleRunning}
          disabled={isComplete}
          className={`px-5 py-2 rounded-lg font-medium text-white transition-colors ${
            isComplete
              ? 'bg-gray-400 cursor-not-allowed'
              : isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default PracticeTimer;
