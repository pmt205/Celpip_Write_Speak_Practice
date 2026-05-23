import { FeedbackResult } from '../types';

interface FeedbackCardProps {
  feedback: FeedbackResult;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score <= 2) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
    if (score === 3) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-800 space-y-4">
      {/* Vocabulary Score */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Vocabulary Score:
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
            feedback.vocabularyScore
          )}`}
        >
          Score: {feedback.vocabularyScore}/5
        </span>
      </div>

      {/* Weak Words Found */}
      {feedback.suggestedUpgrades.length > 0 && (
        <details className="group" open>
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200 list-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">&#9654;</span>
            Weak Words Found ({feedback.suggestedUpgrades.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {feedback.suggestedUpgrades.map((upgrade, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                <span className="text-red-500 line-through">{upgrade.original}</span>
                <span className="mx-2 text-gray-400">&#8594;</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {upgrade.suggestion}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Repeated Words */}
      {feedback.repeatedWords.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200 list-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">&#9654;</span>
            Repeated Words ({feedback.repeatedWords.length})
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {feedback.repeatedWords.map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {item.word} &times;{item.count}
              </span>
            ))}
          </div>
        </details>
      )}

      {/* Improved Version */}
      {feedback.improvedVersion && (
        <details className="group" open>
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200 list-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">&#9654;</span>
            Improved Version
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              {feedback.improvedVersion}
            </p>
          </div>
        </details>
      )}

      {/* Practice Tip */}
      {feedback.practiceTip && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex gap-2">
          <span className="text-lg flex-shrink-0">{'\uD83D\uDCA1'}</span>
          <p className="text-sm text-blue-800 dark:text-blue-200">{feedback.practiceTip}</p>
        </div>
      )}
    </div>
  );
}

export default FeedbackCard;
