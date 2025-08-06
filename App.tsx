import React, { useState, useCallback, useEffect } from 'react';
import type { JournalAnalysis, PersistedJournalEntry, WeeklyAnalysis } from './types';
import { analyzeJournalEntry } from './services/geminiService';
import JournalEditor from './components/JournalEditor';
import AnalysisDisplay from './components/AnalysisDisplay';
import WeeklyReview from './components/WeeklyReview';
import LoadingSpinner from './components/common/LoadingSpinner';
import { IconJourney } from './components/common/Icon';

type View = 'journal' | 'weekly';

const App: React.FC = () => {
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allEntries, setAllEntries] = useState<PersistedJournalEntry[]>([]);
  const [view, setView] = useState<View>('journal');

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('atmalog_entries');
      if (storedEntries) {
        setAllEntries(JSON.parse(storedEntries));
      }
    } catch (e) {
      console.error("Failed to load entries from storage", e);
      setError("Could not load your saved journal entries.");
    }
  }, []);

  const saveEntries = (entries: PersistedJournalEntry[]) => {
    try {
      localStorage.setItem('atmalog_entries', JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries to storage", e);
      setError("Could not save your new journal entry.");
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!journalEntry.trim()) {
      setError('Please write something in your journal before analyzing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeJournalEntry(journalEntry);
      setAnalysis(result);

      const newEntry: PersistedJournalEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        content: journalEntry,
        analysis: result,
      };
      
      const updatedEntries = [newEntry, ...allEntries];
      setAllEntries(updatedEntries);
      saveEntries(updatedEntries);
      setJournalEntry(''); // Clear editor after successful analysis

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [journalEntry, allEntries]);

  const NavButton: React.FC<{
    targetView: View;
    children: React.ReactNode
  }> = ({ targetView, children }) => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-3 text-lg font-medium transition-colors duration-200 focus:outline-none ${
        view === targetView
          ? 'border-b-2 border-teal-500 text-teal-400'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <IconJourney className="w-10 h-10 text-teal-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
              AtmaLog
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-400">
            Your AI Journal for Self-Reflection
          </p>
        </header>

        <nav className="mb-8 flex justify-center border-b border-slate-700">
          <NavButton targetView="journal">Daily Entry</NavButton>
          <NavButton targetView="weekly">Weekly Review</NavButton>
        </nav>

        {error && (
            <div className="my-6 p-4 bg-red-900/30 border-l-4 border-red-600 text-red-200 rounded-lg animate-fade-in">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
        )}

        {view === 'journal' && (
          <div className="animate-fade-in">
            <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
              <JournalEditor
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                onSubmit={handleAnalyze}
                isLoading={isLoading}
              />
            </div>

            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center gap-4 text-slate-400">
                <LoadingSpinner />
                <p className="text-lg">Connecting with your entry...</p>
              </div>
            )}

            {analysis && (
              <div className="mt-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <IconJourney className="w-8 h-8 text-teal-500" />
                  <h2 className="text-3xl font-bold text-slate-100">Your Reflection</h2>
                </div>
                <AnalysisDisplay analysis={analysis} />
              </div>
            )}
            
            {!isLoading && !analysis && (
              <div className="mt-12 text-center text-slate-400">
                <p>Write a new entry to receive your AI-powered yogic insight.</p>
              </div>
            )}
          </div>
        )}

        {view === 'weekly' && (
          <div className="animate-fade-in">
            <WeeklyReview entries={allEntries} />
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-slate-400 text-sm">
        <p>A sacred space to connect with your self.</p>
      </footer>
    </div>
  );
};

export default App;