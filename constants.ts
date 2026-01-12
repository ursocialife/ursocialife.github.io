
import { CardDef, MovementType, TargetType, UnitStats, ArenaDef, CardType, TrophyReward, RewardType, Rarity, UpgradeCost, KingReward, BattlePassTier, ChestType } from './types';

export const TICK_RATE = 30; // Updates per second
export const ARENA_WIDTH = 100;
export const ARENA_HEIGHT = 100;
export const BRIDGE_LEFT_X = 20;
export const BRIDGE_RIGHT_X = 80;
export const RIVER_Y = 50;
export const EMOTE_DURATION = 2000; // ms

// Tower Definitions
export const TOWER_STATS: UnitStats = {
  hp: 2400,
  damage: 90,
  hitSpeed: 0.8,
  range: 22.5, // Scaled x3
  speed: 0,
  movementType: MovementType.GROUND,
  targets: TargetType.ALL,
  isBuilding: true,
  deployTime: 0,
};

// Base Stats (Level 1)
export const PRINCESS_TOWER_HP = 1400;
export const KING_TOWER_HP = 2400;

export const ARENAS: ArenaDef[] = [
  { id: 0, name: 'Training Camp', minTrophies: 0, icon: '🌲', color: 'from-amber-700 to-emerald-700' },
  { id: 1, name: 'Goblin Stadium', minTrophies: 60, icon: '🏟️', color: 'from-green-600 to-lime-800' },
  { id: 2, name: 'Bone Pit', minTrophies: 150, icon: '🦴', color: 'from-orange-700 to-amber-900' },
  { id: 3, name: 'Barbarian Bowl', minTrophies: 300, icon: '🛡️', color: 'from-stone-500 to-stone-700' },
  { id: 4, name: "P.E.K.K.A's Playhouse", minTrophies: 600, icon: '🌋', color: 'from-red-800 to-rose-950' },
  { id: 5, name: 'Spell Valley', minTrophies: 1000, icon: '🧪', color: 'from-fuchsia-700 to-purple-900' },
  { id: 6, name: "Builder's Workshop", minTrophies: 1400, icon: '⚙️', color: 'from-slate-600 to-slate-800' },
  { id: 7, name: "Royal Arena", minTrophies: 1700, icon: '🏰', color: 'from-blue-700 to-indigo-900' },
  { id: 8, name: "Frozen Peak", minTrophies: 2000, icon: '❄️', color: 'from-cyan-500 to-blue-600' },
  { id: 9, name: "Jungle Arena", minTrophies: 2300, icon: '🌿', color: 'from-emerald-700 to-green-900' },
  { id: 10, name: "Hog Mountain", minTrophies: 2600, icon: '⛰️', color: 'from-orange-400 to-red-600' },
  { id: 11, name: "Electro Valley", minTrophies: 3000, icon: '⚡', color: 'from-cyan-600 to-blue-800' },
  { id: 12, name: "Spooky Town", minTrophies: 3300, icon: '🎃', color: 'from-purple-900 to-indigo-950' },
  { id: 13, name: "Rascal's Hideout", minTrophies: 3600, icon: '⛺', color: 'from-yellow-600 to-yellow-800' },
  { id: 14, name: "Serenity Peak", minTrophies: 4000, icon: '🏔️', color: 'from-teal-300 to-teal-600' },
  { id: 15, name: "Miner's Mine", minTrophies: 4500, icon: '⛏️', color: 'from-stone-600 to-stone-800' },
  { id: 16, name: "Executioner's Kitchen", minTrophies: 5000, icon: '🥞', color: 'from-orange-700 to-red-800' },
  { id: 17, name: "Royal Crypt", minTrophies: 5500, icon: '⚰️', color: 'from-pink-900 to-rose-950' },
  { id: 18, name: "Silent Sanctuary", minTrophies: 6000, icon: '🤫', color: 'from-violet-800 to-fuchsia-900' },
  { id: 19, name: "Dragon Spa", minTrophies: 6500, icon: '🐉', color: 'from-red-600 to-orange-700' },
  { id: 20, name: "Legendary Arena", minTrophies: 7000, icon: '🏆', color: 'from-purple-600 to-indigo-600' },
];

export const MAX_LEVEL = 15;
export const MAX_KING_LEVEL = 30;

export const PASS_ROYALE_COST = 500; // Gems

export const RARITY_INFO = {
  [Rarity.COMMON]: { 
      startLevel: 1, 
      color: 'border-gray-400 bg-gray-100 dark:border-gray-500 dark:bg-gray-800', 
      textColor: 'text-gray-600 dark:text-gray-400',
      shopCost: 10,
      dropChance: 70 
  },
  [Rarity.RARE]: { 
      startLevel: 3, 
      color: 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/40', 
      textColor: 'text-orange-600 dark:text-orange-400',
      shopCost: 100,
      dropChance: 25 
  },
  [Rarity.EPIC]: { 
      startLevel: 6, 
      color: 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/40', 
      textColor: 'text-purple-600 dark:text-purple-400',
      shopCost: 1000,
      dropChance: 4.5 
  },
  [Rarity.LEGENDARY]: { 
      startLevel: 9, 
      color: 'border-teal-400 bg-teal-50 dark:border-teal-500 dark:bg-teal-900/40 shadow-[0_0_10px_rgba(45,212,191,0.3)]', 
      textColor: 'text-teal-600 dark:text-teal-400',
      shopCost: 40000,
      dropChance: 0.5 
  }
};

