
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HomeScreen, DebugActionType } from './components/HomeScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { ShopScreen } from './components/ShopScreen';
import { MultiplayerScreen } from './components/MultiplayerScreen';
import { GameCanvas } from './components/GameCanvas';
import { CardHand } from './components/CardHand';
import { ElixirBar } from './components/ElixirBar';
import { ChestModal } from './components/ChestModal';
import { ClaimModal } from './components/ClaimModal';
import { MysteryBoxModal } from './components/MysteryBoxModal';
import { playMenuTransitionSound, initAudio, playButtonSound, startMusic, stopMusic, playItemRevealSound, setMusicEnabled, setSfxEnabled, playLevelUpSound } from './services/audio';
import { GameState, PlayerSide, CardDef, CardType, ShopItem, ChestResult, TrophyReward, KingReward, PlayerCollection, MovementType, TargetType, GameEntity, ChestType, RewardType, GameMode, MultiplayerRole, MPMessage } from './types';
import { 
  CARDS, TOWERS, ARENAS, TICK_RATE, TOWER_STATS, PRINCESS_TOWER_HP, KING_TOWER_HP,
  getUpgradeRequirements, EXCHANGE_RATES, KING_JOURNEY_REWARDS, TROPHY_ROAD, 
  getSpawnPattern, calculateStats, generateAiDeck, MAX_LEVEL, CHEST_CONFIG, RARITY_INFO, PASS_ROYALE_COST,
  SHOP_EMOTES, EMOTE_COST, DEFAULT_EMOTES, KING_LEVEL_XP, MAX_KING_LEVEL
} from './constants';
import { updateGame } from './services/gameLoop';
import { processAiTurn } from './services/aiOpponent';
import { mpService } from './services/multiplayer';

// Bottom Navigation Component
const BottomNav = ({ currentView, onNavigate, hasUpgrades }: { currentView: string, onNavigate: (v: 'HOME' | 'COLLECTION' | 'SHOP' | 'MULTIPLAYER') => void, hasUpgrades: boolean }) => {
  const handleNav = (view: 'HOME' | 'COLLECTION' | 'SHOP' | 'MULTIPLAYER') => {
      if (currentView !== view) {
          playMenuTransitionSound();
          onNavigate(view);
      }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur p-2 flex justify-around items-center border-t border-gray-200 dark:border-gray-700 text-2xl z-50 pb-6 transition-colors shadow-[0_-5px_10px_rgba(0,0,0,0.1)]">
        <button 
           onClick={() => handleNav('SHOP')}
           className={`transition transform hover:scale-110 active:scale-95 ${currentView === 'SHOP' ? 'scale-110 drop-shadow-sm' : 'opacity-50'}`}
        >
           🛒
        </button>
        
        <button 
           onClick={() => handleNav('COLLECTION')}
           className={`transition transform hover:scale-110 active:scale-95 ${currentView === 'COLLECTION' ? 'scale-110 drop-shadow-sm' : 'opacity-50'}`}
        >
           <div className="relative">
               🃏
               {hasUpgrades && (
                   <div className="absolute -top-1 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse shadow-sm flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                   </div>
               )}
           </div>
        </button>
        
        <button 
           onClick={() => handleNav('HOME')}
           className={`transition transform hover:scale-110 active:scale-95 ${currentView === 'HOME' ? 'scale-110 drop-shadow-sm' : 'opacity-50'}`}
        >
           ⚔️
        </button>
        
        <button 
           onClick={() => handleNav('MULTIPLAYER')}
           className={`transition transform hover:scale-110 active:scale-95 ${currentView === 'MULTIPLAYER' ? 'scale-110 drop-shadow-sm text-blue-500' : 'opacity-50'}`}
        >
           👥
        </button>
        
        <div className="opacity-50 cursor-not-allowed">🏆</div>
    </div>
  );
};

