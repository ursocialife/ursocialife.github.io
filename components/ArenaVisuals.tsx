
import React from 'react';

// Returns atmospheric effect configuration for GameCanvas
export const getArenaEffects = (id: number) => {
    return {
        snow: id === 8, // Frozen Peak
        rain: id === 9 || id === 13, // Jungle, Rascal
        embers: id === 4 || id === 16 || id === 19, // PEKKA, Kitchen, Dragon
        clouds: id === 10 || id === 14, // Hog, Serenity
        spirits: id === 5 || id === 7 || id === 17 || id === 18, // Spell, Royal Crypt, Tomb, Sanctuary
        electric: id === 11, // Electro Valley
        spooky: id === 12 || id === 2, // Spooky Town, Bone Pit (dust)
        confetti: id === 20, // Legendary
        gears: id === 6, // Workshop
    };
};

export const ArenaDecorations: React.FC<{ id: number }> = ({ id }) => {
    const commonProps = {
        className: "absolute inset-0 w-full h-full pointer-events-none opacity-60 z-[1]",
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        preserveAspectRatio: "none"
    };

    switch(id) {
        case 0: // Training Camp (Trees)
            return (
                <svg {...commonProps}>
                    <g fill="#14532d">
                        <path d="M-2 15 L5 5 L12 15 H9 L15 25 H-2 V15 Z" />
                        <path d="M-2 85 L5 75 L12 85 H9 L15 95 H-2 V85 Z" />
                        <path d="M102 15 L95 5 L88 15 H91 L85 25 H102 V15 Z" />
                        <path d="M102 85 L95 75 L88 85 H91 L85 95 H102 V85 Z" />
                    </g>
                </svg>
            );
        case 1: // Goblin Stadium (Jungle-ish/Mud)
             return (
                <svg {...commonProps}>
                    <g fill="#3f6212">
                        <circle cx="5" cy="20" r="3" />
                        <circle cx="95" cy="80" r="3" />
                        <rect x="0" y="30" width="5" height="40" rx="2" fill="#57534e" />
                        <rect x="95" y="30" width="5" height="40" rx="2" fill="#57534e" />
                    </g>
                </svg>
             );
        case 2: // Bone Pit (Bones & Skulls)
            return (
                <svg {...commonProps}>
                    <g fill="#d6d3d1">
                        {/* Bones */}
                        <path d="M8 20 Q10 18 12 20 L20 22 Q22 24 20 26 L12 24 Q10 22 8 20" opacity="0.8" />
                        <path d="M85 85 Q87 83 89 85 L97 87 Q99 89 97 91 L89 89 Q87 87 85 85" opacity="0.8" transform="rotate(45 91 88)" />
                        <path d="M10 80 Q12 78 14 80 L22 82 Q24 84 22 86 L14 84 Q12 82 10 80" opacity="0.8" transform="rotate(-45 16 83)" />
                        {/* Skulls */}
                        <g transform="translate(15, 10) scale(0.15)">
                             <path d="M10 10 Q25 0 40 10 L40 30 Q25 40 10 30 Z" fill="#e5e5e5" />
                             <circle cx="18" cy="18" r="4" fill="#44403c" />
                             <circle cx="32" cy="18" r="4" fill="#44403c" />
                        </g>
                        <g transform="translate(80, 20) scale(0.15)">
                             <path d="M10 10 Q25 0 40 10 L40 30 Q25 40 10 30 Z" fill="#e5e5e5" />
                             <circle cx="18" cy="18" r="4" fill="#44403c" />
                             <circle cx="32" cy="18" r="4" fill="#44403c" />
                        </g>
                    </g>
                </svg>
            );
        case 4: // Pekka's Playhouse (Lava/Volcano)
            return (
                <svg {...commonProps}>
                    <defs>
                        <radialGradient id="lavaCracks" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                    </defs>
                    {/* Jagged Rocks */}
                    <path d="M0 20 L8 25 L4 35 L0 30 Z" fill="#1f2937" />
                    <path d="M100 70 L92 75 L96 85 L100 80 Z" fill="#1f2937" />
                    <path d="M0 80 L10 85 L5 95 L0 90 Z" fill="#1f2937" />
                    <path d="M100 10 L90 15 L95 25 L100 20 Z" fill="#1f2937" />
                    
                    {/* Floor Cracks */}
                    <path d="M15 15 L25 17 L20 25" fill="none" stroke="url(#lavaCracks)" strokeWidth="1" opacity="0.8" />
                    <path d="M85 85 L75 83 L80 75" fill="none" stroke="url(#lavaCracks)" strokeWidth="1" opacity="0.8" />
                    <path d="M10 70 L20 72 M90 30 L80 28" fill="none" stroke="#7f1d1d" strokeWidth="1" opacity="0.6" />
                </svg>
            );
        case 9: // Jungle (Vines & Leaves)
            return (
                <svg {...commonProps}>
                    <g fill="#15803d" opacity="0.8">
                        {/* Leaves Top Left */}
                        <path d="M0 10 Q15 15 5 25 Q-5 20 0 10" />
                        <path d="M0 20 Q20 20 10 35 Q-5 30 0 20" />
                        {/* Leaves Bottom Right */}
                        <path d="M100 90 Q85 85 95 75 Q105 80 100 90" />
                        <path d="M100 80 Q80 80 90 65 Q105 70 100 80" />
                        {/* Leaves Bottom Left */}
                        <path d="M0 90 Q15 85 5 75 Q-5 80 0 90" />
                        {/* Leaves Top Right */}
                        <path d="M100 10 Q85 15 95 25 Q105 20 100 10" />
                    </g>
                    <g stroke="#166534" strokeWidth="1.5" fill="none">
                        {/* Vines */}
                        <path d="M5 0 V25 Q10 35 5 45" />
                        <path d="M95 0 V20 Q90 30 95 40" />
                    </g>
                </svg>
            );
        case 11: // Electro Valley
             return (
                 <svg {...commonProps}>
                     <g opacity="0.5">
                         <rect x="0" y="20" width="5" height="10" fill="#0891b2" />
                         <rect x="95" y="70" width="5" height="10" fill="#0891b2" />
                         <circle cx="2.5" cy="20" r="2" fill="#22d3ee" />
                         <circle cx="97.5" cy="70" r="2" fill="#22d3ee" />
                     </g>
                 </svg>
             );
        case 12: // Spooky Town
             return (
                 <svg {...commonProps}>
                     <g fill="#2e1065">
                         {/* Gravestones */}
                         <path d="M5 80 L15 80 L15 90 L5 90 Q5 85 10 80 Q15 85 15 90" transform="translate(0, -5)" />
                         <path d="M85 10 L95 10 L95 20 L85 20 Q85 15 90 10 Q95 15 95 20" transform="translate(0, 5)" />
                     </g>
                 </svg>
             );
        default:
            return null;
    }
};

