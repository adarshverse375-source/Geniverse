import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { SubjectType } from '../types';
import { Bright10Logo } from './Bright10Logo';

interface SplashScreenProps {
  onDismiss: () => void;
  activeSubject?: SubjectType;
}

const SUBJECT_ACCENTS: {
  name: SubjectType;
  short: string;
  icon: string;
  gradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}[] = [
  {
    name: 'Mathematics',
    short: 'Math',
    icon: '📐',
    gradient: 'from-cyan-400 via-sky-500 to-indigo-600',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/35',
    badgeText: 'text-cyan-300',
  },
  {
    name: 'Science',
    short: 'Science',
    icon: '⚡',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/35',
    badgeText: 'text-emerald-300',
  },
  {
    name: 'Social Science',
    short: 'Social Sci',
    icon: '🌍',
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/35',
    badgeText: 'text-amber-300',
  },
  {
    name: 'English Literature',
    short: 'English',
    icon: '📚',
    gradient: 'from-purple-400 via-pink-500 to-rose-600',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/35',
    badgeText: 'text-purple-300',
  },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, activeSubject = 'Mathematics' }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing CBSE NCERT Study Modules...');
  const [cycleIndex, setCycleIndex] = useState(0);

  // Cycle through subjects smoothly for preview
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % SUBJECT_ACCENTS.length);
    }, 700);

    return () => clearInterval(cycleTimer);
  }, []);

  // Smooth loading progression
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(48);
      setStatusText('Loading High-Yield Board MCQ Pool & Formula Sheets...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Syncing Bright AI CBSE Academic Companion...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('All Systems Ready! Launching Bright 10...');
    }, 1400);

    const autoClose = setTimeout(() => {
      onDismiss();
    }, 1850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(autoClose);
    };
  }, [onDismiss]);

  const currentSubjectObj = SUBJECT_ACCENTS[cycleIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#030508] text-white overflow-hidden select-none"
    >
      {/* Dynamic Background OLED Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Radial Cyan Aura */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-sky-500/25 via-indigo-600/20 to-transparent blur-3xl"
        />

        {/* Dynamic Subject Accent Glow (Changes color) */}
        <motion.div 
          key={currentSubjectObj.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none ${
            cycleIndex === 0 ? 'bg-cyan-500/30' :
            cycleIndex === 1 ? 'bg-emerald-500/30' :
            cycleIndex === 2 ? 'bg-amber-500/30' : 'bg-purple-500/30'
          }`}
        />

        {/* Ambient Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Main Glassy Card Container */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)] flex flex-col items-center text-center"
      >
        {/* Specular Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-28 rounded-t-3xl bg-gradient-to-b from-white/10 via-white/2 to-transparent pointer-events-none" />

        {/* 3D App Icon with Subject Morphing */}
        <div className="relative mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Dynamic Halo behind Icon */}
            <div 
              className={`absolute -inset-4 rounded-full blur-xl opacity-60 transition-all duration-500 ${
                cycleIndex === 0 ? 'bg-cyan-500' :
                cycleIndex === 1 ? 'bg-emerald-500' :
                cycleIndex === 2 ? 'bg-amber-500' : 'bg-purple-500'
              }`}
            />
            <Bright10Logo 
              size={88} 
              isMidnight={true} 
              subject={currentSubjectObj.name} 
              glow={true} 
            />
          </motion.div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-1 mb-5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white flex items-center drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
              <span>Bright</span>
              <span className="text-sky-400 ml-2 drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]">10</span>
            </h1>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
              CBSE
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
            Class 10 Smart Board Exam Learning Hub
          </p>
        </div>

        {/* Dynamic Subject Carousel Preview Badges */}
        <div className="w-full flex items-center justify-center gap-1.5 mb-6 flex-wrap">
          {SUBJECT_ACCENTS.map((subj, idx) => {
            const isActive = idx === cycleIndex;
            return (
              <motion.div
                key={subj.name}
                animate={{
                  scale: isActive ? 1.06 : 0.95,
                  opacity: isActive ? 1 : 0.45
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all ${
                  isActive 
                    ? `${subj.badgeBg} ${subj.badgeBorder} ${subj.badgeText} shadow-md` 
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.short}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-2 mb-6">
          <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-0.5">
            <span className="truncate max-w-[280px]">{statusText}</span>
            <span className="text-sky-400 tabular-nums">{progress}%</span>
          </div>
        </div>

        {/* Quick Enter Action / Skip Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-[0_10px_25px_rgba(56,189,248,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-white/20"
        >
          <span>Start Learning Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* NCERT Board Syllabus Compliance Footnote */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Aligned with latest 2024–2026 CBSE Syllabus</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
