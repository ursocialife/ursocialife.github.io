
import React from 'react';
import { PlayerSide } from '../types';

interface UnitModelProps {
  defId: string;
  side: string | PlayerSide;
  className?: string;
  flashing?: boolean;
  variant?: 'card' | 'unit'; 
  facing?: 'front' | 'back';
  action?: 'IDLE' | 'MOVING' | 'ATTACKING' | 'CASTING'; 
  isCharging?: boolean; 
  hasShield?: boolean; 
  isInvisible?: boolean; 
}

export const UnitModel: React.FC<UnitModelProps> = ({ defId, side, className = "w-full h-full", flashing = false, variant = 'unit', facing = 'front', action = 'IDLE', isCharging = false, hasShield = false, isInvisible = false }) => {
  const isPlayer = side === PlayerSide.PLAYER || side === 'PLAYER';
  
  const colors = {
      main: isPlayer ? '#3b82f6' : '#ef4444',     
      dark: isPlayer ? '#1d4ed8' : '#b91c1c',     
      light: isPlayer ? '#93c5fd' : '#fca5a5',    
      skin: '#fca5a5',                            
      goblin: '#4ade80',                          
      bone: '#f1f5f9',                            
      metal: '#94a3b8',                           
      rock: '#57534e',                            
      purple: '#a855f7',                          
      gold: '#facc15',                            
      ice: '#cffafe',                             
      wood: '#78350f',                            
  };

  const isBack = facing === 'back';
  const isAttacking = action === 'ATTACKING';
  const isMoving = action === 'MOVING';

  const defs = (
    <defs>
      <pattern id="um_stonePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#78716c" /> 
          <path d="M0 5 L10 5 M5 0 L5 5 M5 5 L5 10" stroke="#57534e" strokeWidth="1" /> 
      </pattern>
      
      <pattern id="um_woodPattern" x="0" y="0" width="8" height="20" patternUnits="userSpaceOnUse">
          <rect width="8" height="20" fill="#a16207" /> 
          <path d="M4 0 L4 20 M0 5 L2 7 M6 15 L8 12" stroke="#713f12" strokeWidth="0.5" />
      </pattern>

      <linearGradient id="um_metalGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="um_darkMetalGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      
      <radialGradient id="um_skinGrad" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#fecaca" />
        <stop offset="100%" stopColor="#f87171" />
      </radialGradient>
      <radialGradient id="um_goblinGrad" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#16a34a" />
      </radialGradient>
      
      <linearGradient id="um_goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <radialGradient id="um_iceGrad" cx="40%" cy="40%" r="80%">
        <stop offset="0%" stopColor="#ecfeff" />
        <stop offset="100%" stopColor="#22d3ee" />
      </radialGradient>
      <radialGradient id="um_magicGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#e9d5ff" />
        <stop offset="100%" stopColor="#9333ea" />
      </radialGradient>

      <linearGradient id="um_teamBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="um_teamRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>

      <filter id="um_dropShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
        <feFlood floodColor="rgba(0,0,0,0.5)" result="color" />
        <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
        <feComposite in="SourceGraphic" in2="shadow" operator="over" />
      </filter>
    </defs>
  );

  const teamColorFill = isPlayer ? 'url(#um_teamBlue)' : 'url(#um_teamRed)';

  const renderHumanoid = (
      config: { 
          skinColor?: string, 
          armorColor?: string, 
          hat?: 'none'|'helmet'|'hood'|'mohawk'|'crown'|'wizard'|'ushanka'|'bucket'|'king_crown', 
          weapon?: 'sword'|'bow'|'spear'|'axe'|'hammer'|'staff'|'gun'|'lance'|'mace'|'none'|'cannon_control', 
          size?: number,
          hairColor?: string,
          hasBeard?: boolean,
          isFemale?: boolean,
          isGhost?: boolean
      }, 
      x = 50, y = 50, scale = 1
  ) => {
      const { 
          skinColor = colors.skin, 
          armorColor = teamColorFill, 
          hat = 'none', 
          weapon = 'none', 
          size = 1,
          hairColor = '#fcd34d',
          hasBeard = false,
          isFemale = false,
          isGhost = false
      } = config;
      
      const s = scale * size;
      const skinFill = skinColor === colors.skin ? 'url(#um_skinGrad)' : (skinColor === colors.goblin ? 'url(#um_goblinGrad)' : skinColor);
      const isArmorGradient = armorColor === colors.main || armorColor === teamColorFill || armorColor.includes('url');
      const finalArmor = isArmorGradient ? teamColorFill : armorColor;
      
      const filter = isGhost ? undefined : "url(#um_dropShadow)";
      const opacity = isGhost ? 0.7 : 1;

      return (
          <g transform={`translate(${x}, ${y}) scale(${s})`} filter={filter} opacity={opacity}>
              {/* Legs */}
              {!isGhost ? (
                  <>
                    <path d="M-8 30 L-8 40 L-12 40 L-10 30" fill="#4b5563" stroke="black" strokeWidth="1" />
                    <path d="M8 30 L8 40 L12 40 L10 30" fill="#4b5563" stroke="black" strokeWidth="1" />
                  </>
              ) : (
                  <path d="M-10 25 Q-5 45 0 35 Q5 45 10 25 L10 20 L-10 20 Z" fill={finalArmor} stroke="black" strokeWidth="1" opacity="0.8" />
              )}

              {/* Body */}
              <path d="M-14 -2 L14 -2 L12 28 L-12 28 Z" fill={finalArmor} stroke="black" strokeWidth="1.5" />
              
              {/* Shoulders */}
              <circle cx="-16" cy="5" r="5" fill={finalArmor} stroke="black" strokeWidth="1" />
              <circle cx="16" cy="5" r="5" fill={finalArmor} stroke="black" strokeWidth="1" />
              <rect x="-18" y="5" width="4" height="15" fill={skinFill} transform="rotate(10 -16 5)" stroke="black" strokeWidth="0.5" />
              <rect x="14" y="5" width="4" height="15" fill={skinFill} transform="rotate(-10 16 5)" stroke="black" strokeWidth="0.5" />

              {!isGhost && (
                  <>
                    <rect x="-13" y="24" width="26" height="6" fill="#451a03" rx="1" stroke="black" strokeWidth="0.5" />
                    <rect x="-3" y="24" width="6" height="6" fill="url(#um_goldGrad)" />
                  </>
              )}

              {/* Head */}
              <circle cx="0" cy="-10" r="13" fill={skinFill} stroke="black" strokeWidth="1.5" />
              
              {!isBack && hat !== 'bucket' && (
                  <g>
                    <ellipse cx="-4" cy="-12" rx="1.5" ry="2" fill="black" />
                    <ellipse cx="4" cy="-12" rx="1.5" ry="2" fill="black" />
                    <path d="M-7 -16 L-2 -15" stroke="black" strokeWidth="1" strokeLinecap="round" />
                    <path d="M7 -16 L2 -15" stroke="black" strokeWidth="1" strokeLinecap="round" />
                    
                    {hasBeard && <path d="M-10 -5 Q0 10 10 -5 L10 2 Q0 18 -10 2 Z" fill={hairColor} stroke="black" strokeWidth="0.5" />}
                    {skinColor === colors.goblin && (
                        <g>
                            <path d="M-13 -10 L-22 -16 L-13 -4 Z" fill={skinColor} stroke="black" />
                            <path d="M13 -10 L22 -16 L13 -4 Z" fill={skinColor} stroke="black" />
                            <path d="M-2 -5 L0 -2 L2 -5" fill="none" stroke="black" strokeWidth="0.5" />
                        </g>
                    )}
                  </g>
              )}

              {hat === 'helmet' && (
                  <g>
                      <path d="M-14 -12 Q0 -32 14 -12 L14 -8 L-14 -8 Z" fill="url(#um_metalGrad)" stroke="black" />
                      <rect x="-2" y="-30" width="4" height="10" fill="url(#um_metalGrad)" stroke="black" /> 
                  </g>
              )}
              {hat === 'hood' && <path d="M-15 -10 Q0 -34 15 -10 L15 5 Q0 12 -15 5 Z" fill={finalArmor} stroke="black" />}
              {hat === 'crown' && <path d="M-12 -18 L-6 -10 L0 -18 L6 -10 L12 -18 L12 -5 L-12 -5 Z" fill="url(#um_goldGrad)" stroke="black" strokeWidth="1" />}
              {hat === 'king_crown' && (
                  <g>
                      <path d="M-14 -18 L-7 -10 L0 -20 L7 -10 L14 -18 L14 -5 L-14 -5 Z" fill="url(#um_goldGrad)" stroke="black" />
                      <rect x="-14" y="-5" width="28" height="4" fill={colors.main} stroke="black" />
                  </g>
              )}
              {hat === 'wizard' && <path d="M-16 -12 L0 -40 L16 -12 Z" fill={finalArmor} stroke="black" />}
              {hat === 'mohawk' && <path d="M-2 -28 L2 -28 L2 -5 L-2 -5 Z" fill="#1e293b" stroke="black" strokeWidth="0.5" />}
              {hat === 'ushanka' && <rect x="-16" y="-22" width="32" height="14" rx="3" fill="#713f12" stroke="black" />}
              {hat === 'bucket' && (
                  <g>
                      <rect x="-14" y="-24" width="28" height="24" rx="2" fill="url(#um_darkMetalGrad)" stroke="black" />
                      <rect x="-14" y="-14" width="28" height="4" fill="black" opacity="0.5" />
                  </g>
              )}
              {hat === 'none' && !isFemale && !hasBeard && <path d="M-14 -12 Q0 -26 14 -12" fill={hairColor} stroke="black" strokeWidth="0.5" />}
              {isFemale && (
                  <g>
                      <path d="M-14 -12 Q0 -32 14 -12 L16 12 L-16 12 Z" fill={hairColor} stroke="black" strokeWidth="0.5" />
                      <path d="M-14 -12 L-14 10" stroke={hairColor} strokeWidth="2" />
                      <path d="M14 -12 L14 10" stroke={hairColor} strokeWidth="2" />
                  </g>
              )}

              <g className={isAttacking ? 'animate-pulse' : ''} transform={isAttacking ? 'rotate(-20)' : ''}>
                  {weapon === 'sword' && (
                      <g transform="translate(16, 0) rotate(-15)">
                          <rect x="-2" y="5" width="4" height="8" fill="#451a03" stroke="black" /> 
                          <rect x="-6" y="2" width="12" height="3" fill="url(#um_goldGrad)" stroke="black" /> 
                          <path d="M-3 2 L-3 -25 L0 -30 L3 -25 L3 2 Z" fill={isGhost ? "rgba(255,255,255,0.8)" : "url(#um_metalGrad)"} stroke="black" /> 
                          <path d="M0 2 L0 -25" stroke={isGhost ? "#bfdbfe" : "#94a3b8"} strokeWidth="1" /> 
                      </g>
                  )}
                  {weapon === 'spear' && (
                      <g transform="translate(14, 5) rotate(-10)">
                          <rect x="-1.5" y="-40" width="3" height="60" fill="url(#um_woodPattern)" stroke="black" strokeWidth="0.5" />
                          <path d="M-3 -40 L0 -50 L3 -40 Z" fill="url(#um_metalGrad)" stroke="black" />
                      </g>
                  )}
                  {weapon === 'axe' && (
                      <g transform="translate(18, 5) rotate(-10)">
                          <rect x="-2" y="-30" width="4" height="50" fill="url(#um_woodPattern)" stroke="black" />
                          <path d="M0 -25 Q15 -35 15 -10 Q0 -5 0 -25 Z" fill="url(#um_metalGrad)" stroke="black" />
                      </g>
                  )}
                  {weapon === 'hammer' && (
                      <g transform="translate(18, 5) rotate(-20)">
                          <rect x="-2" y="-30" width="5" height="50" fill="url(#um_woodPattern)" stroke="black" />
                          <rect x="-10" y="-35" width="20" height="15" fill="url(#um_stonePattern)" stroke="black" />
                      </g>
                  )}
                  {weapon === 'bow' && (
                       <g transform="translate(10, 5)">
                           <path d="M0 -20 Q20 0 0 20" fill="none" stroke="url(#um_woodPattern)" strokeWidth="3" />
                           <line x1="0" y1="0" x2="0" y2="-15" stroke="black" strokeWidth="1" />
                       </g>
                  )}
                  {weapon === 'staff' && (
                       <g transform="translate(16, 0)">
                           <rect x="-2" y="-40" width="4" height="60" fill="url(#um_woodPattern)" stroke="black" />
                           <circle cx="0" cy="-45" r="6" fill="url(#um_magicGrad)" stroke="#6b21a8" className="animate-pulse" />
                       </g>
                  )}
                  {weapon === 'gun' && (
                       <g transform="translate(8, 8)">
                           <rect x="0" y="0" width="25" height="6" fill="#1e293b" rx="1" stroke="black" />
                           <rect x="-5" y="2" width="10" height="6" fill="url(#um_woodPattern)" rx="2" stroke="black" transform="rotate(20)" />
                       </g>
                  )}
                  {weapon === 'lance' && (
                        <g transform="translate(18, 10) rotate(-45)">
                            <path d="M-3 -60 L3 -60 L5 20 L-5 20 Z" fill="url(#um_metalGrad)" stroke="black" />
                            <circle cx="0" cy="15" r="6" fill={finalArmor} stroke="black" />
                        </g>
                  )}
                  {weapon === 'mace' && (
                        <g transform="translate(18, 5) rotate(-20)">
                            <rect x="-2" y="-30" width="4" height="50" fill="url(#um_darkMetalGrad)" stroke="black" />
                            <circle cx="0" cy="-35" r="10" fill="url(#um_darkMetalGrad)" stroke="black" />
                            <path d="M0 -35 L0 -48 M0 -35 L12 -35 M0 -35 L-12 -35 M0 -35 L0 -22" stroke="black" strokeWidth="2" />
                        </g>
                  )}
                  {weapon === 'cannon_control' && (
                        <g transform="translate(16, 5)">
                            <rect x="0" y="-20" width="4" height="40" fill="url(#um_goldGrad)" stroke="black" />
                            <circle cx="2" cy="-20" r="4" fill="red" />
                        </g>
                  )}
              </g>
          </g>
      );
  };

  const renderSkeleton = (
      config: { weapon?: 'sword'|'bomb'|'shield', hat?: 'none'|'helmet'|'ushanka'|'hood', size?: number },
      x = 50, y = 50, scale = 1
  ) => {
      const { weapon = 'sword', hat = 'none', size = 0.8 } = config;
      const s = scale * size;
      return (
          <g transform={`translate(${x}, ${y}) scale(${s})`} filter="url(#um_dropShadow)">
              <rect x="-8" y="5" width="16" height="20" fill="#f1f5f9" stroke="black" rx="2" /> 
              <line x1="-8" y1="10" x2="8" y2="10" stroke="black" strokeWidth="1" />
              <line x1="-8" y1="15" x2="8" y2="15" stroke="black" strokeWidth="1" />
              <line x1="0" y1="25" x2="0" y2="35" stroke="black" strokeWidth="2" /> 
              <circle cx="0" cy="-5" r="11" fill="white" stroke="black" /> 
              
              {!isBack && (
                  <g>
                      <circle cx="-4" cy="-4" r="2.5" fill="black" />
                      <circle cx="4" cy="-4" r="2.5" fill="black" />
                      <path d="M-1 2 L0 0 L1 2 Z" fill="black" />
                  </g>
              )}
              {hat === 'helmet' && (
                  <path d="M-12 -8 Q0 -22 12 -8 L12 -3 L-12 -3 Z" fill={teamColorFill} stroke="black" />
              )}
              {hat === 'ushanka' && <rect x="-13" y="-16" width="26" height="14" fill="#713f12" rx="2" stroke="black" />}
              {hat === 'hood' && <path d="M-13 -8 Q0 -24 13 -8 L13 5 Q0 12 -13 5 Z" fill={colors.purple} stroke="black" />}
              
              {weapon === 'sword' && (
                  <rect x="8" y="0" width="4" height="25" fill="url(#um_metalGrad)" stroke="black" transform="rotate(-15)" />
              )}
              {weapon === 'bomb' && (
                  <g transform="translate(14, 10)">
                      <circle cx="0" cy="0" r="9" fill="#1e293b" stroke="black" />
                      <path d="M0 -9 L0 -12" stroke="black" strokeWidth="2" />
                      <circle cx="0" cy="-14" r="2" fill="#ef4444" className="animate-pulse" />
                  </g>
              )}
              {weapon === 'shield' && (
                  <circle cx="-8" cy="10" r="12" fill="url(#um_woodPattern)" stroke="black" strokeWidth="1.5" />
              )}
          </g>
      );
  };

  const renderConstruct = (
      config: { type: 'pekka'|'golem'|'mk'|'giant', color?: string },
      x = 50, y = 50, scale = 1
  ) => {
       const { type, color = '#374151' } = config;
       const s = scale;
       const armorFill = type === 'pekka' ? 'url(#um_darkMetalGrad)' : (type === 'mk' ? '#111827' : color);
       
       return (
           <g transform={`translate(${x}, ${y}) scale(${s})`} filter="url(#um_dropShadow)">
               <path d="M-22 -10 L22 -10 L18 40 L-18 40 Z" fill={type === 'golem' ? 'url(#um_stonePattern)' : armorFill} stroke="black" strokeWidth="2" />
               <rect x="-34" y="5" width="14" height="35" rx="4" fill={type === 'golem' ? 'url(#um_stonePattern)' : armorFill} stroke="black" />
               <rect x="20" y="5" width="14" height="35" rx="4" fill={type === 'golem' ? 'url(#um_stonePattern)' : armorFill} stroke="black" />
               <g transform="translate(0, -18)">
                   {type === 'pekka' && (
                       <g>
                           <path d="M-16 0 L-22 -18 L-10 -8 L0 -14 L10 -8 L22 -18 L16 0 Z" fill={armorFill} stroke="black" />
                           {!isBack && <circle cx="0" cy="-4" r="3" fill="#fca5a5" className="animate-pulse" filter="drop-shadow(0 0 2px #f87171)" />}
                       </g>
                   )}
                   {type === 'golem' && (
                       <path d="M-14 -14 L14 -14 L18 10 L-18 10 Z" fill="url(#um_stonePattern)" stroke="black" />
                   )}
                   {type === 'mk' && (
                        <g>
                             <circle cx="0" cy="0" r="16" fill="#111827" stroke="black" strokeWidth="2" />
                             {!isBack && <rect x="-12" y="-4" width="24" height="6" fill="black" rx="1" />}
                        </g>
                   )}
                   {type === 'giant' && (
                       <g>
                           <circle cx="0" cy="0" r="16" fill="url(#um_skinGrad)" stroke="black" />
                           {!isBack && (
                               <g>
                                   <rect x="-6" y="-6" width="4" height="6" fill="#92400e" transform="rotate(45)" /> 
                                   <rect x="2" y="-6" width="4" height="6" fill="#92400e" transform="rotate(-45)" />
                                   <path d="M-10 8 Q0 15 10 8" stroke="#92400e" strokeWidth="4" fill="none" /> 
                               </g>
                           )}
                       </g>
                   )}
               </g>
               {type === 'pekka' && (
                   <g transform="translate(28, 15) rotate(-15)">
                        <rect x="-3" y="-5" width="6" height="50" fill="url(#um_metalGrad)" stroke="black" />
                        <path d="M-3 0 L-10 10 L-3 20" fill="url(#um_metalGrad)" stroke="black" />
                   </g>
               )}
               {type === 'mk' && (
                   <g>
                       <circle cx="-28" cy="35" r="10" fill="#111827" stroke="black" strokeWidth="2" />
                       <path d="M-28 25 L-28 45" stroke="#374151" strokeWidth="2" />
                       <circle cx="28" cy="35" r="10" fill="#111827" stroke="black" strokeWidth="2" />
                       <path d="M28 25 L28 45" stroke="#374151" strokeWidth="2" />
                   </g>
               )}
           </g>
       );
  };

  const renderBuilding = (
      config: { type: 'standard'|'tesla'|'inferno'|'spawner'|'bow'|'tombstone'|'hut', color?: string },
      x = 50, y = 50, scale = 1
  ) => {
       const { type, color = colors.wood } = config;
       return (
           <g transform={`translate(${x}, ${y}) scale(${scale})`} filter="url(#um_dropShadow)">
               <rect x="-22" y="0" width="44" height="35" fill={type === 'standard' || type === 'tombstone' ? 'url(#um_stonePattern)' : 'url(#um_woodPattern)'} stroke="black" strokeWidth="1.5" />
               {type !== 'tombstone' && <path d="M-15 10 L15 10 M-15 20 L15 20" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />}
               {type === 'standard' && (
                   <g>
                       <rect x="-12" y="-12" width="24" height="12" fill="#1f2937" stroke="black" />
                       <circle cx="0" cy="-6" r="4" fill="black" />
                   </g>
               )}
               {type === 'tesla' && (
                   <g className={isAttacking ? "animate-pulse" : ""}>
                       <rect x="-6" y="-25" width="12" height="25" fill="url(#um_metalGrad)" stroke="black" />
                       <path d="M-10 -25 L0 -35 L10 -25" fill="#facc15" stroke="black" />
                       <circle cx="0" cy="-15" r="4" fill="#facc15" filter="drop-shadow(0 0 5px #facc15)" />
                   </g>
               )}
               {type === 'inferno' && (
                    <g>
                        <rect x="-8" y="-35" width="16" height="35" fill="#b91c1c" stroke="black" />
                        <rect x="-6" y="-20" width="12" height="12" fill="#fef08a" className={isAttacking ? "animate-ping" : ""} />
                        <path d="M-12 -35 L12 -35 L0 -45 Z" fill="#7f1d1d" stroke="black" />
                    </g>
               )}
               {type === 'spawner' && <path d="M-15 5 L0 -10 L15 5" fill="#fca5a5" stroke="black" /> }
               {type === 'bow' && (
                   <g transform="translate(0, -10)">
                       <path d="M-20 0 Q0 -20 20 0" stroke="#713f12" strokeWidth="3" fill="none" />
                       <line x1="0" y1="0" x2="0" y2="-15" stroke="black" strokeWidth="1" />
                   </g>
               )}
               {type === 'tombstone' && (
                   <g>
                       <path d="M-18 0 L-12 -28 Q0 -38 12 -28 L18 0 Z" fill="url(#um_stonePattern)" stroke="black" />
                       <path d="M-5 -20 L5 -20 M0 -25 L0 -15" stroke="#4b5563" strokeWidth="2" /> 
                       <rect x="-12" y="10" width="24" height="25" fill="#374151" rx="2" />
                   </g>
               )}
               {type === 'hut' && (
                   <g>
                        <path d="M-28 0 L0 -35 L28 0 Z" fill="#facc15" stroke="black" /> 
                        <path d="M-20 -5 L0 -30 L20 -5" fill="none" stroke="#b45309" strokeWidth="2" />
                        <rect x="-18" y="0" width="36" height="35" fill="url(#um_woodPattern)" stroke="black" />
                        <rect x="-8" y="15" width="16" height="20" fill="#1f2937" rx="2" />
                   </g>
               )}
           </g>
       );
  };

  const renderTower = (
      type: 'princess' | 'king' | 'cannoneer',
      x = 50, y = 50, scale = 1
  ) => {
      const s = scale;
      
      const renderBase = () => (
          <g>
              <path d="M-20 -40 L20 -40 L25 10 L-25 10 Z" fill="url(#um_stonePattern)" stroke="black" strokeWidth="1.5" />
              <rect x="-28" y="10" width="56" height="10" fill="url(#um_stonePattern)" stroke="black" strokeWidth="1.5" />
              <path d="M-15 -35 L15 -35 L15 0 L0 10 L-15 0 Z" fill={teamColorFill} opacity="0.9" stroke="black" strokeWidth="0.5"/>
              <path d="M0 -25 L8 -15 L0 -5 L-8 -15 Z" fill="url(#um_goldGrad)" stroke="black" strokeWidth="0.5" />
              <path d="M-22 -40 L-22 -50 L22 -50 L22 -40 L-22 -40" fill="url(#um_stonePattern)" stroke="black" strokeWidth="1" />
              <rect x="-24" y="-42" width="48" height="4" fill="#57534e" /> 
          </g>
      );

      const renderKingBase = () => (
          <g>
              <path d="M-35 -20 L35 -20 L40 15 L-40 15 Z" fill="url(#um_stonePattern)" stroke="black" strokeWidth="2" />
              <rect x="-42" y="15" width="84" height="12" fill="url(#um_stonePattern)" stroke="black" strokeWidth="2" />
              <rect x="-38" y="-10" width="10" height="25" fill="url(#um_stonePattern)" stroke="black" />
              <rect x="28" y="-10" width="10" height="25" fill="url(#um_stonePattern)" stroke="black" />
              <rect x="-30" y="-5" width="60" height="10" fill={teamColorFill} stroke="black" />
              <rect x="-25" y="-45" width="50" height="25" fill="#44403c" stroke="black" />
          </g>
      );

      const renderFrontWall = () => (
          <g>
              <path d="M-25 -40 L-25 -48 L-15 -48 L-15 -40 L-5 -40 L-5 -48 L5 -48 L5 -40 L15 -40 L15 -48 L25 -48 L25 -40" 
                    fill="url(#um_stonePattern)" stroke="black" strokeWidth="1.5" />
              <path d="M-25 -40 L25 -40" stroke="white" strokeWidth="1" opacity="0.3" />
          </g>
      );

      const renderKingFront = () => (
          <g>
              <path d="M-15 -25 L15 -25 L20 -15 L-20 -15 Z" fill="#1f2937" stroke="black" />
              <path d="M-30 -20 L-30 -30 L-20 -30 L-20 -20 L20 -20 L20 -30 L30 -30 L30 -20" 
                    fill="url(#um_stonePattern)" stroke="black" strokeWidth="2" />
          </g>
      );

      return (
          <g transform={`translate(${x}, ${y}) scale(${s})`} filter="url(#um_dropShadow)">
              {type === 'princess' && (
                  <>
                      {renderBase()}
                      {/* Explicitly passing 0,0 for local centering inside the translated group */}
                      <g transform="translate(0, -45)">
                          {renderHumanoid({ hat: 'crown', weapon: 'bow', isFemale: true, size: 0.85, armorColor: colors.gold }, 0, 0)}
                      </g>
                      {renderFrontWall()}
                  </>
              )}

              {type === 'king' && (
                  <>
                      {renderKingBase()}
                      <g transform="translate(0, -45)">
                          {renderHumanoid({ hat: 'king_crown', weapon: 'none', hasBeard: true, size: 1.1, armorColor: colors.main }, 0, 0)}
                      </g>
                      <g transform="translate(0, -35)">
                          <circle cx="0" cy="0" r="12" fill="#111827" stroke="black" strokeWidth="2" />
                          <circle cx="0" cy="0" r="8" fill="black" />
                      </g>
                      {renderKingFront()}
                  </>
              )}

              {type === 'cannoneer' && (
                  <>
                      {renderBase()}
                      <g transform="translate(0, -45)">
                          {renderHumanoid({ hat: 'helmet', weapon: 'none', size: 0.9, armorColor: '#4b5563' }, 0, 0)}
                      </g>
                      <g transform="translate(0, -40)">
                          <rect x="-8" y="-5" width="16" height="20" fill="#374151" stroke="black" />
                          <circle cx="0" cy="5" r="6" fill="black" />
                      </g>
                      {renderFrontWall()}
                  </>
              )}
          </g>
      );
  };

  const renderSpell = (
      config: { type: 'bottle'|'projectile'|'log'|'roll', color: string },
      x = 50, y = 50, scale = 1
  ) => {
      const { type, color } = config;
      const s = scale;
      return (
          <g transform={`translate(${x}, ${y}) scale(${s})`}>
              {type === 'bottle' && (
                  <g filter="url(#um_dropShadow)">
                      <path d="M-12 15 L-12 -15 L-6 -25 L6 -25 L12 -15 L12 15 Q0 25 -12 15 Z" fill={color} stroke="black" strokeWidth="1.5" opacity="0.9" />
                      <rect x="-6" y="-28" width="12" height="6" fill="#78350f" stroke="black" />
                      <path d="M-5 0 Q0 10 5 0" stroke="white" strokeWidth="2" opacity="0.4" fill="none" /> 
                      <circle cx="0" cy="5" r="8" fill="white" opacity="0.2" filter="blur(3px)" />
                  </g>
              )}
              {type === 'projectile' && (
                   <g>
                       <circle cx="0" cy="0" r="18" fill={color} filter="blur(2px)" />
                       <circle cx="0" cy="0" r="14" fill="white" opacity="0.6" />
                       <path d="M-12 -12 L0 -30 L12 -12" fill={color} opacity="0.6" />
                   </g>
              )}
              {type === 'log' && (
                   <g transform="rotate(90)" filter="url(#um_dropShadow)">
                       <rect x="-12" y="-30" width="24" height="60" fill="url(#um_woodPattern)" stroke="black" rx="3" strokeWidth="1.5" />
                       <path d="M-12 -15 L12 -15 M-12 0 L12 0 M-12 15 L12 15" stroke="#3f1c05" strokeWidth="2" />
                       <circle cx="0" cy="0" r="3" fill="#a16207" />
                       <path d="M-5 -40 L5 -40 L0 -30 Z" fill="#525252" stroke="black" /> 
                       <path d="M-5 40 L5 40 L0 30 Z" fill="#525252" stroke="black" /> 
                   </g>
              )}
          </g>
      );
  };

  const renderFlyer = (
      config: { type: 'minion'|'bat'|'dragon'|'machine', color?: string, armor?: boolean },
      x = 50, y = 50, scale = 1
  ) => {
      const { type, color = colors.main, armor = false } = config;
      const s = scale;
      const wingY = isMoving ? -5 : 0;
      
      return (
          <g transform={`translate(${x}, ${y}) scale(${s})`} filter="url(#um_dropShadow)">
              <g className={isMoving ? "animate-pulse" : ""}>
                  <path d={`M-15 -5 Q-40 ${-15 + wingY} -15 15 L-5 10 Z`} fill={type === 'bat' ? '#a78bfa' : '#93c5fd'} stroke="black" strokeWidth="1" />
                  <path d={`M15 -5 Q40 ${-15 + wingY} 15 15 L5 10 Z`} fill={type === 'bat' ? '#a78bfa' : '#93c5fd'} stroke="black" strokeWidth="1" />
              </g>
              {type === 'minion' && (
                  <g>
                      <circle cx="0" cy="0" r="14" fill={color} stroke="black" strokeWidth="1.5" />
                      {armor && <path d="M-14 0 Q0 -20 14 0 L14 10 L-14 10 Z" fill="#1e3a8a" stroke="black" />}
                      {!isBack && (
                          <g>
                              <circle cx="0" cy="0" r="7" fill="white" stroke="black" strokeWidth="1" />
                              <circle cx="2" cy="0" r="2" fill="black" />
                          </g>
                      )}
                      <path d="M-10 10 L-5 18 M10 10 L5 18" stroke={color} strokeWidth="3" />
                  </g>
              )}
              {type === 'bat' && (
                  <g>
                      <circle cx="0" cy="0" r="9" fill="#4c1d95" stroke="black" />
                      {!isBack && (
                          <g>
                              <circle cx="-3" cy="-2" r="1" fill="white" />
                              <circle cx="3" cy="-2" r="1" fill="white" />
                              <path d="M-2 4 L0 6 L2 4" fill="white" />
                          </g>
                      )}
                  </g>
              )}
              {type === 'dragon' && (
                  <g>
                      <path d="M-12 5 Q0 20 12 5 L0 25 Z" fill={color} stroke="black" /> 
                      <circle cx="0" cy="-10" r="14" fill={color} stroke="black" />
                      {armor && <path d="M-10 -18 L-6 -28 L0 -22 L6 -28 L10 -18" fill="#1e293b" stroke="black" />}
                      {!isBack && (
                          <g>
                              <ellipse cx="-5" cy="-12" rx="2" ry="3" fill="black" />
                              <ellipse cx="5" cy="-12" rx="2" ry="3" fill="black" />
                              <path d="M-4 0 Q0 -2 4 0" stroke="black" strokeWidth="1" fill="none" />
                          </g>
                      )}
                  </g>
              )}
               {type === 'machine' && (
                  <g>
                      <rect x="-18" y="-12" width="36" height="24" rx="4" fill="url(#um_woodPattern)" stroke="black" />
                      <circle cx="0" cy="0" r="6" fill="#1e293b" stroke="black" />
                      <rect x="-24" y="-2" width="48" height="4" fill="#9ca3af" className="animate-spin" style={{transformOrigin: '0 0'}} />
                      <path d="M-10 12 L-15 20 M10 12 L15 20" stroke="#78350f" strokeWidth="3" />
                  </g>
              )}
          </g>
      );
  };

  const renderUnit = () => {
    if (variant === 'card') {
         const swarms: Record<string, {count: number, renderer: any}> = {
             'skeletons': { count: 3, renderer: () => renderSkeleton({}, 0, 0, 0.6) },
             'minions': { count: 3, renderer: () => renderFlyer({type:'minion'}, 0, 0, 0.7) },
             'goblins': { count: 3, renderer: () => renderHumanoid({skinColor: colors.goblin, size: 0.7, hat: 'none', weapon: 'sword'}, 0, 0, 0.7) },
             'spear_goblins': { count: 3, renderer: () => renderHumanoid({skinColor: colors.goblin, size: 0.7, hat: 'none', weapon: 'spear'}, 0, 0, 0.7) },
             'archers': { count: 2, renderer: () => renderHumanoid({hat: 'hood', weapon: 'bow', isFemale: true, size: 0.8}, 0, 0, 0.8) },
             'barbarians': { count: 4, renderer: () => renderHumanoid({hat: 'none', weapon: 'sword', hasBeard: true, size: 0.85}, 0, 0, 0.85) },
             'elitebarbarians': { count: 2, renderer: () => renderHumanoid({hat: 'helmet', weapon: 'sword', hasBeard: true, size: 0.9}, 0, 0, 0.9) },
             'guards': { count: 3, renderer: () => renderSkeleton({weapon: 'shield', hat: 'helmet'}, 0, 0, 0.7) },
             'bats': { count: 4, renderer: () => renderFlyer({type: 'bat'}, 0, 0, 0.6) },
             'zappies': { count: 3, renderer: () => <g transform="scale(0.6)"><rect x="-10" y="-10" width="20" height="20" rx="4" fill="#a5f3fc" stroke="black" /><circle cx="0" cy="-10" r="5" fill="#facc15" /></g> },
             'royalhogs': { count: 3, renderer: () => <g transform="scale(0.7)"><ellipse cx="0" cy="0" rx="18" ry="12" fill="#fca5a5" stroke="black"/><rect x="-6" y="-12" width="12" height="12" fill="#78350f" stroke="black"/><circle cx="-8" cy="-4" r="2" fill="black"/><circle cx="8" cy="-4" r="2" fill="black"/></g> },
             'skeleton_army': { count: 5, renderer: () => renderSkeleton({}, 0, 0, 0.5) },
             'skeletondragons': { count: 2, renderer: () => renderFlyer({type: 'dragon', color: '#e2e8f0'}, 0, 0, 0.8) },
         };

         if (swarms[defId]) {
             const swarm = swarms[defId];
             return (
                 <g>
                     {Array.from({length: swarm.count}).map((_, i) => {
                         const offsetX = (i - (swarm.count-1)/2) * 22;
                         const offsetY = Math.abs(offsetX) * 0.4;
                         return (
                             <g key={i} transform={`translate(${50 + offsetX}, ${50 + offsetY})`}>
                                 {swarm.renderer()}
                             </g>
                         );
                     })}
                 </g>
             );
         }
    }

    switch (defId) {
        case 'tower_princess': return renderTower('princess');
        case 'king_tower': return renderTower('king');
        case 'tower_cannoneer': return renderTower('cannoneer');

        case 'knight': return renderHumanoid({ weapon: 'sword', hat: 'none', hasBeard: false });
        case 'archers': return renderHumanoid({ weapon: 'bow', hat: 'hood', isFemale: true });
        case 'giant': return renderHumanoid({ size: 1.5, weapon: 'none', armorColor: '#92400e' });
        case 'musketeer': return renderHumanoid({ weapon: 'gun', hat: 'helmet', isFemale: true });
        case 'valkyrie': return renderHumanoid({ weapon: 'axe', hat: 'none', isFemale: true, hairColor: '#f97316' });
        case 'wizard': return renderHumanoid({ weapon: 'none', hat: 'wizard', hasBeard: true });
        case 'witch': return renderHumanoid({ weapon: 'staff', hat: 'hood', isFemale: true, armorColor: colors.purple });
        case 'hogrider': return (
            <g transform="translate(50, 50)" filter="url(#um_dropShadow)">
                 <g transform={`translate(0, 15)`}>
                     <rect x="-12" y="5" width="6" height="10" rx="2" fill="#fca5a5" stroke="black" />
                     <rect x="6" y="5" width="6" height="10" rx="2" fill="#fca5a5" stroke="black" />
                     <rect x="-15" y="-10" width="30" height="20" rx="8" fill="#fca5a5" stroke="black" />
                     {!isBack && (
                         <g transform="translate(0, 2)">
                             <ellipse cx="0" cy="2" rx="8" ry="5" fill="#fbcfe8" stroke="black" /> 
                             <circle cx="-3" cy="2" r="1.5" fill="black" opacity="0.6" />
                             <circle cx="3" cy="2" r="1.5" fill="black" opacity="0.6" />
                             <path d="M-8 0 Q-14 -5 -12 5" fill="#fff" stroke="black" strokeWidth="0.5" />
                             <path d="M8 0 Q14 -5 12 5" fill="#fff" stroke="black" strokeWidth="0.5" />
                             <circle cx="-8" cy="-5" r="2" fill="white" stroke="black"><circle cx="0.5" cy="0" r="0.5" fill="black"/></circle>
                             <circle cx="8" cy="-5" r="2" fill="white" stroke="black"><circle cx="-0.5" cy="0" r="0.5" fill="black"/></circle>
                             <path d="M-12 -8 L-18 -15 L-10 -12" fill="#fca5a5" stroke="black" />
                             <path d="M12 -8 L18 -15 L10 -12" fill="#fca5a5" stroke="black" />
                         </g>
                     )}
                 </g>
                 {renderHumanoid({ weapon: 'hammer', hat: 'mohawk', skinColor: '#78350f', size: 0.8 }, 0, -5)}
            </g>
        );
        case 'prince': return (
            <g transform={`translate(50, 50) ${isCharging ? 'rotate(-10)' : ''}`} filter="url(#um_dropShadow)">
                 <g transform={`translate(0, 15)`}>
                     <rect x="-12" y="5" width="6" height="10" rx="2" fill="#a8a29e" stroke="black" />
                     <rect x="6" y="5" width="6" height="10" rx="2" fill="#a8a29e" stroke="black" />
                     <rect x="-15" y="-10" width="30" height="20" rx="8" fill={teamColorFill} stroke="black" /> 
                     <rect x="-12" y="-10" width="24" height="20" rx="4" fill="#a8a29e" stroke="black" /> 
                     {!isBack && (
                         <g transform="translate(0, 2)">
                             <ellipse cx="0" cy="-5" rx="8" ry="12" fill="#a8a29e" stroke="black" />
                             <circle cx="-4" cy="-8" r="1.5" fill="black" />
                             <circle cx="4" cy="-8" r="1.5" fill="black" />
                         </g>
                     )}
                 </g>
                 {renderHumanoid({ weapon: 'lance', hat: 'none', skinColor: colors.skin, size: 0.9, armorColor: colors.main }, 0, -5)}
            </g>
        );
        case 'darkprince': return (
            <g transform={`translate(50, 50) ${isCharging ? 'rotate(-10)' : ''}`} filter="url(#um_dropShadow)">
                 <g transform={`translate(0, 15)`}>
                     <rect x="-12" y="5" width="6" height="10" rx="2" fill="#57534e" stroke="black" />
                     <rect x="6" y="5" width="6" height="10" rx="2" fill="#57534e" stroke="black" />
                     <rect x="-15" y="-10" width="30" height="20" rx="8" fill="#1f2937" stroke="black" /> 
                     <rect x="-12" y="-10" width="24" height="20" rx="4" fill="#57534e" stroke="black" />
                     {!isBack && (
                         <g transform="translate(0, 2)">
                             <ellipse cx="0" cy="-5" rx="8" ry="12" fill="#57534e" stroke="black" />
                             <circle cx="-4" cy="-8" r="1.5" fill="white" /> <circle cx="-4" cy="-8" r="0.5" fill="black" />
                             <circle cx="4" cy="-8" r="1.5" fill="white" /> <circle cx="4" cy="-8" r="0.5" fill="black" />
                         </g>
                     )}
                 </g>
                 {renderHumanoid({ weapon: 'mace', hat: 'bucket', armorColor: '#1f2937', size: 0.9 }, 0, -5)}
                 {(hasShield || variant === 'card') && (
                     <g transform="translate(-10, 0)">
                         <circle cx="0" cy="0" r="12" fill="url(#um_metalGrad)" stroke="black" strokeWidth="2" />
                         <circle cx="0" cy="0" r="4" fill="#1f2937" />
                     </g>
                 )}
            </g>
        );
        case 'miner': return renderHumanoid({ weapon: 'axe', hat: 'helmet', hasBeard: true });
        case 'princess': return renderHumanoid({ weapon: 'bow', hat: 'crown', isFemale: true, armorColor: colors.gold });
        case 'royalgiant': return renderHumanoid({ size: 1.6, weapon: 'gun', hasBeard: true, hat: 'crown', armorColor: teamColorFill });
        case 'magicarcher': return renderHumanoid({ weapon: 'bow', hat: 'hood', armorColor: '#115e59' });
        case 'bandit': return renderHumanoid({ weapon: 'sword', hat: 'hood', isFemale: true, armorColor: '#166534' });
        case 'lumberjack': return (
            <g>
                {renderHumanoid({ weapon: 'axe', hat: 'ushanka', hasBeard: true, armorColor: colors.purple })}
                {/* Rage Bottle in left hand */}
                <g transform="translate(32, 55) rotate(-10)" filter="url(#um_dropShadow)">
                    <rect x="0" y="0" width="8" height="12" rx="2" fill="url(#um_magicGrad)" stroke="black" strokeWidth="1" />
                    <rect x="2" y="-3" width="4" height="3" fill="#581c87" stroke="black" strokeWidth="1" />
                    <circle cx="4" cy="6" r="2.5" fill="#f3e8ff" opacity="0.6" />
                </g>
            </g>
        );
        case 'firecracker': return renderHumanoid({ weapon: 'gun', hat: 'none', isFemale: true, armorColor: '#db2777' });
        case 'executioner': return renderHumanoid({ weapon: 'axe', hat: 'hood', size: 1.1 });
        case 'electrowizard': return renderHumanoid({ weapon: 'none', hat: 'none', hasBeard: false, hairColor: '#3b82f6', armorColor: '#1e3a8a' });
        case 'royalghost': return renderHumanoid({ weapon: 'sword', hat: 'crown', skinColor: '#bfdbfe', armorColor: '#bfdbfe', isGhost: true });
        case 'barbarians': return renderHumanoid({ weapon: 'sword', hat: 'none', hasBeard: true, hairColor: '#facc15' });
        case 'elitebarbarians': return renderHumanoid({ weapon: 'sword', hat: 'helmet', hasBeard: true });

        // --- GOBLINS ---
        case 'goblins': return renderHumanoid({ skinColor: colors.goblin, weapon: 'sword', size: 0.8 });
        case 'spear_goblins': return renderHumanoid({ skinColor: colors.goblin, weapon: 'spear', size: 0.8 });
        case 'dartgoblin': return renderHumanoid({ skinColor: colors.goblin, weapon: 'none', hat: 'hood', size: 0.8 });

        // --- UNDEAD ---
        case 'skeletons':
        case 'skeleton_army': return renderSkeleton({});
        case 'bomber': return renderSkeleton({ weapon: 'bomb', hat: 'ushanka' });
        case 'guards': return (
            <g>
                {renderSkeleton({ weapon: 'shield', hat: 'helmet' })}
            </g>
        );

        // --- HEAVY / CONSTRUCTS ---
        case 'pekka': return renderConstruct({ type: 'pekka' });
        case 'minipekka': return renderConstruct({ type: 'pekka' }, 50, 50, 0.7);
        case 'golem': return renderConstruct({ type: 'golem' });
        case 'icegolem': return renderConstruct({ type: 'golem', color: '#cffafe' });
        case 'megaknight': return renderConstruct({ type: 'mk' });

        // --- FLYING ---
        case 'minions': return renderFlyer({ type: 'minion' });
        case 'megaminion': return renderFlyer({ type: 'minion', armor: true }, 50, 50, 1.3);
        case 'bats': return renderFlyer({ type: 'bat' });
        case 'babydragon': return renderFlyer({ type: 'dragon', color: '#4ade80' });
        case 'electrodragon': return renderFlyer({ type: 'dragon', color: '#60a5fa' });
        case 'flyingmachine': return renderFlyer({ type: 'machine' });
        case 'balloon': return (
            <g transform="translate(50, 50)" filter="url(#um_dropShadow)">
                <circle cx="0" cy="-20" r="25" fill="#ef4444" stroke="black" />
                <path d="M-20 -20 Q0 -40 20 -20" stroke="#b91c1c" strokeWidth="2" fill="none" />
                <rect x="-8" y="10" width="16" height="12" fill="url(#um_woodPattern)" stroke="black" />
                <path d="M-8 10 L-10 -5 M8 10 L10 -5" stroke="black" strokeWidth="1" />
                <circle cx="-5" cy="-25" r="5" fill="white" opacity="0.3" />
                {renderSkeleton({ size: 0.5 }, 0, 15)}
            </g>
        );

        // --- BUILDINGS ---
        case 'cannon': return renderBuilding({ type: 'standard' });
        case 'tesla': return renderBuilding({ type: 'tesla' });
        case 'infernotower': return renderBuilding({ type: 'inferno' });
        case 'goblin_hut': return renderBuilding({ type: 'hut' });
        case 'tombstone': return renderBuilding({ type: 'tombstone' });
        case 'cannoncart': return (
            <g transform="translate(50, 50)">
                <rect x="-15" y="10" width="30" height="20" fill="url(#um_woodPattern)" stroke="black" />
                <circle cx="-15" cy="30" r="8" fill="#1f2937" stroke="black" />
                <circle cx="15" cy="30" r="8" fill="#1f2937" stroke="black" />
                <g transform="translate(0, -10)">
                    {renderBuilding({ type: 'standard' }, 0, 0, 0.8)}
                </g>
            </g>
        );

        // --- SPELLS ---
        case 'rage': return renderSpell({ type: 'bottle', color: '#a855f7' });
        case 'poison': return renderSpell({ type: 'bottle', color: '#ea580c' });
        case 'freeze': return renderSpell({ type: 'bottle', color: '#22d3ee' });
        case 'fireball': return renderSpell({ type: 'projectile', color: '#f97316' });
        case 'arrows': return (
            <g transform="translate(50, 50)">
                <path d="M-10 -10 L0 10 L10 -10" stroke="#b91c1c" strokeWidth="2" fill="none" />
                <path d="M-5 0 L0 15 L5 0" stroke="#b91c1c" strokeWidth="2" fill="none" />
            </g>
        );
        case 'zap': return <path d="M40 20 L60 50 L50 50 L70 80" stroke="#0ea5e9" strokeWidth="4" fill="none" transform="translate(-10, -10)" />;
        case 'log': return renderSpell({ type: 'log', color: '#78350f' });
        case 'rocket': return (
            <g transform="translate(50, 50) rotate(-45)">
                <path d="M-10 0 L10 0 L10 30 L-10 30 Z" fill="#b91c1c" stroke="black" />
                <path d="M-10 0 L0 -15 L10 0 Z" fill="#ef4444" stroke="black" />
                <circle cx="0" cy="15" r="5" fill="#facc15" />
            </g>
        );
        case 'vines': return <path d="M30 80 Q50 20 70 80" stroke="#15803d" strokeWidth="3" fill="none" />;

        // --- OTHER / UNKNOWN ---
        case 'icegolem': return renderConstruct({ type: 'golem', color: '#cffafe' }, 50, 50, 0.8);
        case 'bowler': return (
            <g>
                {renderHumanoid({ skinColor: '#6d28d9', size: 1.2 })}
                <circle cx="30" cy="65" r="12" fill="url(#um_stonePattern)" stroke="black" />
            </g>
        );
        case 'icespirit': return (
            <g transform="translate(50, 50)">
                <circle cx="0" cy="0" r="10" fill="url(#um_iceGrad)" stroke="#22d3ee" />
                <circle cx="-3" cy="-2" r="1.5" fill="black" /> <circle cx="3" cy="-2" r="1.5" fill="black" />
                <path d="M-2 2 Q0 4 2 2" stroke="black" strokeWidth="1" fill="none" />
                <path d="M-12 0 L-18 -5 L-14 -8 M12 0 L18 -5 L14 -8" stroke="#ecfeff" strokeWidth="2" />
            </g>
        );
        case 'electrospirit': return (
            <g transform="translate(50, 50)">
                <circle cx="0" cy="0" r="10" fill="#67e8f9" stroke="#0891b2" />
                <path d="M-5 -15 L0 -10 L5 -15" stroke="#facc15" strokeWidth="2" fill="none" />
                <circle cx="-3" cy="-2" r="1.5" fill="black" /> <circle cx="3" cy="-2" r="1.5" fill="black" />
            </g>
        );
        case 'battleram': return (
            <g transform="translate(50, 50)">
                <rect x="-5" y="-15" width="10" height="40" fill="url(#um_woodPattern)" stroke="black" transform="rotate(90)" />
                {renderHumanoid({ hat: 'none', weapon: 'none' }, -15, 0, 0.7)}
                {renderHumanoid({ hat: 'none', weapon: 'none' }, 15, 0, 0.7)}
            </g>
        );

        default: return renderHumanoid({}); // Fallback
    }
  };

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {defs}
      {renderUnit()}
    </svg>
  );
};
