export interface JournalAnalysis {
  dominantEmotion: string;
  suggestedPractice: {
    type: 'Asana' | 'Pranayama' | 'Meditation';
    name: string;
    description: string;
  };
  chakraConnection: {
    name: string;
    description: string;
  };
  yogicReflection: string;
  mantra: string;
}

export interface PersistedJournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  analysis: JournalAnalysis;
}

export interface WeeklyAnalysis {
  emotionalPattern: string;
  recurringYogicThemes: string[];
  weeklyReflection: string;
  practiceFocus: {
    type: 'Asana' | 'Pranayama' | 'Philosophy';
    name: string;
    reason: string;
  };
}