// Costs are indexed by level you are upgrading TO (or roughly level index)
export const UPGRADE_COSTS: UpgradeCost[] = [
  { cards: 0, gold: 0, xp: 0 },       // Level 1
  { cards: 2, gold: 50, xp: 5 },      // 1->2
  { cards: 4, gold: 150, xp: 10 },    // 2->3
  { cards: 10, gold: 350, xp: 25 },   // 3->4
  { cards: 20, gold: 750, xp: 50 },   // 4->5
  { cards: 50, gold: 1250, xp: 100 }, // 5->6 
  { cards: 100, gold: 2000, xp: 200 },// 6->7
  { cards: 200, gold: 3500, xp: 300 },// 7->8 
  { cards: 400, gold: 6000, xp: 400 },// 8->9 
  { cards: 800, gold: 10000, xp: 600 }, // 9->10
  { cards: 1000, gold: 20000, xp: 800 }, // 10->11
  { cards: 1500, gold: 35000, xp: 1200 }, // 11->12
  { cards: 3000, gold: 75000, xp: 1600 }, // 12->13
  { cards: 5000, gold: 100000, xp: 2000 }, // 13->14
  { cards: 8000, gold: 200000, xp: 2500 }, // 14->15
];

export const getUpgradeRequirements = (rarity: Rarity, currentLevel: number): UpgradeCost => {
    if (currentLevel >= MAX_LEVEL) return { cards: 0, gold: 0, xp: 0 };

    const startLevel = RARITY_INFO[rarity].startLevel;
    
    // Absolute Cost (Gold/XP) depends on the level number itself
    const absoluteCost = UPGRADE_COSTS[currentLevel] || { gold: 0, xp: 0, cards: 0 };
    
    // Relative Cost (Cards) depends on how many upgrades since start level
    const relativeIndex = Math.max(1, currentLevel - startLevel + 1);
    const relativeCost = UPGRADE_COSTS[relativeIndex] || { cards: 0 };

    return {
        gold: absoluteCost.gold,
        xp: absoluteCost.xp,
        cards: relativeCost.cards 
    };
};

export const getSpawnPattern = (count: number): {x: number, y: number}[] => {
    if (count === 1) return [{x:0, y:0}];
    if (count === 2) return [{x:-3, y:0}, {x:3, y:0}];
    if (count === 3) return [{x:0, y:-3}, {x:-3, y:2}, {x:3, y:2}];
    if (count === 4) return [{x:-2.5, y:-2.5}, {x:2.5, y:-2.5}, {x:-2.5, y:2.5}, {x:2.5, y:2.5}];
    if (count === 5) return [{x:0, y:-3}, {x:-3.5, y:-0.5}, {x:3.5, y:-0.5}, {x:-2, y:3}, {x:2, y:3}];
    
    const offsets = [];
    const radius = 6;
    for(let i=0; i<count; i++) {
        const angle = i * 2.39996;
        const r = Math.sqrt(i) * (radius / Math.sqrt(count)); 
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        offsets.push({x: x*1.5, y: y*1.5}); 
    }
    return offsets;
}

// XP Thresholds for King Levels
export const KING_LEVEL_XP: number[] = Array.from({length: MAX_KING_LEVEL}, (_, i) => {
    // Exponential curve starting small
    return Math.floor(50 * Math.pow(1.15, i));
});

// Rewards for King Levels
export const KING_JOURNEY_REWARDS: KingReward[] = [];
for (let i = 2; i <= MAX_KING_LEVEL; i++) {
    if (i % 2 === 0) {
        // Even Levels: Chests (No Mystery)
        let chestType: ChestType = 'SILVER';
        if (i % 10 === 0) chestType = 'MAGICAL';
        else if (i % 4 === 0) chestType = 'GOLDEN';
        
        KING_JOURNEY_REWARDS.push({ level: i, type: RewardType.CHEST, chestType });
    } else {
        // Odd Levels: Resources
        if ((i - 1) % 4 === 0) {
            // Gems
            KING_JOURNEY_REWARDS.push({ level: i, type: RewardType.GEMS, amount: 20 + i });
        } else {
            // Gold
            KING_JOURNEY_REWARDS.push({ level: i, type: RewardType.GOLD, amount: 500 + (i * 100) });
        }
    }
}

export const calculateStats = (baseStats: UnitStats, level: number, isKingTower: boolean = false): UnitStats => {
    const multiplier = Math.pow(1.1, level - 1);
    
    let hp: number;
    let damage = Math.floor(baseStats.damage * multiplier);

    if (isKingTower) {
        // Linear scaling for King Tower: 2400 -> 8500
        const minHp = 2400;
        const maxHp = 8500;
        
        if (level <= 1) {
            hp = minHp;
        } else if (level >= MAX_KING_LEVEL) {
            hp = maxHp;
        } else {
            const step = (maxHp - minHp) / (MAX_KING_LEVEL - 1);
            hp = Math.floor(minHp + (level - 1) * step);
        }
    } else {
        hp = Math.floor(baseStats.hp * multiplier);
    }
    
    // Hard cap for buildings/towers at 75,000 HP
    if (baseStats.isBuilding && hp > 75000) {
        hp = 75000;
    }

    return {
        ...baseStats,
        hp: hp,
        shieldHp: baseStats.shieldHp ? Math.floor(baseStats.shieldHp * multiplier) : undefined,
        damage: damage,
    };
};

