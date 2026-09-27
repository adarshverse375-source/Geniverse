import React from 'react';
import { SubjectType } from '../types';

export interface Bright10LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'icon-only' | 'full';
  showText?: boolean;
  isMidnight?: boolean;
  className?: string;
  glow?: boolean;
  subject?: SubjectType;
}

export const Bright10Logo: React.FC<Bright10LogoProps> = ({
  size = 'md',
  variant = 'icon-only',
  showText = false,
  isMidnight = true,
  className = '',
  glow = false,
  subject = 'Mathematics'
}) => {
  // Map size tokens to pixel dimensions
  let px = 50;
  if (typeof size === 'number') {
    px = size;
  } else {
    switch (size) {
      case 'xs': px = 30; break;
      case 'sm': px = 40; break;
      case 'md': px = 50; break;
      case 'lg': px = 68; break;
      case 'xl': px = 96; break;
    }
  }

  // Dynamic theme colors and motifs according to active subject
  const getSubjectConfig = (subj?: SubjectType) => {
    switch (subj) {
      case 'Mathematics':
        return {
          glowColor: 'rgba(56, 189, 248, 0.45)',
          primary: '#38bdf8',
          secondary: '#818cf8',
          accent: '#0284c7',
          starColor: '#38bdf8',
          label: 'Math',
          subLabel: 'Mathematics',
        };
      case 'Science':
        return {
          glowColor: 'rgba(16, 185, 129, 0.45)',
          primary: '#10b981',
          secondary: '#14b8a6',
          accent: '#059669',
          starColor: '#34d399',
          label: 'Sci',
          subLabel: 'Science',
        };
      case 'Social Science':
        return {
          glowColor: 'rgba(245, 158, 11, 0.45)',
          primary: '#f59e0b',
          secondary: '#fbbf24',
          accent: '#d97706',
          starColor: '#fde047',
          label: 'SST',
          subLabel: 'Social Science',
        };
      case 'English Literature':
        return {
          glowColor: 'rgba(168, 85, 247, 0.45)',
          primary: '#c084fc',
          secondary: '#f472b6',
          accent: '#9333ea',
          starColor: '#e879f9',
          label: 'Eng',
          subLabel: 'English',
        };
      default:
        return {
          glowColor: 'rgba(56, 189, 248, 0.45)',
          primary: '#38bdf8',
          secondary: '#fbbf24',
          accent: '#6366f1',
          starColor: '#fde047',
          label: '10',
          subLabel: 'CBSE Class 10',
        };
    }
  };

  const cfg = getSubjectConfig(subject);

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none group transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] ${className}`}
      style={{ width: px, height: px }}
      title={`Bright 10 • ${cfg.subLabel}`}
    >
      {/* Outer Ambient Glow that shifts color with Subject */}
      <div 
        className="absolute -inset-1 rounded-[28%] blur-md transition-all duration-500 pointer-events-none opacity-70 group-hover:opacity-100"
        style={{
          background: cfg.glowColor
        }}
      />

      {/* 3D Glassy OLED Squircle Container */}
      <div 
        className="relative z-10 w-full h-full rounded-[24%] overflow-hidden bg-black transition-all duration-500"
        style={{
          boxShadow: isMidnight 
            ? `0 8px 24px -2px rgba(0, 0, 0, 0.9), 0 0 0 1.5px rgba(255, 255, 255, 0.18), inset 0 1.5px 2px rgba(255, 255, 255, 0.4)` 
            : `0 8px 20px -2px rgba(0, 0, 0, 0.2), 0 0 0 1.5px ${cfg.primary}, inset 0 1px 1px rgba(255, 255, 255, 0.9)`
        }}
      >
        {/* Dynamic Vector SVG Graphics matching Active Subject */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Gradient */}
            <radialGradient id={`bg-${subject}`} cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#141721" />
              <stop offset="60%" stopColor="#080a0f" />
              <stop offset="100%" stopColor="#020305" />
            </radialGradient>

            {/* Subject Specific Glow */}
            <radialGradient id={`glow-${subject}`} cx="50%" cy="45%" r="45%">
              <stop offset="0%" stopColor={cfg.primary} stopOpacity="0.85" />
              <stop offset="50%" stopColor={cfg.secondary} stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Facet Light Gradient */}
            <linearGradient id={`facetLight-${subject}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={cfg.starColor} />
            </linearGradient>

            {/* Facet Shade Gradient */}
            <linearGradient id={`facetShade-${subject}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cfg.primary} />
              <stop offset="100%" stopColor={cfg.accent} />
            </linearGradient>

            {/* Sheen Gradient */}
            <linearGradient id="sheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Deep OLED Backing */}
          <rect width="100" height="100" fill={`url(#bg-${subject})`} />

          {/* Central Radial Light Glow */}
          <circle cx="50" cy="45" r="34" fill={`url(#glow-${subject})`} />

          {/* ======================================================== */}
          {/* SUBJECT-SPECIFIC MOTIFS                                  */}
          {/* ======================================================== */}

          {/* 1. MATHEMATICS: Geometric coordinate grid & math symbols */}
          {subject === 'Mathematics' && (
            <g opacity="0.85">
              {/* Coordinate axis curves */}
              <circle cx="50" cy="45" r="28" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
              <path d="M 22 45 L 78 45" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="1.5,1.5" opacity="0.4" />
              <path d="M 50 17 L 50 73" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="1.5,1.5" opacity="0.4" />

              {/* Math Glyphs: Pi & Sigma */}
              <text x="25" y="32" fontSize="9" fontWeight="900" fill="#7dd3fc" opacity="0.7" fontFamily="serif">π</text>
              <text x="70" y="32" fontSize="9" fontWeight="900" fill="#7dd3fc" opacity="0.7" fontFamily="serif">∑</text>
              <text x="24" y="65" fontSize="8" fontWeight="bold" fill="#38bdf8" opacity="0.6">√x</text>
              <text x="71" y="65" fontSize="8" fontWeight="bold" fill="#38bdf8" opacity="0.6">±</text>
            </g>
          )}

          {/* 2. SCIENCE: Dual electron atomic orbital loops & quantum nodes */}
          {subject === 'Science' && (
            <g opacity="0.9">
              {/* Elliptical Electron Orbit 1 */}
              <ellipse 
                cx="50" cy="45" rx="30" ry="12" 
                fill="none" stroke="#10b981" strokeWidth="1.2" 
                transform="rotate(-28 50 45)" 
                opacity="0.75"
              />
              {/* Orbiting Quantum Node 1 */}
              <circle cx="24" cy="32" r="2.2" fill="#34d399" filter="drop-shadow(0 0 3px #10b981)" />

              {/* Elliptical Electron Orbit 2 */}
              <ellipse 
                cx="50" cy="45" rx="30" ry="12" 
                fill="none" stroke="#14b8a6" strokeWidth="1.2" 
                transform="rotate(32 50 45)" 
                opacity="0.75"
              />
              {/* Orbiting Quantum Node 2 */}
              <circle cx="76" cy="30" r="2.2" fill="#2dd4bf" filter="drop-shadow(0 0 3px #14b8a6)" />

              {/* Central Nucleus Pulse */}
              <circle cx="50" cy="45" r="4.5" fill="#a7f3d0" opacity="0.9" />
            </g>
          )}

          {/* 3. SOCIAL SCIENCE: Globe latitude/longitude meridians & sunburst */}
          {subject === 'Social Science' && (
            <g opacity="0.85">
              {/* Globe Ring & Meridians */}
              <circle cx="50" cy="45" r="26" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.65" />
              <ellipse cx="50" cy="45" rx="14" ry="26" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.55" />
              <path d="M 24 45 L 76 45" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
              <path d="M 28 34 Q 50 38 72 34" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.45" />
              <path d="M 28 56 Q 50 52 72 56" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.45" />

              {/* Compass / Sunburst ticks */}
              <circle cx="50" cy="19" r="1.5" fill="#fde047" />
              <circle cx="50" cy="71" r="1.5" fill="#fde047" />
              <circle cx="24" cy="45" r="1.5" fill="#fde047" />
              <circle cx="76" cy="45" r="1.5" fill="#fde047" />
            </g>
          )}

          {/* 4. ENGLISH LITERATURE: Open glass book wings & feather quill flourish */}
          {subject === 'English Literature' && (
            <g opacity="0.85">
              {/* Open Book Wings */}
              <path 
                d="M 24 38 C 34 32, 46 34, 50 38 C 54 34, 66 32, 76 38 L 76 60 C 66 54, 54 56, 50 60 C 46 56, 34 54, 24 60 Z" 
                fill="none" 
                stroke="#c084fc" 
                strokeWidth="1.2" 
                opacity="0.7"
              />
              <path 
                d="M 50 38 L 50 60" 
                stroke="#f472b6" 
                strokeWidth="1.2" 
                opacity="0.8"
              />

              {/* Literary Stardust / Quill Dots */}
              <circle cx="32" cy="30" r="1.2" fill="#fbcfe8" />
              <circle cx="68" cy="30" r="1.2" fill="#fbcfe8" />
              <circle cx="50" cy="24" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* ======================================================== */}
          {/* THE 8-POINTED LUMINOUS FACETED STAR (Center: 50, 45)      */}
          {/* ======================================================== */}
          <g>
            {/* North Spike */}
            <polygon points="50,45 50,23 48,43" fill={`url(#facetLight-${subject})`} />
            <polygon points="50,45 50,23 52,43" fill={`url(#facetShade-${subject})`} />

            {/* South Spike */}
            <polygon points="50,45 50,67 48,47" fill={`url(#facetShade-${subject})`} />
            <polygon points="50,45 50,67 52,47" fill={`url(#facetLight-${subject})`} />

            {/* West Spike */}
            <polygon points="50,45 28,45 48,43" fill={`url(#facetLight-${subject})`} />
            <polygon points="50,45 28,45 48,47" fill={`url(#facetShade-${subject})`} />

            {/* East Spike */}
            <polygon points="50,45 72,45 52,43" fill={`url(#facetShade-${subject})`} />
            <polygon points="50,45 72,45 52,47" fill={`url(#facetLight-${subject})`} />

            {/* Diagonals */}
            <polygon points="50,45 65,30 52,43" fill={`url(#facetLight-${subject})`} />
            <polygon points="50,45 35,30 48,43" fill={`url(#facetShade-${subject})`} />
            <polygon points="50,45 35,60 48,47" fill={`url(#facetLight-${subject})`} />
            <polygon points="50,45 65,60 52,47" fill={`url(#facetShade-${subject})`} />

            {/* Diamond Core */}
            <circle cx="50" cy="45" r="2.2" fill="#ffffff" />
          </g>

          {/* ======================================================== */}
          {/* "10" OR SUBJECT BADGE AT BOTTOM                          */}
          {/* ======================================================== */}
          <g transform="translate(0, 8)">
            <rect 
              x="33" y="73" width="34" height="14" rx="7" 
              fill="#000000" 
              stroke={cfg.primary} 
              strokeWidth="1" 
              opacity="0.9"
            />
            <text 
              x="50" y="83.5" 
              textAnchor="middle" 
              fontSize="8.5" 
              fontWeight="900" 
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.5"
            >
              {cfg.label}
            </text>
          </g>

          {/* 3D Convex Glass Sheen across Top Arc */}
          <path d="M 0 0 L 100 0 L 100 42 C 60 52, 40 52, 0 42 Z" fill="url(#sheen)" />
        </svg>
      </div>

      {/* Optional Brand Text (Only if showText is requested) */}
      {showText && (
        <div className="ml-3 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-base font-black tracking-tight ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
              Bright
            </span>
            <span className="text-base font-black tracking-tight" style={{ color: cfg.primary }}>
              10
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
            {cfg.subLabel}
          </span>
        </div>
      )}
    </div>
  );
};
