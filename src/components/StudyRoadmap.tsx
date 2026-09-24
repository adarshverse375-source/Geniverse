import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  GraduationCap, 
  BookOpen, 
  Check, 
  Award,
  ChevronRight,
  Flame,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Chapter, SubjectType, UserProgress } from '../types';

interface StudyRoadmapProps {
  isMidnight: boolean;
  activeSubject: SubjectType;
  chapters: Chapter[];
  selectedChapterId: string;
  userProgress: UserProgress;
  onSelectChapter: (chapterId: string) => void;
  onNavigateToQuiz: (chapterId: string) => void;
  subjectColor?: string;
  onAwardBonusPoints?: (points: number, reason: string) => void;
}

export const StudyRoadmap: React.FC<StudyRoadmapProps> = ({
  isMidnight,
  activeSubject,
  chapters,
  selectedChapterId,
  userProgress,
  onSelectChapter,
  onNavigateToQuiz,
  subjectColor = '#0284c7',
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Filter chapters belonging strictly to the active subject (preserving logical sequence)
  const subjectChapters = chapters.filter(c => c.subject === activeSubject);

  // Helper: check completion metrics of each chapter
  const getChapterStatus = (chapter: Chapter) => {
    const quizScore = userProgress.quizScores[chapter.id] ?? 0;
    const quizAttempts = userProgress.quizAttempts?.[chapter.id] ?? 0;
    const cardIds = chapter.flashcards.map(f => f.id);
    const learnedCardsCount = cardIds.filter(id => userProgress.completedFlashcards.includes(id)).length;
    const totalCards = cardIds.length || 1;
    const flashcardProgress = Math.round((learnedCardsCount / totalCards) * 100);

    // Considered complete if quiz score >= 60% OR (quiz attempted with >= 50% and all flashcards mastered)
    const isMastered = quizScore >= 80;
    const isCompleted = quizScore >= 60 || (quizAttempts > 0 && flashcardProgress === 100);
    const isInProgress = (quizAttempts > 0 || learnedCardsCount > 0) && !isCompleted;

    return {
      quizScore,
      quizAttempts,
      learnedCardsCount,
      totalCards,
      flashcardProgress,
      isMastered,
      isCompleted,
      isInProgress,
      isUnattempted: !isCompleted && !isInProgress
    };
  };

  // Determine overall completion statistics
  const chapterStatuses = subjectChapters.map(ch => ({
    chapter: ch,
    status: getChapterStatus(ch)
  }));

  const completedCount = chapterStatuses.filter(s => s.status.isCompleted).length;
  const totalChapters = subjectChapters.length;
  const overallPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  // Determine the next recommended chapter to study
  // 1. Look for the first chapter in sequence that is NOT completed
  // 2. If all completed, recommend the one with lowest score for revision
  // 3. Fallback to the current selected chapter
  const firstIncomplete = chapterStatuses.find(s => !s.status.isCompleted);
  const lowestScored = [...chapterStatuses].sort((a, b) => a.status.quizScore - b.status.quizScore)[0];
  
  const nextRecommended = firstIncomplete ? firstIncomplete : (lowestScored || chapterStatuses[0]);
  const isSelectedRecommended = nextRecommended?.chapter.id === selectedChapterId;

  return (
    <section 
      aria-label="Chapter Progress Roadmap"
      className={`rounded-2xl transition-all border ${
        isMidnight 
          ? 'glass-panel border-slate-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.3)]' 
          : 'bg-white border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ backgroundColor: subjectColor }}
          >
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base font-extrabold ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                {activeSubject} Learning Roadmap
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {completedCount}/{totalChapters} Mastered ({overallPercentage}%)
              </span>
            </div>
            <p className="text-xs opacity-70 mt-0.5">
              Sequence-aligned CBSE mastery path for {activeSubject}
            </p>
          </div>
        </div>

        {/* Progress meter & collapse button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Visual mini bar */}
          <div className="w-24 sm:w-32 hidden xs:flex flex-col gap-1 text-right">
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-700">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${overallPercentage}%`,
                  backgroundColor: overallPercentage === 100 ? '#10b981' : subjectColor
                }}
              />
            </div>
            <span className="text-[10px] font-bold opacity-60">{overallPercentage}% Complete</span>
          </div>

          <button
            onClick={() => setCollapsed(prev => !prev)}
            className={`text-xs font-bold py-1 px-2.5 rounded-lg border transition-all ${
              isMidnight 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {collapsed ? 'Expand Roadmap' : 'Compact'}
          </button>
        </div>
      </div>

      {/* Suggested Next Chapter Highlight Banner */}
      {nextRecommended && (
        <div 
          className={`p-3.5 sm:p-4 mx-4 sm:mx-5 mt-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isMidnight
              ? 'bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900/60 border-sky-500/30 text-sky-100'
              : 'bg-gradient-to-r from-sky-50 via-indigo-50/60 to-white border-sky-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono">
                  Recommended Next Step
                </span>
                {isSelectedRecommended && (
                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Currently Selected
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold truncate mt-0.5">
                {nextRecommended.chapter.name}
              </h4>
              <p className="text-[11px] opacity-75 truncate">
                {nextRecommended.status.isCompleted 
                  ? 'All chapters finished! Recommended for high-yield revision to retain exam readiness.'
                  : nextRecommended.status.isInProgress
                    ? `Partially prepared (${nextRecommended.status.learnedCardsCount}/${nextRecommended.status.totalCards} cards learned, quiz score: ${nextRecommended.status.quizScore}%). Complete MCQs to finish!`
                    : 'Next logical foundational topic in the CBSE syllabus sequence.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {nextRecommended.chapter.id !== selectedChapterId ? (
              <button
                onClick={() => onSelectChapter(nextRecommended.chapter.id)}
                className="py-1.5 px-3.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Switch to Chapter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateToQuiz(nextRecommended.chapter.id)}
                className="py-1.5 px-3.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Take Chapter Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Sequence Roadmap Timeline */}
      {!collapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {chapterStatuses.map((item, index) => {
              const { chapter, status } = item;
              const isSelected = chapter.id === selectedChapterId;
              const isRecommended = nextRecommended?.chapter.id === chapter.id;

              return (
                <div
                  key={chapter.id}
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`group cursor-pointer relative p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 text-left ${
                    isSelected
                      ? isMidnight
                        ? 'bg-slate-800/90 border-sky-400/70 shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-sky-400/40'
                        : 'bg-[#f0f9ff] border-[#0058be] shadow-sm ring-1 ring-[#0058be]/20'
                      : isMidnight
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {/* Top Bar: Sequence Step + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                          status.isMastered
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : status.isCompleted
                              ? 'bg-sky-500 text-white'
                              : status.isInProgress
                                ? 'bg-amber-500 text-white'
                                : isMidnight
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {status.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                        Step {index + 1}
                      </span>
                    </div>

                    {/* Status badge */}
                    {status.isMastered ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" /> Mastered
                      </span>
                    ) : status.isCompleted ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                      </span>
                    ) : status.isInProgress ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" /> In Progress
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Chapter Title & Focus */}
                  <div>
                    <h5 className={`text-sm font-extrabold line-clamp-1 leading-snug ${
                      isSelected ? (isMidnight ? 'text-white' : 'text-[#0058be]') : ''
                    }`}>
                      {chapter.name}
                    </h5>
                    <p className="text-[11px] opacity-65 line-clamp-1 mt-0.5">
                      {chapter.keySummary[0] || 'Core Board concepts & formulas'}
                    </p>
                  </div>

                  {/* Metrics Row: Flashcards & Quiz Score */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="opacity-70 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-sky-500" />
                      {status.learnedCardsCount}/{status.totalCards} Cards
                    </span>
                    <span className={`font-bold ${
                      status.quizScore >= 80 
                        ? 'text-emerald-500' 
                        : status.quizScore >= 60 
                          ? 'text-sky-500' 
                          : status.quizAttempts > 0 
                            ? 'text-amber-500' 
                            : 'opacity-40'
                    }`}>
                      {status.quizAttempts > 0 ? `Quiz: ${status.quizScore}%` : 'Quiz: --'}
                    </span>
                  </div>

                  {/* Current Active Indicator Pill */}
                  {isSelected && (
                    <div 
                      className="absolute -top-1.5 right-3 text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: subjectColor }}
                    >
                      Active
                    </div>
                  )}

                  {/* Recommendation ribbon */}
                  {isRecommended && !isSelected && (
                    <div className="absolute -top-1.5 left-3 text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider bg-sky-500 text-white shadow-xs flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-current" /> Suggested
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