export const ArenaIcon: React.FC<{ id: number; className?: string }> = ({ id, className = "w-full h-full" }) => {
    return (
        <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                 <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#15803d" /></linearGradient>
                 <linearGradient id="mudGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d97706" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
                 <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cffafe" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
                 <linearGradient id="lavaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" /></linearGradient>
                 <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fde047" /><stop offset="100%" stopColor="#854d0e" /></linearGradient>
                 <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#581c87" /></linearGradient>
            </defs>
            
            {id === 0 && ( // Training Camp
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="url(#grassGrad)" rx="15" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" />
                    <rect x="45" y="60" width="10" height="30" fill="#78350f" rx="2" />
                    <circle cx="50" cy="50" r="15" fill="#fca5a5" stroke="#ef4444" strokeWidth="5" />
                    <circle cx="50" cy="50" r="5" fill="#ef4444" />
                </g>
            )}
            {id === 1 && ( // Goblin Stadium
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#3f6212" rx="15" />
                    <path d="M10 50 L90 50" stroke="#84cc16" strokeWidth="3" />
                    <circle cx="50" cy="50" r="25" fill="#365314" stroke="#84cc16" strokeWidth="3" />
                    <path d="M50 20 L50 80" stroke="#84cc16" strokeWidth="3" />
                    <path d="M20 20 L40 40 M60 40 L80 20 M20 80 L40 60 M60 60 L80 80" stroke="#bef264" strokeWidth="2" opacity="0.6"/>
                </g>
            )}
            {id === 2 && ( // Bone Pit
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="url(#mudGrad)" rx="15" />
                    <path d="M20 65 Q40 45 60 65" fill="#fef3c7" stroke="#78350f" strokeWidth="1" /> {/* Skull top */}
                    <circle cx="30" cy="60" r="5" fill="#451a03" />
                    <circle cx="50" cy="60" r="5" fill="#451a03" />
                    <path d="M70 20 L85 35 M85 20 L70 35" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
                    <path d="M15 80 L30 85 L25 95" stroke="#fef3c7" strokeWidth="3" fill="none"/>
                </g>
            )}
            {id === 3 && ( // Barbarian Bowl
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#44403c" rx="15" />
                    <circle cx="50" cy="50" r="35" fill="#57534e" stroke="#78716c" strokeWidth="3" />
                    <path d="M50 20 L70 50 L50 80 L30 50 Z" fill="#d6d3d1" stroke="#292524" />
                    <path d="M30 30 L70 70 M70 30 L30 70" stroke="#292524" strokeWidth="4" />
                </g>
            )}
            {id === 4 && ( // PEKKA
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#450a0a" rx="15" />
                    <path d="M50 15 L85 85 L15 85 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="50" cy="60" r="10" fill="#ef4444" className="animate-pulse" />
                    <path d="M10 10 L30 10 L10 30 Z" fill="#171717" />
                    <path d="M90 90 L70 90 L90 70 Z" fill="#171717" />
                </g>
            )}
            {id === 5 && ( // Spell Valley
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#581c87" rx="15" />
                    <path d="M50 10 L70 50 L50 90 L30 50 Z" fill="#a855f7" opacity="0.5" />
                    <path d="M50 30 Q70 30 70 50 Q70 70 50 70 Q30 70 30 50 Q30 30 50 30" fill="#d8b4fe" stroke="#c084fc" strokeWidth="2" />
                    <circle cx="50" cy="45" r="5" fill="white" className="animate-pulse" />
                    <path d="M50 45 L50 20" stroke="white" strokeWidth="2" />
                </g>
            )}
            {id === 6 && ( // Workshop
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#292524" rx="15" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="#78716c" strokeWidth="6" strokeDasharray="10 6" />
                    <circle cx="50" cy="50" r="12" fill="#d6d3d1" />
                    <rect x="44" y="10" width="12" height="80" fill="#1c1917" opacity="0.6" />
                    <rect x="10" y="44" width="80" height="12" fill="#1c1917" opacity="0.6" />
                </g>
            )}
            {id === 7 && ( // Royal Arena
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#1e3a8a" rx="15" />
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#60a5fa" strokeWidth="2" />
                    <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="#2563eb" opacity="0.6" />
                    <path d="M50 20 L50 30 M75 50 L65 50 M50 80 L50 70 M25 50 L35 50" stroke="#93c5fd" strokeWidth="2" />
                    <circle cx="50" cy="50" r="8" fill="#facc15" stroke="#b45309" strokeWidth="2" />
                </g>
            )}
            {id === 8 && ( // Frozen Peak
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="url(#iceGrad)" rx="15" />
                    <path d="M20 80 L50 30 L80 80" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
                    <path d="M50 30 L60 80 L40 80 Z" fill="#bae6fd" />
                    <circle cx="20" cy="20" r="3" fill="white" /> <circle cx="80" cy="30" r="2" fill="white" /> <circle cx="50" cy="15" r="2" fill="white" />
                </g>
            )}
            {id === 9 && ( // Jungle
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#064e3b" rx="15" />
                    <path d="M50 15 L85 85 L15 85 Z" fill="#065f46" stroke="#059669" strokeWidth="2" />
                    <rect x="35" y="40" width="30" height="30" fill="#10b981" rx="2" />
                    <circle cx="42" cy="50" r="3" fill="#022c22" /> <circle cx="58" cy="50" r="3" fill="#022c22" />
                    <path d="M40 60 Q50 55 60 60" stroke="#022c22" strokeWidth="2" fill="none" />
                    <path d="M10 20 Q30 30 20 50" stroke="#34d399" strokeWidth="3" fill="none" />
                </g>
            )}
            {id === 10 && ( // Hog Mountain
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#7c2d12" rx="15" />
                    <path d="M0 60 L30 30 L60 60 L80 40 L100 60 L100 100 L0 100 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="2" />
                    <circle cx="50" cy="20" r="10" fill="white" opacity="0.8" />
                    <circle cx="70" cy="25" r="8" fill="white" opacity="0.6" />
                </g>
            )}
            {id === 11 && ( // Electro Valley
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#0e7490" rx="15" />
                    <path d="M10 50 L30 50 L40 20 L60 80 L70 50 L90 50" stroke="#22d3ee" strokeWidth="3" fill="none" />
                    <circle cx="20" cy="50" r="4" fill="#67e8f9" /> <circle cx="80" cy="50" r="4" fill="#67e8f9" />
                    <rect x="45" y="10" width="10" height="80" fill="#155e75" opacity="0.4" />
                </g>
            )}
            {id === 12 && ( // Spooky Town
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#4c1d95" rx="15" />
                    <circle cx="50" cy="50" r="30" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
                    <path d="M40 40 L35 50 L45 50 Z" fill="#431407" />
                    <path d="M60 40 L55 50 L65 50 Z" fill="#431407" />
                    <path d="M40 65 Q50 75 60 65" stroke="#431407" strokeWidth="2" fill="none" />
                    <rect x="48" y="15" width="4" height="10" fill="#166534" />
                </g>
            )}
            {id === 13 && ( // Rascal
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#854d0e" rx="15" />
                    <rect x="25" y="30" width="50" height="50" fill="#a16207" stroke="#3f1c05" strokeWidth="3" rx="4" />
                    <path d="M25 30 L50 10 L75 30 Z" fill="#166534" stroke="#064e3b" strokeWidth="2" />
                    <circle cx="50" cy="50" r="10" fill="#3f1c05" />
                    <path d="M30 30 L20 10 M70 30 L80 10" stroke="#3f1c05" strokeWidth="2" />
                </g>
            )}
            {id === 14 && ( // Serenity Peak
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#0f766e" rx="15" />
                    <path d="M10 80 Q30 60 50 80 T90 80" fill="#99f6e4" opacity="0.5" />
                    <path d="M10 60 Q40 40 70 60" fill="#5eead4" opacity="0.3" />
                    <circle cx="70" cy="30" r="12" fill="#fca5a5" stroke="#be123c" strokeWidth="1" />
                    <path d="M70 42 L70 55" stroke="#be123c" strokeWidth="1" />
                </g>
            )}
            {id === 15 && ( // Miner's Mine
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#44403c" rx="15" />
                    <path d="M10 50 Q50 80 90 50" stroke="#292524" strokeWidth="6" fill="none" strokeDasharray="5 5" />
                    <rect x="20" y="20" width="20" height="20" fill="#a8a29e" transform="rotate(20)" />
                    <rect x="60" y="60" width="20" height="20" fill="#78716c" transform="rotate(-15)" />
                    <circle cx="80" cy="20" r="8" fill="#fcd34d" filter="blur(2px)" />
                </g>
            )}
            {id === 16 && ( // Kitchen
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#9a3412" rx="15" />
                    <rect x="10" y="10" width="80" height="80" fill="none" stroke="#fed7aa" strokeWidth="2" />
                    <path d="M10 50 L90 50 M50 10 L50 90" stroke="#fed7aa" strokeWidth="2" />
                    <circle cx="50" cy="50" r="25" fill="#c2410c" />
                    <path d="M40 40 L60 60 M60 40 L40 60" stroke="#7c2d12" strokeWidth="4" />
                </g>
            )}
            {id === 17 && ( // Royal Crypt (High)
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#831843" rx="15" />
                    <rect x="30" y="20" width="40" height="60" fill="#500724" stroke="#fbcfe8" strokeWidth="2" />
                    <path d="M30 20 L50 10 L70 20" fill="#fbcfe8" />
                    <path d="M40 40 L60 40 M50 30 L50 60" stroke="#fbcfe8" strokeWidth="3" />
                </g>
            )}
            {id === 18 && ( // Silent Sanctuary
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#4c1d95" rx="15" />
                    <path d="M50 15 L80 85 L20 85 Z" fill="#6d28d9" stroke="#c4b5fd" strokeWidth="2" />
                    <circle cx="50" cy="60" r="10" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                    <path d="M50 25 L50 45" stroke="white" strokeWidth="2" />
                    <circle cx="20" cy="20" r="2" fill="white" /> <circle cx="80" cy="20" r="2" fill="white" />
                </g>
            )}
            {id === 19 && ( // Dragon Spa
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="#b91c1c" rx="15" />
                    <path d="M0 50 Q25 25 50 50 T100 50" stroke="#fca5a5" strokeWidth="4" fill="none" opacity="0.6" />
                    <path d="M0 70 Q25 45 50 70 T100 70" stroke="#fca5a5" strokeWidth="4" fill="none" opacity="0.4" />
                    <circle cx="80" cy="20" r="10" fill="#fca5a5" filter="blur(4px)" />
                    <path d="M50 20 Q70 10 70 40" stroke="#7f1d1d" strokeWidth="4" fill="none" />
                </g>
            )}
            {id === 20 && ( // Legendary
                <g>
                    <rect x="0" y="0" width="100" height="100" fill="url(#purpleGrad)" rx="15" />
                    <path d="M25 30 L75 30 L65 80 L35 80 Z" fill="#facc15" stroke="#b45309" strokeWidth="2" />
                    <path d="M25 30 Q10 30 15 50 L28 45" fill="none" stroke="#facc15" strokeWidth="3" />
                    <path d="M75 30 Q90 30 85 50 L72 45" fill="none" stroke="#facc15" strokeWidth="3" />
                    <circle cx="50" cy="20" r="10" fill="#facc15" />
                    <path d="M40 50 L50 60 L60 50" stroke="#b45309" strokeWidth="2" fill="none" />
                </g>
            )}
            
            {/* Gloss Overlay */}
            <path d="M0 0 Q50 15 100 0 L100 40 Q50 25 0 40 Z" fill="white" opacity="0.1" />
        </svg>
    );
};

