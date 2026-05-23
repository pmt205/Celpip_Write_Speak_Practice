import { VocabularyItem } from '../types';

interface VocabularyCardProps {
  item: VocabularyItem;
  onEdit: (item: VocabularyItem) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

function VocabularyCard({
  item,
  onEdit,
  onDelete,
  onPractice,
  onToggleMastered,
}: VocabularyCardProps) {
  const getDifficultyDots = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`inline-block w-2 h-2 rounded-full mx-0.5 ${
          i < level
            ? 'bg-primary-500 dark:bg-primary-400'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      School: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
      Family: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
      Technology: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
      Transportation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
      Housing: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
      Shopping: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
      Health: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
      Environment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
      Complaints: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
      Opinions: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
      Emotions: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-800">
      {/* Word Pair */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-500 dark:text-gray-400 line-through">{item.weakWord}</span>
        <span className="text-gray-400">{'\u2192'}</span>
        <span className="font-bold text-green-600 dark:text-green-400">{item.betterWord}</span>
        {item.mastered && <span className="text-amber-500 ml-auto">{'\u2B50'}</span>}
      </div>

      {/* Example Sentence */}
      <p className="text-sm italic text-gray-600 dark:text-gray-300 mb-3">
        "{item.exampleSentence}"
      </p>

      {/* Category & Difficulty */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
            item.category
          )}`}
        >
          {item.category}
        </span>
        <div className="flex items-center">{getDifficultyDots(item.difficulty)}</div>
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Practiced {item.timesPracticed} times
        {item.lastPracticed && (
          <span> &middot; Last: {new Date(item.lastPracticed).toLocaleDateString()}</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onPractice(item.id)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          Practice
        </button>
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => onToggleMastered(item.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            item.mastered
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
          }`}
        >
          {item.mastered ? '\u2B50 Mastered' : '\u2606 Master'}
        </button>
      </div>
    </div>
  );
}

export default VocabularyCard;
