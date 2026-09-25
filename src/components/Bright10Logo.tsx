import React from 'react';

export interface Bright10LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'icon-only' | 'full';
  showText?: boolean;
  isMidnight?: boolean;
  className?: string;
  glow?: boolean;
}

export const Bright10Logo: React.FC<Bright10LogoProps> = ({
  size = 'md',
  variant = 'icon-only',
  showText = false,
  isMidnight = true,
  className = '',
  glow = true
}) => {
  // Map size tokens to pixel dimensions
  let px = 48;
  if (typeof size === 'number') {
    px = size;
  } else {
    switch (size) {
      case 'xs': px = 28; break;
      case 'sm': px = 36; break;
      case 'md': px = 48; break;
      case 'lg': px = 64; break;
      case 'xl': px = 96; break;
    }
  }

  // If variant is "full", the SVG includes both the glass book icon and the "Bright 10" text inside the squircle
  const isFull = variant === 'full' || showText;

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none group transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{ width: px, height: px }}
      title="Bright 10 - CBSE Class 10 Learning Platform"
    >
      {/* Dynamic ambient backdrop glow */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-[24%] bg-amber-400/20 blur-md pointer-events-none transition-opacity duration-300 group-hover:opacity-80"
          style={{
            transform: 'scale(1.08)',
            filter: 'blur(8px)'
          }}
        />
      )}

      <svg 
        viewBox="0 0 512 512" 
        width={px} 
        height={px} 
        className="relative z-10 w-full h-full drop-shadow-md rounded-[23%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base squircle gradient */}
          <radialGradient id={`bgGrad-${px}`} cx="50%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#1c1d24" />
            <stop offset="50%" stopColor="#0d0e13" />
            <stop offset="100%" stopColor="#040406" />
          </radialGradient>

          {/* Squircle rim highlight */}
          <linearGradient id={`rimGrad-${px}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="18%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>

          {/* Star radiant glow */}
          <radialGradient id={`starGlow-${px}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#eab308" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#ca8a04" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
          </radialGradient>

          {/* Glass page wings */}
          <linearGradient id={`glassPageLeft-${px}`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id={`glassPageRight-${px}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id={`glassEdgeSheen-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#cbd5e1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          {/* Star 8-point facet gradients */}
          <linearGradient id={`starFacetLight-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id={`starFacetWarm-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={`starFacetShade-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id={`tenGrad-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f5d0a9" />
          </linearGradient>

          <filter id={`softGlow-${px}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Background Base */}
        <rect width="512" height="512" rx="116" fill={`url(#bgGrad-${px})`} />
        <rect width="512" height="512" rx="116" fill="none" stroke={`url(#rimGrad-${px})`} strokeWidth="3.5" />

        {/* Main Graphic Layer (shifted slightly up if full text is visible, or centered if icon-only) */}
        <g transform={isFull ? "translate(0, -6)" : "translate(0, 18) scale(1.15) translate(-38, -38)"}>
          
          {/* Back Glass Layers */}
          <path 
            d="M148 140 C148 126, 160 120, 180 124 L244 138 C252 140, 256 142, 256 142 C256 142, 260 140, 268 138 L332 124 C352 120, 364 126, 364 140 L364 286 C364 298, 350 306, 332 308 L268 316 C260 317, 256 322, 256 322 C256 322, 252 317, 244 316 L180 308 C162 306, 148 298, 148 286 Z" 
            fill="none" 
            stroke="#ffffff" 
            strokeOpacity="0.22" 
            strokeWidth="4" 
          />

          <path 
            d="M156 134 C156 122, 168 116, 186 120 L246 134 C252 136, 256 138, 256 138 C256 138, 260 136, 266 134 L326 120 C344 116, 356 122, 356 134 L356 292 C356 302, 344 310, 328 312 L266 320 C260 321, 256 326, 256 326 C256 326, 252 321, 246 320 L184 312 C168 310, 156 302, 156 292 Z" 
            fill="none" 
            stroke="#ffffff" 
            strokeOpacity="0.36" 
            strokeWidth="4.5" 
          />

          {/* Primary Front Glass Book Left & Right Wings */}
          <path 
            d="M166 126 C166 114, 178 110, 196 114 L248 128 C253 130, 256 133, 256 135 L256 332 C256 332, 252 325, 244 324 L192 316 C174 313, 166 304, 166 292 Z"
            fill={`url(#glassPageLeft-${px})`} 
            stroke={`url(#glassEdgeSheen-${px})`} 
            strokeWidth="5" 
            strokeLinejoin="round" 
          />
          <path 
            d="M346 126 C346 114, 334 110, 316 114 L264 128 C259 130, 256 133, 256 135 L256 332 C256 332, 260 325, 268 324 L320 316 C338 313, 346 304, 346 292 Z"
            fill={`url(#glassPageRight-${px})`} 
            stroke={`url(#glassEdgeSheen-${px})`} 
            strokeWidth="5" 
            strokeLinejoin="round" 
          />

          {/* Inner Curving Glass Sheaves */}
          <path 
            d="M182 134 C210 148, 238 152, 256 142 L256 324 C238 320, 206 312, 182 288 Z"
            fill="#ffffff" 
            fillOpacity="0.14" 
            stroke="#ffffff" 
            strokeOpacity="0.55" 
            strokeWidth="3" 
          />
          <path 
            d="M330 134 C302 148, 274 152, 256 142 L256 324 C274 320, 306 312, 330 288 Z"
            fill="#ffffff" 
            fillOpacity="0.14" 
            stroke="#ffffff" 
            strokeOpacity="0.55" 
            strokeWidth="3" 
          />

          {/* Lower Glass Spine Refraction Cup */}
          <path 
            d="M232 322 C242 334, 256 338, 256 338 C256 338, 270 334, 280 322"
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            opacity="0.9" 
          />

          {/* Golden Center Bloom */}
          <circle 
            cx="256" 
            cy="225" 
            r="98" 
            fill={`url(#starGlow-${px})`} 
            opacity="0.85" 
            filter={`url(#softGlow-${px})`} 
          />

          {/* The 8-Pointed Faceted Star */}
          <g>
            {/* North Point */}
            <polygon points="256,225 256,158 250,218" fill={`url(#starFacetLight-${px})`} />
            <polygon points="256,225 256,158 262,218" fill={`url(#starFacetWarm-${px})`} />

            {/* South Point */}
            <polygon points="256,225 256,292 250,232" fill={`url(#starFacetShade-${px})`} />
            <polygon points="256,225 256,292 262,232" fill={`url(#starFacetWarm-${px})`} />

            {/* West Point */}
            <polygon points="256,225 189,225 249,219" fill={`url(#starFacetLight-${px})`} />
            <polygon points="256,225 189,225 249,231" fill={`url(#starFacetShade-${px})`} />

            {/* East Point */}
            <polygon points="256,225 323,225 263,219" fill={`url(#starFacetWarm-${px})`} />
            <polygon points="256,225 323,225 263,231" fill={`url(#starFacetShade-${px})`} />

            {/* NE Point */}
            <polygon points="256,225 304,177 263,219" fill={`url(#starFacetLight-${px})`} />
            <polygon points="256,225 304,177 262,218" fill={`url(#starFacetWarm-${px})`} />

            {/* NW Point */}
            <polygon points="256,225 208,177 250,218" fill={`url(#starFacetLight-${px})`} />
            <polygon points="256,225 208,177 249,219" fill={`url(#starFacetWarm-${px})`} />

            {/* SW Point */}
            <polygon points="256,225 208,273 249,231" fill={`url(#starFacetShade-${px})`} />
            <polygon points="256,225 208,273 250,232" fill={`url(#starFacetLight-${px})`} />

            {/* SE Point */}
            <polygon points="256,225 304,273 263,231" fill={`url(#starFacetWarm-${px})`} />
            <polygon points="256,225 304,273 262,232" fill={`url(#starFacetShade-${px})`} />

            {/* Star Core Highlight */}
            <polygon points="256,218 263,225 256,232 249,225" fill="#ffffff" opacity="0.95" />
            <circle cx="256" cy="225" r="3.5" fill="#ffffff" />
          </g>

          {/* Micro sparkle */}
          <path d="M452 437 Q452 452 467 452 Q452 452 452 467 Q452 452 437 452 Q452 452 452 437 Z" fill="#ffffff" opacity="0.4" />
        </g>

        {/* App Title Text for Full variant */}
        {isFull && (
          <text 
            x="256" 
            y="420" 
            textAnchor="middle" 
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif" 
            fontWeight="800" 
            fontSize="52" 
            letterSpacing="-1.5"
          >
            <tspan fill="#ffffff">Bright </tspan>
            <tspan fill={`url(#tenGrad-${px})`}>10</tspan>
          </text>
        )}
      </svg>
    </div>
  );
};
