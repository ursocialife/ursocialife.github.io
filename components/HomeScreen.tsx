
import React, { useState, useEffect, useRef } from 'react';
import { CARDS, ARENAS, TROPHY_ROAD, RARITY_INFO, KING_LEVEL_XP, KING_JOURNEY_REWARDS, MAX_KING_LEVEL, PRINCESS_TOWER_HP, KING_TOWER_HP, calculateStats, TOWERS, BATTLE_PASS_TIERS, TOWER_STATS } from '../constants';
import { TrophyReward, RewardType, PlayerSide, KingReward, PlayerCollection } from '../types';
import { SettingsModal } from './SettingsModal';
import { UnitModel } from './UnitModels';
import { ChestModel } from './ChestModel';
import { GoldIcon, GemIcon, KingXPIcon } from './ResourceIcons';
import { ArenaIcon, getArenaBackgroundStyle } from './ArenaVisuals';
import { playClickSound, playButtonSound } from '../services/audio';
import { CardDetailsModal } from './CardDetailsModal';
import { BattlePassScreen } from './BattlePassScreen';

export type DebugActionType = 'GOLD' | 'GEMS' | 'XP' | 'TROPHIES' | 'CROWNS';

interface HomeScreenProps {
  trophies: number;
  username: string;
  gold: number;
  gems: number;
  kingLevel: number;
  kingXP: number;
  onUpdateUsername: (name: string) => void;
  onStartBattle: () => void;
  onNavigate: (view: 'HOME' | 'COLLECTION' | 'SHOP') => void;
  currentView: 'HOME' | 'COLLECTION' | 'SHOP';
  onDebugAction: (type: DebugActionType, amount: number) => void;
  claimedRewards: string[];
  onClaimReward: (reward: TrophyReward | KingReward, isKingReward?: boolean) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  muteEmotes: boolean;
  onToggleMuteEmotes: () => void;
  claimedKingRewards: number[]; // Level numbers
  collection: PlayerCollection;
  onTrophyRoadToggle: (isOpen: boolean) => void;
  autoOpenRewards: boolean;
  onToggleAutoOpenRewards: () => void;
  // Battle Pass Props
  battlePassCrowns: number;
  isPassRoyaleUnlocked: boolean;
  onUnlockPassRoyale: () => void;
  claimedPassRewards: string[];
  onClaimPassReward: (reward: TrophyReward) => void;
  // Audio
  musicEnabled: boolean;
  onToggleMusic: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  trophies, 
  username, 
  gold, 
  gems, 
  kingLevel, 
  kingXP, 
  onUpdateUsername, 
  onStartBattle, 
  onNavigate, 
  currentView, 
  onDebugAction, 
  claimedRewards,
  onClaimReward,
  theme,
  onToggleTheme,
  muteEmotes,
  onToggleMuteEmotes,
  claimedKingRewards,
  collection,
  onTrophyRoadToggle,
  autoOpenRewards,
  onToggleAutoOpenRewards,
  battlePassCrowns,
  isPassRoyaleUnlocked,
  onUnlockPassRoyale,
  claimedPassRewards,
  onClaimPassReward,
  musicEnabled,
  onToggleMusic,
  sfxEnabled,
  onToggleSfx
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArenasModalOpen, setIsArenasModalOpen] = useState(false);
  const [isKingJourneyOpen, setIsKingJourneyOpen] = useState(false);
  const [isBattlePassOpen, setIsBattlePassOpen] = useState(false);
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  
  // Track if we have already auto-opened for the current progress state
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const currentArena = ARENAS.slice().reverse().find(a => trophies >= a.minTrophies) || ARENAS[0];

  // Check for claimable rewards
  const hasClaimableTrophyRewards = TROPHY_ROAD.some(r => trophies >= r.trophies && !claimedRewards.includes(r.id));
  const hasClaimableKingRewards = KING_JOURNEY_REWARDS.some(r => kingLevel >= r.level && !claimedKingRewards.includes(r.level));
  
  // Check for Battle Pass Rewards
  const hasClaimablePassRewards = BATTLE_PASS_TIERS.some(tier => {
      const crownsMet = battlePassCrowns >= tier.crownsRequired;
      if (!crownsMet) return false;
      const freeUnclaimed = tier.freeReward && !claimedPassRewards.includes(tier.freeReward.id);
      const premiumUnclaimed = isPassRoyaleUnlocked && tier.premiumReward && !claimedPassRewards.includes(tier.premiumReward.id);
      return freeUnclaimed || premiumUnclaimed;
  });

  // XP Progress
  const requiredXPIndex = Math.max(0, kingLevel - 1);
  const nextLevelXP = KING_LEVEL_XP[requiredXPIndex] || KING_LEVEL_XP[MAX_KING_LEVEL - 1]; // Fallback for max
  const xpProgress = kingLevel >= MAX_KING_LEVEL ? 100 : Math.min(100, (kingXP / nextLevelXP) * 100);

  // Sync state with parent to hide bottom nav
  useEffect(() => {
    onTrophyRoadToggle(isArenasModalOpen || isKingJourneyOpen || isBattlePassOpen);
  }, [isArenasModalOpen, isKingJourneyOpen, isBattlePassOpen, onTrophyRoadToggle]);

  // Reset auto-open lock when progress changes
  useEffect(() => {
      setHasAutoOpened(false);
  }, [trophies, battlePassCrowns, kingLevel]);

  // Handle Auto Open Menu Logic
  useEffect(() => {
      if (autoOpenRewards && !hasAutoOpened) {
          if (hasClaimablePassRewards) {
              setIsBattlePassOpen(true);
              setHasAutoOpened(true);
          } else if (hasClaimableTrophyRewards) {
              setIsArenasModalOpen(true);
              setHasAutoOpened(true);
          } else if (hasClaimableKingRewards) {
              setIsKingJourneyOpen(true);
              setHasAutoOpened(true);
          }
      }
  }, [autoOpenRewards, hasAutoOpened, hasClaimablePassRewards, hasClaimableTrophyRewards, hasClaimableKingRewards]);

  // Autoscroll to current trophy level when modal opens
  useEffect(() => {
    if (isArenasModalOpen) {
        const timer = setTimeout(() => {
            const sortedRewards = [...TROPHY_ROAD].sort((a, b) => Math.abs(a.trophies - trophies) - Math.abs(b.trophies - trophies));
            const targetReward = sortedRewards[0];
            if (targetReward) {
                const element = document.getElementById(`reward-${targetReward.id}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                else {
                    const element = document.getElementById(`arena-card-${currentArena.id}`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isArenasModalOpen, currentArena.id, trophies]);

  const renderRewardIcon = (reward: TrophyReward | KingReward) => {
    switch (reward.type) {
        case RewardType.GOLD: 
            return <div className="w-8 h-8 drop-shadow-md"><GoldIcon /></div>;
        case RewardType.GEMS: 
            return <div className="w-8 h-8 drop-shadow-md"><GemIcon /></div>;
        case RewardType.CHEST: 
            if (reward.chestType) {
                return (
                    <div className="w-10 h-10 filter drop-shadow-md relative flex justify-center">
                        <ChestModel type={reward.chestType} level={reward.chestLevel || 1} />
                        {reward.chestType === 'MYSTERY' && reward.chestLevel && (
                            <span className="absolute -bottom-1 right-0 text-[8px] font-black bg-black/60 text-white px-1 rounded">Lvl {reward.chestLevel}</span>
                        )}
                    </div>
                );
            }
            return '📦';
        default: return '🎁';
    }
  };

  const getRewardColor = (reward: TrophyReward | KingReward) => {
      switch (reward.type) {
        case RewardType.GOLD: return 'bg-yellow-100 border-yellow-400 dark:bg-yellow-600';
        case RewardType.GEMS: return 'bg-green-100 border-green-400 dark:bg-green-600';
        case RewardType.CHEST: return 'bg-blue-100 border-blue-400 dark:bg-blue-600';
        default: return 'bg-gray-200 border-gray-400 dark:bg-gray-600';
      }
  };

  const viewingCardDef = viewingCardId ? [...CARDS, ...TOWERS].find(c => c.id === viewingCardId) : null;

  // Battle Pass Progress Bar (Global)
  const maxCrowns = BATTLE_PASS_TIERS[BATTLE_PASS_TIERS.length - 1].crownsRequired;
  const globalPassProgress = Math.min(100, Math.max(0, (battlePassCrowns / maxCrowns) * 100));

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden transition-all duration-500">
      {/* Dynamic Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none transition-all duration-500"
        style={getArenaBackgroundStyle(currentArena.id)}
      ></div>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 shadow-lg z-10 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 transition-colors gap-2">
        {/* Left Side: Settings, User Profile, King Journey */}
        <div className="flex items-center gap-3">
            <button 
                onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 shadow transition-colors"
            >
                <span className="text-xl">⚙️</span>
            </button>
            <div className="flex flex-col justify-center">
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-300 max-w-[100px] truncate leading-tight">{username}</h2>
                <div 
                    onClick={() => { playClickSound(); setIsKingJourneyOpen(true); }}
                    className="flex items-center gap-1 cursor-pointer active:scale-95 transition-transform mt-0.5"
                >
                    <div className="w-3.5 h-3.5"><KingXPIcon /></div>
                    <span className="text-xs font-black text-blue-800 dark:text-blue-300">{kingLevel}</span>
                    <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden ml-1 border border-black/10">
                        <div className="h-full bg-blue-500" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right Side: Resources & Trophies */}
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">{gold.toLocaleString()}</span>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4"><GoldIcon /></div>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-full border border-green-300 dark:border-green-800 shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">{gems.toLocaleString()}</span>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4"><GemIcon /></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 rounded-lg border border-yellow-300 dark:border-yellow-700 shadow-sm min-w-[55px]">
                 <span className="text-lg leading-none mb-0.5">🏆</span>
                 <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-400 leading-none">{trophies}</span>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
         <div className="flex flex-col items-center p-6 gap-6 z-10">
            
            {/* Battle Pass Banner */}
            <button 
                onClick={() => { playClickSound(); setIsBattlePassOpen(true); }}
                className="w-full max-w-xs h-24 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-xl border-2 border-yellow-500 shadow-xl relative overflow-hidden group active:scale-95 transition-all"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSI+PHBhdGggZD0iTTAgNDBXMTAgMzAgMjAgNDAgMzAgMzAgNDAgNDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-30"></div>
                {hasClaimablePassRewards && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce z-20"></div>
                )}
                
                <div className="flex h-full items-center px-4 justify-between relative z-10">
                    <div className="flex flex-col items-start">
                        <div className="text-yellow-200 text-[10px] font-bold uppercase tracking-widest">Season 1</div>
                        <h2 className="text-2xl font-black text-white italic uppercase drop-shadow-md">Pass Royale</h2>
                        <div className="w-32 h-3 bg-black/40 rounded-full mt-1 border border-white/10 overflow-hidden relative">
                            <div className="h-full bg-yellow-400" style={{ width: `${globalPassProgress}%` }}></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                                {battlePassCrowns} / {maxCrowns}
                            </div>
                        </div>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                        👑
                    </div>
                </div>
            </button>

            {/* Arena Display (Clickable) */}
            <button 
                onClick={() => { playButtonSound(); setIsArenasModalOpen(true); }}
                className={`w-full max-w-xs bg-gradient-to-br ${currentArena.color} rounded-xl p-4 border-2 border-white/20 shadow-2xl flex flex-col items-center relative overflow-hidden shrink-0 transition-transform active:scale-95 group`}
            >
                {hasClaimableTrophyRewards && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce shadow-md z-20"></div>
                )}
                <div className="flex w-full justify-between items-center z-10 mb-2">
                    <div className="w-20 h-20 filter drop-shadow-md">
                        <ArenaIcon id={currentArena.id} />
                    </div>
                    <div className="text-right flex-1 pl-4">
                         <h2 className="text-lg font-black uppercase italic tracking-wider text-white drop-shadow-md leading-tight">{currentArena.name}</h2>
                         <div className="text-[10px] font-bold text-white/80 uppercase mt-1">Current Arena</div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-0"></div>
            </button>

            {/* King Journey Button */}
            <button
                onClick={() => { playButtonSound(); setIsKingJourneyOpen(true); }}
                className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3 shadow-xl border-2 border-blue-400 relative overflow-hidden flex items-center justify-between group active:scale-95 transition-transform"
            >
                {hasClaimableKingRewards && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-bounce z-20"></div>
                )}
                <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 bg-blue-900 rounded-full border-2 border-blue-300 flex items-center justify-center text-xl shadow-inner relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2"><KingXPIcon /></div>
                        <span className="font-black text-white pt-1">{kingLevel}</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-white uppercase tracking-widest drop-shadow-md">King Journey</span>
                        <div className="text-[10px] text-blue-200">
                            {kingXP} / {nextLevelXP} XP
                        </div>
                    </div>
                </div>
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1 bg-black/40 w-full">
                    <div className="h-full bg-yellow-400" style={{ width: `${xpProgress}%` }}></div>
                </div>
                <div className="text-xl text-white opacity-50 group-hover:translate-x-1 transition-transform">›</div>
            </button>
            
            {/* Battle Button */}
            <button
                onClick={() => { onStartBattle(); }}
                className="group relative w-full max-w-xs z-10"
            >
                <div className="absolute inset-0 bg-yellow-600 rounded-lg transform translate-y-1 group-active:translate-y-0 transition-transform"></div>
                <div className="relative bg-gradient-to-b from-yellow-400 to-orange-500 p-4 rounded-lg border-t-2 border-yellow-300 shadow-xl flex items-center justify-center gap-3 transform group-active:translate-y-1 transition-transform">
                    <span className="text-3xl filter drop-shadow">⚔️</span>
                    <div className="flex flex-col items-start">
                        <span className="text-2xl font-black text-white drop-shadow-md uppercase tracking-wider">Battle</span>
                    </div>
                </div>
            </button>
            
            {/* Admin Debug Menu */}
            {username === 'admin.social' && (
                <div className="w-full max-w-xs bg-black/80 backdrop-blur-md rounded-lg p-3 text-white text-xs border border-white/20 shadow-xl z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="font-bold mb-2 uppercase text-gray-400">Admin Tools</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => onDebugAction('GOLD', 1000)} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">+1k Gold</button>
                        <button onClick={() => onDebugAction('GEMS', 100)} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">+100 Gems</button>
                        <button onClick={() => onDebugAction('XP', 500)} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">+500 XP</button>
                        <button onClick={() => onDebugAction('TROPHIES', 100)} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">+100 Trophies</button>
                        <button onClick={() => onDebugAction('CROWNS', 10)} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">+10 Crowns</button>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Overlays */}
      {isBattlePassOpen && (
          <BattlePassScreen 
              currentCrowns={battlePassCrowns}
              claimedRewards={claimedPassRewards}
              isPremiumUnlocked={isPassRoyaleUnlocked}
              onClaimReward={onClaimPassReward}
              onUnlockPremium={onUnlockPassRoyale}
              canAffordPremium={gems >= 500}
              onClose={() => setIsBattlePassOpen(false)}
          />
      )}

      {isArenasModalOpen && (
          <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-md shrink-0 z-10">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Trophy Road</h2>
                  <button onClick={() => setIsArenasModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-white font-bold hover:bg-gray-600 transition-colors">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scroll-smooth no-scrollbar">
                  <div className="relative min-h-full pb-20">
                      {/* Central Line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-700 -translate-x-1/2 rounded-full"></div>
                      
                      <div className="space-y-4 relative z-10">
                          {/* Render in reverse order (High trophies at top) */}
                          {[...ARENAS].reverse().map(arena => {
                              const arenaRewards = TROPHY_ROAD.filter(r => r.trophies > arena.minTrophies && r.trophies <= (ARENAS.find(a => a.id === arena.id + 1)?.minTrophies || 10000));
                              const isUnlocked = trophies >= arena.minTrophies;
                              const isCurrent = currentArena.id === arena.id;
                              const unlockedCards = CARDS.filter(c => c.unlockTrophies === arena.minTrophies);

                              return (
                                  <div key={arena.id} className="flex flex-col items-center w-full mb-8 relative">
                                      
                                      {/* Rewards between arenas */}
                                      {[...arenaRewards].reverse().map(reward => {
                                          const isClaimed = claimedRewards.includes(reward.id);
                                          const canClaim = trophies >= reward.trophies && !isClaimed;
                                          
                                          return (
                                              <div key={reward.id} id={`reward-${reward.id}`} className="flex items-center gap-4 my-2 z-10 w-full max-w-md relative">
                                                  <div className="flex-1 text-right text-xs font-bold text-gray-500">{reward.trophies}</div>
                                                  
                                                  <div className={`w-3 h-3 rounded-full ${trophies >= reward.trophies ? 'bg-yellow-500' : 'bg-gray-700'} shrink-0 relative`}></div>

                                                  <div className="flex-1">
                                                      <button 
                                                          onClick={() => {
                                                              if (canClaim) {
                                                                  playButtonSound();
                                                                  onClaimReward(reward);
                                                              } else if (isClaimed) {
                                                                  playClickSound(); 
                                                              }
                                                          }}
                                                          disabled={!canClaim && !isClaimed}
                                                          className={`
                                                              w-14 h-14 rounded-lg flex items-center justify-center border-b-4 transition-all
                                                              ${isClaimed ? 'bg-gray-800 border-gray-900 opacity-50 grayscale' : (canClaim ? `${getRewardColor(reward)} animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer active:scale-95` : 'bg-gray-800 border-gray-700 opacity-70')}
                                                          `}
                                                      >
                                                          {isClaimed && <div className="absolute inset-0 flex items-center justify-center z-10"><span className="text-green-500 text-2xl font-black">✓</span></div>}
                                                          {renderRewardIcon(reward)}
                                                      </button>
                                                  </div>
                                              </div>
                                          );
                                      })}

                                      {/* Arena Milestone */}
                                      <div id={`arena-card-${arena.id}`} className={`w-full max-w-md p-4 rounded-xl border-4 ${isUnlocked ? 'border-yellow-500 bg-gray-800' : 'border-gray-600 bg-gray-900'} relative z-10 mb-4 shadow-xl flex flex-col gap-4 transition-transform mt-4`}>
                                          <div className="flex items-center gap-4">
                                              <div className={`w-16 h-16 shrink-0 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                                                  <ArenaIcon id={arena.id} />
                                              </div>
                                              <div className="flex-1">
                                                  <div className="text-xs font-bold text-gray-400 uppercase">Arena {arena.id}</div>
                                                  <div className={`text-lg font-black uppercase italic ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{arena.name}</div>
                                                  <div className="text-sm font-bold text-yellow-500">{arena.minTrophies} 🏆</div>
                                              </div>
                                              {isCurrent && <div className="absolute -right-2 -top-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce">YOU</div>}
                                          </div>

                                          {/* Unlocked Cards Section */}
                                          {unlockedCards.length > 0 && (
                                              <div className="w-full pt-2 border-t border-gray-700/50">
                                                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Unlocks</div>
                                                  <div className="grid grid-cols-4 gap-2">
                                                      {unlockedCards.map(card => {
                                                          const rarityConfig = RARITY_INFO[card.rarity];
                                                          return (
                                                              <div 
                                                                  key={card.id} 
                                                                  onClick={() => { playClickSound(); setViewingCardId(card.id); }}
                                                                  className={`aspect-[3/4] rounded border relative overflow-hidden flex flex-col items-center justify-center p-1 bg-gray-800 ${rarityConfig.color.replace('bg-', 'border-')} cursor-pointer active:scale-95 transition-transform`} 
                                                                  title={card.name}
                                                              >
                                                                  <div className={`absolute inset-0 opacity-20 ${rarityConfig.color.replace('border-', 'bg-')}`}></div>
                                                                  <div className="relative w-full h-full pointer-events-none scale-90 mb-2">
                                                                      <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
                                                                  </div>
                                                                  <div className="absolute bottom-0 w-full bg-black/60 text-[6px] text-white text-center font-bold truncate px-0.5 py-0.5 pointer-events-none">
                                                                      {card.name}
                                                                  </div>
                                                                  {!isUnlocked && (
                                                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px] z-10">
                                                                          <span className="text-lg">🔒</span>
                                                                      </div>
                                                                  )}
                                                              </div>
                                                          );
                                                      })}
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* King Journey Modal */}
      {isKingJourneyOpen && (
          <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-md shrink-0 z-10">
                  <div className="flex items-center gap-2">
                      <KingXPIcon className="w-6 h-6" />
                      <h2 className="text-xl font-black text-white uppercase tracking-wider">King's Journey</h2>
                  </div>
                  <button onClick={() => setIsKingJourneyOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-white font-bold hover:bg-gray-600 transition-colors">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scroll-smooth no-scrollbar">
                  <div className="relative min-h-full pb-20 px-2">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-2 bg-blue-900/50 rounded-full"></div>

                        {Array.from({ length: MAX_KING_LEVEL }).map((_, i) => {
                            const lvl = i + 1;
                            const isCurrent = lvl === kingLevel;
                            const isPassed = lvl <= kingLevel;
                            const reward = KING_JOURNEY_REWARDS.find(r => r.level === lvl);
                            const isClaimed = claimedKingRewards.includes(lvl);
                            const canClaim = isPassed && reward && !isClaimed;

                            return (
                                <div key={lvl} className={`relative flex items-center gap-6 mb-8 ${isPassed ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                                    {/* Level Bubble */}
                                    <div className={`w-16 h-16 rounded-full border-4 z-10 flex items-center justify-center text-2xl font-black shadow-xl shrink-0 ${isCurrent ? 'bg-blue-600 border-blue-400 text-white scale-110' : (isPassed ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-gray-800 border-gray-600 text-gray-500')}`}>
                                        {lvl}
                                        {isCurrent && <div className="absolute -inset-1 border-4 border-white/20 rounded-full animate-ping"></div>}
                                    </div>

                                    {/* Stats & Reward */}
                                    <div className="flex-1 bg-gray-800 rounded-xl p-3 border border-gray-700 shadow-md relative">
                                        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 border-l border-b border-gray-700 transform rotate-45"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-bold uppercase">Tower HP</span>
                                                <span className="text-lg font-black text-white">{calculateStats({ ...TOWER_STATS, hp: KING_TOWER_HP }, lvl, true).hp}</span>
                                            </div>
                                            {reward && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => {
                                                            if(canClaim) {
                                                                playButtonSound();
                                                                onClaimReward(reward, true);
                                                            }
                                                        }}
                                                        disabled={!canClaim && !isClaimed}
                                                        className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 ${isClaimed ? 'bg-gray-700 border-gray-600 opacity-50' : (canClaim ? `${getRewardColor(reward)} animate-pulse` : 'bg-gray-900 border-gray-700 opacity-50')}`}
                                                    >
                                                        {isClaimed && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg"><span className="text-green-500 text-xl font-bold">✓</span></div>}
                                                        {renderRewardIcon(reward)}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                  </div>
              </div>
          </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
          <SettingsModal 
              username={username}
              onUpdateUsername={onUpdateUsername}
              theme={theme}
              onToggleTheme={onToggleTheme}
              onClose={() => setIsSettingsOpen(false)}
              muteEmotes={muteEmotes}
              onToggleMuteEmotes={onToggleMuteEmotes}
              autoOpenRewards={autoOpenRewards}
              onToggleAutoOpenRewards={onToggleAutoOpenRewards}
              musicEnabled={musicEnabled}
              onToggleMusic={onToggleMusic}
              sfxEnabled={sfxEnabled}
              onToggleSfx={onToggleSfx}
          />
      )}

      {/* Card Detail Popup (Quick View from Progression screens) */}
      {viewingCardDef && (
          <CardDetailsModal 
              card={viewingCardDef}
              collection={collection}
              onClose={() => setViewingCardId(null)}
          />
      )}
    </div>
  );
};
