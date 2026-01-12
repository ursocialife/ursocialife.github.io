
import React from 'react';

export const GoldIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ri_goldGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </radialGradient>
      <filter id="ri_goldTexture" x="0%" y="0%" width="100%" height="100%">
         <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
         <feComposite operator="in" in="noise" in2="SourceGraphic" result="composite" />
         <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
      </filter>
      <linearGradient id="ri_edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    
    <g filter="drop-shadow(0px 4px 2px rgba(0,0,0,0.4))">
        {/* Outer Rim */}
        <circle cx="50" cy="50" r="45" fill="url(#ri_edgeGrad)" stroke="#78350f" strokeWidth="1" />
        <circle cx="50" cy="50" r="40" fill="#78350f" />
        
        {/* Inner Coin Body */}
        <circle cx="50" cy="50" r="38" fill="url(#ri_goldGrad)" />
        
        {/* Texture Overlay (Subtle) */}
        <circle cx="50" cy="50" r="38" fill="url(#ri_goldGrad)" opacity="0.8" />

        {/* Embossed Ring */}
        <circle cx="50" cy="50" r="30" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.6" strokeDasharray="5 3" />

        {/* Crown Symbol */}
        <path d="M35 55 L35 45 L42 50 L50 35 L58 50 L65 45 L65 55 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
        <path d="M35 55 L65 55 L65 62 Q50 68 35 62 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
        
        {/* Specular Shine */}
        <ellipse cx="35" cy="35" rx="10" ry="5" fill="white" opacity="0.4" transform="rotate(-45 35 35)" />
    </g>
  </svg>
);

export const GemIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ri_gemFace1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
      <linearGradient id="ri_gemFace2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
      <linearGradient id="ri_gemFace3" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
      </linearGradient>
    </defs>
    
    <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.3))" transform="translate(50 50) scale(0.9) translate(-50 -50)">
        {/* Back Facets (Darker) */}
        <path d="M20 35 L80 35 L50 90 Z" fill="url(#ri_gemFace3)" stroke="#14532d" strokeWidth="1" />
        
        {/* Top Facet (Bright) */}
        <path d="M30 35 L20 35 L50 10 L80 35 L70 35 L50 45 Z" fill="#bbf7d0" stroke="#14532d" strokeWidth="0.5" />
        
        {/* Side Facets */}
        <path d="M20 35 L50 45 L50 90 Z" fill="url(#ri_gemFace2)" stroke="#14532d" strokeWidth="0.5" />
        <path d="M80 35 L50 45 L50 90 Z" fill="url(#ri_gemFace2)" stroke="#14532d" strokeWidth="0.5" />

        {/* Upper Side Facets */}
        <path d="M20 35 L50 10 L50 45 Z" fill="url(#ri_gemFace1)" opacity="0.9" />
        <path d="M80 35 L50 10 L50 45 Z" fill="url(#ri_gemFace1)" opacity="0.8" />
        
        {/* Hard Edge Highlights */}
        <path d="M20 35 L50 45 L80 35" fill="none" stroke="#dcfce7" strokeWidth="1" opacity="0.6" />
        <path d="M50 10 L50 45 L50 90" fill="none" stroke="#14532d" strokeWidth="1" opacity="0.3" />
        
        {/* Sparkle */}
        <path d="M35 25 L40 25 L37.5 20 Z" fill="white" opacity="0.8" />
        <circle cx="37.5" cy="23.5" r="2" fill="white" filter="blur(1px)" opacity="0.8" />
    </g>
  </svg>
);

export const KingXPIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ri_kingStar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
        </defs>
        <g filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">
            {/* Star Shape */}
            <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="url(#ri_kingStar)" stroke="#172554" strokeWidth="2" />
            <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.5" />
        </g>
    </svg>
);
