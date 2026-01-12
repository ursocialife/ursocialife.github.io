
import React, { useEffect, useRef } from 'react';
import { BATTLE_PASS_TIERS, PASS_ROYALE_COST } from '../constants';
import { BattlePassTier, RewardType, TrophyReward } from '../types';
import { GoldIcon, GemIcon } from './ResourceIcons';
import { ChestModel } from './ChestModel';
import { playClickSound, playButtonSound } from '../services/audio';

interface BattlePassScreenProps {
    currentCrowns: number;
    claimedRewards: string[]; // List of IDs (bp_free_1, bp_prem_1, etc.)
    isPremiumUnlocked: boolean;
    onClaimReward: (reward: TrophyReward) => void;
    onUnlockPremium: () => void;
    canAffordPremium: boolean;
    onClose: () => void;
}

const RewardItem: React.FC<{ reward: TrophyReward, canClaim: boolean, isClaimed: boolean, onClaim: () => void, isPremium: boolean, isLocked: boolean }> = ({ reward, canClaim, isClaimed, onClaim, isPremium, isLocked }) => {
    
    const renderIcon = () => {
        if (reward.type === RewardType.GOLD) return <div className="w-8 h-8"><GoldIcon /></div>;
        if (reward.type === RewardType.GEMS) return <div className="w-8 h-8"><GemIcon /></div>;
        if (reward.type === RewardType.CHEST) return <div className="w-12 h-12"><ChestModel type={reward.chestType || 'SILVER'} level={reward.chestLevel} /></div>;
        if (reward.type === RewardType.EMOTE) return <div className="text-4xl animate-bounce">{reward.emote}</div>;
        return <div className="text-2xl">🎁</div>;
    };

    const getBgColor = () => {
        if (isClaimed) return 'bg-gray-300 dark:bg-gray-700 opacity-50 grayscale';
        if (isLocked) return 'bg-gray-200 dark:bg-gray-800 opacity-70';
        if (isPremium) return 'bg-yellow-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600';
        return 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600';
    };

    return (
        <div className={`relative flex flex-col items-center justify-center p-2 rounded-lg border-2 w-20 h-24 shrink-0 transition-all ${getBgColor()} ${canClaim ? 'animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-105' : ''}`}>
            {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 rounded-lg"><span className="text-xl">🔒</span></div>}
            
            <div className="flex-1 flex items-center justify-center scale-90">
                {renderIcon()}
            </div>
            
            {reward.amount && <div className="text-sm font-black text-white stroke-black drop-shadow-md bg-black/40 rounded px-1 -mt-1 z-10">{reward.amount}</div>}
            
            {canClaim && !isClaimed && (
                <button 
                    onClick={(e) => { e.stopPropagation(); playButtonSound(); onClaim(); }}
                    className="absolute -bottom-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce z-20"
                >
                    CLAIM
                </button>
            )}
            {isClaimed && (
                <div className="absolute -bottom-2 bg-gray-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow z-20">
                    DONE
                </div>
            )}
        </div>
    );
};

export const BattlePassScreen: React.FC<BattlePassScreenProps> = ({
    currentCrowns,
    claimedRewards,
    isPremiumUnlocked,
    onClaimReward,
    onUnlockPremium,
    canAffordPremium,
    onClose
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to current progress
    useEffect(() => {
        if (scrollRef.current) {
            // Estimate position: Each tier is about 120px tall (item height + margin)
            // We want to scroll to current tier
            const currentTierIndex = BATTLE_PASS_TIERS.findIndex(t => t.crownsRequired > currentCrowns);
            const targetIndex = currentTierIndex === -1 ? BATTLE_PASS_TIERS.length - 1 : Math.max(0, currentTierIndex - 1);
            const scrollPos = targetIndex * 104; // 96px height + 8px gap approx
            scrollRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 shadow-lg border-b-4 border-yellow-900 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent 0, transparent 20px, rgba(255,255,255,0.2) 20px, rgba(255,255,255,0.2) 40px)` }}></div>
                
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                        <div className="text-white/80 text-xs font-bold uppercase tracking-widest">Season 1</div>
                        <h1 className="text-3xl font-black text-white drop-shadow-md italic uppercase">Pass Royale</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/20">
                        <span className="text-2xl">👑</span>
                        <span className="text-xl font-bold text-white">{currentCrowns}</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-black/20 rounded-full text-white font-bold hover:bg-black/40 transition-colors">✕</button>
                </div>

                {!isPremiumUnlocked && (
                    <div className="mt-4 flex justify-center relative z-10">
                        <button 
                            onClick={() => { if(canAffordPremium) onUnlockPremium(); else playClickSound(); }}
                            className={`w-full max-w-sm py-3 rounded-xl font-black text-lg shadow-lg border-b-4 flex items-center justify-center gap-2 transition-all active:scale-95
                                ${canAffordPremium ? 'bg-green-500 hover:bg-green-400 border-green-700 text-white' : 'bg-gray-500 border-gray-700 text-gray-300 cursor-not-allowed'}
                            `}
                        >
                            <span>Unlock Pass Royale</span>
                            <div className="bg-black/20 px-2 py-0.5 rounded flex items-center gap-1 text-sm">
                                <span>{PASS_ROYALE_COST}</span>
                                <div className="w-4 h-4"><GemIcon /></div>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Track Header Labels */}
            <div className="flex text-xs font-bold uppercase text-gray-400 bg-gray-800 p-2 border-b border-gray-700 shadow-md z-10">
                <div className="flex-1 text-right pr-8">Free</div>
                <div className="w-16 text-center text-yellow-500">Crowns</div>
                <div className="flex-1 pl-8 text-yellow-500">Premium</div>
            </div>

            {/* Scrollable Track */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-800 p-4 no-scrollbar relative">
                
                {/* Central Road Background Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-black/30 -translate-x-1/2 rounded-full border border-white/5"></div>
                {/* Central Road Fill (Approximate based on crown count) */}
                <div 
                    className="absolute left-1/2 top-0 w-4 bg-gradient-to-b from-yellow-400 to-orange-500 -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
                    style={{ 
                        height: `${Math.min(100, (currentCrowns / BATTLE_PASS_TIERS[BATTLE_PASS_TIERS.length-1].crownsRequired) * 100)}%` 
                    }}
                ></div>

                <div className="flex flex-col gap-6 pb-20 relative z-10">
                    {BATTLE_PASS_TIERS.map((tier, idx) => {
                        const isUnlocked = currentCrowns >= tier.crownsRequired;
                        const prevTierCrowns = idx > 0 ? BATTLE_PASS_TIERS[idx-1].crownsRequired : 0;
                        const isCurrentRange = currentCrowns >= prevTierCrowns && currentCrowns < tier.crownsRequired;
                        
                        return (
                            <div key={tier.tier} className="flex gap-4 items-center relative h-20">
                                
                                {/* Free Track (Left) */}
                                <div className="flex-1 flex justify-end items-center pr-4 border-r border-white/5 gap-3">
                                    {/* Tier Number Indicator on Side of Free Rewards */}
                                    <div className="text-xs font-bold text-gray-500 bg-gray-900/50 px-1.5 py-0.5 rounded border border-white/10">
                                        {tier.tier}
                                    </div>

                                    {tier.freeReward && (
                                        <RewardItem 
                                            reward={tier.freeReward} 
                                            canClaim={isUnlocked && !claimedRewards.includes(tier.freeReward.id)}
                                            isClaimed={claimedRewards.includes(tier.freeReward.id)}
                                            onClaim={() => onClaimReward(tier.freeReward!)}
                                            isPremium={false}
                                            isLocked={!isUnlocked}
                                        />
                                    )}
                                </div>

                                {/* Center Crown Counter Node */}
                                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-16">
                                    <div className={`w-12 h-8 rounded bg-gray-900 border-2 flex items-center justify-center gap-1 z-20 shadow-lg ${isUnlocked ? 'border-yellow-500 text-yellow-500' : 'border-gray-600 text-gray-500'}`}>
                                        <span className="text-[10px]">👑</span>
                                        <span className="text-xs font-black">{tier.crownsRequired}</span>
                                    </div>
                                </div>

                                {/* Premium Track (Right) */}
                                <div className="flex-1 flex justify-start items-center pl-4 border-l border-white/5">
                                    <div className={`relative p-1 rounded-xl transition-all duration-300 ${!isPremiumUnlocked ? 'filter grayscale opacity-60' : ''}`}>
                                        {!isPremiumUnlocked && (
                                            <div className="absolute -top-2 -right-2 text-xl z-20 drop-shadow-md">🔒</div>
                                        )}
                                        {tier.premiumReward && (
                                            <RewardItem 
                                                reward={tier.premiumReward} 
                                                canClaim={isUnlocked && isPremiumUnlocked && !claimedRewards.includes(tier.premiumReward.id)}
                                                isClaimed={claimedRewards.includes(tier.premiumReward.id)}
                                                onClaim={() => onClaimReward(tier.premiumReward!)}
                                                isPremium={true}
                                                isLocked={!isUnlocked || !isPremiumUnlocked}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
