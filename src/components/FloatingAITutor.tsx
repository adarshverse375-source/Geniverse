import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Minus, 
  Move, 
  Bot, 
  Maximize2
} from 'lucide-react';
import { SubjectType } from '../types';
import { GeminiChatbot } from './GeminiChatbot';

interface FloatingAITutorProps {
  isMidnight: boolean;
  activeSubject: SubjectType;
  activeChapterName: string;
  onRewardXP: (points: number, reason: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const FloatingAITutor: React.FC<FloatingAITutorProps> = ({
  isMidnight,
  activeSubject,
  activeChapterName,
  onRewardXP,
  isOpen,
  onToggle,
}) => {
  const isDraggingRef = useRef(false);
  const dragControls = useDragControls();

  return (
    <>
      {/* ======================================================= */}
      {/* 1. MOVEABLE 3D GLASSY OLED CIRCULAR ORB: BRIGHT AI      */}
      {/* ======================================================= */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            id="floating-bright-ai-orb"
            drag
            dragMomentum={false}
            dragElastic={0.08}
            whileDrag={{ scale: 1.08 }}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 120);
            }}
            initial={{ scale: 0, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 cursor-grab active:cursor-grabbing select-none gpu-accel"
            style={{ touchAction: 'none' }}
          >
            {/* Outer Multi-Color Glowing Halo */}
            <div className="relative group">
              
              {/* Vibrant Colorful Radial Ambient Glow (Cyan, Magenta, Gold, Purple) */}
              <div 
                className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 opacity-60 group-hover:opacity-90 blur-xl transition-opacity duration-300 pointer-events-none" 
              />

              {/* Colorful Animated Boundary (Rich Multi-Color Gradient Ring) */}
              <div className="relative p-[2.5px] rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105 active:scale-95">
                <div 
                  className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#c084fc,#f472b6,#fb7185,#fbbf24,#34d399,#38bdf8)] animate-spin-slow rounded-full opacity-100" 
                />

                {/* 3D Glassy OLED Circular Core - Made sleeker and slightly smaller */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isDraggingRef.current) {
                      onToggle(true);
                    }
                  }}
                  className={`relative w-13 h-13 sm:w-13.5 sm:h-13.5 rounded-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                    isMidnight 
                      ? 'bg-[#000000] text-white' 
                      : 'bg-[#0a0d14] text-white'
                  }`}
                  style={{
                    boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.95), 0 8px 24px rgba(0, 0, 0, 0.8)'
                  }}
                  title="Bright AI • Move anywhere or tap to chat"
                  aria-label="Open Moveable Bright AI Assistant"
                >
                  {/* 3D Convex Glass Lens Specular Reflection (Top Arc) */}
                  <div 
                    className="absolute top-0 inset-x-1.5 h-3.5 rounded-t-full pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.08) 60%, transparent 100%)'
                    }}
                  />

                  {/* 3D Holographic AI Star Icon */}
                  <div className="relative flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-sky-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
                  </div>

                  {/* Clean Typography Title */}
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 leading-none mt-0.5 group-hover:from-white group-hover:to-sky-300 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Bright AI
                  </span>
                </button>
              </div>

              {/* Classy Hover Drag Chip */}
              <div 
                className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 border ${
                  isMidnight 
                    ? 'bg-black/90 border-white/15 text-white backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.8)]' 
                    : 'bg-slate-900/90 border-slate-700 text-white shadow-lg backdrop-blur-xl'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Move className="w-3 h-3 text-sky-400" />
                  <span>Move anywhere &bull; Tap to chat</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* 2. EXPANDED 3D GLASSY OLED FLOATING WINDOW              */}
      {/* ======================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end sm:p-5 pointer-events-none">
            {/* Backdrop Blur on mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggle(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs sm:hidden pointer-events-auto"
            />

            {/* Floating Window Container with 3D Glassy OLED Frame - More compact sizing */}
            <motion.div
              drag
              dragListener={false}
              dragControls={dragControls}
              dragMomentum={false}
              dragElastic={0.06}
              initial={{ opacity: 0, scale: 0.9, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`pointer-events-auto w-full sm:w-[385px] md:w-[410px] max-h-[88vh] sm:max-h-[76vh] h-[80vh] sm:h-[530px] rounded-t-3xl sm:rounded-2xl border flex flex-col overflow-hidden shadow-2xl relative ${
                isMidnight 
                  ? 'bg-[#000000]/95 border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)]' 
                  : 'bg-white/95 border-slate-200/90 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]'
              }`}
            >
              {/* Luxury Top Drag Bar */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className={`p-3.5 px-4.5 border-b flex items-center justify-between gap-3 cursor-move select-none transition-colors ${
                  isMidnight 
                    ? 'bg-[#07090e]/90 border-white/10 hover:bg-[#0c101a]/90' 
                    : 'bg-slate-50/90 border-slate-200/90 hover:bg-slate-100'
                }`}
                title="Drag bar to reposition window"
              >
                {/* Brand & Context */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black font-heading truncate ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                        Bright AI
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        OLED
                      </span>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 truncate">
                      {activeSubject} &bull; {activeChapterName}
                    </p>
                  </div>
                </div>

                {/* Window Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div 
                    className="p-1.5 opacity-40 hover:opacity-100 transition-opacity hidden sm:block" 
                    title="Drag bar to move window"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </div>

                  {/* Minimize to circular orb */}
                  <button
                    type="button"
                    onClick={() => onToggle(false)}
                    className={`p-1.5 px-2 rounded-xl border transition-all ${
                      isMidnight 
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10 shadow-xs' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
                    }`}
                    title="Minimize to circular orb"
                    aria-label="Minimize"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => onToggle(false)}
                    className={`p-1.5 px-2 rounded-xl border transition-all ${
                      isMidnight 
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/40 shadow-xs' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs'
                    }`}
                    title="Close Bright AI"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chatbot Body */}
              <div className="flex-1 overflow-hidden relative">
                <GeminiChatbot
                  isMidnight={isMidnight}
                  activeSubject={activeSubject}
                  activeChapterName={activeChapterName}
                  onRewardXP={onRewardXP}
                  isCompact={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
