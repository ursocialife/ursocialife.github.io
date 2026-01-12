
import React from 'react';
import { ChestType } from '../types';

interface ChestModelProps {
  type: string | ChestType;
  level?: number; // Added level for Mystery Chests (1-5)
}

export const ChestModel: React.FC<ChestModelProps> = ({ type, level = 1 }) => {
  const isSilver = type === 'SILVER';
  const isGolden = type === 'GOLDEN';
  const isMagical = type === 'MAGICAL';
  const isMystery = type === 'MYSTERY';

  // Base configurations
  let bodyColorStart = '#e2e8f0'; // Silver Start
  let bodyColorEnd = '#94a3b8';   // Silver End
  let strokeColor = '#334155';
  let trimColor = '#cbd5e1';
  let accentColor = '#64748b';
  let glowColor = 'rgba(255,255,255,0)';
  
  if (isGolden) {
    bodyColorStart = '#fcd34d'; // Amber-300
    bodyColorEnd = '#b45309';   // Amber-700
    strokeColor = '#451a03';
    trimColor = '#fbbf24';
    accentColor = '#92400e';
    glowColor = 'rgba(251, 191, 36, 0.4)';
  } else if (isMagical) {
    bodyColorStart = '#d8b4fe'; // Purple-300
    bodyColorEnd = '#7e22ce';   // Purple-700
    strokeColor = '#3b0764';
    trimColor = '#c084fc';
    accentColor = '#a855f7';
    glowColor = 'rgba(192, 132, 252, 0.5)';
  } else if (isMystery) {
      // Mystery Chest Colors based on Level
      switch(level) {
          case 1: // Wood/Common
              bodyColorStart = '#a16207';
              bodyColorEnd = '#713f12';
              strokeColor = '#451a03';
              trimColor = '#d97706';
              accentColor = '#9ca3af';
              break;
          case 2: // Bronze/Rare
              bodyColorStart = '#fdba74';
              bodyColorEnd = '#ea580c';
              strokeColor = '#7c2d12';
              trimColor = '#fed7aa';
              accentColor = '#c2410c';
              break;
          case 3: // Purple/Epic
              bodyColorStart = '#c084fc';
              bodyColorEnd = '#7e22ce';
              strokeColor = '#3b0764';
              trimColor = '#e9d5ff';
              accentColor = '#6b21a8';
              glowColor = 'rgba(168, 85, 247, 0.4)';
              break;
          case 4: // Cyan/Legendary
              bodyColorStart = '#22d3ee';
              bodyColorEnd = '#0891b2';
              strokeColor = '#164e63';
              trimColor = '#a5f3fc';
              accentColor = '#06b6d4';
              glowColor = 'rgba(34, 211, 238, 0.6)';
              break;
          case 5: // Gold/Champion
              bodyColorStart = '#fde047';
              bodyColorEnd = '#ca8a04';
              strokeColor = '#854d0e';
              trimColor = '#fef08a';
              accentColor = '#ffffff';
              glowColor = 'rgba(250, 204, 21, 0.8)';
              break;
          default:
              break;
      }
  }

  const gradientId = `chestGrad_${type}_${level}`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bodyColorStart} />
                <stop offset="100%" stopColor={bodyColorEnd} />
            </linearGradient>
            <filter id="chestGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Glow for Magical/Golden/High Level Mystery */}
        {(isGolden || isMagical || (isMystery && level >= 3)) && (
            <circle cx="50" cy="50" r="45" fill={glowColor} filter="blur(8px)" className="animate-pulse" />
        )}

        {/* Main Body */}
        <path 
            d="M15 45 L15 85 Q15 95 25 95 L75 95 Q85 95 85 85 L85 45 Z" 
            fill={`url(#${gradientId})`} 
            stroke={strokeColor} 
            strokeWidth="3" 
        />
        
        {/* Lid */}
        <path 
            d="M10 45 Q50 -5 90 45" 
            fill={`url(#${gradientId})`} 
            stroke={strokeColor} 
            strokeWidth="3" 
        />
        <path 
            d="M10 45 Q50 -5 90 45" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            opacity="0.3" 
            transform="scale(0.9) translate(5, 5)" 
        />

        {/* Metal Trim */}
        <rect x="12" y="42" width="76" height="8" rx="2" fill={trimColor} stroke={strokeColor} strokeWidth="2" />
        
        {/* Lock/Latch */}
        <rect x="42" y="38" width="16" height="20" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
        <circle cx="50" cy="48" r="3" fill="#1e293b" />
        <rect x="49" y="48" width="2" height="6" fill="#1e293b" />

        {/* Mystery Question Mark */}
        {isMystery && (
             <text x="50" y="85" textAnchor="middle" fill={strokeColor} fontSize="35" fontWeight="900" opacity="0.6">?</text>
        )}

        {/* Decorative Straps */}
        <path d="M25 45 L25 90" stroke={strokeColor} strokeWidth="4" opacity="0.4" />
        <path d="M75 45 L75 90" stroke={strokeColor} strokeWidth="4" opacity="0.4" />

        {/* Gems on Magical Chest */}
        {isMagical && (
            <>
                <circle cx="25" cy="30" r="4" fill="#60a5fa" stroke="white" strokeWidth="1" className="animate-pulse" />
                <circle cx="75" cy="30" r="4" fill="#60a5fa" stroke="white" strokeWidth="1" className="animate-pulse" />
            </>
        )}
    </svg>
  );
};
