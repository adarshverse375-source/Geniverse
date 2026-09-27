import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  Zap, 
  Layers, 
  GraduationCap, 
  Compass, 
  Sparkles, 
  Clock, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  ChevronRight,
  Move
} from 'lucide-react';
import { Chapter, SubjectType, UserProgress } from '../types';
import { cleanLatexMath } from './FormattedMessage';

export type SectionBoxId = 
  | 'notes' 
  | 'resources' 
  | 'formulas' 
  | 'flashcards' 
  | 'quiz' 
  | 'roadmap' 
  | 'pomodoro' 
  | 'badges';

interface SectionBoxesHubProps {
  isMidnight: boolean;
  activeChapter: Chapter;
  selectedSubject: SubjectType;
  subjectThemeBg: string;
  userProgress: UserProgress;
  activeQuestionsCount: number;
  customQuestionsCount: number;
  onOpenBox: (boxId: SectionBoxId) => void;
  onOpenAIFloating?: () => void;
}

export const SectionBoxesHub: React.FC<SectionBoxesHubProps> = ({
  isMidnight,
  activeChapter,
  selectedSubject,
  subjectThemeBg,
  userProgress,
  activeQuestionsCount,
  customQuestionsCount,
  onOpenBox,
  onOpenAIFloating,
}) => {
  const chapterScore = userProgress.quizScores[activeChapter.id] || 0;
  const learnedCardsCount = activeChapter.flashcards.filter(c => 
    userProgress.completedFlashcards.includes(c.id)
  ).length;

  const boxes: Array<{
    id: SectionBoxId;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    accentColor: string;
    previewText?: string;
    stats?: string;
    popular?: boolean;
    isMoveableAI?: boolean;
  }> = [
    {
      id: 'notes',
      title: 'Chapter Revision Notes',
      subtitle: 'Complete syllabus breakdown, core concepts & marking rubrics',
      badge: `${activeChapter.keySummary.length} Concepts`,
      icon: BookOpen,
      accentColor: '#0ea5e9', // Sky Blue
      previewText: activeChapter.keySummary[0] || 'Official CBSE syllabus takeaways',
      stats: 'Essential Theory',
      popular: true,
    },
    {
      id: 'resources',
      title: 'Important Resources & NCERT',
      subtitle: 'Official NCERT Textbooks, CBSE Syllabus, SQPs & Exemplars',
      badge: 'NCERT & CBSE',
      icon: FileText,
      accentColor: '#14b8a6', // Teal
      previewText: 'Direct official downloads & blueprint for 2025–26 board exams',
      stats: 'Official Materials',
      popular: true,
    },
    {
      id: 'formulas',
      title: 'Formulas & Key Theorems',
      subtitle: 'High-yield board exam formulas, mathematical proofs & laws',
      badge: `${activeChapter.formulasOrFacts.length} Formulas`,
      icon: Zap,
      accentColor: '#f59e0b', // Amber
      previewText: cleanLatexMath(activeChapter.formulasOrFacts[0] || 'Key Formulas Sheet'),
      stats: 'Quick Reference',
    },
    {
      id: 'flashcards',
      title: 'Active-Recall Flashcards',
      subtitle: 'Interactive 3D flip cards for high-yield board questions',
      badge: `${learnedCardsCount}/${activeChapter.flashcards.length} Learned`,
      icon: Layers,
      accentColor: '#6366f1', // Indigo
      previewText: activeChapter.flashcards[0]?.front || 'Self-testing memory drill',
      stats: '+15 XP per Card',
    },
    {
      id: 'quiz',
      title: 'Board Quizzes & Mock Test',
      subtitle: 'PYQ practice, AI exam generator & custom question pool',
      badge: `${activeQuestionsCount} Questions`,
      icon: GraduationCap,
      accentColor: '#10b981', // Emerald
      previewText: chapterScore > 0 ? `Best Score: ${chapterScore}%` : 'Unattempted mock test',
      stats: chapterScore > 0 ? `${chapterScore}% Mastered` : 'Practice Now',
      popular: true,
    },
    {
      id: 'roadmap',
      title: 'Syllabus Journey & Roadmap',
      subtitle: 'Visual chapter milestone track and completion progression',
      badge: 'Interactive',
      icon: Compass,
      accentColor: '#ec4899', // Pink
      previewText: 'Track your Class 10 preparation chapter by chapter',
      stats: 'Milestone Map',
    },
    {
      id: 'pomodoro',
      title: 'Focus Pomodoro Timer',
      subtitle: 'Distraction-free 25-minute study intervals with XP bonus',
      badge: 'Productivity',
      icon: Clock,
      accentColor: '#f43f5e', // Rose
      previewText: 'Structured deep-work intervals designed for board revision',
      stats: 'Focus Session',
    },
    {
      id: 'badges',
      title: 'Achievements & Growth',
      subtitle: 'Earned topper badges, streak metrics & total XP rank',
      badge: `${userProgress.unlockedBadges.length} Trophies`,
      icon: Trophy,
      accentColor: '#d97706', // Gold
      previewText: `${userProgress.points} Total XP • ${userProgress.streak} Days Streak`,
      stats: `${userProgress.points} XP`,
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full animate-fadeIn">
      {/* Classy, Aesthetic Chapter Banner */}
      <div 
        className={`p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
          isMidnight 
            ? 'glass-panel border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]' 
            : 'bg-white border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)]'
        }`}
      >
        {/* Subtle Decorative Ambient Background Glow */}
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: subjectThemeBg }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-lg shadow-md transition-transform hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${subjectThemeBg}, ${subjectThemeBg}cc)`,
                boxShadow: `0 8px 20px -4px ${subjectThemeBg}40`
              }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${subjectThemeBg}18`,
                    color: subjectThemeBg
                  }}
                >
                  {selectedSubject} &bull; Section Hub
                </span>
                <span className="text-[11px] font-semibold opacity-60">
                  Class 10 CBSE Board
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-black font-heading mt-1 tracking-tight ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                {activeChapter.name}
              </h2>
            </div>
          </div>

          {/* Quick Mastery Chip */}
          <div className="flex items-center gap-3">
            <div 
              className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${
                isMidnight ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold opacity-60 block leading-tight">Mastery</span>
                <span className="text-xs font-black text-emerald-400">
                  {chapterScore > 0 ? `${chapterScore}% Score` : 'Ready to Learn'}
                </span>
              </div>
              {chapterScore >= 80 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Flame className="w-5 h-5 text-amber-400" />
              )}
            </div>
          </div>
        </div>

        {/* Clean Aesthetic Sub-instruction banner */}
        <p className="text-xs opacity-75 mt-3.5 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-2 font-medium">
          <span className="text-amber-400">✨</span>
          <span>Click any <strong>Section Box</strong> to open its clean view, or tap the <strong>moveable circular AI orb</strong> in the corner anytime!</span>
        </p>
      </div>

      {/* ======================================================= */}
      {/* THE SECTION BOXES (AESTHETIC, CLASSY, STRUCTURED TILES) */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxes.map((box) => {
          const Icon = box.icon;
          return (
            <motion.div
              key={box.id}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                if (box.isMoveableAI && onOpenAIFloating) {
                  onOpenAIFloating();
                } else {
                  onOpenBox(box.id);
                }
              }}
              className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative flex flex-col justify-between overflow-hidden ${
                isMidnight 
                  ? 'glass-panel hover:border-white/20 hover:bg-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]' 
                  : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]'
              }`}
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: box.accentColor,
              }}
            >
              {/* Top Accent Radial Glow on hover */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-300 blur-2xl pointer-events-none"
                style={{ backgroundColor: box.accentColor }}
              />

              {/* Box Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs"
                    style={{ 
                      backgroundColor: `${box.accentColor}18`,
                      color: box.accentColor 
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {box.isMoveableAI ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                        <Move className="w-2.5 h-2.5 animate-pulse" />
                        Moveable
                      </span>
                    ) : box.popular ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                        High Yield
                      </span>
                    ) : null}
                    
                    <span 
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: isMidnight ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                        borderColor: isMidnight ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                        color: isMidnight ? '#94a3b8' : '#64748b'
                      }}
                    >
                      {box.badge}
                    </span>
                  </div>
                </div>

                <h3 className={`text-base font-extrabold font-heading tracking-tight group-hover:text-sky-400 transition-colors ${
                  isMidnight ? 'text-white' : 'text-slate-900'
                }`}>
                  {box.title}
                </h3>

                <p className="text-xs opacity-70 leading-relaxed mt-1 line-clamp-2 font-medium">
                  {box.subtitle}
                </p>

                {/* Micro preview snippet */}
                {box.previewText && (
                  <div 
                    className={`mt-3 p-2.5 rounded-xl text-[11px] font-medium border truncate ${
                      isMidnight 
                        ? 'bg-slate-950/50 border-white/5 text-slate-300' 
                        : 'bg-slate-50 border-slate-200/70 text-slate-700'
                    }`}
                  >
                    <span className="opacity-50 mr-1.5 font-bold">Preview:</span>
                    <span className="italic">{box.previewText}</span>
                  </div>
                )}
              </div>

              {/* Box Footer Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-bold opacity-60">
                  {box.stats}
                </span>

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-black transition-all duration-200 group-hover:translate-x-1"
                  style={{ color: box.accentColor }}
                >
                  <span>{box.isMoveableAI ? 'Summon AI' : 'Open Section'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
