
export enum PlayerSide {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY'
}

export enum CardType {
  TROOP = 'TROOP',
  BUILDING = 'BUILDING',
  SPELL = 'SPELL',
  TOWER = 'TOWER'
}

export enum MovementType {
  GROUND = 'GROUND',
  AIR = 'AIR'
}

export enum TargetType {
  GROUND = 'GROUND',
  AIR = 'AIR',
  BUILDING = 'BUILDING',
  ALL = 'ALL'
}

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum RewardType {
  GOLD = 'GOLD',
  GEMS = 'GEMS',
  CHEST = 'CHEST',
  CARD = 'CARD',
  EMOTE = 'EMOTE'
}

export type ChestType = 'SILVER' | 'GOLDEN' | 'MAGICAL' | 'MYSTERY';
export type GameMode = 'STANDARD' | 'TRIPLE_ELIXIR' | 'SUDDEN_DEATH' | 'MIRROR' | 'RAGE';
export type MultiplayerRole = 'HOST' | 'GUEST' | 'NONE';

export interface UnitStats {
  hp: number;
  damage: number;
  hitSpeed: number;
  range: number;
  speed: number;
  movementType: MovementType;
  targets: TargetType;
  isBuilding: boolean;
  deployTime: number;
  shieldHp?: number;
  radius?: number;
  canCharge?: boolean;
  canPlaceAnywhere?: boolean;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  icon: string;
  spawnCount: number;
  color: string;
  description: string;
  unlockTrophies: number;
  stats: UnitStats;
}

export interface ArenaDef {
  id: number;
  name: string;
  minTrophies: number;
  icon: string;
  color: string;
}

export interface GameEntity {
  id: string;
  defId: string;
  type: CardType;
  side: PlayerSide;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  stats: UnitStats;
  level: number;
  lastAttackTime: number;
  lastDamageTime: number;
  lastSpawnTime: number;
  targetId: string | null;
  state: 'IDLE' | 'MOVING' | 'ATTACKING' | 'CASTING';
  deployTimer: number;
  frozenTimer: number;
  stunTimer: number;
  rageTimer: number;
  rootTimer: number;
  chargeTimer: number;
  isCharging: boolean;
  isInvisible?: boolean;
  invisibleTimer?: number;
}

export interface GameProjectile {
  id: string;
  visualType: string;
  startX: number;
  startY: number;
  destX: number;
  destY: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  targetId: string | null;
  damage: number;
  areaRadius: number;
  ownerSide: PlayerSide;
  arcHeight?: number;
  effect?: 'FREEZE' | 'POISON' | 'RAGE' | 'LOG' | 'GOBLIN_BARREL';
}

export interface GameParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  createdAt: number;
  duration: number;
  type: 'hit' | 'explosion' | 'spawn';
}

export interface ActiveEmote {
  id: string;
  side: PlayerSide;
  content: string;
  createdAt: number;
}

export interface GameState {
  entities: GameEntity[];
  projectiles: GameProjectile[];
  particles: GameParticle[];
  playerElixir: number;
  enemyElixir: number;
  gameTime: number;
  gameOver: boolean;
  winner: PlayerSide | null;
  activeEmotes: ActiveEmote[];
  kingLevel: number;
  playerCrowns: number;
  enemyCrowns: number;
  phase: 'REGULAR' | 'OVERTIME' | 'TIEBREAKER';
  trophyChange?: number;
  aiHand: string[];
  aiDeckCycle: string[];
  aiNextMoveTime: number;
  gameMode: GameMode;
}

export interface PlayerCollection {
  [cardId: string]: {
    level: number;
    count: number;
  };
}

export interface UpgradeCost {
  cards: number;
  gold: number;
  xp: number;
}

export interface TrophyReward {
  id: string;
  trophies: number;
  type: RewardType;
  amount?: number;
  chestType?: ChestType;
  chestLevel?: number;
  emote?: string;
}

export interface KingReward {
  level: number;
  type: RewardType;
  amount?: number;
  chestType?: ChestType;
  chestLevel?: number;
  emote?: string;
}

export interface BattlePassTier {
  tier: number;
  crownsRequired: number;
  freeReward: TrophyReward | null;
  premiumReward: TrophyReward | null;
}

export interface ShopItem {
  id: string;
  type: 'CARD' | 'EMOTE' | 'CHEST';
  cardId?: string;
  emoteContent?: string;
  chestType?: ChestType;
  chestLevel?: number;
  amount: number;
  cost: number;
  currency: 'GOLD' | 'GEMS';
  purchased: boolean;
  isFree?: boolean;
}

export interface ChestResult {
  gold: number;
  gems: number;
  cards: { def: CardDef; count: number }[];
  type: ChestType;
}

// Multiplayer Payload Types
export type MPMessage = 
  | { type: 'JOIN', name: string, level: number }
  | { type: 'START', state: GameState, opponentName: string, opponentLevel: number, arenaId: number, deck?: string[] }
  | { type: 'INPUT', action: 'PLACE_CARD', cardId: string, x: number, y: number, level: number }
  | { type: 'INPUT', action: 'EMOTE', content: string }
  | { type: 'UPDATE', state: GameState }
  | { type: 'GAME_OVER', winner: PlayerSide | null };
