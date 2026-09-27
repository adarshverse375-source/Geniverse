import React from 'react';
import { 
  LayoutGrid,
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  FileText, 
  Trophy 
} from 'lucide-react';
import { UserProgress } from '../types';

export type MainTabType = 'hub' | 'notes' | 'quiz' | 'resources' | 'badges';

interface PWBottomNavProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  isMidnight: boolean;
  userProgress: UserProgress;
  totalChaptersCount?: number;
  totalPYQCount?: number;
}

export const PWBottomNav: React.FC<PWBottomNavProps> = ({
  activeTab,
  setActiveTab,
  isMidnight,
  userProgress,
  totalChaptersCount = 18,
  totalPYQCount = 90
}) => {
  const navItems = [
    {
      id: 'hub' as MainTabType,
      label: 'All Boxes',
      sublabel: 'Section Hub',
      icon: LayoutGrid,
      accent: '#6366f1',
      badge: '8 Boxes',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'notes' as MainTabType,
      label: 'Notes',
      sublabel: 'Chapter Theory',
      icon: BookOpen,
      accent: '#0284c7',
      badge: `${totalChaptersCount} Ch`,
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    },
    {
      id: 'quiz' as MainTabType,
      label: 'Practice',
      sublabel: 'Tests & PYQs',
      icon: GraduationCap,
      accent: '#059669',
      badge: 'PYQ',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'resources' as MainTabType,
      label: 'NCERT & CBSE',
      sublabel: 'PDFs & Guides',
      icon: FileText,
      accent: '#0d9488',
      badge: 'NCERT',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    },
    {
      id: 'badges' as MainTabType,
      label: 'My Growth',
      sublabel: 'Stats & XP',
      icon: Trophy,
      accent: '#d97706',
      badge: `${userProgress.points} XP`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <nav 
      aria-label="Bright 10 Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 transition-all duration-300"
    >
      {/* Frosted Glass Floating Outer Frame */}
      <div 
        className={`w-full border-t transition-colors duration-200 ${
          isMidnight 
            ? 'bg-slate-950/92 backdrop-blur-xl border-slate-800/90 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]' 
            : 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-[0_-6px_25px_rgba(0,0,0,0.08)]'
        }`}
      >
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const ItemIcon = item.icon;

            return (
              <button
                key={item.id}
                id={`pw-bottom-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.scrollY > 150) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`relative flex-1 py-1.5 px-1 sm:px-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 group ${
                  isActive 
                    ? isMidnight
                      ? 'text-white font-bold'
                      : 'text-slate-900 font-bold'
                    : isMidnight 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Active Top Glowing Accent Indicator */}
                {isActive && (
                  <span 
                    className="absolute -top-1.5 w-8 sm:w-12 h-1 rounded-full shadow-sm animate-pulse"
                    style={{ 
                      backgroundColor: item.accent,
                      boxShadow: `0 0 10px ${item.accent}`
                    }} 
                  />
                )}

                {/* Icon Wrapper */}
                <div className="relative">
                  <div 
                    className={`w-9 h-7 sm:w-10 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? isMidnight 
                          ? 'bg-slate-800/90 shadow-inner' 
                          : 'bg-slate-100 shadow-sm'
                        : 'group-hover:bg-slate-800/20'
                    }`}
                    style={{
                      color: isActive ? item.accent : undefined
                    }}
                  >
                    <ItemIcon 
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`} 
                    />
                  </div>
                </div>

                {/* Tab Label */}
                <div className="flex flex-col items-center leading-none">
                  <span className={`text-[11px] sm:text-xs tracking-tight ${
                    isActive ? 'font-extrabold' : 'font-semibold'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Subtle Sublabel on tablet/desktop */}
                  <span className="text-[9px] opacity-60 font-medium hidden sm:block mt-0.5">
                    {item.sublabel}
                  </span>
                </div>

                {/* Micro Badge */}
                <span 
                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border hidden xs:inline-block leading-tight ${
                    isActive
                      ? item.badgeColor
                      : isMidnight ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