// Battle Header Component (Top Bar)
const BattleHeader = ({ time, opponentName, opponentTrophies, playerCrowns, enemyCrowns, phase, mode }: { 
    time: number, 
    opponentName: string, 
    opponentTrophies: number, 
    playerCrowns: number, 
    enemyCrowns: number,
    phase: string,
    mode: GameMode
}) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const isOvertime = phase === 'OVERTIME';
    const isTiebreaker = phase === 'TIEBREAKER';

    return (
        <div className="w-full h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-3 z-50 shadow-md shrink-0">
            {/* Opponent Info (Left) */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Opponent</span>
                    <span className="text-[10px] text-yellow-500 font-bold">🏆 {opponentTrophies}</span>
                </div>
                <span className="text-sm font-black text-white leading-tight truncate max-w-[120px]">{opponentName}</span>
            </div>

            {/* Timer/Mode (Center) */}
            <div className={`
                flex flex-col items-center justify-center bg-black/40 rounded-lg px-3 py-1 border border-white/10
                ${time <= 10 && phase === 'REGULAR' ? 'animate-pulse text-red-500 border-red-500/50' : 'text-white'}
                ${isOvertime || isTiebreaker ? 'border-red-500/50 bg-red-900/20' : ''}
            `}>
                <span className="text-lg font-black tabular-nums">{timeString}</span>
                {mode !== 'STANDARD' && <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest leading-none">{mode.replace('_', ' ')}</span>}
                {isOvertime && <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest leading-none">Overtime</span>}
                {isTiebreaker && <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest leading-none">Tiebreaker</span>}
            </div>

            {/* Crowns (Right) */}
            <div className="flex items-center gap-3">
                {/* Enemy Crowns */}
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-red-400 uppercase">Enemy</span>
                    <div className="flex items-center gap-1 bg-red-900/30 px-2 rounded border border-red-500/30">
                        <span className="text-base">👑</span>
                        <span className="text-lg font-black text-white">{enemyCrowns}</span>
                    </div>
                </div>
                
                {/* Player Crowns */}
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-400 uppercase">You</span>
                    <div className="flex items-center gap-1 bg-blue-900/30 px-2 rounded border border-blue-500/30">
                        <span className="text-base">👑</span>
                        <span className="text-lg font-black text-white">{playerCrowns}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Game Over Overlay
const GameOverOverlay = ({ winner, playerCrowns, enemyCrowns, trophyChange, onContinue, onPlayAgain }: { 
    winner: PlayerSide | null, 
    playerCrowns: number,
    enemyCrowns: number,
    trophyChange: number,
    onContinue: () => void, 
    onPlayAgain: () => void 
}) => {
    const isVictory = winner === PlayerSide.PLAYER;
    const isDraw = winner === null;
    const title = isDraw ? "Draw" : (isVictory ? "Victory!" : "Defeat");
    const titleColor = isDraw ? "text-gray-400" : (isVictory ? "text-yellow-400" : "text-red-500");
    const trophyColor = trophyChange > 0 ? "text-yellow-400" : (trophyChange < 0 ? "text-red-400" : "text-gray-400");
    const trophySign = trophyChange > 0 ? "+" : "";

    return (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="scale-110 sm:scale-125 animate-in zoom-in duration-300 flex flex-col items-center w-full px-4">
                {/* Header */}
                <div className="relative mb-6 text-center">
                    {isVictory && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full animate-spin [animation-duration:10s]"></div>}
                    <h1 className={`text-6xl font-black uppercase tracking-tighter drop-shadow-2xl stroke-black stroke-2 ${titleColor}`}>
                        {title}
                    </h1>
                </div>

                {/* Score Board */}
                <div className="flex items-center justify-center gap-8 mb-8 bg-gray-900/80 p-4 rounded-2xl border-2 border-gray-700 shadow-2xl">
                    {/* Player */}
                    <div className="flex flex-col items-center">
                        <span className="text-blue-400 font-bold uppercase text-xs mb-1 tracking-widest">You</span>
                        <div className="relative">
                            <span className="text-5xl font-black text-white">{playerCrowns}</span>
                            <div className="absolute -top-3 -right-4 text-2xl">👑</div>
                        </div>
                    </div>

                    <div className="text-gray-600 font-black text-2xl">-</div>

                    {/* Enemy */}
                    <div className="flex flex-col items-center">
                        <span className="text-red-400 font-bold uppercase text-xs mb-1 tracking-widest">Enemy</span>
                        <div className="relative">
                            <span className="text-5xl font-black text-white">{enemyCrowns}</span>
                            <div className="absolute -top-3 -right-4 text-2xl">👑</div>
                        </div>
                    </div>
                </div>

                {/* Trophy Change */}
                <div className={`flex items-center gap-2 mb-12 ${trophyColor} bg-black/40 px-6 py-2 rounded-full border border-white/10`}>
                    <span className="text-3xl">🏆</span>
                    <span className="text-4xl font-black">{trophySign}{trophyChange}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => { playButtonSound(); onPlayAgain(); }}
                        className="bg-yellow-500 hover:bg-yellow-400 text-white border-b-4 border-yellow-700 font-black py-4 px-8 rounded-xl shadow-lg active:scale-95 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest text-lg"
                    >
                        Play Again
                    </button>
                    <button 
                        onClick={() => { playButtonSound(); onContinue(); }}
                        className="bg-gray-600 hover:bg-gray-500 text-white border-b-4 border-gray-800 font-black py-4 px-8 rounded-xl shadow-lg active:scale-95 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest text-lg"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SAVE SYSTEM ---
const SAVE_KEY = 'CR_APP_DATA_V1';

const loadSavedData = () => {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load save data", e);
    return {};
  }
};

const savedData = loadSavedData();

// --- INITIAL STATE ---
const INITIAL_COLLECTION: PlayerCollection = {};
// Grant basic starting cards
['knight', 'archers', 'arrows', 'giant', 'musketeer', 'minions', 'fireball', 'goblins'].forEach(id => {
    INITIAL_COLLECTION[id] = { level: 1, count: 0 };
});
TOWERS.forEach(t => {
    if (t.unlockTrophies === 0) INITIAL_COLLECTION[t.id] = { level: 1, count: 0 };
});

const BOT_NAMES = ["Trainer Earl", "Trainer Cheddar", "Red King", "NoobMaster69", "ProPlayer", "Guest_123", "ClashKing", "TheGiant", "MegaKnightLover"];

// Helper: Transform state for Guest view (Flip logic)
const transformStateForGuest = (state: GameState): GameState => {
    const flippedEntities = state.entities.map(e => ({
        ...e,
        x: 100 - e.x,
        y: 100 - e.y,
        side: e.side === PlayerSide.PLAYER ? PlayerSide.ENEMY : PlayerSide.PLAYER
    }));

    const flippedProjectiles = state.projectiles.map(p => ({
        ...p,
        x: 100 - p.x,
        y: 100 - p.y,
        startX: 100 - p.startX,
        startY: 100 - p.startY,
        destX: 100 - p.destX,
        destY: 100 - p.destY,
        ownerSide: p.ownerSide === PlayerSide.PLAYER ? PlayerSide.ENEMY : PlayerSide.PLAYER
    }));

    const flippedEmotes = state.activeEmotes.map(e => ({
        ...e,
        side: e.side === PlayerSide.PLAYER ? PlayerSide.ENEMY : PlayerSide.PLAYER
    }));

    // Flip King/Crowns info
    const pCrowns = state.enemyCrowns; // Host's Enemy is Guest's Player
    const eCrowns = state.playerCrowns; // Host's Player is Guest's Enemy

    return {
        ...state,
        entities: flippedEntities,
        projectiles: flippedProjectiles,
        activeEmotes: flippedEmotes,
        playerCrowns: pCrowns,
        enemyCrowns: eCrowns,
        // Swap elixir for display if needed, though usually client tracks its own elixir usage
        playerElixir: state.enemyElixir,
        enemyElixir: state.playerElixir
    };
};

const App: React.FC = () => {
    // --- STATE ---
    const [view, setView] = useState<'HOME' | 'COLLECTION' | 'SHOP' | 'BATTLE' | 'MULTIPLAYER'>('HOME');
    const [theme, setTheme] = useState<'light'|'dark'>(savedData.settings?.theme || 'dark');
    
    // Settings
    const [muteEmotes, setMuteEmotes] = useState(savedData.settings?.muteEmotes ?? false);
    const [autoOpenRewards, setAutoOpenRewards] = useState(savedData.settings?.autoOpenRewards ?? true);
    const [musicEnabled, setMusicEnabledState] = useState(savedData.settings?.musicEnabled ?? true);
    const [sfxEnabled, setSfxEnabledState] = useState(savedData.settings?.sfxEnabled ?? true);

    // User Data
    const [username, setUsername] = useState(savedData.username || 'Player');
    const [gold, setGold] = useState(savedData.gold ?? 1000);
    const [gems, setGems] = useState(savedData.gems ?? 100);
    const [trophies, setTrophies] = useState(savedData.trophies ?? 0);
    const [kingLevel, setKingLevel] = useState(savedData.kingLevel ?? 1);
    const [kingXP, setKingXP] = useState(savedData.kingXP ?? 0);
    const [collection, setCollection] = useState<PlayerCollection>(savedData.collection || INITIAL_COLLECTION);
    const [deck, setDeck] = useState<string[]>(savedData.deck || ['knight', 'archers', 'arrows', 'giant', 'musketeer', 'minions', 'fireball', 'goblins']);
    const [activeDeckIndex, setActiveDeckIndex] = useState(savedData.activeDeckIndex ?? 0);
    const [decks, setDecks] = useState<string[][]>(savedData.decks || [
        ['knight', 'archers', 'arrows', 'giant', 'musketeer', 'minions', 'fireball', 'goblins'],
        ['knight', 'archers', 'arrows', 'giant', 'musketeer', 'minions', 'fireball', 'goblins'],
        ['knight', 'archers', 'arrows', 'giant', 'musketeer', 'minions', 'fireball', 'goblins']
    ]);
    const [selectedTowerId, setSelectedTowerId] = useState(savedData.selectedTowerId || 'tower_princess');
    
    // Emote State
    const [unlockedEmotes, setUnlockedEmotes] = useState<string[]>(savedData.unlockedEmotes || [...DEFAULT_EMOTES]);
    const [emoteDeck, setEmoteDeck] = useState<string[]>(savedData.emoteDeck || [...DEFAULT_EMOTES]);

    // Reward Tracking
    const [claimedRewards, setClaimedRewards] = useState<string[]>(savedData.claimedRewards || []);
    const [claimedKingRewards, setClaimedKingRewards] = useState<number[]>(savedData.claimedKingRewards || []);
    
    // Battle Pass State
    const [battlePassCrowns, setBattlePassCrowns] = useState(savedData.battlePassCrowns ?? 0);
    const [isPassRoyaleUnlocked, setIsPassRoyaleUnlocked] = useState(savedData.isPassRoyaleUnlocked ?? false);
    const [claimedPassRewards, setClaimedPassRewards] = useState<string[]>(savedData.claimedPassRewards || []);

    // Game State (Transient)
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [hand, setHand] = useState<string[]>([]);
    const [nextCard, setNextCard] = useState<string>('');
    const [deckCycle, setDeckCycle] = useState<string[]>([]); 
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [opponentName, setOpponentName] = useState("Trainer Cheddar");
    
    // Multiplayer State
    const [mpRole, setMpRole] = useState<MultiplayerRole>('NONE');
    const [mpStatus, setMpStatus] = useState<'IDLE'|'CONNECTING'|'WAITING'|'CONNECTED'|'ERROR'>('IDLE');
    const [mpError, setMpError] = useState<string>();
    const [mpArenaId, setMpArenaId] = useState<number | null>(null);
    const hostingModeRef = useRef<GameMode>('STANDARD'); // Track hosting mode without re-rendering listeners
    
    // UI State
    const [isMenuHidden, setIsMenuHidden] = useState(false);

    // Modals
    const [chestResult, setChestResult] = useState<ChestResult | null>(null);
    const [claimReward, setClaimReward] = useState<{type: 'GOLD'|'GEMS'|'EMOTE', amount: number, content?: string} | null>(null);
    const [mysteryBoxStartLevel, setMysteryBoxStartLevel] = useState<number | null>(null);

    // Shop State
    const [dailyDeals, setDailyDeals] = useState<ShopItem[]>(savedData.dailyDeals || []);
    const [dailyEmoteDeals, setDailyEmoteDeals] = useState<ShopItem[]>(savedData.dailyEmoteDeals || []);
    const [lastLoginDate, setLastLoginDate] = useState<string>(savedData.lastLoginDate || '');

    // --- EFFECT: Sync Current Deck to Decks Array ---
    useEffect(() => {
        setDecks(prevDecks => {
            // Only update if the specific deck slot actually changed to prevent infinite loops
            if (JSON.stringify(prevDecks[activeDeckIndex]) !== JSON.stringify(deck)) {
                const newDecks = [...prevDecks];
                newDecks[activeDeckIndex] = deck;
                return newDecks;
            }
            return prevDecks;
        });
    }, [deck, activeDeckIndex]);

    // --- EFFECT: Save Data ---
    useEffect(() => {
        const data = {
            username, gold, gems, trophies, kingLevel, kingXP,
            collection, deck, decks, activeDeckIndex, selectedTowerId,
            unlockedEmotes, emoteDeck,
            claimedRewards, claimedKingRewards,
            battlePassCrowns, isPassRoyaleUnlocked, claimedPassRewards,
            lastLoginDate, dailyDeals, dailyEmoteDeals,
            settings: { theme, muteEmotes, autoOpenRewards, musicEnabled, sfxEnabled }
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }, [
        username, gold, gems, trophies, kingLevel, kingXP,
        collection, deck, decks, activeDeckIndex, selectedTowerId,
        unlockedEmotes, emoteDeck,
        claimedRewards, claimedKingRewards,
        battlePassCrowns, isPassRoyaleUnlocked, claimedPassRewards,
        lastLoginDate, dailyDeals, dailyEmoteDeals,
        theme, muteEmotes, autoOpenRewards, musicEnabled, sfxEnabled
    ]);

    // --- EFFECT: King Level Up ---
    useEffect(() => {
        if (kingLevel >= MAX_KING_LEVEL) return;

        // XP needed for current level to next (Level N needs XP at index N-1)
        const requiredXP = KING_LEVEL_XP[Math.max(0, kingLevel - 1)];
        
        if (kingXP >= requiredXP) {
            // Level Up!
            setKingXP(prev => prev - requiredXP);
            setKingLevel(prev => prev + 1);
            playLevelUpSound();
        }
    }, [kingXP, kingLevel]);

    // --- EFFECT: Theme ---
    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    // --- EFFECT: Initial Audio Interaction ---
    useEffect(() => {
        const handleInteraction = () => {
            initAudio({});
            if (musicEnabled) {
                startMusic('MENU'); // Start music on first interaction
            }
            window.removeEventListener('click', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        return () => window.removeEventListener('click', handleInteraction);
    }, [musicEnabled]);

    // --- EFFECT: Audio Settings ---
    useEffect(() => {
        setMusicEnabled(musicEnabled);
        if (musicEnabled) {
            startMusic(view === 'BATTLE' ? 'BATTLE' : 'MENU');
        } else {
            stopMusic();
        }
    }, [musicEnabled, view]);

    useEffect(() => {
        setSfxEnabled(sfxEnabled);
    }, [sfxEnabled]);

    // --- EFFECT: Music Logic View Switch ---
    useEffect(() => {
        // Only if enabled, otherwise effect above handles stop
        if (musicEnabled) {
            if (view === 'BATTLE') {
                startMusic('BATTLE');
            } else {
                startMusic('MENU');
            }
        }
    }, [view, musicEnabled]);

    // --- EFFECT: Multiplayer Listeners ---
    useEffect(() => {
        const unsub = mpService.onMessage((msg) => {
            if (msg.type === 'JOIN') {
                // --- HOST LOGIC: Guest Joined ---
                // Updates opponent name AND starts the battle since we now know the guest is ready and their name
                setOpponentName(msg.name);
                handleStartBattle(hostingModeRef.current, true);
            }
            else if (msg.type === 'INPUT') {
                // --- HOST LOGIC: Guest Input ---
                if (msg.action === 'PLACE_CARD') {
                    setGameState(prev => {
                        if (!prev || prev.gameOver) return prev;
                        
                        const hostX = 100 - msg.x;
                        const hostY = 100 - msg.y;

                        const cardDef = CARDS.find(c => c.id === msg.cardId);
                        if (cardDef && prev.enemyElixir >= cardDef.cost) {
                            // Force Tournament Standard (Level 9) for multiplayer
                            const level = 9;
                            const stats = calculateStats(cardDef.stats, level);
                            const spawnOffsets = getSpawnPattern(cardDef.spawnCount);
                            
                            const newEntities = spawnOffsets.map((off, i) => ({
                                id: `${cardDef.id}_e_${Date.now()}_${i}`,
                                defId: cardDef.id,
                                type: cardDef.type,
                                side: PlayerSide.ENEMY,
                                x: Math.max(2, Math.min(98, hostX - off.x)), 
                                y: Math.max(2, Math.min(98, hostY - off.y)),
                                hp: cardDef.type === CardType.SPELL ? 1 : stats.hp,
                                maxHp: cardDef.type === CardType.SPELL ? 1 : stats.hp,
                                shieldHp: stats.shieldHp || 0,
                                maxShieldHp: stats.shieldHp || 0,
                                stats: stats,
                                level: level,
                                lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, 
                                state: cardDef.type === CardType.SPELL ? 'CASTING' : 'IDLE',
                                deployTimer: cardDef.stats.deployTime + (i * 100),
                                frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false
                            })) as GameEntity[];

                            return {
                                ...prev,
                                entities: [...prev.entities, ...newEntities],
                                enemyElixir: prev.enemyElixir - cardDef.cost
                            };
                        }
                        return prev;
                    });
                } else if (msg.action === 'EMOTE') {
                    setGameState(prev => prev ? ({
                        ...prev,
                        activeEmotes: [...prev.activeEmotes, {
                            id: Date.now().toString(),
                            side: PlayerSide.ENEMY,
                            content: msg.content,
                            createdAt: Date.now()
                        }]
                    }) : null);
                }
            } 
            else if (msg.type === 'START' || msg.type === 'UPDATE') {
                // --- GUEST LOGIC ---
                
                if (msg.type === 'START') {
                    setGameState(transformStateForGuest(msg.state));
                    setOpponentName(msg.opponentName);
                    setMpArenaId(msg.arenaId); // Sync arena
                    
                    setView('BATTLE');
                    setIsMenuHidden(true);
                    
                    // Reset Hand for Guest - If Mirror Mode, use deck from host
                    const startDeck = msg.deck || deck; 
                    const initialHand = startDeck.slice(0, 4);
                    const initialDeckCycle = startDeck.slice(4);
                    const nextC = initialDeckCycle[0];
                    setHand(initialHand);
                    setDeckCycle(initialDeckCycle.slice(1));
                    setNextCard(nextC);
                } else if (msg.type === 'UPDATE') {
                    setGameState(transformStateForGuest(msg.state));
                }
            }
        });
        return unsub;
    }, [deck, kingLevel]); 

    const generateDailyShop = (currentTrophies: number, preserveFree: boolean = false) => {
        const availableCards = CARDS.filter(c => c.unlockTrophies <= currentTrophies);
        const deals: ShopItem[] = [];
        const emoteDeals: ShopItem[] = [];
        const usedCardIds = new Set<string>();
        
        // Cards
        let startIdx = 0;
        if (preserveFree && dailyDeals.length > 0) {
            const freeItem = dailyDeals.find(d => d.isFree);
            if (freeItem) {
                deals.push(freeItem);
                if (freeItem.cardId) usedCardIds.add(freeItem.cardId);
                startIdx = 1;
            }
        }

        for(let i=startIdx; i<6; i++) {
             // Filter out cards already picked for this shop refresh
             const pool = availableCards.filter(c => !usedCardIds.has(c.id));
             if (pool.length === 0) break; 

             const card = pool[Math.floor(Math.random() * pool.length)];
             usedCardIds.add(card.id);

             const isFree = i === 0;
             deals.push({
                 id: `deal_${i}_${Date.now()}`,
                 type: 'CARD',
                 cardId: card.id,
                 amount: isFree ? 10 : Math.floor(Math.random() * 20) + 1,
                 cost: isFree ? 0 : 100,
                 currency: 'GOLD',
                 purchased: false,
                 isFree
             });
        }
        
        // Emotes - Pick 3 unique random
        const shuffledEmotes = [...SHOP_EMOTES].sort(() => Math.random() - 0.5);
        for(let i=0; i<3; i++) {
            if (i < shuffledEmotes.length) {
                const emoteContent = shuffledEmotes[i];
                // Check if already owned
                const isOwned = unlockedEmotes.includes(emoteContent);
                
                emoteDeals.push({
                    id: `emote_deal_${i}_${Date.now()}`,
                    type: 'EMOTE',
                    emoteContent: emoteContent,
                    amount: 1,
                    cost: EMOTE_COST,
                    currency: 'GEMS',
                    purchased: isOwned
                });
            }
        }

        setDailyDeals(deals);
        setDailyEmoteDeals(emoteDeals);
    };

    // --- EFFECT: Daily Shop ---
    useEffect(() => {
        const today = new Date().toDateString();
        if (lastLoginDate !== today) {
            generateDailyShop(trophies, false);
            setLastLoginDate(today);
        }
    }, [lastLoginDate]);

    // --- EFFECT: Game Loop ---
    useEffect(() => {
        if (view === 'BATTLE') {
            // Only Host runs the loop logic. Guest receives updates via MP listener.
            if (mpRole === 'GUEST') return; 

            let animationFrameId: number;
            let lastTime = Date.now();

            const loop = () => {
                const now = Date.now();
                const dt = Math.min(now - lastTime, 50); // Cap dt to prevent huge jumps
                lastTime = now;

                setGameState(prev => {
                    if (!prev || prev.gameOver) return prev;

                    // 1. Core Game Update (Physics, Logic, Elixir)
                    const nextState = updateGame(prev, dt);

                    // 2. AI Logic (Only if NOT Multiplayer Host)
                    // If Host, we wait for Guest inputs via mpService listener
                    if (mpRole === 'NONE') {
                        const aiResult = processAiTurn(nextState, trophies);
                        if (aiResult.newEntities.length > 0) {
                            nextState.entities.push(...aiResult.newEntities);
                            nextState.enemyElixir -= aiResult.elixirSpent;
                            if(aiResult.updatedHand) nextState.aiHand = aiResult.updatedHand;
                            if(aiResult.updatedCycle) nextState.aiDeckCycle = aiResult.updatedCycle;
                            nextState.aiNextMoveTime = now + (2000 + Math.random() * 2000); // Reset cooldown
                        }
                        if (aiResult.emote && !muteEmotes) {
                             nextState.activeEmotes.push({
                                 id: Date.now().toString(),
                                 side: PlayerSide.ENEMY,
                                 content: aiResult.emote,
                                 createdAt: now
                             });
                        }
                    } else if (mpRole === 'HOST') {
                        // Broadcast state to Guest
                        // Throttle broadcasts slightly? For now send every frame for smoothness in local
                        mpService.send({ type: 'UPDATE', state: nextState });
                    }

                    return nextState;
                });

                animationFrameId = requestAnimationFrame(loop);
            };

            animationFrameId = requestAnimationFrame(loop);

            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [view, trophies, muteEmotes, mpRole]);

    // --- HELPER: Generate Chest Rewards ---
    const generateChestRewards = (chestType: ChestType, currentTrophies: number): ChestResult => {
        const config = CHEST_CONFIG[chestType] || CHEST_CONFIG['SILVER'];
        const c = config as any; 

        // Gold - Ensure at least minimum (and non-zero for standard chests)
        let minGold = c.minGold;
        if (minGold <= 0 && chestType !== 'MYSTERY') minGold = 10;
        
        let maxGold = c.maxGold;
        if (maxGold < minGold) maxGold = minGold + 50;

        let gold = Math.floor(minGold + Math.random() * (maxGold - minGold + 1));
        let gems = Math.floor(c.minGems + Math.random() * (c.maxGems - c.minGems + 1));
        
        const count = c.cards;
        const cards: { def: CardDef; count: number }[] = [];
        
        if (count > 0) {
            const available = CARDS.filter(cd => cd.unlockTrophies <= currentTrophies);
            if (available.length > 0) {
                 for(let i=0; i<count; i++) {
                     const card = available[Math.floor(Math.random() * available.length)];
                     const existing = cards.find(x => x.def.id === card.id);
                     if (existing) existing.count++;
                     else cards.push({ def: card, count: 1 });
                 }
            }
        }

        return { gold, gems, cards, type: chestType };
    };

    const handleClaimReward = (reward: TrophyReward | KingReward, isKingReward: boolean = false) => {
        if (isKingReward) {
            setClaimedKingRewards(prev => [...prev, (reward as KingReward).level]);
        } else {
            setClaimedRewards(prev => [...prev, (reward as TrophyReward).id]);
        }

        if (reward.type === RewardType.CHEST && reward.chestType) {
            if (reward.chestType === 'MYSTERY') {
                setMysteryBoxStartLevel(reward.chestLevel || 1);
                return;
            }
            const result = generateChestRewards(reward.chestType, trophies);
            setGold(prev => prev + result.gold);
            setGems(prev => prev + result.gems);
            setCollection(prev => {
                const next = { ...prev };
                result.cards.forEach(c => {
                    if (!next[c.def.id]) next[c.def.id] = { level: 1, count: 0 };
                    next[c.def.id].count += c.count;
                });
                return next;
            });
            setChestResult(result);
        } else {
            if (reward.type === RewardType.GOLD && reward.amount) setGold(prev => prev + reward.amount);
            if (reward.type === RewardType.GEMS && reward.amount) setGems(prev => prev + reward.amount);
            if (reward.type === RewardType.EMOTE && reward.emote) {
                if (!unlockedEmotes.includes(reward.emote)) setUnlockedEmotes(prev => [...prev, reward.emote!]);
            }
            setClaimReward({ type: reward.type as any, amount: reward.amount || 1, content: reward.emote });
        }
    };

    const handleMysteryBoxComplete = (reward: { type: string, amount: number, card?: CardDef, emote?: string }) => {
      setMysteryBoxStartLevel(null);
      // Add rewards
      if (reward.type === 'GOLD') setGold(g => g + reward.amount);
      if (reward.type === 'GEMS') setGems(g => g + reward.amount);
      if (reward.type === 'CARD' && reward.card) {
          setCollection(prev => {
              const next = { ...prev };
              if (!next[reward.card!.id]) next[reward.card!.id] = { level: 1, count: 0 };
              next[reward.card!.id].count += reward.amount;
              return next;
          });
      }
      if (reward.type === 'EMOTE' && reward.emote) {
          if(!unlockedEmotes.includes(reward.emote)) setUnlockedEmotes(prev => [...prev, reward.emote!]);
      }
      // Show claim modal
      setClaimReward({ type: reward.type as any, amount: reward.amount, content: reward.emote || (reward.card ? reward.card.name : undefined) });
    };

    const handleBuyItem = (item: ShopItem) => {
        if (item.currency === 'GOLD') {
            if (gold < item.cost) return;
            setGold(prev => prev - item.cost);
        } else {
            if (gems < item.cost) return;
            setGems(prev => prev - item.cost);
        }

        // Mark purchased
        if (item.type === 'CARD' || item.type === 'EMOTE') {
            if (item.id.includes('deal')) {
               setDailyDeals(prev => prev.map(d => d.id === item.id ? { ...d, purchased: true } : d));
            }
            if (item.id.includes('emote')) {
               setDailyEmoteDeals(prev => prev.map(d => d.id === item.id ? { ...d, purchased: true } : d));
            }
        }

        // Grant Item
        if (item.type === 'CARD' && item.cardId) {
            setCollection(prev => {
                const next = { ...prev };
                if (!next[item.cardId!]) next[item.cardId!] = { level: 1, count: 0 };
                next[item.cardId!].count += item.amount;
                return next;
            });
        } else if (item.type === 'EMOTE' && item.emoteContent) {
            if (!unlockedEmotes.includes(item.emoteContent)) {
                setUnlockedEmotes(prev => [...prev, item.emoteContent!]);
            }
        } else if (item.type === 'CHEST' && item.chestType) {
            if (item.chestType === 'MYSTERY') {
                setMysteryBoxStartLevel(item.chestLevel || 1);
                return;
            }
            const result = generateChestRewards(item.chestType, trophies);
            setGold(prev => prev + result.gold);
            setGems(prev => prev + result.gems);
            setCollection(prev => {
                const next = { ...prev };
                result.cards.forEach(c => {
                    if (!next[c.def.id]) next[c.def.id] = { level: 1, count: 0 };
                    next[c.def.id].count += c.count;
                });
                return next;
            });
            setChestResult(result);
        }
    };

    const handleStartBattle = (mode: GameMode = 'STANDARD', asHost: boolean = false) => {
        // Deck Selection Logic
        let battleDeck = deck;
        if (mode === 'MIRROR' && asHost) {
            battleDeck = generateAiDeck(8000); // Max trophy pool for mirror match
        }

        const initialHand = battleDeck.slice(0, 4);
        const initialDeckCycle = battleDeck.slice(4);
        const nextC = initialDeckCycle[0];
        
        // Mode logic
        let gameTime = 180;
        let phase: 'REGULAR' | 'OVERTIME' = 'REGULAR';
        if (mode === 'SUDDEN_DEATH') {
            gameTime = 180; // 3 mins overtime
            phase = 'OVERTIME';
        }

        // Multiplayer forces Tournament Standard (Level 9)
        const battleLevel = asHost ? 9 : kingLevel;

        // Current Arena ID (Host determines this)
        const arenaId = ARENAS.slice().reverse().find(a => trophies >= a.minTrophies)?.id || 0;

        const newGameState: GameState = {
            entities: [
                { id: 'kt_p', defId: 'king_tower', type: CardType.TOWER, side: PlayerSide.PLAYER, x: 50, y: 92, hp: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true).hp, maxHp: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
                { id: 'pt_p_l', defId: selectedTowerId, type: CardType.TOWER, side: PlayerSide.PLAYER, x: 20, y: 82, hp: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel).hp, maxHp: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
                { id: 'pt_p_r', defId: selectedTowerId, type: CardType.TOWER, side: PlayerSide.PLAYER, x: 80, y: 82, hp: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel).hp, maxHp: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id===selectedTowerId)!.stats, battleLevel), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
                
                { id: 'kt_e', defId: 'king_tower', type: CardType.TOWER, side: PlayerSide.ENEMY, x: 50, y: 8, hp: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true).hp, maxHp: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id==='king_tower')!.stats, battleLevel, true), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
                { id: 'pt_e_l', defId: 'tower_princess', type: CardType.TOWER, side: PlayerSide.ENEMY, x: 20, y: 18, hp: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel).hp, maxHp: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
                { id: 'pt_e_r', defId: 'tower_princess', type: CardType.TOWER, side: PlayerSide.ENEMY, x: 80, y: 18, hp: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel).hp, maxHp: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel).hp, shieldHp: 0, maxShieldHp: 0, stats: calculateStats(TOWERS.find(t=>t.id==='tower_princess')!.stats, battleLevel), level: battleLevel, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: 'IDLE', deployTimer: 0, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false },
            ],
            projectiles: [],
            particles: [],
            playerElixir: 5,
            enemyElixir: 5,
            gameTime: gameTime,
            gameOver: false,
            winner: null,
            activeEmotes: [],
            kingLevel: battleLevel,
            playerCrowns: 0,
            enemyCrowns: 0,
            phase: phase,
            aiHand: generateAiDeck(trophies).slice(0, 4),
            aiDeckCycle: generateAiDeck(trophies).slice(4),
            aiNextMoveTime: Date.now() + 3000,
            gameMode: mode
        };
        
        setHand(initialHand);
        setDeckCycle(initialDeckCycle.slice(1));
        setNextCard(nextC);
        setGameState(newGameState);
        setView('BATTLE');
        setIsMenuHidden(true);

        if (asHost) {
            // Send initial state to guest, including mirrored deck and host's arena
            mpService.send({ 
                type: 'START', 
                state: newGameState, 
                opponentName: username, 
                opponentLevel: battleLevel,
                arenaId: arenaId,
                deck: mode === 'MIRROR' ? battleDeck : undefined 
            });
        } else {
            setMpArenaId(null); // Reset local MP arena override
        }
    };

    // --- Multiplayer Actions ---
    const handleStartHosting = async (mode: GameMode): Promise<string> => {
        setMpStatus('CONNECTING');
        setMpError(undefined);
        const code = mpService.generateCode();
        hostingModeRef.current = mode; // Store mode to use when Guest joins
        
        return new Promise((resolve) => {
            mpService.initHost(
                code,
                () => { // On Connect (Guest Connected to PeerJS)
                    setMpStatus('WAITING'); // Wait for explicit JOIN message
                    setMpRole('HOST');
                    // We DO NOT start battle here anymore. We wait for JOIN message.
                },
                (err) => {
                    setMpStatus('ERROR');
                    setMpError(err);
                }
            );
            setMpStatus('WAITING');
            resolve(code);
        });
    };

    const handleJoinGame = async (code: string) => {
        setMpStatus('CONNECTING');
        setMpError(undefined);
        mpService.joinGame(
            code,
            () => { // On Connect
                setMpStatus('CONNECTED');
                setMpRole('GUEST');
                // Send Join Info
                mpService.send({ type: 'JOIN', name: username, level: kingLevel });
            },
            (err) => {
                setMpStatus('ERROR');
                setMpError(err);
            }
        );
    };

    const handleCancelMP = () => {
        mpService.disconnect();
        setMpStatus('IDLE');
        setMpRole('NONE');
        setMpArenaId(null);
    };

    const handlePlaceCard = (x: number, y: number) => {
        if (!selectedCardId) return;
        
        // Find in current hand (which might be mirrored/overridden locally in state)
        const card = CARDS.find(c => c.id === selectedCardId)!;
        // In Multiplayer, force Level 9 (Tournament Standard)
        const level = mpRole !== 'NONE' ? 9 : (collection[card.id]?.level || 1);

        if (mpRole === 'GUEST') {
            // Send input to host
            if (gameState && gameState.playerElixir >= card.cost) { // Optimistic check
                mpService.send({ 
                    type: 'INPUT', 
                    action: 'PLACE_CARD', 
                    cardId: selectedCardId, 
                    x: x, 
                    y: y, 
                    level: level 
                });
                
                // Optimistic Local Update (Optional, for now let's rely on Host update to avoid desync issues)
                // We consume elixir locally just for visual feedback until update comes
                setGameState(prev => prev ? ({ ...prev, playerElixir: prev.playerElixir - card.cost }) : null);
            }
        } else {
            // Host or Offline logic
            if (!gameState || gameState.playerElixir < card.cost) return;
            const stats = calculateStats(card.stats, level);
            const spawnOffsets = getSpawnPattern(card.spawnCount);
            const newEntities: GameEntity[] = spawnOffsets.map((off, i) => ({
                id: `${card.id}_p_${Date.now()}_${i}`,
                defId: card.id,
                type: card.type,
                side: PlayerSide.PLAYER,
                x: Math.max(2, Math.min(98, x + off.x)),
                y: Math.max(2, Math.min(98, y + off.y)),
                hp: card.type === CardType.SPELL ? 1 : stats.hp,
                maxHp: card.type === CardType.SPELL ? 1 : stats.hp,
                shieldHp: stats.shieldHp || 0,
                maxShieldHp: stats.shieldHp || 0,
                stats: stats,
                level: level,
                lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0, targetId: null, state: card.type === CardType.SPELL ? 'CASTING' : 'IDLE',
                deployTimer: card.stats.deployTime + (i * 100),
                frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false
            }));

            setGameState(prev => prev ? ({ ...prev, entities: [...prev.entities, ...newEntities], playerElixir: prev.playerElixir - card.cost }) : null);
        }
        
        // Cycle Card
        const newHand = hand.filter(id => id !== selectedCardId);
        newHand.push(nextCard);
        const newCycle = [...deckCycle, selectedCardId];
        const newNext = newCycle.shift()!;
        
        setHand(newHand);
        setDeckCycle(newCycle);
        setNextCard(newNext);
        setSelectedCardId(null);
    };

    const handleEmote = (emote: string) => {
        if (mpRole === 'GUEST') {
            mpService.send({ type: 'INPUT', action: 'EMOTE', content: emote });
        }
        setGameState(prev => prev ? ({...prev, activeEmotes: [...prev.activeEmotes, {id: Date.now().toString(), side: PlayerSide.PLAYER, content: emote, createdAt: Date.now()}]}) : null);
    };

    return (
      <div className="w-full h-full bg-black overflow-hidden relative">
          {view === 'BATTLE' && gameState ? (
              <div className="flex flex-col h-full relative">
                  <BattleHeader 
                      time={gameState.gameTime} 
                      opponentName={opponentName} 
                      opponentTrophies={trophies} 
                      playerCrowns={gameState.playerCrowns} 
                      enemyCrowns={gameState.enemyCrowns}
                      phase={gameState.phase}
                      mode={gameState.gameMode}
                  />
                  <GameCanvas 
                      entities={gameState.entities} 
                      onPlaceCard={handlePlaceCard} 
                      selectedCardId={selectedCardId} 
                      selectedCardType={selectedCardId ? (CARDS.find(c=>c.id===selectedCardId)?.type || null) : null}
                      activeEmotes={gameState.activeEmotes}
                      muteEmotes={muteEmotes}
                      // Use MP Arena ID if available, otherwise calculate from local trophies
                      arenaId={mpArenaId !== null ? mpArenaId : (ARENAS.slice().reverse().find(a => trophies >= a.minTrophies)?.id || 0)}
                      projectiles={gameState.projectiles}
                      particles={gameState.particles}
                      collection={collection}
                  />
                  <ElixirBar amount={gameState.playerElixir} />
                  <CardHand 
                      cards={hand.map(id => CARDS.find(c => c.id === id)!)}
                      selectedCardId={selectedCardId}
                      onSelectCard={(c) => setSelectedCardId(selectedCardId === c.id ? null : c.id)}
                      elixir={gameState.playerElixir}
                      nextCard={CARDS.find(c => c.id === nextCard)!}
                      collection={collection}
                      onEmote={handleEmote}
                      emoteDeck={emoteDeck}
                  />
                  {gameState.gameOver && (
                      <GameOverOverlay 
                          winner={gameState.winner} 
                          playerCrowns={gameState.playerCrowns}
                          enemyCrowns={gameState.enemyCrowns}
                          trophyChange={mpRole !== 'NONE' ? 0 : (gameState.trophyChange || 0)}
                          onContinue={() => {
                              if (mpRole === 'NONE' && gameState.trophyChange) setTrophies(prev => Math.max(0, prev + gameState.trophyChange!));
                              if (gameState.winner === PlayerSide.PLAYER) {
                                  setBattlePassCrowns(prev => prev + gameState.playerCrowns);
                                  setGold(prev => prev + (gameState.gameMode === 'STANDARD' ? 50 : 25)); // Standard gives more gold
                              }
                              setView('HOME'); 
                              setIsMenuHidden(false); 
                              setGameState(null);
                              handleCancelMP(); // Disconnect after game
                          }}
                          onPlayAgain={() => {
                              // For simplicity in MP, Play Again just resets if Host, or kicks to menu if complex.
                              // Let's just exit to menu for MP reliability
                              if (mpRole === 'NONE' && gameState.trophyChange) setTrophies(prev => Math.max(0, prev + gameState.trophyChange!));
                              if (gameState.winner === PlayerSide.PLAYER) {
                                  setBattlePassCrowns(prev => prev + gameState.playerCrowns);
                                  setGold(prev => prev + 50);
                              }
                              setView('HOME'); 
                              setIsMenuHidden(false); 
                              setGameState(null);
                              handleCancelMP();
                          }}
                      />
                  )}
              </div>
          ) : (
              <div className="w-full h-full relative flex flex-col">
                  <div className="flex-1 overflow-hidden relative">
                      {view === 'HOME' && (
                          <HomeScreen 
                              trophies={trophies}
                              username={username}
                              gold={gold}
                              gems={gems}
                              kingLevel={kingLevel}
                              kingXP={kingXP}
                              onUpdateUsername={setUsername}
                              onStartBattle={() => { setOpponentName(BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)]); handleStartBattle('STANDARD'); }}
                              onNavigate={setView}
                              currentView={view}
                              onDebugAction={(t, a) => {
                                  if (t === 'GOLD') setGold(g => g + a);
                                  if (t === 'GEMS') setGems(g => g + a);
                                  if (t === 'XP') setKingXP(x => x + a);
                                  if (t === 'TROPHIES') setTrophies(tr => tr + a);
                                  if (t === 'CROWNS') setBattlePassCrowns(c => c + a);
                              }}
                              claimedRewards={claimedRewards}
                              onClaimReward={handleClaimReward}
                              theme={theme}
                              onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                              muteEmotes={muteEmotes}
                              onToggleMuteEmotes={() => setMuteEmotes(m => !m)}
                              claimedKingRewards={claimedKingRewards}
                              collection={collection}
                              onTrophyRoadToggle={setIsMenuHidden}
                              autoOpenRewards={autoOpenRewards}
                              onToggleAutoOpenRewards={() => setAutoOpenRewards(a => !a)}
                              battlePassCrowns={battlePassCrowns}
                              isPassRoyaleUnlocked={isPassRoyaleUnlocked}
                              onUnlockPassRoyale={() => {
                                  if(gems >= PASS_ROYALE_COST) {
                                      setGems(g => g - PASS_ROYALE_COST);
                                      setIsPassRoyaleUnlocked(true);
                                  }
                              }}
                              claimedPassRewards={claimedPassRewards}
                              onClaimPassReward={(reward) => {
                                  setClaimedPassRewards(prev => [...prev, reward.id]);
                                  handleClaimReward(reward);
                              }}
                              musicEnabled={musicEnabled}
                              onToggleMusic={() => setMusicEnabledState(m => !m)}
                              sfxEnabled={sfxEnabled}
                              onToggleSfx={() => setSfxEnabledState(s => !s)}
                          />
                      )}
                      {view === 'COLLECTION' && (
                          <CollectionScreen 
                              currentTrophies={trophies}
                              currentDeck={deck}
                              onUpdateDeck={setDeck}
                              activeDeckIndex={activeDeckIndex}
                              onSwitchDeckIndex={(idx) => { setActiveDeckIndex(idx); setDeck(decks[idx] || deck); }}
                              collection={collection}
                              gold={gold}
                              gems={gems}
                              onUpgradeCard={(id) => {
                                  const card = CARDS.find(c => c.id === id)!;
                                  const col = collection[id];
                                  const cost = getUpgradeRequirements(card.rarity, col.level);
                                  if (gold >= cost.gold && col.count >= cost.cards) {
                                      setGold(g => g - cost.gold);
                                      setKingXP(x => x + cost.xp);
                                      setCollection(prev => ({
                                          ...prev,
                                          [id]: { level: col.level + 1, count: col.count - cost.cards }
                                      }));
                                  }
                              }}
                              onBuyCards={() => {}} // Not implemented in details modal for now
                              selectedTowerId={selectedTowerId}
                              onSelectTower={setSelectedTowerId}
                              unlockedEmotes={unlockedEmotes}
                              emoteDeck={emoteDeck}
                              onSetEmoteDeck={setEmoteDeck}
                          />
                      )}
                      {view === 'SHOP' && (
                          <ShopScreen 
                              coins={gold}
                              gems={gems}
                              dailyDeals={dailyDeals}
                              dailyEmoteDeals={dailyEmoteDeals}
                              onBuyItem={handleBuyItem}
                              onExchange={(type, amount) => {
                                  if (type === 'GEMS_TO_COINS') {
                                      setGems(g => g - 11);
                                      setGold(g => g + amount);
                                  } else {
                                      setGold(g => g - amount);
                                      setGems(g => g + 10);
                                  }
                              }}
                              onReroll={() => {
                                  if(gems >= 10) {
                                      setGems(g => g - 10);
                                      generateDailyShop(trophies, true);
                                  }
                              }}
                          />
                      )}
                      {view === 'MULTIPLAYER' && (
                          <MultiplayerScreen 
                              onStartHosting={handleStartHosting}
                              onJoinGame={handleJoinGame}
                              connectionStatus={mpStatus}
                              errorMessage={mpError}
                              onCancel={handleCancelMP}
                          />
                      )}
                  </div>
                  {!isMenuHidden && (
                      <BottomNav currentView={view} onNavigate={setView} hasUpgrades={Object.keys(collection).some((key) => {
                          const val = collection[key];
                          const def = CARDS.find(d => d.id === key);
                          if(!def) return false;
                          const cost = getUpgradeRequirements(def.rarity, val.level);
                          return val.count >= cost.cards && gold >= cost.gold && val.level < MAX_LEVEL;
                      })} />
                  )}
              </div>
          )}

          {chestResult && <ChestModal result={chestResult} onClose={() => setChestResult(null)} />}
          {claimReward && <ClaimModal type={claimReward.type} amount={claimReward.amount} content={claimReward.content} onClose={() => setClaimReward(null)} />}
          
          {mysteryBoxStartLevel !== null && (
              <MysteryBoxModal 
                  startLevel={mysteryBoxStartLevel} 
                  currentTrophies={trophies} 
                  unlockedEmotes={unlockedEmotes} 
                  onComplete={handleMysteryBoxComplete} 
              />
          )}
      </div>
    );
};

export default App;