export const BATTLE_PASS_TIERS: BattlePassTier[] = (() => {
    const tiers: BattlePassTier[] = [];
    const NUM_TIERS = 50;
    const CROWNS_PER_TIER = 10;

    for (let i = 1; i <= NUM_TIERS; i++) {
        let freeReward: TrophyReward | null = null;
        let premiumReward: TrophyReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.GOLD, amount: 500 }; 

        const scale = 1 + (i / NUM_TIERS) * 2;
        const baseGold = 500;
        const baseGems = 50;

        // FREE TRACK
        if (i % 5 === 0) {
             const isMystery = i % 10 === 0; // Every 10th is Mystery Level 2
             freeReward = { 
                 id: `bp_free_${i}`, 
                 trophies: 0, 
                 type: RewardType.CHEST, 
                 chestType: isMystery ? 'MYSTERY' : 'GOLDEN',
                 chestLevel: isMystery ? 2 : undefined
             };
        } else if (i % 3 === 0) {
            // Inject some Level 1 Mystery Boxes in place of some silver chests
            freeReward = { 
                id: `bp_free_${i}`, 
                trophies: 0, 
                type: RewardType.CHEST, 
                chestType: 'MYSTERY',
                chestLevel: 1
            };
        } else if (i % 2 === 0) {
            freeReward = { id: `bp_free_${i}`, trophies: 0, type: RewardType.GOLD, amount: Math.floor(100 * scale) };
        } else {
            freeReward = { 
                id: `bp_free_${i}`, 
                trophies: 0, 
                type: RewardType.CHEST, 
                chestType: 'SILVER'
            };
        }

        // PREMIUM TRACK
        if (i === NUM_TIERS) {
            // Tier 50: Ultimate Reward - Mystery Box Level 5
            premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.CHEST, chestType: 'MYSTERY', chestLevel: 5 };
        } else if (i % 10 === 0) {
            // 10, 20, 30, 40
            // Make Magical rarer (every 20 tiers), use High Level Mystery Box for others
            if (i % 20 === 0) {
                premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.CHEST, chestType: 'MAGICAL' };
            } else {
                premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.CHEST, chestType: 'MYSTERY', chestLevel: 4 };
            }
        } else if (i % 5 === 0) {
            // Alternating Gems and Mystery Level 2
            if (i % 10 === 5) {
                 premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.CHEST, chestType: 'MYSTERY', chestLevel: 3 };
            } else {
                 premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.GEMS, amount: Math.floor(baseGems * scale) };
            }
        } else if (i % 3 === 0) {
            // Replace some Golden chests with Mystery Level 2
            premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.CHEST, chestType: 'MYSTERY', chestLevel: 2 };
        } else {
            premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.GOLD, amount: Math.floor(baseGold * scale) };
        }

        if (i === 20) {
             // Keep the emote at tier 20, overrides the Magical chest logic above if needed, but 20 is % 20 so let's shift emote to 19 or keep it additional
             premiumReward = { id: `bp_prem_${i}`, trophies: 0, type: RewardType.EMOTE, emote: '🤑' };
        }

        tiers.push({
            tier: i,
            crownsRequired: i * CROWNS_PER_TIER,
            freeReward,
            premiumReward
        });
    }
    return tiers;
})();

export const TROPHY_ROAD: TrophyReward[] = (() => {
    const rewards: TrophyReward[] = [];
    const MAX_TROPHIES = 8000;
    
    for (let t = 50; t <= MAX_TROPHIES; t += 50) {
        let reward: TrophyReward = {
            id: `tr_${t}`,
            trophies: t,
            type: RewardType.GOLD,
        };

        if (t === MAX_TROPHIES) {
             reward.type = RewardType.CHEST;
             reward.chestType = 'MYSTERY';
             reward.chestLevel = 5; // Ultimate Trophy Road Reward
             rewards.push(reward);
             continue;
        }

        const step = (t / 50) % 10;
        
        if (step === 0) { // Multiples of 500
             if (t === 7000) {
                 // 7000: Mystery Box Level 4
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'MYSTERY';
                 reward.chestLevel = 4;
             } else if (t % 2000 === 0) { 
                 // 2000, 4000, 6000: Magical Chest (Keep these rare)
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'MAGICAL';
             } else if (t % 1000 === 0) {
                 // 1000, 3000, 5000: Mystery Box Level 3
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'MYSTERY';
                 reward.chestLevel = 3;
             } else { 
                 // 500, 1500, 2500... : Golden Chest
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'GOLDEN';
             }
        } else if (step === 5) { // X50 (e.g. 250, 750)
             // Replaces Golden Chest with Mystery Box Level 2
             reward.type = RewardType.CHEST;
             reward.chestType = 'MYSTERY';
             reward.chestLevel = 2;
        } else if (step === 2 || step === 8) { 
             // Small Rewards
             if (step === 8) {
                 // Replace Silver with Mystery Box Level 1
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'MYSTERY';
                 reward.chestLevel = 1;
             } else {
                 reward.type = RewardType.CHEST;
                 reward.chestType = 'SILVER';
             }
        } else if (step === 3 || step === 6 || step === 9) { 
             reward.type = RewardType.GEMS;
             reward.amount = 20 + Math.floor(t / 500) * 10;
        } else { 
             reward.type = RewardType.GOLD;
             reward.amount = 200 + Math.floor(t * 0.5);
        }

        rewards.push(reward);
    }
    return rewards;
})();

