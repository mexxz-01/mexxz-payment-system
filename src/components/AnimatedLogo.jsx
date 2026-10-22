import React from 'react';

export default function AnimatedLogo({ size = 'md' }) {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size] || 'w-10 h-10';

  return (
    <div className={`relative ${dimensions} flex items-center justify-center select-none group`}>
      {/* Outer ambient glow ring */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-cyan-500/30 to-purple-500/20 blur-md animate-pulse pointer-events-none" />

      {/* Main Vector Animated Badge */}
      <svg
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="mexxzStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981">
              <animate attributeName="stop-color" values="#10b981; #06b6d4; #8b5cf6; #10b981" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#06b6d4">
              <animate attributeName="stop-color" values="#06b6d4; #8b5cf6; #10b981; #06b6d4" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" values="#8b5cf6; #10b981; #06b6d4; #8b5cf6" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <linearGradient id="mexxzFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rotating Cyber Hexagon Border */}
        <path
          d="M50 4 L88 26 L88 74 L50 96 L12 74 L12 26 Z"
          fill="url(#mexxzFillGrad)"
          stroke="url(#mexxzStrokeGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Animated Dash Radar Ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#mexxzStrokeGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="14s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Stylized Modern "M" Monogram */}
        <path
          d="M32 68 L32 34 L50 54 L68 34 L68 68"
          stroke="url(#mexxzStrokeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {/* Central Energy Spark Node */}
        <circle cx="50" cy="54" r="3" fill="#ffffff">
          <animate attributeName="r" values="2.5; 4.5; 2.5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7; 1; 0.7" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
