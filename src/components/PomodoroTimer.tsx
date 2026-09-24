import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Award, 
  Flame, 
  CheckCircle2, 
  SkipForward,
  Brain,
  Timer,
  BookOpen
} from 'lucide-react';
import { SubjectType } from '../types';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  isMidnight: boolean;
  activeSubject: SubjectType;
  activeChapterName: string;
  onAwardPoints: (amount: number, reason: string) => void;
  subjectColor?: string;
}

const MODE_CONFIG: Record<PomodoroMode, { label: string; shortLabel: string; defaultDuration: number; color: string; icon: React.ElementType }> = {
  focus: {
    label: 'Deep Focus',
    shortLabel: 'Focus',
    defaultDuration: 25 * 60, // 25 minutes = 1500 seconds
    color: '#0284c7', // sky-600
    icon: Brain,
  },
  shortBreak: {
    label: 'Short Break',
    shortLabel: 'Short',
    defaultDuration: 5 * 60, // 5 minutes = 300 seconds
    color: '#10b981', // emerald-500
    icon: Coffee,
  },
  longBreak: {
    label: 'Long Break',
    shortLabel: 'Long',
    defaultDuration: 15 * 60, // 15 minutes = 900 seconds
    color: '#8b5cf6', // violet-500
    icon: Sparkles,
  },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isMidnight,
  activeSubject,
  activeChapterName,
  onAwardPoints,
  subjectColor = '#0284c7',
}) => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [totalDuration, setTotalDuration] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    const saved = localStorage.getItem('cbse_pomodoro_completed_sessions');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('cbse_pomodoro_focus_minutes');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [recentCelebration, setRecentCelebration] = useState<string | null>(null);

  const endTimeRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesized notification chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High-pitched pleasant bell chord (C6, E6, G6)
      const freqs = [1046.5, 1318.51, 1567.98];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        gain.gain.setValueAtTime(0.18, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.8);
      });
    } catch (err) {
      console.warn('Audio chime note unavailable:', err);
    }
  };

  // Switch mode
  const handleSelectMode = (newMode: PomodoroMode, customSeconds?: number) => {
    setIsActive(false);
    setMode(newMode);
    const duration = customSeconds ?? MODE_CONFIG[newMode].defaultDuration;
    setTotalDuration(duration);
    setTimeLeft(duration);
    endTimeRef.current = null;
  };

  // Toggle play/pause
  const toggleTimer = () => {
    if (!isActive) {
      // Starting / resuming
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
    } else {
      // Pausing
      setIsActive(false);
      endTimeRef.current = null;
    }
  };

  // Reset current timer
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalDuration);
    endTimeRef.current = null;
  };

  // Skip to next phase
  const handleSkip = () => {
    setIsActive(false);
    endTimeRef.current = null;
    if (mode === 'focus') {
      // Next is short break
      handleSelectMode('shortBreak');
    } else {
      // Next is focus
      handleSelectMode('focus');
    }
  };

  // Timer tick effect with Date.now() diffing to avoid background tab drift
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remainingMs = endTimeRef.current - Date.now();
      const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        setIsActive(false);
        endTimeRef.current = null;
        handleTimerCompletion();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, mode, totalDuration]);

  // Handle timer completion and bonus awarding
  const handleTimerCompletion = () => {
    playChime();

    if (mode === 'focus') {
      const addedMinutes = Math.round(totalDuration / 60);
      const newTotalSessions = completedSessions + 1;
      const newTotalMinutes = totalFocusMinutes + addedMinutes;

      setCompletedSessions(newTotalSessions);
      setTotalFocusMinutes(newTotalMinutes);

      localStorage.setItem('cbse_pomodoro_completed_sessions', String(newTotalSessions));
      localStorage.setItem('cbse_pomodoro_focus_minutes', String(newTotalMinutes));

      // Award bonus points for every 25 minutes of activity!
      const bonusPoints = 50;
      onAwardPoints(bonusPoints, `Completed ${addedMinutes}-min Focused Pomodoro on ${activeSubject}`);

      setRecentCelebration(`🎉 +${bonusPoints} Bonus Points Awarded! Great 25-minute focus session on ${activeChapterName}!`);
      setTimeout(() => setRecentCelebration(null), 8000);

      // Auto propose break
      if (newTotalSessions % 4 === 0) {
        handleSelectMode('longBreak');
      } else {
        handleSelectMode('shortBreak');
      }
    } else {
      // Break completed
      setRecentCelebration(`☕ Break complete! Ready for your next focus session on ${activeSubject}?`);
      setTimeout(() => setRecentCelebration(null), 6000);
      handleSelectMode('focus');
    }
  };

  // Tab Title ticker when running
  useEffect(() => {
    if (isActive) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const prevTitle = document.title;
      document.title = `(${formatted}) ${mode === 'focus' ? '🎯 Focus' : '☕ Break'} - CBSE Study Hub`;

      return () => {
        document.title = prevTitle;
      };
    }
  }, [isActive, timeLeft, mode]);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage (0 to 1)
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = 283 * (1 - progress); // 283 = 2 * PI * 45

  const activeModeConfig = MODE_CONFIG[mode];
  const IconComponent = activeModeConfig.icon;

  return (
    <div
      className={`max-w-xl md:max-w-2xl mx-auto rounded-2xl transition-all relative overflow-hidden ${
        isMidnight
          ? 'glass-panel p-4 sm:p-5 md:p-6 border border-slate-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
          : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-4 sm:p-5 md:p-6'
      }`}
    >
      {/* Background ambient gradient glow */}
      <div 
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: activeModeConfig.color }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ backgroundColor: activeModeConfig.color }}
          >
            <Timer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm sm:text-base font-extrabold truncate ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                Pomodoro Focus Study Timer
              </h3>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                <Award className="w-3 h-3" /> +50 XP / 25m
              </span>
            </div>
            <p className="text-[11px] sm:text-xs opacity-70 flex items-center gap-1.5 mt-0.5 truncate">
              <BookOpen className="w-3 h-3 text-sky-500 shrink-0" />
              <span className="truncate">Target: <strong className="font-semibold">{activeSubject}</strong> • {activeChapterName}</span>
            </p>
          </div>
        </div>

        {/* Top Controls: Sound Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`py-1 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isMidnight 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[10px] sm:text-[11px] font-bold">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 mb-4 gap-1 w-full">
        {(['focus', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((mKey) => {
          const m = MODE_CONFIG[mKey];
          const isSelected = mode === mKey;
          const MIcon = m.icon;
          return (
            <button
              key={mKey}
              onClick={() => handleSelectMode(mKey)}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all min-w-0 ${
                isSelected
                  ? isMidnight
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-700'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MIcon className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected ? m.color : undefined }} />
              <span className="hidden sm:inline truncate">{m.label}</span>
              <span className="sm:hidden truncate">{m.shortLabel}</span>
              <span className="text-[10px] opacity-60 shrink-0">({m.defaultDuration / 60}m)</span>
            </button>
          );
        })}
      </div>

      {/* Main Clock Center Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 my-1">
        {/* Circular Progress Display */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center select-none shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Track Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="5"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={activeModeConfig.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 * (1 - progress)}
              className="transition-all duration-300"
            />
          </svg>

          {/* Time & Mode In Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span 
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none ${
                isMidnight ? 'text-white' : 'text-slate-900'
              }`}
            >
              {formattedTime}
            </span>
            <span 
              className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${activeModeConfig.color}20`,
                color: activeModeConfig.color,
              }}
            >
              {activeModeConfig.label}
            </span>
            {isActive && (
              <span className="text-[9px] font-bold text-emerald-500 animate-pulse mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Session Stats */}
        <div className="flex flex-col gap-3 w-full sm:flex-1 items-center sm:items-start min-w-0">
          {/* Main Primary Action Buttons */}
          <div className="flex items-center gap-2 w-full justify-center sm:justify-start">
            <button
              onClick={toggleTimer}
              className={`py-2.5 px-4 sm:px-5 rounded-xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 flex-1 sm:flex-initial ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'hover:brightness-110'
              }`}
              style={{ backgroundColor: !isActive ? activeModeConfig.color : undefined }}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 shrink-0" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>{timeLeft < totalDuration ? 'Resume Focus' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isMidnight 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSkip}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isMidnight 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Skip to Next Session"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Fast 10s Demo for Testing */}
            <button
              onClick={() => {
                setIsActive(false);
                setTimeLeft(10);
                setTotalDuration(10);
                endTimeRef.current = Date.now() + 10 * 1000;
                setIsActive(true);
              }}
              className="px-2 py-2 rounded-xl border border-dashed border-sky-400 text-sky-500 hover:bg-sky-500/10 font-bold text-[11px] transition-all shrink-0 hidden sm:flex items-center gap-1"
              title="Run a quick 10-second timer to test bonus point reward logic"
            >
              <span>⚡ 10s Test</span>
            </button>
          </div>

          {/* Quick Demo on mobile */}
          <div className="flex sm:hidden items-center justify-center gap-2 text-[10px] w-full">
            <span className="opacity-60 font-medium">Test bonus rewards:</span>
            <button
              onClick={() => {
                setIsActive(false);
                setTimeLeft(10);
                setTotalDuration(10);
                endTimeRef.current = Date.now() + 10 * 1000;
                setIsActive(true);
              }}
              className="px-2 py-0.5 rounded-md border border-dashed border-sky-400 text-sky-500 hover:bg-sky-500/10 font-bold transition-all"
            >
              ⚡ Fast 10s Demo
            </button>
          </div>

          {/* Focused Sessions Milestone tracker */}
          <div className={`p-2.5 sm:p-3 rounded-xl border w-full text-xs space-y-1.5 ${
            isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between font-bold text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5 opacity-80">
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Today's Focus Streak:</span>
              </span>
              <span className="text-orange-500 font-extrabold">{completedSessions} Sessions</span>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] opacity-70">
              <span>Total Learning Time:</span>
              <span className="font-bold">{totalFocusMinutes} mins focused</span>
            </div>

            {/* Session Dots Indicator */}
            <div className="flex items-center gap-1 pt-0.5">
              {[0, 1, 2, 3].map((dotIdx) => {
                const isFilled = dotIdx < (completedSessions % 4 || (completedSessions > 0 && completedSessions % 4 === 0 ? 4 : 0));
                return (
                  <div
                    key={dotIdx}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      isFilled
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-500 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                    title={`Pomodoro Interval ${dotIdx + 1} of 4`}
                  />
                );
              })}
            </div>
            <p className="text-[9px] sm:text-[10px] opacity-60 text-center">
              4 sessions = extended Long Break &amp; +200 bonus XP!
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Banner */}
      {recentCelebration && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{recentCelebration}</span>
          </div>
          <button 
            onClick={() => setRecentCelebration(null)}
            className="text-[11px] opacity-70 hover:opacity-100 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