export const CHEST_CONFIG = {
    SILVER: { minGold: 30, maxGold: 50, minGems: 0, maxGems: 2, cards: 5, cost: 30 },
    GOLDEN: { minGold: 150, maxGold: 200, minGems: 5, maxGems: 15, cards: 15, cost: 80 },
    MAGICAL: { minGold: 600, maxGold: 800, minGems: 30, maxGems: 60, cards: 40, cost: 300 },
    MYSTERY: { minGold: 0, maxGold: 0, minGems: 0, maxGems: 0, cards: 0, cost: 50 }, 
};

export const MYSTERY_BOX_ODDS = {
    1: 0.6, 
    2: 0.5, 
    3: 0.4, 
    4: 0.25 
};

export const EXCHANGE_RATES = {
  GEMS_TO_COINS: 90.909090, 
  COINS_TO_GEMS: 110, 
};

export const DEFAULT_EMOTES = ['👍', '😭', '😡', '😂'];
export const SHOP_EMOTES = [
  '😎', '😱', '🤯', '🥳', '😴', '🤡', '👻', '💩', '🤖', '💀','👎', 
  '👀', '🧠', '🥶', '🤢', '🤠', '🤐', '🥱', '🥺', '😈', '👽','🙄'
];
export const EMOTE_COST = 150;

export const TOWERS: CardDef[] = [
    {
        id: 'king_tower',
        name: 'King Tower',
        type: CardType.TOWER,
        rarity: Rarity.COMMON,
        cost: 0,
        icon: '👑',
        spawnCount: 1,
        color: 'bg-yellow-500',
        description: 'Protect the King!',
        unlockTrophies: 0,
        stats: { ...TOWER_STATS, hp: KING_TOWER_HP, range: 21, damage: 109 }
    },
    {
        id: 'tower_princess',
        name: 'Tower Princess',
        type: CardType.TOWER,
        rarity: Rarity.COMMON,
        cost: 0,
        icon: '👸',
        spawnCount: 1,
        color: 'bg-pink-500',
        description: 'The standard Princess. Shoots flaming arrows.',
        unlockTrophies: 0,
        stats: { ...TOWER_STATS, hp: PRINCESS_TOWER_HP }
    },
    {
        id: 'tower_cannoneer',
        name: 'Cannoneer',
        type: CardType.TOWER,
        rarity: Rarity.EPIC,
        cost: 0,
        icon: '💣',
        spawnCount: 1,
        color: 'bg-red-900',
        description: 'Deals massive damage but shoots slowly.',
        unlockTrophies: 1000,
        stats: { ...TOWER_STATS, damage: 280, hitSpeed: 2.2, hp: 2000 }
    }
];

