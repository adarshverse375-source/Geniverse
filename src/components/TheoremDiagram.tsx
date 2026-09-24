import React from 'react';

export type DiagramType = 
  | 'BPT_TRIANGLE' 
  | 'PYTHAGORAS' 
  | 'CIRCLE_TANGENTS' 
  | 'TRIGONOMETRY_TRIANGLE'
  | 'CONCAVE_MIRROR'
  | 'STOMATA'
  | 'STOMATA_OPEN_CLOSED';

interface TheoremDiagramProps {
  type: DiagramType | string;
  isMidnight?: boolean;
}

export const TheoremDiagram: React.FC<TheoremDiagramProps> = ({ type, isMidnight = false }) => {
  const normalizedType = type.toUpperCase().trim();

  if (normalizedType.includes('STOMAT') || normalizedType.includes('GUARD_CELL')) {
    return <StomataDiagram isMidnight={isMidnight} />;
  }

  if (normalizedType.includes('BPT') || normalizedType.includes('THALES') || normalizedType.includes('PROPORTIONALITY')) {
    return <BptDiagram isMidnight={isMidnight} />;
  }

  if (normalizedType.includes('PYTHAGORAS')) {
    return <PythagorasDiagram isMidnight={isMidnight} />;
  }

  if (normalizedType.includes('CIRCLE') || normalizedType.includes('TANGENT')) {
    return <CircleTangentsDiagram isMidnight={isMidnight} />;
  }

  if (normalizedType.includes('TRIGO') || normalizedType.includes('HEIGHT')) {
    return <TrigonometryDiagram isMidnight={isMidnight} />;
  }

  return <BptDiagram isMidnight={isMidnight} />;
};

/**
 * Basic Proportionality Theorem (Thales Theorem) Interactive SVG Diagram
 * Triangle ABC with DE || BC, construction lines BE, CD and altitudes EN ⊥ AB, DM ⊥ AC
 */
