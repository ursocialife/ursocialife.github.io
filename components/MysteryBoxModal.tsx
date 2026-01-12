
import React, { useState, useEffect } from 'react';
import { ChestModel } from './ChestModel';
import { MYSTERY_BOX_ODDS, CARDS, RARITY_INFO, SHOP_EMOTES } from '../constants';
import { CardDef, PlayerSide } from '../types';
import { GoldIcon, GemIcon } from './ResourceIcons';
import { UnitModel } from './UnitModels';
import { playOscillator, initAudio } from '../services/audio';

interface MysteryBoxModalProps {
    startLevel: number;
    currentTrophies: number;
    unlockedEmotes: string[];
    onComplete: (reward: { type: 'GOLD' | 'GEMS' | 'CARD' | 'EMOTE', amount: number, card?: CardDef, emote?: string }) => void;
}

const playSound = (type: 'upgrade' | 'open' | 'fail', level: number = 1) => {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;

    if (type === 'upgrade') {
        // Pitch increases with level (Level 2 to 5)
        // Base 440Hz * multiplier
        const multiplier = 1 + ((level - 1) * 0.25); 
        const startFreq = 440 * multiplier;
        const endFreq = 880 * multiplier;

        playOscillator(ctx, 'sine', startFreq, endFreq, t, 0.3, 0.1);
    } else if (type === 'fail') {
        playOscillator(ctx, 'sawtooth', 200, 100, t, 0.2, 0.1);
    } else {
        // Open
        playOscillator(ctx, 'triangle', 400, 50, t, 0.5, 0.2);
    }
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({ startLevel, currentTrophies, unlockedEmotes, onComplete }) => {
    const [level, setLevel] = useState(startLevel);
    const [isOpened, setIsOpened] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [reward, setReward] = useState<{ type: 'GOLD' | 'GEMS' | 'CARD' | 'EMOTE', amount: number, card?: CardDef, emote?: string } | null>(null);

    const getRandomCard = (rarity: string) => {
        const pool = CARDS.filter(c => c.rarity === rarity && c.unlockTrophies <= currentTrophies);
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const getRandomEmote = () => {
        const available = SHOP_EMOTES.filter(e => !unlockedEmotes.includes(e));
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    };

    // Generate final reward based on level
    const generateReward = (lvl: number) => {
        // Chance for Emote (Level 3+)
        if (lvl >= 3) {
            const emoteChance = lvl === 3 ? 0.1 : (lvl === 4 ? 0.15 : 0.2); // 10%, 15%, 20%
            if (Math.random() < emoteChance) {
                const emote = getRandomEmote();
                if (emote) return { type: 'EMOTE', amount: 1, emote };
            }
        }

        // Lvl 1: Gold (Range 100-500)
        if (lvl === 1) return { type: 'GOLD', amount: randomInt(100, 500) };
        
        // Lvl 2: Gold (High 500-1000) or Common Cards
        if (lvl === 2) {
            const commonCard = getRandomCard('COMMON');
            if (Math.random() > 0.5 && commonCard) {
                return { type: 'CARD', amount: 20, card: commonCard };
            }
            return { type: 'GOLD', amount: randomInt(500, 1000) };
        }
        
        // Lvl 3: Gems or Rare Cards
        if (lvl === 3) {
            const rareCard = getRandomCard('RARE');
            if (Math.random() > 0.5 && rareCard) {
                return { type: 'CARD', amount: 10, card: rareCard };
            }
            return { type: 'GEMS', amount: 20 };
        }
        
        // Lvl 4: Gems (High) or Epic Cards
        if (lvl === 4) {
            const epicCard = getRandomCard('EPIC');
            if (Math.random() > 0.5 && epicCard) {
                return { type: 'CARD', amount: 5, card: epicCard };
            }
            return { type: 'GEMS', amount: 50 };
        }
        
        // Lvl 5: Huge Gold (Range 2500-7500) or Legendary
        if (lvl === 5) {
            const legCard = getRandomCard('LEGENDARY');
            if (Math.random() > 0.3 && legCard) {
                return { type: 'CARD', amount: 1, card: legCard };
            }
            return { type: 'GOLD', amount: randomInt(2500, 7500) };
        }
        
        return { type: 'GOLD', amount: 100 };
    };

    const handleTap = () => {
        if (isOpened || isAnimating) return;

        setIsAnimating(true);
        
        // Max level is 5
        if (level >= 5) {
            // Force open
            handleOpen();
            return;
        }

        const odds = (MYSTERY_BOX_ODDS as any)[level] || 0;
        const roll = Math.random();

        // Animation Delay
        setTimeout(() => {
            if (roll < odds) {
                // Upgrade!
                const newLevel = level + 1;
                setLevel(newLevel);
                playSound('upgrade', newLevel);
                setIsAnimating(false);
            } else {
                // Fail Upgrade -> Open at current level
                playSound('fail');
                handleOpen();
            }
        }, 600);
    };

    const handleOpen = () => {
        const finalReward = generateReward(level) as any;
        setReward(finalReward);
        setIsOpened(true);
        setIsAnimating(false);
        playSound('open');
    };

    const handleClaim = () => {
        if (reward) {
            onComplete(reward);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center w-full max-w-sm">
                
                {/* Header */}
                <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg mb-8 text-center">
                    {isOpened ? "Reward Unlocked!" : "Mystery Box"}
                </h2>

                {/* Box Display */}
                <div className="relative mb-12">
                    {/* Background Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-white/20 to-transparent transition-all duration-500 ${isAnimating ? 'scale-125 opacity-50' : 'scale-100 opacity-20'}`}></div>
                    
                    {/* Chest Model */}
                    <div 
                        onClick={handleTap}
                        className={`
                            w-48 h-48 transition-all duration-300
                            ${isAnimating ? 'animate-bounce scale-110' : 'scale-100'}
                            ${isOpened ? 'opacity-0 scale-0' : 'cursor-pointer active:scale-95'}
                        `}
                    >
                        <ChestModel type="MYSTERY" level={level} />
                    </div>

                    {/* Opened Reward View */}
                    {isOpened && reward && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in duration-500">
                            <div className="w-40 h-40 mb-4 drop-shadow-2xl flex items-center justify-center">
                                {reward.type === 'GOLD' && <div className="w-full h-full"><GoldIcon /></div>}
                                {reward.type === 'GEMS' && <div className="w-full h-full"><GemIcon /></div>}
                                {reward.type === 'EMOTE' && <div className="text-8xl animate-bounce filter drop-shadow-xl">{reward.emote}</div>}
                                {reward.type === 'CARD' && reward.card && (
                                    <div className={`relative w-full h-full rounded border-4 overflow-hidden flex items-center justify-center bg-gray-800 ${RARITY_INFO[reward.card.rarity].color}`}>
                                        <div className="relative z-10 w-[80%] h-[80%] flex items-center justify-center">
                                            <UnitModel defId={reward.card.id} side={PlayerSide.PLAYER} variant="card" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-4xl font-black text-white stroke-black drop-shadow-md">
                                {reward.type === 'CARD' ? `x${reward.amount}` : (reward.type === 'EMOTE' ? 'New Emote' : reward.amount.toLocaleString())}
                            </div>
                            <div className="text-xl font-bold text-gray-300 uppercase">
                                {reward.type === 'CARD' ? reward.card?.name : reward.type}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions / Status */}
                {!isOpened && (
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-white mb-2">Level {level}</div>
                        <div className="text-sm text-gray-400">Tap to Upgrade</div>
                        <div className="flex gap-1 justify-center mt-2">
                            {[1, 2, 3, 4, 5].map(l => (
                                <div key={l} className={`w-3 h-3 rounded-full ${l <= level ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Claim Button */}
                {isOpened && (
                    <button 
                        onClick={handleClaim}
                        className="bg-green-500 hover:bg-green-400 text-white font-black py-3 px-12 rounded-full text-xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all"
                    >
                        Claim
                    </button>
                )}
            </div>
        </div>
    );
};