export const getArenaBackgroundStyle = (id: number) => {
    // Advanced Patterns
    const grassPattern = `
        radial-gradient(circle at 10% 10%, rgba(255,255,255,0.03) 1px, transparent 1px),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 2px, transparent 2px),
        repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 12px)
    `;
    const stonePattern = `
        repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 30px),
        repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 30px)
    `;
    const tilePattern = `
        repeating-conic-gradient(rgba(255,255,255,0.03) 0deg 90deg, transparent 90deg 180deg)
    `;

    switch(id) {
        case 0: // Training Camp
            return {
                backgroundImage: `
                    ${grassPattern},
                    linear-gradient(to bottom, #15803d, #14532d)
                `,
                backgroundSize: '20px 20px, 100% 100%',
                backgroundColor: '#15803d'
            };
        case 1: // Goblin Stadium
            return {
                backgroundImage: `
                    ${grassPattern},
                    radial-gradient(circle at 50% 50%, #3f6212 0%, #1a2e05 100%)
                `,
                backgroundSize: '30px 30px, 100% 100%',
                backgroundColor: '#1a2e05'
            };
        case 2: // Bone Pit
            return {
                backgroundImage: `
                    repeating-radial-gradient(circle at 50% 50%, #78350f 0, #78350f 10px, #854d0e 10px, #854d0e 20px),
                    radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)
                `,
                backgroundColor: '#78350f'
            };
        case 3: // Barbarian Bowl
            return {
                backgroundImage: `
                    repeating-linear-gradient(45deg, #44403c 0, #44403c 20px, #292524 20px, #292524 40px),
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)
                `,
                backgroundColor: '#292524'
            };
        case 4: // PEKKA
            return {
                backgroundImage: `
                    repeating-linear-gradient(90deg, transparent 0, transparent 49px, #000 49px, #000 50px),
                    linear-gradient(to bottom, #450a0a, #7f1d1d, #450a0a)
                `,
                backgroundSize: '50px 50px, 100% 100%',
                backgroundColor: '#450a0a'
            };
        case 5: // Spell Valley
            return {
                backgroundImage: `
                    repeating-conic-gradient(#581c87 0deg 10deg, #4c1d95 10deg 20deg),
                    radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.1) 0%, transparent 70%)
                `,
                backgroundColor: '#4c1d95'
            };
        case 6: // Workshop
            return {
                backgroundImage: `
                   ${stonePattern},
                   linear-gradient(to bottom, #292524, #1c1917)
                `,
                backgroundSize: '40px 40px, 100% 100%',
                backgroundColor: '#1c1917'
            };
        case 7: // Royal Arena
            return {
                backgroundImage: `
                    ${tilePattern},
                    linear-gradient(to bottom, #1e3a8a, #172554)
                `,
                backgroundSize: '40px 40px, 100% 100%',
                backgroundColor: '#172554'
            };
        case 8: // Frozen Peak
            return {
                backgroundImage: `
                    linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%) -50px 0,
                    linear-gradient(225deg, rgba(255,255,255,0.1) 25%, transparent 25%) -50px 0,
                    linear-gradient(315deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(to bottom, #0ea5e9, #0284c7)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#0284c7'
            };
        case 9: // Jungle
            return {
                backgroundImage: `
                    radial-gradient(circle, transparent 20%, #064e3b 20%, #064e3b 80%, transparent 80%, transparent),
                    radial-gradient(circle, transparent 20%, #064e3b 20%, #064e3b 80%, transparent 80%, transparent) 25px 25px,
                    linear-gradient(to bottom, #065f46, #064e3b)
                `,
                backgroundSize: '50px 50px, 50px 50px, 100% 100%',
                backgroundColor: '#064e3b'
            };
        case 10: // Hog Mountain
            return {
                backgroundImage: `
                    repeating-radial-gradient(circle at 50% 0%, #ea580c 0, #ea580c 20px, #c2410c 20px, #c2410c 40px)
                `,
                backgroundColor: '#c2410c'
            };
        case 11: // Electro Valley
            return {
                backgroundImage: `
                    linear-gradient(90deg, transparent 49%, #06b6d4 49%, #06b6d4 51%, transparent 51%),
                    linear-gradient(0deg, transparent 49%, #06b6d4 49%, #06b6d4 51%, transparent 51%),
                    linear-gradient(to bottom, #083344, #164e63)
                `,
                backgroundSize: '50px 50px, 50px 50px, 100% 100%',
                backgroundColor: '#083344'
            };
        case 12: // Spooky Town
            return {
                backgroundImage: `
                    radial-gradient(circle at 20% 20%, #581c87 0%, transparent 20%),
                    radial-gradient(circle at 80% 80%, #581c87 0%, transparent 20%),
                    repeating-linear-gradient(to bottom, #4c1d95, #2e1065 50px)
                `,
                backgroundColor: '#2e1065'
            };
        case 13: // Rascal's Hideout
            return {
                backgroundImage: `
                    repeating-linear-gradient(45deg, #a16207, #a16207 10px, #854d0e 10px, #854d0e 20px),
                    radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%)
                `,
                backgroundColor: '#854d0e'
            };
        case 14: // Serenity Peak
            return {
                backgroundImage: `
                    radial-gradient(circle at 50% 100%, #ccfbf1 0%, transparent 60%),
                    linear-gradient(to top, #0f766e, #115e59)
                `,
                backgroundColor: '#115e59'
            };
        case 15: // Miner's Mine
            return {
                backgroundImage: `
                    repeating-linear-gradient(90deg, #292524 0, #292524 40px, #1c1917 40px, #1c1917 80px),
                    linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))
                `,
                backgroundColor: '#1c1917'
            };
        case 16: // Kitchen
            return {
                backgroundImage: `
                    repeating-conic-gradient(#c2410c 0deg 45deg, #9a3412 45deg 90deg),
                    radial-gradient(circle, transparent 30%, rgba(0,0,0,0.3) 100%)
                `,
                backgroundSize: '60px 60px, 100% 100%',
                backgroundColor: '#9a3412'
            };
        case 17: // Royal Crypt
            return {
                backgroundImage: `
                    repeating-linear-gradient(to bottom, #831843, #500724 20px),
                    radial-gradient(circle at 50% 50%, #db2777 0%, transparent 60%)
                `,
                backgroundColor: '#500724'
            };
        case 18: // Silent Sanctuary
            return {
                backgroundImage: `
                    repeating-radial-gradient(circle at 50% 0%, #6d28d9 0, #6d28d9 30px, #5b21b6 30px, #5b21b6 60px)
                `,
                backgroundColor: '#4c1d95'
            };
        case 19: // Dragon Spa
            return {
                backgroundImage: `
                    radial-gradient(circle at 50% 100%, #fca5a5 0%, transparent 50%),
                    repeating-linear-gradient(0deg, #b91c1c 0, #b91c1c 2px, transparent 2px, transparent 10px),
                    linear-gradient(to bottom, #7f1d1d, #450a0a)
                `,
                backgroundColor: '#450a0a'
            };
        case 20: // Legendary
            return {
                backgroundImage: `
                    conic-gradient(from 0deg at 50% 50%, #4c1d95 0deg, #6d28d9 60deg, #4c1d95 120deg, #6d28d9 180deg, #4c1d95 240deg, #6d28d9 300deg, #4c1d95 360deg),
                    radial-gradient(circle at 50% 50%, transparent 20%, #000 100%)
                `,
                backgroundColor: '#2e1065'
            };
        default:
            return { 
                backgroundImage: `
                    ${grassPattern},
                    linear-gradient(to bottom, #15803d, #14532d)
                `,
                backgroundSize: '20px 20px, 100% 100%',
                backgroundColor: '#111827' 
            };
    }
};
