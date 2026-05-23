import { useState, useEffect } from 'react';
import VocabularyCard from '../components/VocabularyCard';
import { getVocabBank, saveVocabBank, markWordPracticed, markWordMastered } from '../utils/storage';
import { VocabularyItem, Category } from '../types';

type SortOption = 'recently-practiced' | 'difficulty' | 'times-practiced';

const ALL_CATEGORIES: Category[] = [
  'Work', 'School', 'Family', 'Technology', 'Transportation',
  'Housing', 'Shopping', 'Health', 'Environment', 'Complaints',
  'Opinions', 'Emotions',
];

function VocabularyBank() {
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recently-practiced');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  // Add form state
  const [newWeakWord, setNewWeakWord] = useState('');
  const [newBetterWord, setNewBetterWord] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Work');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Edit form state
  const [editWeakWord, setEditWeakWord] = useState('');
  const [editBetterWord, setEditBetterWord] = useState('');
  const [editExample, setEditExample] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Work');
  const [editDifficulty, setEditDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    setVocab(getVocabBank());
  }, []);

  const filteredVocab = vocab
    .filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.weakWord.toLowerCase().includes(q) ||
          item.betterWord.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .filter((item) => {
      if (categoryFilter !== 'All') return item.category === categoryFilter;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recently-practiced':
          return (b.lastPracticed || '').localeCompare(a.lastPracticed || '');
        case 'difficulty':
          return b.difficulty - a.difficulty;
        case 'times-practiced':
          return b.timesPracticed - a.timesPracticed;
        default:
          return 0;
      }
    });

  const masteredCount = vocab.filter((item) => item.mastered).length;
  const needPracticeCount = vocab.filter((item) => !item.mastered).length;

  const handleAdd = () => {
    if (!newWeakWord.trim() || !newBetterWord.trim()) return;

    const newItem: VocabularyItem = {
      id: Date.now().toString(),
      weakWord: newWeakWord.trim(),
      betterWord: newBetterWord.trim(),
      exampleSentence: newExample.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      timesPracticed: 0,
      lastPracticed: '',
      mastered: false,
    };

    const updated = [newItem, ...vocab];
    setVocab(updated);
    saveVocabBank(updated);

    // Reset form
    setNewWeakWord('');
    setNewBetterWord('');
    setNewExample('');
    setNewCategory('Work');
    setNewDifficulty(3);
    setShowAddForm(false);
  };

  const handleEdit = (item: VocabularyItem) => {
    setEditingItem(item);
    setEditWeakWord(item.weakWord);
    setEditBetterWord(item.betterWord);
    setEditExample(item.exampleSentence);
    setEditCategory(item.category);
    setEditDifficulty(item.difficulty);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editWeakWord.trim() || !editBetterWord.trim()) return;

    const updated = vocab.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            weakWord: editWeakWord.trim(),
            betterWord: editBetterWord.trim(),
            exampleSentence: editExample.trim(),
            category: editCategory,
            difficulty: editDifficulty,
          }
        : item
    );
    setVocab(updated);
    saveVocabBank(updated);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;
    const updated = vocab.filter((item) => item.id !== id);
    setVocab(updated);
    saveVocabBank(updated);
  };

  const handlePractice = (id: string) => {
    markWordPracticed(id);
    setFlashId(id);
    setTimeout(() => setFlashId(null), 600);
    setVocab(getVocabBank());
  };

  const handleToggleMastered = (id: string) => {
    const item = vocab.find((v) => v.id === id);
    if (!item) return;

    if (item.mastered) {
      // Un-master
      const updated = vocab.map((v) =>
        v.id === id ? { ...v, mastered: false } : v
      );
      setVocab(updated);
      saveVocabBank(updated);
    } else {
      markWordMastered(id);
      setVocab(getVocabBank());
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {'\uD83D\uDCDA'} Vocabulary Bank
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          + Add Word
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">Total: {vocab.length}</span>
        <span>|</span>
        <span className="text-green-600 dark:text-green-400">Mastered: {masteredCount}</span>
        <span>|</span>
        <span className="text-amber-600 dark:text-amber-400">Need Practice: {needPracticeCount}</span>
      </div>

      {/* Add Word Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add New Word</h3>
          <input
            type="text"
            value={newWeakWord}
            onChange={(e) => setNewWeakWord(e.target.value)}
            placeholder="Weak Word"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <input
            type="text"
            value={newBetterWord}
            onChange={(e) => setNewBetterWord(e.target.value)}
            placeholder="Better Word"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <input
            type="text"
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            placeholder="Example Sentence"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <div className="flex gap-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Category)}
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newWeakWord.trim() || !newBetterWord.trim()}
              className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search words..."
        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />

      <div className="flex gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="All">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="recently-practiced">Recently Practiced</option>
          <option value="difficulty">Difficulty</option>
          <option value="times-practiced">Times Practiced</option>
        </select>
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3">
        {filteredVocab.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg">{'\uD83D\uDD0D'}</p>
            <p>No words match your filter.</p>
          </div>
        )}

        {filteredVocab.map((item) =>
          editingItem?.id === item.id ? (
            <div key={item.id} className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Edit Word</h3>
              <input
                type="text"
                value={editWeakWord}
                onChange={(e) => setEditWeakWord(e.target.value)}
                placeholder="Weak Word"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={editBetterWord}
                onChange={(e) => setEditBetterWord(e.target.value)}
                placeholder="Better Word"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={editExample}
                onChange={(e) => setEditExample(e.target.value)}
                placeholder="Example Sentence"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <div className="flex gap-3">
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className={`transition-all duration-300 ${
                flashId === item.id ? 'ring-2 ring-green-400 scale-105' : ''
              }`}
            >
              <VocabularyCard
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPractice={handlePractice}
                onToggleMastered={handleToggleMastered}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default VocabularyBank;