export const CARDS: CardDef[] = [
  // --- ARENA 0 ---
  { id: 'knight', name: 'Knight', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 3, icon: '⚔️', color: 'bg-blue-500', spawnCount: 1, description: 'A tough melee fighter.', unlockTrophies: 0, stats: { hp: 800, damage: 120, hitSpeed: 1.1, range: 4.5, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'archers', name: 'Archers', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 3, icon: '🏹', color: 'bg-pink-500', spawnCount: 2, description: 'Two ranged attackers.', unlockTrophies: 0, stats: { hp: 200, damage: 60, hitSpeed: 1.2, range: 16.5, speed: 0.65, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'goblins', name: 'Goblins', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 2, icon: '👺', color: 'bg-green-500', spawnCount: 4, description: 'Fast, cheap, and numerous.', unlockTrophies: 0, stats: { hp: 100, damage: 80, hitSpeed: 1.1, range: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'musketeer', name: 'Musketeer', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🔫', color: 'bg-purple-800', spawnCount: 1, description: 'High damage ranged unit.', unlockTrophies: 0, stats: { hp: 450, damage: 150, hitSpeed: 1.1, range: 18, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'arrows', name: 'Arrows', type: CardType.SPELL, rarity: Rarity.COMMON, cost: 3, icon: '🗯️', color: 'bg-blue-300', spawnCount: 1, description: 'Arrows pepper a large area.', unlockTrophies: 0, stats: { hp: 0, damage: 200, hitSpeed: 0, range: 0, radius: 20, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 800 } },
  { id: 'fireball', name: 'Fireball', type: CardType.SPELL, rarity: Rarity.RARE, cost: 4, icon: '☄️', color: 'bg-orange-500', spawnCount: 1, description: 'Incinerates a small area.', unlockTrophies: 0, stats: { hp: 0, damage: 400, hitSpeed: 0, range: 0, radius: 12.5, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1200 } },
  { id: 'minions', name: 'Minions', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 3, icon: '🦇', color: 'bg-purple-600', spawnCount: 3, description: 'Flying attackers.', unlockTrophies: 0, stats: { hp: 150, damage: 60, hitSpeed: 1, range: 6, speed: 0.8, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'giant', name: 'Giant', type: CardType.TROOP, rarity: Rarity.RARE, cost: 5, icon: '🗿', color: 'bg-orange-600', spawnCount: 1, description: 'Slow but tough. Targets buildings.', unlockTrophies: 0, stats: { hp: 2200, damage: 150, hitSpeed: 1.5, range: 2, speed: 0.325, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },

  // --- ARENA 1 ---
  { id: 'bomber', name: 'Bomber', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 3, icon: '💣', color: 'bg-orange-300', spawnCount: 1, description: 'Deals area damage. Ground only.', unlockTrophies: 60, stats: { hp: 250, damage: 180, hitSpeed: 1.8, range: 13.5, radius: 4.5, speed: 0.65, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'valkyrie', name: 'Valkyrie', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🪓', color: 'bg-orange-700', spawnCount: 1, description: 'Melee fighter who deals area damage.', unlockTrophies: 60, stats: { hp: 1200, damage: 160, hitSpeed: 1.5, range: 3, radius: 6, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'spear_goblins', name: 'Spear Goblins', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 2, icon: '🎋', color: 'bg-green-400', spawnCount: 3, description: 'Three unarmored ranged attackers.', unlockTrophies: 60, stats: { hp: 80, damage: 50, hitSpeed: 1.3, range: 15, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'minipekka', name: 'Mini P.E.K.K.A', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🥞', color: 'bg-blue-400', spawnCount: 1, description: 'The arena is a certified butterfly-free zone.', unlockTrophies: 60, stats: { hp: 800, damage: 400, hitSpeed: 1.6, range: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  
  // --- ARENA 2 ---
  { id: 'skeletons', name: 'Skeletons', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 1, icon: '💀', color: 'bg-gray-300', spawnCount: 3, description: 'Three fragile skeletons.', unlockTrophies: 150, stats: { hp: 40, damage: 40, hitSpeed: 1.0, range: 4.5, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'babydragon', name: 'Baby Dragon', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 4, icon: '🐲', color: 'bg-green-600', spawnCount: 1, description: 'Flying tank with splash damage.', unlockTrophies: 150, stats: { hp: 900, damage: 100, hitSpeed: 1.5, range: 10.5, radius: 4.5, speed: 0.7, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'goblin_hut', name: 'Goblin Hut', type: CardType.BUILDING, rarity: Rarity.RARE, cost: 5, icon: '⛺', color: 'bg-green-700', spawnCount: 1, description: 'Building that spawns Spear Goblins.', unlockTrophies: 150, stats: { hp: 700, damage: 0, hitSpeed: 0, range: 0, speed: 0, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: true, deployTime: 1000 } },
  { id: 'tesla', name: 'Hidden Tesla', type: CardType.BUILDING, rarity: Rarity.COMMON, cost: 4, icon: '⚡', color: 'bg-blue-400', spawnCount: 1, description: 'Defensive building that hides underground.', unlockTrophies: 150, stats: { hp: 900, damage: 130, hitSpeed: 1.1, range: 16.5, speed: 0, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: true, deployTime: 1000 } },
  { id: 'balloon', name: 'Balloon', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🎈', color: 'bg-red-400', spawnCount: 1, description: 'Wrecks buildings with massive bombs.', unlockTrophies: 150, stats: { hp: 1000, damage: 500, hitSpeed: 2.0, range: 3, speed: 0.52, movementType: MovementType.AIR, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },
  
  // --- ARENA 3 ---
  { id: 'barbarians', name: 'Barbarians', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 5, icon: '😠', color: 'bg-yellow-600', spawnCount: 5, description: 'A horde of melee attackers.', unlockTrophies: 300, stats: { hp: 400, damage: 100, hitSpeed: 1.4, range: 4.5, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'cannon', name: 'Cannon', type: CardType.BUILDING, rarity: Rarity.COMMON, cost: 3, icon: '💣', color: 'bg-gray-800', spawnCount: 1, description: 'Defensive building. Ground only.', unlockTrophies: 300, stats: { hp: 600, damage: 100, hitSpeed: 0.9, range: 16.5, speed: 0, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: true, deployTime: 1000 } },
  { id: 'princess', name: 'Princess', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 3, icon: '👸', color: 'bg-yellow-400', spawnCount: 1, description: 'Shoots a volley of flaming arrows from long range.', unlockTrophies: 300, stats: { hp: 200, damage: 140, hitSpeed: 3.0, range: 27, radius: 6, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'rage', name: 'Rage', type: CardType.SPELL, rarity: Rarity.EPIC, cost: 2, icon: '🟣', color: 'bg-purple-600', spawnCount: 1, description: 'Increases movement and attack speed. Deals damage to enemies.', unlockTrophies: 300, stats: { hp: 0, damage: 120, hitSpeed: 0, range: 0, radius: 15, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 200 } },
  { id: 'rocket', name: 'Rocket', type: CardType.SPELL, rarity: Rarity.RARE, cost: 6, icon: '🚀', color: 'bg-orange-600', spawnCount: 1, description: 'Deals massive damage to a small area.', unlockTrophies: 300, stats: { hp: 0, damage: 1000, hitSpeed: 0, range: 0, radius: 10, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 2000 } },
  
  // --- ARENA 4 ---
  { id: 'pekka', name: 'P.E.K.K.A', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 7, icon: '👹', color: 'bg-indigo-900', spawnCount: 1, description: 'Heavy armor, heavy damage.', unlockTrophies: 600, stats: { hp: 2600, damage: 550, hitSpeed: 1.8, range: 4.5, speed: 0.39, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 2000 } },
  { id: 'tombstone', name: 'Tombstone', type: CardType.BUILDING, rarity: Rarity.RARE, cost: 3, icon: '🪦', color: 'bg-gray-700', spawnCount: 1, description: 'Troop building that deploys Skeletons periodically. Spawns 4 Skeletons on death.', unlockTrophies: 600, stats: { hp: 440, damage: 0, hitSpeed: 0, range: 0, speed: 0, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: true, deployTime: 1000 } },
  { id: 'hogrider', name: 'Hog Rider', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🔨', color: 'bg-orange-400', spawnCount: 1, description: 'Fast unit that targets buildings.', unlockTrophies: 600, stats: { hp: 1000, damage: 200, hitSpeed: 1.6, range: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },
  { id: 'skeleton_army', name: 'Skeleton Army', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 3, icon: '☠️', color: 'bg-purple-600', spawnCount: 15, description: 'Spawns an army of Skeletons.', unlockTrophies: 600, stats: { hp: 40, damage: 40, hitSpeed: 1.0, range: 4.5, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'zap', name: 'Zap', type: CardType.SPELL, rarity: Rarity.COMMON, cost: 2, icon: '⚡', color: 'bg-blue-200', spawnCount: 1, description: 'Zaps enemies in a small area.', unlockTrophies: 600, stats: { hp: 0, damage: 120, hitSpeed: 0, range: 0, radius: 10, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 200 } },
  { id: 'infernotower', name: 'Inferno Tower', type: CardType.BUILDING, rarity: Rarity.RARE, cost: 5, icon: '🗼', color: 'bg-red-800', spawnCount: 1, description: 'Melts high HP targets.', unlockTrophies: 600, stats: { hp: 1200, damage: 200, hitSpeed: 0.4, range: 18, speed: 0, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: true, deployTime: 1000 } },
  
  // --- ARENA 5 ---
  { id: 'wizard', name: 'Wizard', type: CardType.TROOP, rarity: Rarity.RARE, cost: 5, icon: '🧙‍♂️', color: 'bg-blue-600', spawnCount: 1, description: 'Deals high area damage.', unlockTrophies: 1000, stats: { hp: 550, damage: 220, hitSpeed: 1.4, range: 15, radius: 4.5, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'poison', name: 'Poison', type: CardType.SPELL, rarity: Rarity.EPIC, cost: 4, icon: '🧪', color: 'bg-orange-800', spawnCount: 1, description: 'Covers the area in deadly toxin.', unlockTrophies: 1000, stats: { hp: 0, damage: 250, hitSpeed: 0, range: 0, radius: 17.5, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'witch', name: 'Witch', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🧙‍♀️', color: 'bg-purple-700', spawnCount: 1, description: 'Summons Skeletons, shoots destruct beams.', unlockTrophies: 1000, stats: { hp: 600, damage: 100, hitSpeed: 0.7, range: 15, radius: 3, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'bats', name: 'Bats', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 2, icon: '🦇', color: 'bg-purple-900', spawnCount: 5, description: 'Five flying creatures.', unlockTrophies: 1000, stats: { hp: 40, damage: 40, hitSpeed: 1.0, range: 3, speed: 0.9, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'prince', name: 'Prince', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🏇', color: 'bg-yellow-600', spawnCount: 1, description: 'Deals double damage when charging.', unlockTrophies: 1000, stats: { hp: 1600, damage: 325, hitSpeed: 1.4, range: 3, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000, canCharge: true } },
  { id: 'darkprince', name: 'Dark Prince', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 4, icon: '🛡️', color: 'bg-gray-800', spawnCount: 1, description: 'Deals area damage and has a shield that absorbs damage. Charges!', unlockTrophies: 1000, stats: { hp: 1000, shieldHp: 200, damage: 200, hitSpeed: 1.3, range: 2.5, radius: 3, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000, canCharge: true } },

  // --- ARENA 6 ---
  { id: 'golem', name: 'Golem', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 8, icon: '🧱', color: 'bg-gray-600', spawnCount: 1, description: 'Slow but extremely durable.', unlockTrophies: 1400, stats: { hp: 3200, damage: 180, hitSpeed: 2.5, range: 4.5, speed: 0.26, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 3000 } },
  { id: 'sparky', name: 'Sparky', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 6, icon: '🔋', color: 'bg-yellow-700', spawnCount: 1, description: 'Obliterates everything.', unlockTrophies: 1400, stats: { hp: 1200, damage: 1000, hitSpeed: 4.0, range: 13.5, radius: 6, speed: 0.39, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'battleram', name: 'Battle Ram', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🐏', color: 'bg-orange-200', spawnCount: 1, description: 'Two Barbarians holding a big log.', unlockTrophies: 1400, stats: { hp: 700, damage: 250, hitSpeed: 1.0, range: 4.5, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000, canCharge: true } },
  { id: 'flyingmachine', name: 'Flying Machine', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🚁', color: 'bg-red-200', spawnCount: 1, description: 'A flying cannon on wings.', unlockTrophies: 1400, stats: { hp: 400, damage: 140, hitSpeed: 1.0, range: 18, speed: 0.7, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'miner', name: 'Miner', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 3, icon: '⛏️', color: 'bg-stone-600', spawnCount: 1, description: 'Burrows underground. Place anywhere.', unlockTrophies: 1400, stats: { hp: 1000, damage: 160, hitSpeed: 1.2, range: 2, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000, canPlaceAnywhere: true } },
  
  // --- ARENA 7 ---
  { id: 'megaminion', name: 'Mega Minion', type: CardType.TROOP, rarity: Rarity.RARE, cost: 3, icon: '👾', color: 'bg-indigo-600', spawnCount: 1, description: 'Flying, armored, and hits hard.', unlockTrophies: 1700, stats: { hp: 700, damage: 260, hitSpeed: 1.6, range: 6, speed: 0.52, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'royalgiant', name: 'Royal Giant', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 6, icon: '🤴', color: 'bg-blue-700', spawnCount: 1, description: 'Wrecks buildings from a distance.', unlockTrophies: 1700, stats: { hp: 2400, damage: 250, hitSpeed: 1.7, range: 15, speed: 0.39, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },
  { id: 'elitebarbarians', name: 'Elite Barbarians', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 6, icon: '🔱', color: 'bg-orange-500', spawnCount: 2, description: 'Faster, stronger, and angrier Barbarians.', unlockTrophies: 1700, stats: { hp: 900, damage: 300, hitSpeed: 1.4, range: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'guards', name: 'Guards', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 3, icon: '🛡️', color: 'bg-purple-800', spawnCount: 3, description: 'Shielded skeletons. Knock off their shields and all that is left are three ruthless bone brothers.', unlockTrophies: 1700, stats: { hp: 90, shieldHp: 200, damage: 100, hitSpeed: 1.0, range: 6, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },

  // --- ARENA 8 ---
  { id: 'icespirit', name: 'Ice Spirit', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 1, icon: '❄️', color: 'bg-cyan-300', spawnCount: 1, description: 'Jumps on enemies to freeze them.', unlockTrophies: 2000, stats: { hp: 190, damage: 90, hitSpeed: 0, range: 7.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'freeze', name: 'Freeze', type: CardType.SPELL, rarity: Rarity.EPIC, cost: 4, icon: '❄️', color: 'bg-cyan-400', spawnCount: 1, description: 'Freezes troops and buildings. Deals small damage.', unlockTrophies: 2000, stats: { hp: 0, damage: 100, hitSpeed: 0, range: 0, radius: 15, speed: 0, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 200 } },
  { id: 'log', name: 'The Log', type: CardType.SPELL, rarity: Rarity.LEGENDARY, cost: 2, icon: '🪵', color: 'bg-amber-800', spawnCount: 1, description: 'Rolls through everything.', unlockTrophies: 2000, stats: { hp: 0, damage: 240, hitSpeed: 0, range: 0, radius: 10, speed: 0, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 100 } },
  { id: 'icegolem', name: 'Ice Golem', type: CardType.TROOP, rarity: Rarity.RARE, cost: 2, icon: '⛄', color: 'bg-cyan-100', spawnCount: 1, description: 'Tough, slow, and targets buildings.', unlockTrophies: 2000, stats: { hp: 1000, damage: 70, hitSpeed: 2.5, range: 4.5, speed: 0.39, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },
  { id: 'bowler', name: 'Bowler', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🎳', color: 'bg-violet-700', spawnCount: 1, description: 'Rolls large rocks at enemies.', unlockTrophies: 2000, stats: { hp: 1400, damage: 240, hitSpeed: 2.5, range: 15, radius: 4.5, speed: 0.39, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'megaknight', name: 'Mega Knight', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 7, icon: '👹', color: 'bg-gray-900', spawnCount: 1, description: 'He lands with the force of 1,000 mustaches.', unlockTrophies: 2000, stats: { hp: 3300, damage: 240, hitSpeed: 1.7, range: 3, radius: 6, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 2000 } },

  // --- ARENA 9 ---
  { id: 'dartgoblin', name: 'Dart Goblin', type: CardType.TROOP, rarity: Rarity.RARE, cost: 3, icon: '🎯', color: 'bg-green-700', spawnCount: 1, description: 'Runs fast, shoots far, chews gum.', unlockTrophies: 2300, stats: { hp: 216, damage: 90, hitSpeed: 0.7, range: 19.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'vines', name: 'Vines', type: CardType.SPELL, rarity: Rarity.EPIC, cost: 3, icon: '🌿', color: 'bg-emerald-800', spawnCount: 1, description: 'Roots enemies in place and deals damage.', unlockTrophies: 2300, stats: { hp: 0, damage: 180, hitSpeed: 0, range: 0, radius: 12.5, speed: 0, movementType: MovementType.AIR, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'executioner', name: 'Executioner', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🪓', color: 'bg-purple-900', spawnCount: 1, description: 'Throws his axe like a boomerang.', unlockTrophies: 2300, stats: { hp: 1000, damage: 280, hitSpeed: 2.4, range: 13.5, radius: 4.5, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  
  // --- ARENA 10 ---
  { id: 'royalhogs', name: 'Royal Hogs', type: CardType.TROOP, rarity: Rarity.RARE, cost: 5, icon: '🐖', color: 'bg-orange-300', spawnCount: 4, description: 'Hogs jumping over the river.', unlockTrophies: 2600, stats: { hp: 700, damage: 70, hitSpeed: 1.2, range: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.BUILDING, isBuilding: false, deployTime: 1000 } },
  { id: 'cannoncart', name: 'Cannon Cart', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🛒', color: 'bg-gray-700', spawnCount: 1, description: 'A cannon on wheels.', unlockTrophies: 2600, stats: { hp: 800, damage: 200, hitSpeed: 1.2, range: 15, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },

  // --- ARENA 11 ---
  { id: 'electrowizard', name: 'Electro Wizard', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 4, icon: '⚡', color: 'bg-blue-500', spawnCount: 1, description: 'Shoots lightning with both hands.', unlockTrophies: 3000, stats: { hp: 600, damage: 200, hitSpeed: 1.8, range: 15, radius: 3, speed: 0.7, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'zappies', name: 'Zappies', type: CardType.TROOP, rarity: Rarity.RARE, cost: 4, icon: '🔋', color: 'bg-cyan-200', spawnCount: 3, description: 'Pack of miniature Zap machines.', unlockTrophies: 3000, stats: { hp: 440, damage: 70, hitSpeed: 2.0, range: 13.5, speed: 0.52, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'electrodragon', name: 'Electro Dragon', type: CardType.TROOP, rarity: Rarity.EPIC, cost: 5, icon: '🐉', color: 'bg-blue-400', spawnCount: 1, description: 'Spits bolts of electricity.', unlockTrophies: 3000, stats: { hp: 800, damage: 150, hitSpeed: 2.1, range: 10.5, radius: 4.5, speed: 0.52, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'electrospirit', name: 'Electro Spirit', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 1, icon: '⚡', color: 'bg-cyan-400', spawnCount: 1, description: 'Jumps and zaps enemies.', unlockTrophies: 3000, stats: { hp: 190, damage: 80, hitSpeed: 0, range: 7.5, radius: 4.5, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },

  // --- ARENA 12 ---
  { id: 'royalghost', name: 'Royal Ghost', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 3, icon: '👻', color: 'bg-indigo-300', spawnCount: 1, description: 'He drifts invisibly through the arena.', unlockTrophies: 3300, stats: { hp: 1000, damage: 210, hitSpeed: 1.8, range: 3, radius: 4.5, speed: 0.65, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'skeletondragons', name: 'Skeleton Dragons', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 4, icon: '☠️', color: 'bg-gray-400', spawnCount: 2, description: 'Fragile flying units that deal area damage.', unlockTrophies: 3300, stats: { hp: 440, damage: 140, hitSpeed: 1.7, range: 10.5, radius: 3, speed: 0.7, movementType: MovementType.AIR, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },

  // --- ARENA 13 ---
  { id: 'magicarcher', name: 'Magic Archer', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 4, icon: '🏹', color: 'bg-teal-600', spawnCount: 1, description: 'Shoots a magic arrow that passes through enemies.', unlockTrophies: 3600, stats: { hp: 490, damage: 110, hitSpeed: 1.1, range: 21, radius: 2, speed: 0.65, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } },
  { id: 'bandit', name: 'Bandit', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 3, icon: '🥷', color: 'bg-green-800', spawnCount: 1, description: 'Dashes to her target.', unlockTrophies: 3600, stats: { hp: 750, damage: 160, hitSpeed: 1.0, range: 3, speed: 0.9, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000, canCharge: true } },

  // --- ARENA 14 ---
  { id: 'lumberjack', name: 'Lumberjack', type: CardType.TROOP, rarity: Rarity.LEGENDARY, cost: 4, icon: '🪵', color: 'bg-purple-800', spawnCount: 1, description: 'He chops trees by day and hunts The Log by night.', unlockTrophies: 4000, stats: { hp: 1000, damage: 200, hitSpeed: 0.8, range: 3, speed: 1.0, movementType: MovementType.GROUND, targets: TargetType.GROUND, isBuilding: false, deployTime: 1000 } },
  { id: 'firecracker', name: 'Firecracker', type: CardType.TROOP, rarity: Rarity.COMMON, cost: 3, icon: '🎆', color: 'bg-pink-600', spawnCount: 1, description: 'Shoots a firecracker that bursts on impact.', unlockTrophies: 4000, stats: { hp: 250, damage: 150, hitSpeed: 3.0, range: 6, radius: 6, speed: 0.65, movementType: MovementType.GROUND, targets: TargetType.ALL, isBuilding: false, deployTime: 1000 } }
];

export const generateAiDeck = (playerTrophies: number): string[] => {
    const trophyLimit = playerTrophies;
    const availableCards = CARDS.filter(c => c.unlockTrophies <= trophyLimit);
    
    if (availableCards.length < 8) {
        return ['knight', 'archers', 'goblins', 'giant', 'minions', 'arrows', 'fireball', 'musketeer'];
    }

    const deck: string[] = [];
    const tanks = availableCards.filter(c => c.stats.hp > 1500 && c.type === CardType.TROOP);
    const spells = availableCards.filter(c => c.type === CardType.SPELL);
    const troops = availableCards.filter(c => c.type === CardType.TROOP && c.stats.hp <= 1500);
    const buildings = availableCards.filter(c => c.type === CardType.BUILDING);

    if (tanks.length > 0) {
        deck.push(tanks[Math.floor(Math.random() * tanks.length)].id);
    } else {
        deck.push(troops[Math.floor(Math.random() * troops.length)].id);
    }

    if (spells.length > 0) {
        deck.push(spells[Math.floor(Math.random() * spells.length)].id);
        if (spells.length > 1) {
             let secondSpell = spells[Math.floor(Math.random() * spells.length)];
             while(secondSpell.id === deck[deck.length-1] && spells.length > 1) {
                 secondSpell = spells[Math.floor(Math.random() * spells.length)];
             }
             deck.push(secondSpell.id);
        }
    }

    while (deck.length < 8) {
        const pool = [...troops, ...buildings];
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        if (!deck.includes(randomCard.id)) {
            deck.push(randomCard.id);
        }
    }

    return deck;
};