export const BptDiagram: React.FC<{ isMidnight?: boolean }> = ({ isMidnight = false }) => {
  return (
    <div className={`my-4 p-4 rounded-2xl border transition-all ${
      isMidnight 
        ? 'bg-slate-900/90 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
        : 'bg-gradient-to-b from-indigo-50/70 to-sky-50/40 border-indigo-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-500">
            CBSE Board Figure: Basic Proportionality Theorem (BPT)
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          DE ∥ BC
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* SVG Drawing Canvas */}
        <div className="w-full max-w-[340px] aspect-[4/3] relative flex items-center justify-center">
          <svg viewBox="0 0 320 240" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="triFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient id="adeFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Triangle ABC background fill */}
            <polygon 
              points="160,25 40,215 280,215" 
              fill="url(#triFill)" 
              stroke={isMidnight ? "#818cf8" : "#4f46e5"} 
              strokeWidth="2.5" 
              strokeLinejoin="round" 
            />

            {/* Shaded Triangle ADE for ratio comparison */}
            <polygon 
              points="160,25 90,135 230,135" 
              fill="url(#adeFill)" 
              stroke={isMidnight ? "#ec4899" : "#db2777"} 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />

            {/* Parallel line DE */}
            <line 
              x1="90" y1="135" x2="230" y2="135" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />

            {/* Construction Lines (BE and CD) - Dashed Indigo */}
            <line 
              x1="40" y1="215" x2="230" y2="135" 
              stroke="#6366f1" 
              strokeWidth="1.6" 
              strokeDasharray="4 3" 
            />
            <line 
              x1="280" y1="215" x2="90" y2="135" 
              stroke="#6366f1" 
              strokeWidth="1.6" 
              strokeDasharray="4 3" 
            />

            {/* Perpendicular Altitudes: EN ⊥ AB and DM ⊥ AC - Dashed Emerald */}
            {/* EN from E(230,135) perpendicular to AB */}
            <line 
              x1="230" y1="135" x2="114" y2="98" 
              stroke="#10b981" 
              strokeWidth="1.8" 
              strokeDasharray="3 3" 
            />
            {/* Right-angle marker for EN at N */}
            <path d="M 114,98 L 121,102 L 125,95 L 118,91" fill="none" stroke="#10b981" strokeWidth="1.2" />

            {/* DM from D(90,135) perpendicular to AC */}
            <line 
              x1="90" y1="135" x2="206" y2="98" 
              stroke="#10b981" 
              strokeWidth="1.8" 
              strokeDasharray="3 3" 
            />
            {/* Right-angle marker for DM at M */}
            <path d="M 206,98 L 199,102 L 195,95 L 202,91" fill="none" stroke="#10b981" strokeWidth="1.2" />

            {/* Parallel arrows on DE and BC */}
            <path d="M 155,131 L 165,135 L 155,139" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <path d="M 155,211 L 165,215 L 155,219" fill="none" stroke={isMidnight ? "#818cf8" : "#4f46e5"} strokeWidth="2" strokeLinecap="round" />

            {/* Vertex points dots */}
            <circle cx="160" cy="25" r="4" fill="#4f46e5" />
            <circle cx="40" cy="215" r="4" fill="#4f46e5" />
            <circle cx="280" cy="215" r="4" fill="#4f46e5" />
            <circle cx="90" cy="135" r="4" fill="#ef4444" />
            <circle cx="230" cy="135" r="4" fill="#ef4444" />
            <circle cx="114" cy="98" r="3.5" fill="#10b981" />
            <circle cx="206" cy="98" r="3.5" fill="#10b981" />

            {/* Vertex Labels */}
            <text x="160" y="16" textAnchor="middle" className="font-extrabold text-sm" fill={isMidnight ? "#ffffff" : "#1e1b4b"}>A</text>
            <text x="24" y="224" textAnchor="middle" className="font-extrabold text-sm" fill={isMidnight ? "#ffffff" : "#1e1b4b"}>B</text>
            <text x="296" y="224" textAnchor="middle" className="font-extrabold text-sm" fill={isMidnight ? "#ffffff" : "#1e1b4b"}>C</text>
            <text x="74" y="139" textAnchor="middle" className="font-extrabold text-sm" fill="#ef4444">D</text>
            <text x="248" y="139" textAnchor="middle" className="font-extrabold text-sm" fill="#ef4444">E</text>
            <text x="100" y="94" textAnchor="middle" className="font-extrabold text-xs" fill="#10b981">N</text>
            <text x="220" y="94" textAnchor="middle" className="font-extrabold text-xs" fill="#10b981">M</text>
          </svg>
        </div>

        {/* Legend / Key Proof Elements */}
        <div className="flex flex-col gap-2 text-xs w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-red-500 rounded" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Line <strong className="text-red-500">DE ∥ BC</strong> (Given)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Altitudes: <strong className="text-emerald-600 dark:text-emerald-400">EN ⊥ AB</strong> &amp; <strong className="text-emerald-600 dark:text-emerald-400">DM ⊥ AC</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-indigo-500 rounded border-dashed" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Construction: Join <strong className="text-indigo-500">BE</strong> &amp; <strong className="text-indigo-500">CD</strong></span>
          </div>
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 mt-1">
            Target to Prove: AD/DB = AE/EC
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pythagoras Theorem Right-Angled Triangle SVG
 */
export const PythagorasDiagram: React.FC<{ isMidnight?: boolean }> = ({ isMidnight = false }) => {
  return (
    <div className={`my-4 p-4 rounded-2xl border ${
      isMidnight ? 'bg-slate-900/90 border-sky-500/40' : 'bg-sky-50/60 border-sky-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase text-sky-500">Pythagoras Theorem: Right Triangle</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">AC² = AB² + BC²</span>
      </div>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 280 180" className="w-full max-w-[280px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,140 230,140 50,30" fill="rgba(56,189,248,0.12)" stroke="#0284c7" strokeWidth="2.5" />
          {/* Right angle at B(50,140) */}
          <path d="M 50,122 L 68,122 L 68,140" fill="none" stroke="#0284c7" strokeWidth="1.5" />
          {/* Altitude BD ⊥ AC */}
          <line x1="50" y1="140" x2="114" y2="69" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 3" />
          <circle cx="50" cy="30" r="4" fill="#0284c7" />
          <circle cx="50" cy="140" r="4" fill="#0284c7" />
          <circle cx="230" cy="140" r="4" fill="#0284c7" />
          <circle cx="114" cy="69" r="3.5" fill="#ef4444" />
          <text x="40" y="26" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>A</text>
          <text x="35" y="152" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>B (90°)</text>
          <text x="242" y="145" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>C</text>
          <text x="122" y="64" className="font-bold text-xs" fill="#ef4444">D</text>
        </svg>
      </div>
    </div>
  );
};

/**
 * Circle Tangents Theorem 10.2 Diagram
 */
export const CircleTangentsDiagram: React.FC<{ isMidnight?: boolean }> = ({ isMidnight = false }) => {
  return (
    <div className={`my-4 p-4 rounded-2xl border ${
      isMidnight ? 'bg-slate-900/90 border-emerald-500/40' : 'bg-emerald-50/60 border-emerald-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase text-emerald-500">CBSE Theorem 10.2: Tangents From External Point</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">PQ = PR</span>
      </div>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 300 180" className="w-full max-w-[300px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
          {/* Circle */}
          <circle cx="100" cy="90" r="55" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2" />
          <circle cx="100" cy="90" r="3" fill="#10b981" />
          <text x="92" y="86" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>O</text>
          {/* Point P */}
          <circle cx="260" cy="90" r="4" fill="#6366f1" />
          <text x="270" y="94" className="font-bold text-xs" fill="#6366f1">P</text>
          {/* Tangents PQ and PR */}
          <line x1="260" y1="90" x2="118" y2="38" stroke="#6366f1" strokeWidth="2" />
          <line x1="260" y1="90" x2="118" y2="142" stroke="#6366f1" strokeWidth="2" />
          {/* Radii OQ and OR */}
          <line x1="100" y1="90" x2="118" y2="38" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100" y1="90" x2="118" y2="142" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Line OP */}
          <line x1="100" y1="90" x2="260" y2="90" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Points Q and R */}
          <circle cx="118" cy="38" r="3.5" fill="#10b981" />
          <circle cx="118" cy="142" r="3.5" fill="#10b981" />
          <text x="114" y="28" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>Q (90°)</text>
          <text x="114" y="160" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>R (90°)</text>
        </svg>
      </div>
    </div>
  );
};

/**
 * Trigonometry Heights & Distances Triangle Diagram
 */
export const TrigonometryDiagram: React.FC<{ isMidnight?: boolean }> = ({ isMidnight = false }) => {
  return (
    <div className={`my-4 p-4 rounded-2xl border ${
      isMidnight ? 'bg-slate-900/90 border-violet-500/40' : 'bg-violet-50/60 border-violet-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase text-violet-500">Trigonometric Heights & Distances</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-500">tan(θ) = Height / Base</span>
      </div>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 260 160" className="w-full max-w-[260px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,130 220,130 220,30" fill="rgba(139,92,246,0.12)" stroke="#8b5cf6" strokeWidth="2.5" />
          <path d="M 205,130 L 205,115 L 220,115" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          {/* Angle theta arc at A(40,130) */}
          <path d="M 75,130 A 35 35 0 0 0 69,114" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <text x="82" y="125" className="font-bold text-xs" fill="#f59e0b">θ</text>
          <text x="25" y="135" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>A</text>
          <text x="228" y="135" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>B</text>
          <text x="225" y="24" className="font-bold text-xs" fill={isMidnight ? '#fff' : '#0f172a'}>C</text>
          <text x="130" y="148" textAnchor="middle" className="font-semibold text-xs" fill="#64748b">Base (Adjacent)</text>
          <text x="235" y="80" className="font-semibold text-xs" fill="#8b5cf6">Height</text>
          <text x="115" y="70" className="font-semibold text-xs" fill="#6366f1">Hypotenuse</text>
        </svg>
      </div>
    </div>
  );
};

/**
 * CBSE Class 10 Biology: Stomata (Open and Closed Stomatal Pore)
 * Shows bean-shaped Guard Cells, Stomatal Pore, Chloroplasts, Nucleus, and Epidermal Cells
 */
export const StomataDiagram: React.FC<{ isMidnight?: boolean }> = ({ isMidnight = false }) => {
  return (
    <div className={`my-4 p-4 rounded-2xl border transition-all ${
      isMidnight 
        ? 'bg-slate-900/95 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-slate-100' 
        : 'bg-gradient-to-b from-emerald-50/70 to-teal-50/40 border-emerald-200 shadow-sm text-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-3 border-b pb-2 border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            NCERT Class 10 Biology • Figure 6.3: Stomatal Apparatus
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
          Open vs. Closed Pore
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Panel 1: Open Stoma */}
        <div className={`p-3 rounded-xl border flex flex-col items-center ${
          isMidnight ? 'bg-slate-950/60 border-slate-800' : 'bg-white/80 border-emerald-100 shadow-xs'
        }`}>
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            (A) Open Stomatal Pore (Turgid Guard Cells)
          </div>
          <p className="text-[10px] text-slate-500 mb-2 text-center">
            Water enters guard cells → cells swell & curve → pore opens
          </p>
          <svg viewBox="0 0 280 200" className="w-full max-w-[260px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="guardCellOpen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="epidermalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Surrounding Epidermal Cells */}
            <path d="M 20,40 Q 70,20 140,25 Q 210,20 260,40 L 260,160 Q 210,180 140,175 Q 70,180 20,160 Z" fill="url(#epidermalGrad)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Epidermal cell partition lines */}
            <line x1="75" y1="23" x2="70" y2="80" stroke="#94a3b8" strokeWidth="1" />
            <line x1="205" y1="23" x2="210" y2="80" stroke="#94a3b8" strokeWidth="1" />
            <line x1="70" y1="120" x2="75" y2="177" stroke="#94a3b8" strokeWidth="1" />
            <line x1="210" y1="120" x2="205" y2="177" stroke="#94a3b8" strokeWidth="1" />

            {/* Left Kidney Guard Cell (Turgid, curved) */}
            <path d="M 130,45 C 90,50 80,150 130,155 C 112,130 112,70 130,45 Z" fill="url(#guardCellOpen)" stroke="#047857" strokeWidth="2" />
            {/* Inner thick wall of left guard cell */}
            <path d="M 130,45 C 112,70 112,130 130,155" fill="none" stroke="#064e3b" strokeWidth="3" />

            {/* Right Kidney Guard Cell (Turgid, curved) */}
            <path d="M 150,45 C 190,50 200,150 150,155 C 168,130 168,70 150,45 Z" fill="url(#guardCellOpen)" stroke="#047857" strokeWidth="2" />
            {/* Inner thick wall of right guard cell */}
            <path d="M 150,45 C 168,70 168,130 150,155" fill="none" stroke="#064e3b" strokeWidth="3" />

            {/* Open Stomatal Aperture (Center white/translucent) */}
            <ellipse cx="140" cy="100" rx="10" ry="32" fill={isMidnight ? '#0f172a' : '#f0fdf4'} stroke="#047857" strokeWidth="1.2" />

            {/* Chloroplasts in Left Guard Cell */}
            <circle cx="102" cy="75" r="3" fill="#15803d" />
            <circle cx="98" cy="100" r="3" fill="#15803d" />
            <circle cx="103" cy="125" r="3" fill="#15803d" />
            <circle cx="114" cy="62" r="2.5" fill="#15803d" />
            <circle cx="114" cy="138" r="2.5" fill="#15803d" />
            {/* Nucleus Left */}
            <circle cx="108" cy="98" r="4.5" fill="#dc2626" />

            {/* Chloroplasts in Right Guard Cell */}
            <circle cx="178" cy="75" r="3" fill="#15803d" />
            <circle cx="182" cy="100" r="3" fill="#15803d" />
            <circle cx="177" cy="125" r="3" fill="#15803d" />
            <circle cx="166" cy="62" r="2.5" fill="#15803d" />
            <circle cx="166" cy="138" r="2.5" fill="#15803d" />
            {/* Nucleus Right */}
            <circle cx="172" cy="98" r="4.5" fill="#dc2626" />

            {/* Pointer Labels */}
            {/* Stomatal Pore Pointer */}
            <line x1="140" y1="100" x2="60" y2="100" stroke="#0284c7" strokeWidth="1.2" />
            <circle cx="60" cy="100" r="2" fill="#0284c7" />
            <text x="18" y="103" className="font-extrabold text-[9px]" fill="#0284c7">Stomatal Pore</text>

            {/* Guard Cell Pointer */}
            <line x1="185" y1="85" x2="235" y2="70" stroke="#059669" strokeWidth="1.2" />
            <circle cx="235" cy="70" r="2" fill="#059669" />
            <text x="210" y="62" className="font-extrabold text-[9px]" fill="#059669">Guard Cell</text>

            {/* Chloroplast Pointer */}
            <line x1="178" y1="125" x2="230" y2="135" stroke="#15803d" strokeWidth="1.2" />
            <circle cx="230" cy="135" r="2" fill="#15803d" />
            <text x="210" y="148" className="font-extrabold text-[9px]" fill="#15803d">Chloroplast</text>
          </svg>
        </div>

        {/* Panel 2: Closed Stoma */}
        <div className={`p-3 rounded-xl border flex flex-col items-center ${
          isMidnight ? 'bg-slate-950/60 border-slate-800' : 'bg-white/80 border-emerald-100 shadow-xs'
        }`}>
          <div className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            (B) Closed Stomatal Pore (Flaccid Guard Cells)
          </div>
          <p className="text-[10px] text-slate-500 mb-2 text-center">
            Water lost from guard cells → cells shrink & straighten → pore closes
          </p>
          <svg viewBox="0 0 280 200" className="w-full max-w-[260px] h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="guardCellClosed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Surrounding Epidermal Cells */}
            <path d="M 20,40 Q 70,20 140,25 Q 210,20 260,40 L 260,160 Q 210,180 140,175 Q 70,180 20,160 Z" fill="url(#epidermalGrad)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="75" y1="23" x2="70" y2="80" stroke="#94a3b8" strokeWidth="1" />
            <line x1="205" y1="23" x2="210" y2="80" stroke="#94a3b8" strokeWidth="1" />
            <line x1="70" y1="120" x2="75" y2="177" stroke="#94a3b8" strokeWidth="1" />
            <line x1="210" y1="120" x2="205" y2="177" stroke="#94a3b8" strokeWidth="1" />

            {/* Left Guard Cell (Straightened, Flaccid) */}
            <path d="M 139,45 C 105,50 100,150 139,155 C 137,130 137,70 139,45 Z" fill="url(#guardCellClosed)" stroke="#047857" strokeWidth="2" />
            <path d="M 139,45 L 139,155" fill="none" stroke="#064e3b" strokeWidth="3" />

            {/* Right Guard Cell (Straightened, Flaccid) */}
            <path d="M 141,45 C 175,50 180,150 141,155 C 143,130 143,70 141,45 Z" fill="url(#guardCellClosed)" stroke="#047857" strokeWidth="2" />
            <path d="M 141,45 L 141,155" fill="none" stroke="#064e3b" strokeWidth="3" />

            {/* Closed slit seam between cells */}
            <line x1="140" y1="45" x2="140" y2="155" stroke="#064e3b" strokeWidth="2" />

            {/* Chloroplasts Left */}
            <circle cx="118" cy="75" r="3" fill="#15803d" />
            <circle cx="114" cy="100" r="3" fill="#15803d" />
            <circle cx="118" cy="125" r="3" fill="#15803d" />
            <circle cx="127" cy="62" r="2.5" fill="#15803d" />
            <circle cx="127" cy="138" r="2.5" fill="#15803d" />
            <circle cx="123" cy="98" r="4.5" fill="#dc2626" />

            {/* Chloroplasts Right */}
            <circle cx="162" cy="75" r="3" fill="#15803d" />
            <circle cx="166" cy="100" r="3" fill="#15803d" />
            <circle cx="162" cy="125" r="3" fill="#15803d" />
            <circle cx="153" cy="62" r="2.5" fill="#15803d" />
            <circle cx="153" cy="138" r="2.5" fill="#15803d" />
            <circle cx="157" cy="98" r="4.5" fill="#dc2626" />

            {/* Nucleus Pointer */}
            <line x1="123" y1="98" x2="60" y2="98" stroke="#dc2626" strokeWidth="1.2" />
            <circle cx="60" cy="98" r="2" fill="#dc2626" />
            <text x="22" y="102" className="font-extrabold text-[9px]" fill="#dc2626">Nucleus</text>

            {/* Closed Pore Label */}
            <line x1="140" y1="105" x2="225" y2="105" stroke="#0f766e" strokeWidth="1.2" />
            <circle cx="225" cy="105" r="2" fill="#0f766e" />
            <text x="180" y="96" className="font-extrabold text-[9px]" fill="#0f766e">Pore Closed</text>
          </svg>
        </div>
      </div>

      <div className={`mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-center justify-between ${
        isMidnight ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-white/60 border-emerald-100 text-slate-700'
      }`}>
        <span className="font-semibold">
          💡 <strong className="text-emerald-600 dark:text-emerald-400">NCERT Exam Insight:</strong> Opening & closing of the stomatal pore is controlled by guard cells swelling (absorbing water) and shrinking (losing water).
        </span>
      </div>
    </div>
  );
};
