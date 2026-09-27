import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  GraduationCap, 
  Flame, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Check, 
  FileText,
  BadgeAlert,
  Zap,
  Layers,
  Compass,
  Clock,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { ThemeType, SubjectType, Question, CustomQuestion, Flashcard, Chapter, UserProgress, BADGES } from './types';
import { CBSE_CHAPTERS } from './data';
import { AddQuestionModal } from './components/AddQuestionModal';
import { ManageQuestionsModal } from './components/ManageQuestionsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PomodoroTimer } from './components/PomodoroTimer';
import { StudyRoadmap } from './components/StudyRoadmap';
import { QuizView } from './components/QuizView';
import { cleanLatexMath } from './components/FormattedMessage';
import { Bright10Logo } from './components/Bright10Logo';
import { ImportantResourcesSection } from './components/ImportantResourcesSection';
import { PWBottomNav, MainTabType } from './components/PWBottomNav';
import { SectionBoxesHub, SectionBoxId } from './components/SectionBoxesHub';
import { FloatingAITutor } from './components/FloatingAITutor';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  // --- Splash Screen State ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Moveable Floating Circular AI Tutor State ---
  const [isFloatingAITutorOpen, setIsFloatingAITutorOpen] = useState(false);

  // --- Persistent User Progress State ---
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('cbse_brights_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number') return parsed;
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }
    return {
      theme: 'midnight', // Default to sleek midnight glassmorphic
      points: 150,
      streak: 5,
      lastActiveDate: new Date().toLocaleDateString(),
      quizScores: {},
      quizAttempts: {},
      completedFlashcards: [],
      unlockedBadges: ['novice', 'scholar']
    };
  });

  const activeTheme = userProgress.theme;

  useEffect(() => {
    localStorage.setItem('cbse_brights_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // --- UI Navigation State: Minimal Section Box Architecture ---
  // When activeSectionBox is null, the clean Section Boxes Hub is shown.
  // When activeSectionBox has a value (e.g. 'notes', 'resources'), ONLY that box is shown.
  const [activeSectionBox, setActiveSectionBox] = useState<SectionBoxId | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Mathematics');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('math-real-numbers');

  // Chapters filtered by subject (memoized for instantaneous switching)
  const filteredChapters = useMemo(() => CBSE_CHAPTERS.filter(c => c.subject === selectedSubject), [selectedSubject]);
  const activeChapter = useMemo(() => CBSE_CHAPTERS.find(c => c.id === selectedChapterId) || filteredChapters[0] || CBSE_CHAPTERS[0], [selectedChapterId, filteredChapters]);

  // Auto-align chapter if subject changes
  useEffect(() => {
    if (activeChapter.subject !== selectedSubject && filteredChapters.length > 0) {
      setSelectedChapterId(filteredChapters[0].id);
    }
  }, [selectedSubject, activeChapter.subject, filteredChapters]);

  // Dynamically update browser tab favicon with active subject theme color
  useEffect(() => {
    try {
      const themeColors: Record<SubjectType, string> = {
        'Mathematics': '#38bdf8',
        'Science': '#10b981',
        'Social Science': '#f59e0b',
        'English Literature': '#c084fc',
      };
      const color = themeColors[selectedSubject] || '#38bdf8';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#040508"/><circle cx="32" cy="32" r="24" fill="${color}" opacity="0.3"/><polygon points="32,12 36,28 52,32 36,36 32,52 28,36 12,32 28,28" fill="${color}"/><circle cx="32" cy="32" r="3.5" fill="#ffffff"/></svg>`;
      const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = dataUri;
      }
    } catch {
      // Graceful fallback for non-browser runtimes
    }
  }, [selectedSubject]);

  // Sequential chapter browsing helpers
  const currentChapterIndex = useMemo(() => filteredChapters.findIndex(c => c.id === activeChapter.id), [filteredChapters, activeChapter.id]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setSelectedChapterId(filteredChapters[currentChapterIndex - 1].id);
    }
  }, [currentChapterIndex, filteredChapters]);

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < filteredChapters.length - 1) {
      setSelectedChapterId(filteredChapters[currentChapterIndex + 1].id);
    }
  }, [currentChapterIndex, filteredChapters]);

  // --- Flashcards State ---
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
  }, [selectedChapterId]);

  // --- Custom User Questions State ---
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('cbse_brights_custom_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse custom questions', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cbse_brights_custom_questions', JSON.stringify(customQuestions));
  }, [customQuestions]);

  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] = useState(false);

  const getChapterQuestions = useCallback((chapId: string) => {
    const chap = CBSE_CHAPTERS.find(c => c.id === chapId) || CBSE_CHAPTERS[0];
    const userAdded = customQuestions.filter(q => q.chapterId === chapId);
    return [...chap.highYieldQuestions, ...userAdded];
  }, [customQuestions]);

  // --- Quiz Practice State ---
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => getChapterQuestions(selectedChapterId));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // AI MCQ Generator state
  const [aiQuizLoading, setAiQuizLoading] = useState(false);
  const [aiQuizError, setAiQuizError] = useState<string | null>(null);
  const [customQuizGenerated, setCustomQuizGenerated] = useState(false);

  useEffect(() => {
    if (!customQuizGenerated) {
      setActiveQuestions(getChapterQuestions(selectedChapterId));
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuizScore(0);
      setQuizFinished(false);
      setAiQuizError(null);
    }
  }, [selectedChapterId, activeChapter, customQuestions, customQuizGenerated, getChapterQuestions]);

  // --- Toast Feedback with debounce cleanup ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3600);
  }, []);

  const addPoints = useCallback((amount: number, reason: string) => {
    setUserProgress(prev => {
      const newPoints = prev.points + amount;
      let newlyUnlocked: string[] = [...prev.unlockedBadges];
      
      BADGES.forEach(badge => {
        if (newPoints >= badge.unlockedAtPoints && !newlyUnlocked.includes(badge.id)) {
          newlyUnlocked.push(badge.id);
          setTimeout(() => {
            showToast(`🏆 Achievement Unlocked: ${badge.title}!`, 'success');
          }, 400);
        }
      });

      return {
        ...prev,
        points: newPoints,
        unlockedBadges: newlyUnlocked
      };
    });
    showToast(`+${amount} Points: ${reason}!`, 'success');
  }, [showToast]);

  const toggleTheme = () => {
    const nextTheme: ThemeType = activeTheme === 'learning' ? 'midnight' : 'learning';
    setUserProgress(prev => ({ ...prev, theme: nextTheme }));
    showToast(`Switched to ${nextTheme === 'learning' ? 'Learning Brights (Tactile)' : 'Midnight Brights (Glassmorphic)'} theme!`, 'info');
  };

  const handleSaveCustomQuestion = (newQuestion: CustomQuestion) => {
    setCustomQuestions(prev => [newQuestion, ...prev]);
    addPoints(25, 'Contributed Custom Question');
    showToast('Question saved to Board MCQ pool! +25 XP', 'success');
  };

  const handleDeleteCustomQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
    showToast('Question removed from quiz pool', 'info');
  };

  // --- AI Quiz Generator ---
  const generateAIQuiz = async () => {
    if (aiQuizLoading) return;
    setAiQuizLoading(true);
    setAiQuizError(null);
    showToast('Consulting Board Paper setter...', 'info');

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: activeChapter.name,
          count: 4
        })
      });

      if (!res.ok) {
        throw new Error('Board generation server error. Verify your server is online.');
      }

      const data = await res.json();
      if (data && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setActiveQuestions(data.questions);
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setQuizScore(0);
        setQuizFinished(false);
        setCustomQuizGenerated(true);
        showToast('Successfully generated fresh CBSE Board MCQs!', 'success');
        addPoints(15, 'Generated Custom AI Quiz');
      } else {
        throw new Error('Invalid quiz response structure received.');
      }
    } catch (err: any) {
      console.error(err);
      setAiQuizError(err.message || 'Failed to generate custom board exam MCQs. Using offline preloaded syllabus questions.');
      showToast('Using preloaded questions', 'error');
    } finally {
      setAiQuizLoading(false);
    }
  };

  // --- Quiz Handlers ---
  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    
    const correct = selectedOption === activeQuestions[currentQuestionIdx].correctIndex;
    if (correct) {
      setQuizScore(prev => prev + 1);
      addPoints(10, `Correct Answer to Q${currentQuestionIdx + 1}`);
      showToast('Fabulous! Correct answer.', 'success');
    } else {
      showToast('Review the explanation.', 'error');
    }
  };

  const handleQuizNext = () => {
    if (currentQuestionIdx < activeQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      const finalPercentage = Math.round((quizScore / activeQuestions.length) * 100);
      setUserProgress(prev => {
        const currentHigh = prev.quizScores[activeChapter.id] || 0;
        const attempts = (prev.quizAttempts[activeChapter.id] || 0) + 1;
        
        return {
          ...prev,
          quizScores: {
            ...prev.quizScores,
            [activeChapter.id]: Math.max(currentHigh, finalPercentage)
          },
          quizAttempts: {
            ...prev.quizAttempts,
            [activeChapter.id]: attempts
          }
        };
      });

      if (finalPercentage === 100) {
        addPoints(50, 'Perfect Score 100% on Board MCQ Mock Exam');
      } else if (finalPercentage >= 70) {
        addPoints(25, 'Finished Board MCQ Mock Exam (Passed)');
      } else {
        addPoints(10, 'Completed Board MCQ Mock Exam');
      }
    }
  };

  const handleQuizPrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleQuizRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleFlashcardComplete = (cardId: string) => {
    if (userProgress.completedFlashcards.includes(cardId)) {
      showToast('Flashcard already learned!', 'info');
      return;
    }
    
    setUserProgress(prev => ({
      ...prev,
      completedFlashcards: [...prev.completedFlashcards, cardId]
    }));
    addPoints(15, 'Learned Study Flashcard');
  };

  const isMidnight = activeTheme === 'midnight';
  
  const getSubjectColor = (subj: SubjectType) => {
    switch (subj) {
      case 'Mathematics':
        return isMidnight ? '#38bdf8' : '#0058be';
      case 'Science':
        return isMidnight ? '#ec4899' : '#dc2c4f';
      case 'Social Science':
        return isMidnight ? '#f97316' : '#ea580c';
      case 'English Literature':
        return isMidnight ? '#10b981' : '#059669';
    }
  };

  const subjectThemeBg = getSubjectColor(selectedSubject);

  // Sync bottom nav tab
  const getActiveTabForNav = (): MainTabType => {
    if (!activeSectionBox) return 'hub';
    if (activeSectionBox === 'notes') return 'notes';
    if (activeSectionBox === 'quiz') return 'quiz';
    if (activeSectionBox === 'resources') return 'resources';
    if (activeSectionBox === 'badges') return 'badges';
    return 'hub';
  };

  const handleBottomNavClick = (tab: MainTabType) => {
    if (tab === 'hub') {
      setActiveSectionBox(null);
    } else if (tab === 'notes') {
      setActiveSectionBox('notes');
    } else if (tab === 'quiz') {
      setActiveSectionBox('quiz');
    } else if (tab === 'resources') {
      setActiveSectionBox('resources');
    } else if (tab === 'badges') {
      setActiveSectionBox('badges');
    }
  };

  // Section meta dictionary for opened box headers
  const SECTION_META: Record<SectionBoxId, { title: string; icon: React.ElementType; color: string }> = {
    notes: { title: 'Chapter Revision Notes', icon: BookOpen, color: '#0284c7' },
    resources: { title: 'NCERT & CBSE Important Resources', icon: FileText, color: '#0d9488' },
    formulas: { title: 'Formulas & Key Theorems', icon: Zap, color: '#f59e0b' },
    flashcards: { title: 'Active-Recall Study Flashcards', icon: Layers, color: '#6366f1' },
    quiz: { title: 'Board Quizzes & PYQs', icon: GraduationCap, color: '#10b981' },
    roadmap: { title: 'Syllabus Journey & Roadmap', icon: Compass, color: '#ec4899' },
    pomodoro: { title: 'Focus Pomodoro Timer', icon: Clock, color: '#f43f5e' },
    badges: { title: 'Topper Badges & Growth', icon: Trophy, color: '#d97706' },
  };

  return (
    <div 
      id="app-root-container"
      className={`min-h-screen w-full transition-colors duration-300 ${
        isMidnight 
          ? 'bg-[#0b0f19] text-[#e2e8f0] selection:bg-[#38bdf8]/30 selection:text-white' 
          : 'bg-[#f8fafc] text-[#0f172a] selection:bg-[#0058be]/20'
      }`}
    >
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {isMidnight ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[130px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/10 blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[5%] left-[2%] w-56 h-56 rounded-full bg-sky-100/60 blur-3xl" />
            <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full bg-amber-50/70 blur-3xl" />
          </>
        )}
      </div>

      {/* --- Toast Alert --- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="app-toast-alert"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl max-w-md w-[90%] border ${
              isMidnight ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- High-End 3D OLED Splash Screen with Subject Morphing --- */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen 
            onDismiss={() => setShowSplash(false)} 
            activeSubject={selectedSubject} 
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-5 md:py-7 pb-28 flex flex-col gap-5">
        
        {/* ======================================================= */}
        {/* MINIMAL, SLEEK HEADER BAR WITH LOGO                     */}
        {/* ======================================================= */}
        {/* ======================================================= */}
        {/* 3D GLASSY OLED UPPER HEADER SECTION                     */}
        {/* ======================================================= */}
        <header 
          id="app-header"
          className={`relative p-5 sm:p-6 rounded-3xl border transition-all overflow-hidden ${
            isMidnight 
              ? 'bg-[#000000]/90 border-white/15 backdrop-blur-2xl shadow-[0_24px_60px_-10px_rgba(0,0,0,0.9),inset_0_1.5px_2px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.95)]' 
              : 'bg-white/95 border-slate-200/90 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,1)]'
          }`}
        >
          {/* 3D Convex Top Specular Sheen */}
          <div 
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl"
            style={{
              background: isMidnight
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 60%, transparent 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.2) 60%, transparent 100%)'
            }}
          />

          {/* OLED Ambient Atmosphere Glows */}
          {isMidnight && (
            <>
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Brand Identity: Dynamic Morphing App Icon & 3D Typography */}
            <div 
              onClick={() => setActiveSectionBox(null)}
              className="flex items-center gap-3.5 cursor-pointer group select-none"
              title="Return to Section Hub • Click to reset view"
            >
              <div id="app-brand-logo" className="shrink-0 transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <Bright10Logo size={52} glow={true} isMidnight={isMidnight} subject={selectedSubject} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-none text-white flex items-center">
                    <span className={isMidnight ? 'text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]' : 'text-slate-900'}>
                      Bright
                    </span>
                    <span className="text-[#38bdf8] ml-1.5 drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]">
                      10
                    </span>
                  </h1>
                  
                  {/* 3D Glassy Pill Badge */}
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: isMidnight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                      borderColor: isMidnight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)',
                      color: isMidnight ? '#7dd3fc' : '#0284c7',
                      boxShadow: isMidnight ? 'inset 0 1px 1px rgba(255, 255, 255, 0.25)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    CBSE Class 10
                  </span>
                </div>
                <p className={`text-xs font-semibold tracking-wide mt-1.5 ${isMidnight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Minimal Board Exam Learning Hub
                </p>
              </div>
            </div>

            {/* 3D Glassy OLED Badges: XP, Streak, Theme */}
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap w-full md:w-auto">
              
              {/* 3D Glass XP Tile */}
              <div 
                onClick={() => setActiveSectionBox('badges')}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isMidnight 
                    ? 'bg-[#000000]/80 border-amber-500/35 text-white hover:border-amber-400/60' 
                    : 'bg-white border-amber-300/80 text-slate-800 shadow-sm hover:border-amber-400'
                }`}
                style={{
                  boxShadow: isMidnight 
                    ? '0 8px 20px -2px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px rgba(255, 255, 255, 0.2), 0 0 12px -2px rgba(245, 158, 11, 0.15)' 
                    : '0 4px 14px -2px rgba(245, 158, 11, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                }}
                title="View XP and Badges"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Trophy className="w-4 h-4 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block">SCORE</span>
                  <span className="font-heading font-black text-sm text-amber-300 drop-shadow-[0_1px_4px_rgba(245,158,11,0.3)]">
                    {userProgress.points} XP
                  </span>
                </div>
              </div>

              {/* 3D Glass Streak Tile */}
              <div 
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${
                  isMidnight 
                    ? 'bg-[#000000]/80 border-orange-500/35 text-white' 
                    : 'bg-white border-orange-300/80 text-slate-800 shadow-sm'
                }`}
                style={{
                  boxShadow: isMidnight 
                    ? '0 8px 20px -2px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px rgba(255, 255, 255, 0.2), 0 0 12px -2px rgba(249, 115, 22, 0.15)' 
                    : '0 4px 14px -2px rgba(249, 115, 22, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                }}
                title="Current Daily Board Study Streak"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
                  <Flame className="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block">STREAK</span>
                  <span className="font-heading font-black text-sm text-orange-400 drop-shadow-[0_1px_4px_rgba(249,115,22,0.3)]">
                    {userProgress.streak} Days
                  </span>
                </div>
              </div>

              {/* PWA Install Button */}
              <PWAInstallButton isMidnight={isMidnight} />

              {/* Splash Screen Replay Button */}
              <button
                type="button"
                onClick={() => setShowSplash(true)}
                className={`p-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isMidnight 
                    ? 'bg-[#000000]/80 text-amber-300 border-white/20 hover:border-amber-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.25)]' 
                    : 'bg-white text-amber-600 border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:border-slate-300'
                }`}
                title="View Intro Splash Screen"
                aria-label="View Splash Screen"
              >
                <Sparkles className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              </button>

              {/* 3D Glass Theme Switcher */}
              <button 
                id="theme-toggle-slider"
                onClick={toggleTheme}
                className={`p-2.5 rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isMidnight 
                    ? 'bg-[#000000]/80 text-sky-300 border-white/20 hover:border-sky-400/60 shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.25)]' 
                    : 'bg-white text-slate-800 border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:border-slate-300'
                }`}
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {isMidnight ? (
                  <Moon className="w-4 h-4 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </button>

            </div>

          </div>
        </header>

        {/* ======================================================= */}
        {/* COMPACT SUBJECT SELECTOR                                 */}
        {/* ======================================================= */}
        <nav aria-label="Subject Selector" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Mathematics', 'Science', 'Social Science', 'English Literature'] as SubjectType[]).map((subj) => {
            const isSelected = selectedSubject === subj;
            const itemColor = getSubjectColor(subj);
            
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`py-2.5 px-3.5 rounded-xl text-left transition-all relative flex items-center justify-between border ${
                  isSelected
                    ? isMidnight 
                      ? 'bg-slate-800/90 text-white font-black shadow-md' 
                      : 'bg-white text-slate-900 font-black shadow-sm'
                    : isMidnight
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                }`}
                style={{
                  borderColor: isSelected ? itemColor : undefined,
                  borderLeftWidth: isSelected ? '4px' : undefined,
                  borderLeftColor: isSelected ? itemColor : undefined,
                }}
              >
                <div className="truncate">
                  <span className="text-[9px] uppercase font-bold opacity-60 block leading-tight">Class 10</span>
                  <span className="text-xs sm:text-sm font-bold truncate block">{subj}</span>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full shrink-0 ml-1" style={{ backgroundColor: itemColor }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ======================================================= */}
        {/* COMPACT CHAPTER PICKER BAR (Replaces Clunky 16-item Side) */}
        {/* ======================================================= */}
        <section 
          id="chapter-picker-bar"
          className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
            isMidnight ? 'glass-panel border-slate-800/90' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold opacity-60 shrink-0">Chapter:</span>
            
            {/* Styled Native Select for zero-friction chapter switching */}
            <div className="relative flex-1 max-w-md">
              <select
                aria-label="Select CBSE Chapter"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className={`w-full py-1.5 pl-3 pr-8 rounded-xl font-bold text-xs sm:text-sm appearance-none cursor-pointer border transition-all truncate ${
                  isMidnight 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:outline-hidden' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:outline-hidden'
                }`}
              >
                {filteredChapters.map((ch, idx) => (
                  <option key={ch.id} value={ch.id}>
                    Ch {idx + 1}: {ch.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 opacity-50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sequential Prev / Next Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[11px] font-bold opacity-60 mr-1 hidden sm:inline">
              {currentChapterIndex + 1} of {filteredChapters.length}
            </span>

            <div className="flex gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevChapter}
                disabled={currentChapterIndex === 0}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentChapterIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : isMidnight 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNextChapter}
                disabled={currentChapterIndex === filteredChapters.length - 1}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  currentChapterIndex === filteredChapters.length - 1
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : isMidnight 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* MAIN CONTENT AREA: SECTION BOXES HUB OR OPENED BOX     */}
        {/* ======================================================= */}
        <main className="w-full">
          <AnimatePresence mode="wait">
            
            {/* --------------------------------------------------- */}
            {/* VIEW A: SECTION BOXES HUB (MINIMAL & SIMPLE)        */}
            {/* --------------------------------------------------- */}
            {activeSectionBox === null ? (
              <motion.div
                key="section-boxes-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SectionBoxesHub
                  isMidnight={isMidnight}
                  activeChapter={activeChapter}
                  selectedSubject={selectedSubject}
                  subjectThemeBg={subjectThemeBg}
                  userProgress={userProgress}
                  activeQuestionsCount={activeQuestions.length}
                  customQuestionsCount={customQuestions.filter(q => q.chapterId === activeChapter.id).length}
                  onOpenBox={(boxId) => setActiveSectionBox(boxId)}
                  onOpenAIFloating={() => setIsFloatingAITutorOpen(true)}
                />
              </motion.div>
            ) : (
              /* --------------------------------------------------- */
              /* VIEW B: FOCUSED OPENED SECTION BOX VIEW             */
              /* --------------------------------------------------- */
              <motion.div
                key={`opened-box-${activeSectionBox}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* Clean Top Navigation Bar for Opened Box */}
                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isMidnight ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="btn-back-to-hub"
                      onClick={() => setActiveSectionBox(null)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                        isMidnight 
                          ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to All Section Boxes</span>
                    </button>

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold opacity-60 block leading-tight">
                        {selectedSubject} • {activeChapter.name}
                      </span>
                      <h2 className="text-sm sm:text-base font-black truncate">
                        {SECTION_META[activeSectionBox].title}
                      </h2>
                    </div>
                  </div>

                  {/* Horizontal Quick Switcher Pills for Other Boxes */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {(Object.keys(SECTION_META) as SectionBoxId[]).map((boxId) => {
                      const isCurrent = activeSectionBox === boxId;
                      const Icon = SECTION_META[boxId].icon;
                      return (
                        <button
                          key={boxId}
                          onClick={() => setActiveSectionBox(boxId)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                            isCurrent
                              ? isMidnight 
                                ? 'bg-sky-500 text-white shadow-sm' 
                                : 'bg-sky-600 text-white shadow-sm'
                              : isMidnight 
                                ? 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800' 
                                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{SECTION_META[boxId].title.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 1. NOTES BOX CONTENT                              */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'notes' && (
                  <section 
                    id="opened-box-notes"
                    className={`p-6 rounded-2xl border transition-all ${
                      isMidnight ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4 border-slate-200/50 dark:border-slate-800/60">
                      <div>
                        <span 
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                          style={{
                            backgroundColor: `${subjectThemeBg}15`,
                            color: subjectThemeBg
                          }}
                        >
                          {activeChapter.subject}
                        </span>
                        <h3 className={`text-2xl font-black mt-1.5 ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                          {activeChapter.name} Complete Notes
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveSectionBox('quiz')}
                          className={`text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 ${
                            isMidnight 
                              ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          Take Practice Test
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Key Takeaways Grid */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        📝 Core Syllabus Breakdown & Exam Takeaways
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeChapter.keySummary.map((bullet, idx) => (
                          <li 
                            key={idx}
                            className={`p-4 rounded-xl border flex gap-3.5 ${
                              isMidnight 
                                ? 'bg-slate-900/40 border-slate-800 text-slate-300' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span 
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-xs"
                              style={{ backgroundColor: subjectThemeBg }}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-xs leading-relaxed font-medium">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick reference formulas sheet */}
                    <div className="mt-6 p-4 rounded-xl bg-violet-600/5 border border-violet-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase text-violet-500 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4" />
                          Board Quick Formulas Reference
                        </h4>
                        <button
                          onClick={() => setActiveSectionBox('formulas')}
                          className="text-xs font-bold text-violet-500 hover:underline flex items-center gap-1"
                        >
                          <span>Full Formula Sheet</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {activeChapter.formulasOrFacts.map((fact, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl text-xs font-semibold border ${
                              isMidnight 
                                ? 'bg-slate-900/80 border-indigo-500/30 text-indigo-100' 
                                : 'bg-white text-slate-800 border-indigo-100'
                            }`}
                          >
                            <span className="select-all font-mono font-bold">{cleanLatexMath(fact)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* ------------------------------------------------- */}
                {/* 2. IMPORTANT RESOURCES BOX CONTENT                */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'resources' && (
                  <ImportantResourcesSection 
                    isMidnight={isMidnight}
                    selectedSubject={selectedSubject}
                    selectedChapterId={selectedChapterId}
                  />
                )}

                {/* ------------------------------------------------- */}
                {/* 3. FORMULAS BOX CONTENT                           */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'formulas' && (
                  <section 
                    id="opened-box-formulas"
                    className={`p-6 rounded-2xl border transition-all ${
                      isMidnight ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="mb-6 border-b pb-4 border-slate-200/50 dark:border-slate-800/60">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/10 text-amber-500">
                        Board Formula Sheet
                      </span>
                      <h3 className={`text-2xl font-black mt-1.5 ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                        {activeChapter.name} Formulas & Theorems
                      </h3>
                      <p className="text-xs opacity-70 mt-1">
                        High-yield formulas, laws, and definitions guaranteed to carry marks in board exams.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {activeChapter.formulasOrFacts.map((formula, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                            isMidnight 
                              ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-amber-500/50' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded">
                              Law #{idx + 1}
                            </span>
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          
                          <div className="py-2">
                            <p className="font-mono font-black text-sm select-all">
                              {cleanLatexMath(formula)}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/50 flex justify-between items-center text-[10px] opacity-60">
                            <span>CBSE Standard</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(cleanLatexMath(formula));
                                showToast('Formula copied to clipboard!', 'success');
                              }}
                              className="font-bold hover:text-amber-500"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ------------------------------------------------- */}
                {/* 4. FLASHCARDS BOX CONTENT                         */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'flashcards' && (
                  <section 
                    id="opened-box-flashcards"
                    className={`p-6 rounded-2xl border transition-all ${
                      isMidnight ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className={`text-lg font-black ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
                          🧠 Active-Recall Study Flashcards
                        </h3>
                        <p className="text-xs opacity-75 mt-0.5">Flip cards to test memory. Mark as Learned to gain +15 XP!</p>
                      </div>
                      <span className="text-xs font-bold py-1 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        Card {currentCardIdx + 1} of {activeChapter.flashcards.length}
                      </span>
                    </div>

                    {activeChapter.flashcards.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        <div 
                          onClick={() => setIsCardFlipped(prev => !prev)}
                          className="h-[190px] w-full cursor-pointer relative transition-all duration-500"
                          style={{ perspective: '1000px' }}
                        >
                          <div 
                            className="absolute inset-0 w-full h-full transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between"
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              backgroundColor: isMidnight 
                                ? isCardFlipped ? '#1e1c24' : 'rgba(30,41,59,0.9)' 
                                : isCardFlipped ? '#fff8e1' : '#ffffff',
                              border: `2px solid ${isCardFlipped ? '#f59e0b' : subjectThemeBg}`,
                            }}
                          >
                            {!isCardFlipped ? (
                              <div className="flex flex-col justify-between h-full" style={{ backfaceVisibility: 'hidden' }}>
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">BOARD QUESTION</span>
                                <p className={`text-sm md:text-base font-bold text-center self-center max-w-lg ${
                                  isMidnight ? 'text-[#e6e0e9]' : 'text-slate-900'
                                }`}>
                                  {activeChapter.flashcards[currentCardIdx].front}
                                </p>
                                <span className="text-[10px] italic text-center text-slate-400 block mt-2">Click card to reveal answer</span>
                              </div>
                            ) : (
                              <div 
                                className="flex flex-col justify-between h-full text-center" 
                                style={{ 
                                  backfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg)'
                                }}
                              >
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider text-amber-500 block">ANSWER SCHEME EXPLAINED</span>
                                <p className={`text-xs md:text-sm font-bold max-w-lg mx-auto ${
                                  isMidnight ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {activeChapter.flashcards[currentCardIdx].back}
                                </p>
                                {activeChapter.flashcards[currentCardIdx].extraInfo && (
                                  <span className="text-[10px] text-violet-500 font-bold block bg-violet-500/10 py-1 px-2.5 rounded">
                                    💡 Tip: {activeChapter.flashcards[currentCardIdx].extraInfo}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2">
                            <button
                              disabled={currentCardIdx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setTimeout(() => setCurrentCardIdx(prev => prev - 1), 150);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                currentCardIdx === 0 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              disabled={currentCardIdx === activeChapter.flashcards.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setTimeout(() => setCurrentCardIdx(prev => prev + 1), 150);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                currentCardIdx === activeChapter.flashcards.length - 1 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          <button
                            id="btn-mark-learned-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlashcardComplete(activeChapter.flashcards[currentCardIdx].id);
                            }}
                            className={`text-xs font-extrabold flex items-center gap-2 py-2 px-4 rounded-xl transition-all ${
                              userProgress.completedFlashcards.includes(activeChapter.flashcards[currentCardIdx].id)
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30'
                                : isMidnight
                                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {userProgress.completedFlashcards.includes(activeChapter.flashcards[currentCardIdx].id) ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-500" />
                                Learnt & Mastered
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 opacity-70" />
                                Mark as Learnt (+15 XP)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm opacity-60 text-center py-6">No study flashcards available for this section.</p>
                    )}
                  </section>
                )}

                {/* ------------------------------------------------- */}
                {/* 5. QUIZ BOX CONTENT                               */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'quiz' && (
                  <QuizView
                    isMidnight={isMidnight}
                    activeQuestions={activeQuestions}
                    currentQuestionIdx={currentQuestionIdx}
                    selectedOption={selectedOption}
                    isAnswerSubmitted={isAnswerSubmitted}
                    quizScore={quizScore}
                    quizFinished={quizFinished}
                    aiQuizLoading={aiQuizLoading}
                    aiQuizError={aiQuizError}
                    customQuestionsCount={customQuestions.filter(q => q.chapterId === activeChapter.id).length}
                    subjectName={activeChapter.subject}
                    chapterName={activeChapter.name}
                    subjectColor={subjectThemeBg}
                    onSelectOption={handleOptionSelect}
                    onSubmitAnswer={handleQuizSubmit}
                    onNextQuestion={handleQuizNext}
                    onPreviousQuestion={handleQuizPrevious}
                    onRestartQuiz={handleQuizRestart}
                    onGenerateAIQuiz={generateAIQuiz}
                    onOpenAddQuestion={() => setIsAddQuestionModalOpen(true)}
                    onOpenManageQuestions={() => setIsManageQuestionsModalOpen(true)}
                  />
                )}

                {/* ------------------------------------------------- */}
                {/* 6. ROADMAP BOX CONTENT                            */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'roadmap' && (
                  <StudyRoadmap
                    isMidnight={isMidnight}
                    activeSubject={selectedSubject}
                    chapters={CBSE_CHAPTERS}
                    selectedChapterId={selectedChapterId}
                    userProgress={userProgress}
                    onSelectChapter={(chapId) => setSelectedChapterId(chapId)}
                    onNavigateToQuiz={(chapId) => {
                      setSelectedChapterId(chapId);
                      setActiveSectionBox('quiz');
                    }}
                    subjectColor={subjectThemeBg}
                    onAwardBonusPoints={addPoints}
                  />
                )}

                {/* ------------------------------------------------- */}
                {/* 7. FOCUS TIMER (POMODORO) BOX CONTENT             */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'pomodoro' && (
                  <PomodoroTimer
                    isMidnight={isMidnight}
                    activeSubject={selectedSubject}
                    activeChapterName={activeChapter.name}
                    onAwardPoints={addPoints}
                    subjectColor={subjectThemeBg}
                  />
                )}

                {/* ------------------------------------------------- */}
                {/* 9. BADGES & GROWTH BOX CONTENT                    */}
                {/* ------------------------------------------------- */}
                {activeSectionBox === 'badges' && (
                  <div className="flex flex-col gap-6">
                    {/* Performance Bento Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Ring */}
                      <div 
                        className={`p-5 rounded-2xl flex flex-col items-center gap-3 justify-center ${
                          isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-sm'
                        }`}
                      >
                        <h4 className="text-xs uppercase font-extrabold text-slate-400">Total Score XP</h4>
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="44" 
                              stroke={isMidnight ? '#1e293b' : '#e2e8f0'} 
                              strokeWidth="8" 
                              fill="transparent" 
                            />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="44" 
                              stroke={subjectThemeBg} 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray="276"
                              strokeDashoffset={Math.max(0, 276 - (userProgress.points / 500) * 276)}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xl font-black block leading-none">{userProgress.points}</span>
                            <span className="text-[9px] uppercase font-bold opacity-60">XP</span>
                          </div>
                        </div>
                        <span className="text-[10px] opacity-75 text-center font-bold">500 XP to clear Topper Level</span>
                      </div>

                      {/* Cards Learned */}
                      <div 
                        className={`p-5 rounded-2xl flex flex-col justify-between ${
                          isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-1">Study Recall Progress</h4>
                          <span className="text-3xl font-black">{userProgress.completedFlashcards.length}</span>
                          <span className="text-sm opacity-60 ml-1.5 font-bold">Cards Learned</span>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${Math.min(100, (userProgress.completedFlashcards.length / 15) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quizzes played */}
                      <div 
                        className={`p-5 rounded-2xl flex flex-col justify-between ${
                          isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-1">Board Quizzes Played</h4>
                          <span className="text-3xl font-black">
                            {(Object.values(userProgress.quizAttempts) as number[]).reduce((a: number, b: number) => a + b, 0)}
                          </span>
                          <span className="text-sm opacity-60 ml-1.5 font-bold">Attempts</span>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ 
                                width: `${
                                  (Object.values(userProgress.quizScores) as number[]).length > 0 
                                    ? Math.min(100, (Object.values(userProgress.quizScores) as number[]).reduce((a: number, b: number) => a + b, 0) / (Object.values(userProgress.quizScores) as number[]).length)
                                    : 0
                                }%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge Board */}
                    <div 
                      className={`p-6 rounded-2xl border transition-all ${
                        isMidnight ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="mb-6">
                        <h3 className={`text-base font-extrabold ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
                          🏆 CBSE Topper Badge Shelf
                        </h3>
                        <p className="text-xs opacity-75 mt-0.5">Badges unlock automatically as your total score points climb.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {BADGES.map((badge) => {
                          const isUnlocked = userProgress.points >= badge.unlockedAtPoints;
                          return (
                            <div 
                              key={badge.id}
                              className={`p-4 rounded-xl border-2 text-center flex flex-col items-center justify-between gap-3 transition-all relative overflow-hidden ${
                                isUnlocked 
                                  ? isMidnight
                                    ? 'bg-slate-900/60 border-amber-500/50 text-white shadow-md'
                                    : 'bg-[#fffbeb] border-[#fdd404] text-slate-800 shadow-sm'
                                  : isMidnight
                                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                                    : 'bg-[#f8fafc] border-slate-200 text-slate-400 opacity-60'
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-full">
                                Requires {badge.unlockedAtPoints} XP
                              </span>

                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                                isUnlocked 
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                                  : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                              }`}>
                                {badge.iconName === 'Compass' && <Sparkles className="w-6 h-6" />}
                                {badge.iconName === 'GraduationCap' && <GraduationCap className="w-6 h-6" />}
                                {badge.iconName === 'Trophy' && <Trophy className="w-6 h-6" />}
                                {badge.iconName === 'Flame' && <Flame className="w-6 h-6" />}
                              </div>

                              <div className="text-center">
                                <h4 className="text-sm font-black leading-snug">{badge.title}</h4>
                                <p className="text-[10px] leading-relaxed opacity-75 mt-1">{badge.description}</p>
                              </div>

                              <span className={`text-[10px] font-black uppercase tracking-wider ${
                                isUnlocked ? 'text-emerald-500' : 'text-slate-400'
                              }`}>
                                {isUnlocked ? '● UNLOCKED' : 'LOCKED'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Minimal Footer */}
        <footer className="text-center py-4 opacity-50 text-[10px] font-bold flex items-center justify-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Bright 10 &bull; CBSE Class 10 Minimal Learning Hub &copy; 2026.</span>
        </footer>

        {/* --- Custom Question Modals --- */}
        <AddQuestionModal
          isOpen={isAddQuestionModalOpen}
          onClose={() => setIsAddQuestionModalOpen(false)}
          onSave={handleSaveCustomQuestion}
          currentChapterId={selectedChapterId}
          currentSubject={selectedSubject}
          isMidnight={isMidnight}
        />

        <ManageQuestionsModal
          isOpen={isManageQuestionsModalOpen}
          onClose={() => setIsManageQuestionsModalOpen(false)}
          questions={customQuestions}
          onDeleteQuestion={handleDeleteCustomQuestion}
          onOpenAddModal={() => setIsAddQuestionModalOpen(true)}
          isMidnight={isMidnight}
        />

        {/* PWA Offline Indicator */}
        <OfflineIndicator />

        {/* Persistent Bottom Navigation Dock */}
        <PWBottomNav 
          activeTab={getActiveTabForNav()}
          setActiveTab={handleBottomNavClick}
          isMidnight={isMidnight}
          userProgress={userProgress}
          totalChaptersCount={filteredChapters.length}
          totalPYQCount={activeQuestions.length}
        />

        {/* Moveable Floating Circular AI Tutor (Corner Assistant) */}
        <FloatingAITutor
          isMidnight={isMidnight}
          activeSubject={selectedSubject}
          activeChapterName={activeChapter.name}
          onRewardXP={addPoints}
          isOpen={isFloatingAITutorOpen}
          onToggle={setIsFloatingAITutorOpen}
        />

      </div>
    </div>
  );
}
