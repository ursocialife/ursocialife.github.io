
import { CARDS, DEFAULT_EMOTES, SHOP_EMOTES, getSpawnPattern, calculateStats } from '../constants';
import { GameEntity, PlayerSide, GameState, CardType, MovementType, TargetType } from '../types';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface AiResult {
    newEntities: GameEntity[];
    emote?: string;
    elixirSpent: number;
    updatedHand?: string[];
    updatedCycle?: string[];
}

export const processAiTurn = (gameState: GameState, playerTrophies: number): AiResult => {
  if (gameState.gameOver) return { newEntities: [], elixirSpent: 0 };

  const newEntities: GameEntity[] = [];
  let emote: string | undefined = undefined;
  let elixirSpent = 0;
  
  let updatedHand = gameState.aiHand ? [...gameState.aiHand] : [];
  let updatedCycle = gameState.aiDeckCycle ? [...gameState.aiDeckCycle] : [];

  if (updatedHand.length === 0) {
      // Fallback deck consisting strictly of Arena 0 (Training Camp) cards
      const fallbackDeck = ['knight', 'archers', 'goblins', 'giant', 'minions', 'arrows', 'fireball', 'musketeer'];
      updatedHand = fallbackDeck.slice(0, 4);
      updatedCycle = fallbackDeck.slice(4);
  }

  const now = Date.now();

  // Difficulty Scaling
  const difficulty = Math.min(1, Math.max(0, playerTrophies / 5000));
  
  // AI Card Level Calculation
  const aiLevel = Math.max(1, Math.min(13, Math.floor(playerTrophies / 500) + 1));

  if (now < gameState.aiNextMoveTime) {
      return { newEntities: [], elixirSpent: 0 };
  }

  let cardToPlayId: string | null = null;
  let playX = 50;
  let playY = 20;

  const threats = gameState.entities.filter(e => 
      e.side === PlayerSide.PLAYER && 
      e.hp > 0 && 
      e.deployTimer === 0 && // Ignored if still deploying
      e.y < 60
  );

  threats.sort((a, b) => a.y - b.y);

  const handCards = updatedHand.map(id => CARDS.find(c => c.id === id)).filter(Boolean) as typeof CARDS;

  // 1. DEFENSE
  if (threats.length > 0) {
      const threat = threats[0];
      const distToTower = threat.y;

      if (distToTower < 30 || gameState.enemyElixir > 6) {
          let bestCounter = handCards.find(c => {
              if (threat.stats.movementType === MovementType.AIR && c.stats.targets === TargetType.GROUND) return false;
              if (threat.stats.hp > 1000 && c.spawnCount > 1) return true;
              if (threat.defId === 'valkyrie' && c.spawnCount > 1) return false;
              return c.cost <= gameState.enemyElixir;
          });

          if (!bestCounter) bestCounter = handCards.find(c => c.cost <= gameState.enemyElixir);

          if (bestCounter) {
              cardToPlayId = bestCounter.id;
              
              if (bestCounter.type === CardType.SPELL) {
                  playX = threat.x;
                  playY = threat.y;
              } else if (bestCounter.type === CardType.BUILDING) {
                  const pullStrength = difficulty > 0.4 ? 10 : 5;
                  playX = 50 + (threat.x > 50 ? -pullStrength : pullStrength); 
                  playY = 25;
              } else {
                  if (difficulty > 0.6 && !bestCounter.stats.isBuilding && !bestCounter.stats.movementType) {
                      playX = 50 + (threat.x > 50 ? -10 : 10);
                      playY = 25;
                  } else {
                      playX = threat.x;
                      playY = threat.y - 5; 
                  }
              }
          }
      }
  }

  // 2. OFFENSE
  if (!cardToPlayId) {
      const aggressionChance = 0.02 + (difficulty * 0.1); 
      const minElixirToPush = difficulty > 0.5 ? 6 : 9;

      if (gameState.enemyElixir >= 9.5 || (gameState.enemyElixir >= minElixirToPush && Math.random() < aggressionChance)) {
          let offenseCard = handCards.find(c => c.stats.targets === TargetType.BUILDING && c.cost <= gameState.enemyElixir);
          if (!offenseCard) offenseCard = handCards.find(c => c.stats.hp > 800 && c.cost <= gameState.enemyElixir);
          if (!offenseCard) offenseCard = handCards.find(c => c.cost <= 3);

          if (offenseCard) {
              cardToPlayId = offenseCard.id;
              const existingUnits = gameState.entities.filter(e => e.side === PlayerSide.ENEMY && e.hp > 0);
              let laneX = 20; 
              
              if (existingUnits.length > 0 && Math.random() < (0.5 + difficulty * 0.4)) {
                  const leader = existingUnits[0];
                  laneX = leader.x > 50 ? 80 : 20;
              } else {
                  laneX = Math.random() > 0.5 ? 20 : 80;
              }

              playX = laneX;
              
              if (offenseCard.stats.hp > 1000 && gameState.enemyElixir < 10) {
                  playY = 5;
              } else {
                  playY = 35;
              }
          }
      }
  }

  // Execute Play
  if (cardToPlayId) {
      const cardDef = CARDS.find(c => c.id === cardToPlayId);
      
      if (cardDef && gameState.enemyElixir >= cardDef.cost) {
          const jitterAmount = (1 - difficulty) * 4; 
          playX += (Math.random() - 0.5) * 2 * jitterAmount;
          playY += (Math.random() - 0.5) * 2 * jitterAmount;

          playX = Math.max(5, Math.min(95, playX));
          playY = Math.max(5, Math.min(45, playY)); 

          if (cardDef.type === CardType.SPELL) {
              if (!threats.length) {
                  playY = 85; 
                  playX = Math.random() > 0.5 ? 20 : 80;
                  if (Math.random() > (0.5 + difficulty * 0.5)) {
                      playX += (Math.random() - 0.5) * 10;
                      playY += (Math.random() - 0.5) * 10;
                  }
              }
          }

          elixirSpent = cardDef.cost;

          // Spawn Units
          const scaledStats = calculateStats(cardDef.stats, aiLevel);
          const spawnCount = cardDef.spawnCount;
          const offsets = getSpawnPattern(spawnCount);

          for (let i = 0; i < spawnCount; i++) {
              let spawnX = playX + offsets[i].x;
              let spawnY = playY + offsets[i].y;
              
              spawnX = Math.max(2, Math.min(98, spawnX));
              
              const isSpell = cardDef.type === CardType.SPELL;
              const initialHp = isSpell ? 1 : scaledStats.hp;

              newEntities.push({
                  id: simpleId(),
                  defId: cardDef.id,
                  type: cardDef.type,
                  side: PlayerSide.ENEMY,
                  x: spawnX,
                  y: spawnY,
                  hp: initialHp,
                  maxHp: initialHp,
                  shieldHp: scaledStats.shieldHp || 0,
                  maxShieldHp: scaledStats.shieldHp || 0,
                  stats: scaledStats,
                  level: aiLevel, // Assign Level
                  lastAttackTime: 0,
                  lastDamageTime: 0,
                  lastSpawnTime: 0,
                  targetId: null,
                  state: isSpell ? 'CASTING' : 'IDLE',
                  deployTimer: cardDef.stats.deployTime + (i * 50),
                  frozenTimer: 0,
                  stunTimer: 0,
                  rageTimer: 0,
                  rootTimer: 0,
                  chargeTimer: 0,
                  isCharging: false
              });
          }

          const cardIdx = updatedHand.indexOf(cardToPlayId);
          if (cardIdx > -1) {
              const [nextCard] = updatedCycle;
              const newCycle = [...updatedCycle.slice(1), cardToPlayId];
              updatedHand = [...updatedHand];
              updatedHand[cardIdx] = nextCard;
              updatedCycle = newCycle;
          }
      } else {
          elixirSpent = 0;
      }
  }

  const emoteChance = 0.001 + (difficulty * 0.002);
  if (Math.random() < emoteChance) {
      const allEmotes = [...DEFAULT_EMOTES, ...SHOP_EMOTES];
      emote = allEmotes[Math.floor(Math.random() * allEmotes.length)];
  }

  return { 
      newEntities, 
      emote, 
      elixirSpent, 
      updatedHand: elixirSpent > 0 ? updatedHand : undefined, 
      updatedCycle: elixirSpent > 0 ? updatedCycle : undefined 
  };
};
