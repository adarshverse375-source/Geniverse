import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  FileText, 
  Trophy, 
  Flame, 
  Clock, 
  PlusCircle, 
  FolderKanban, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  BrainCircuit, 
  FileCheck2,
  Compass
} from 'lucide-react';
import { MainTabType } from './PWBottomNav';
import { SubjectType } from '../types';

interface PWSectionOptionsProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  isMidnight: boolean;
  selectedSubject: SubjectType;
  activeChapterName: string;
  onOpenAddQuestion?: () => void;
  onOpenManageQuestions?: () => void;
  onGenerateAIQuiz?: () => void;
}

export const PWSectionOptions: React.FC<PWSectionOptionsProps> = ({
  activeTab,
  setActiveTab,
  isMidnight,
  selectedSubject,
  activeChapterName,
  onOpenAddQuestion,
  onOpenManageQuestions,
  onGenerateAIQuiz,
}) => {
  // Smooth scroll helper
  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render options based on active tab
  const renderOptions = () => {
    switch (activeTab) {
      case 'notes':
      case 'hub':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-500">
                  PW Study Dock • Section Shortcuts
                </span>
              </div>
              <span className="text-[10px] font-bold opacity-60">
                {activeChapterName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => scrollToElement('chapter-summary-notes')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/60 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-500" />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">Theory Notes</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">Key Concepts</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('chapter-formulas-block')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">Formulas & Laws</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">Quick Revision</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('chapter-flashcards-deck')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-500" />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">Flashcard Deck</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">Memory Drill</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500/60 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-black text-teal-500 bg-teal-500/10 px-1 rounded">PDF</span>
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">NCERT & CBSE</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">Books & Syllabus</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('pomodoro-timer-section')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-rose-500/60 hover:bg-slate-800/80 text-white' 
                    : 'bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-rose-500" />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">Focus Timer</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">25m Pomodoro</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isMidnight 
                    ? 'bg-purple-950/30 border-purple-800/50 hover:border-purple-500 hover:bg-purple-900/30 text-white' 
                    : 'bg-purple-50/60 border-purple-200 hover:border-purple-400 hover:bg-purple-100/50 text-purple-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-black text-purple-500 bg-purple-500/20 px-1 rounded animate-pulse">AI</span>
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">Ask AI Tutor</span>
                  <span className="text-[10px] opacity-60 leading-none block mt-0.5">Clear Doubts</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                  PW Practice Suite • DPP & Board PYQs
                </span>
              </div>
              <span className="text-[10px] font-bold opacity-60">
                CBSE Pattern MCQs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={onGenerateAIQuiz}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 group ${
                  isMidnight 
                    ? 'bg-emerald-950/30 border-emerald-800/60 hover:border-emerald-500 text-white' 
                    : 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-emerald-950 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Generate AI Quiz</span>
                  <span className="text-[10px] opacity-60 block truncate">New Board Questions</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenAddQuestion}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/60 text-white' 
                    : 'bg-white border-slate-200 hover:border-sky-400 text-slate-800 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Add Custom PYQ</span>
                  <span className="text-[10px] opacity-60 block truncate">Your School Questions</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenManageQuestions}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/60 text-white' 
                    : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Question Bank</span>
                  <span className="text-[10px] opacity-60 block truncate">Manage & Review</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 group ${
                  isMidnight 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/60 text-white' 
                    : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Revise Formulas</span>
                  <span className="text-[10px] opacity-60 block truncate">Before Testing</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-500">
                  PW Resources Vault • Direct Official Materials
                </span>
              </div>
              <span className="text-[10px] font-bold opacity-60">
                Verified CBSE Academic & NCERT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className={`p-2.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-[10px] font-black uppercase text-teal-500 block">Category 1</span>
                <span className="text-xs font-bold block mt-0.5">NCERT Textbooks</span>
                <span className="text-[10px] opacity-60">Math, Science, SST, Eng</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-[10px] font-black uppercase text-sky-500 block">Category 2</span>
                <span className="text-xs font-bold block mt-0.5">CBSE 2025–26 Syllabus</span>
                <span className="text-[10px] opacity-60">Official Blueprint & Marks</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-[10px] font-black uppercase text-amber-500 block">Category 3</span>
                <span className="text-xs font-bold block mt-0.5">NCERT Exemplar (HOTS)</span>
                <span className="text-[10px] opacity-60">High-scoring Problems</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-[10px] font-black uppercase text-indigo-500 block">Category 4</span>
                <span className="text-xs font-bold block mt-0.5">Sample Papers (SQP)</span>
                <span className="text-[10px] opacity-60">With Marking Scheme</span>
              </div>
            </div>
          </div>
        );

      case 'badges':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-500">
                  PW Growth & Performance Suite
                </span>
              </div>
              <span className="text-[10px] font-bold opacity-60">
                Class 10 Target: 95%+
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isMidnight ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500' : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Continue Learning</span>
                  <span className="text-[10px] opacity-60 block truncate">Read Chapters</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isMidnight ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Earn 100 XP</span>
                  <span className="text-[10px] opacity-60 block truncate">Take Today's Quiz</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('pomodoro-timer-section')}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isMidnight ? 'bg-slate-900/60 border-slate-800 hover:border-rose-500' : 'bg-white border-slate-200 hover:border-rose-400 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Study Session</span>
                  <span className="text-[10px] opacity-60 block truncate">Pomodoro XP Boost</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isMidnight ? 'bg-slate-900/60 border-slate-800 hover:border-teal-500' : 'bg-white border-slate-200 hover:border-teal-400 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Download PDFs</span>
                  <span className="text-[10px] opacity-60 block truncate">Official Syllabus</span>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section 
      aria-label="PW Section Option Dock"
      className={`rounded-2xl p-4 sm:p-5 transition-all ${
        isMidnight 
          ? 'glass-panel border-2 border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
          : 'bg-slate-50/90 rounded-2xl border-2 border-slate-200/90 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
      }`}
    >
      {renderOptions()}
    </section>
  );
};
