
import { GameState, PlayerSide, CardType, GameEntity, GameProjectile } from '../types';
import { BRIDGE_LEFT_X, BRIDGE_RIGHT_X, getSpawnPattern, calculateStats, CARDS, EMOTE_DURATION } from '../constants';

// Utility: Calculate distance between two entities
const getDistance = (e1: {x: number, y: number}, e2: {x: number, y: number}) => {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
};

// Utility: Get Hitbox Radius
const getHitboxRadius = (e: GameEntity) => {
    return e.stats.isBuilding ? 3.5 : 1.5;
};

// Generate simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mass Definition for Physics
const getMass = (entity: GameEntity): number => {
    if (entity.stats.isBuilding) return Infinity;
    if (entity.defId.includes('golem') || entity.defId === 'pekka' || entity.defId === 'megaknight' || entity.defId === 'giant' || entity.defId === 'royalgiant') return 3.0;
    if (entity.defId === 'knight' || entity.defId === 'valkyrie' || entity.defId === 'prince' || entity.defId === 'hogrider' || entity.defId === 'bowler') return 1.5;
    return 0.5;
};

// Helper: Spawn Units (used for spawners and death spawns)
const spawnUnits = (
    defId: string, 
    count: number, 
    side: PlayerSide, 
    x: number, 
    y: number, 
    level: number, 
    targetArray: GameEntity[]
) => {
    const cardDef = CARDS.find(c => c.id === defId);
    if (!cardDef) return;
    
    const stats = calculateStats(cardDef.stats, level);
    const offsets = getSpawnPattern(count);
    
    offsets.forEach((off, i) => {
        targetArray.push({
            id: generateId(),
            defId: defId,
            type: CardType.TROOP,
            side: side,
            x: Math.max(2, Math.min(98, x + off.x)),
            y: Math.max(2, Math.min(98, y + off.y)),
            hp: stats.hp,
            maxHp: stats.hp,
            shieldHp: stats.shieldHp || 0,
            maxShieldHp: stats.shieldHp || 0,
            stats: stats,
            level: level,
            lastAttackTime: 0,
            lastDamageTime: 0,
            lastSpawnTime: 0,
            targetId: null,
            state: 'IDLE',
            deployTimer: 500 + (i * 100),
            frozenTimer: 0,
            stunTimer: 0,
            rageTimer: 0,
            rootTimer: 0,
            chargeTimer: 0,
            isCharging: false
        });
    });
};

// Helper: Calculate avoidance vector for ground units against buildings
const getAvoidanceVector = (entity: GameEntity, entities: GameEntity[]) => {
    let avoidX = 0;
    let avoidY = 0;
    
    if (entity.stats.movementType !== 'GROUND') return { x: 0, y: 0 };

    entities.forEach(other => {
        if (other.id === entity.id) return;
        if (!other.stats.isBuilding) return; // Only avoid buildings
        if (other.hp <= 0) return;

        const dist = getDistance(entity, other);
        const radiusSum = getHitboxRadius(entity) + getHitboxRadius(other);
        const avoidanceRange = radiusSum + 2.5; // Look ahead/around buffer

        if (dist < avoidanceRange) {
            let pushX = entity.x - other.x;
            let pushY = entity.y - other.y;
            const pushLen = Math.sqrt(pushX*pushX + pushY*pushY);
            
            if (pushLen > 0) {
                // Stronger weight when closer
                const weight = 3.5 * (1 - (dist / avoidanceRange));
                avoidX += (pushX / pushLen) * weight;
                avoidY += (pushY / pushLen) * weight;
            }
        }
    });
    
    return { x: avoidX, y: avoidY };
};

export const updateGame = (state: GameState, dt: number): GameState => {
    // 1. Time & Elixir
    let newGameTime = state.gameTime - (dt / 1000);
    const now = Date.now();
    
    // Filter Expired Emotes
    const activeEmotes = state.activeEmotes.filter(e => now - e.createdAt < EMOTE_DURATION);

    let gameOver = state.gameOver;
    let winner = state.winner;
    let phase = state.phase;

    if (newGameTime <= 0 && !gameOver) {
        if (phase === 'REGULAR') {
            if (state.playerCrowns !== state.enemyCrowns) {
                gameOver = true;
                winner = state.playerCrowns > state.enemyCrowns ? PlayerSide.PLAYER : PlayerSide.ENEMY;
            } else {
                phase = 'OVERTIME';
                newGameTime = 120;
            }
        } else if (phase === 'OVERTIME') {
             if (state.playerCrowns !== state.enemyCrowns) {
                gameOver = true;
                winner = state.playerCrowns > state.enemyCrowns ? PlayerSide.PLAYER : PlayerSide.ENEMY;
            } else {
                phase = 'TIEBREAKER';
                newGameTime = 0;
                gameOver = true;
                winner = null; 
            }
        }
    }

    // Elixir Calculation based on Game Mode
    let speedMult = 1;
    if (state.gameMode === 'TRIPLE_ELIXIR') {
        speedMult = 3;
    } else if (state.gameMode === 'SUDDEN_DEATH') {
        // Sudden Death starts in Overtime conditions usually (2x elixir)
        speedMult = 2;
    } else {
        // Standard Ladder
        const isDoubleElixir = (phase === 'REGULAR' && newGameTime <= 60) || phase !== 'REGULAR';
        speedMult = isDoubleElixir ? 2 : 1;
    }

    const elixirRate = speedMult * (dt / 2800); 
    const newPlayerElixir = Math.min(10, state.playerElixir + elixirRate);
    const newEnemyElixir = Math.min(10, state.enemyElixir + elixirRate);

    // 2. Process Entities
    let newEntities: GameEntity[] = [];
    const newProjectiles = state.projectiles.map(p => ({ ...p }));
    const newParticles = state.particles.map(p => ({ ...p })).filter(p => Date.now() - p.createdAt < p.duration);

    state.entities.forEach(entity => {
        // Handle Death (except spells which manage their own life)
        if (entity.hp <= 0 && entity.type !== CardType.SPELL) {
            // Death Spawn Logic
            if (entity.defId === 'tombstone') {
                spawnUnits('skeletons', 4, entity.side, entity.x, entity.y, entity.level, newEntities);
            } else if (entity.defId === 'goblin_hut') {
                spawnUnits('spear_goblins', 1, entity.side, entity.x, entity.y, entity.level, newEntities);
            }
            return;
        }

        // Deploy Timer
        if (entity.deployTimer > 0) {
            entity.deployTimer = Math.max(0, entity.deployTimer - dt);
            if (entity.deployTimer === 0 && entity.type !== CardType.SPELL) {
                entity.lastAttackTime = now;
                // If it's a spawner, set the lastSpawnTime to now so it waits a full cycle before first spawn
                entity.lastSpawnTime = now;
                newParticles.push({id: generateId(), x: entity.x, y: entity.y, type: 'spawn', color: '#ffffff', size: 5, createdAt: now, duration: 500});
            }
        }

        // --- SPELL EXECUTION LOGIC ---
        if (entity.type === CardType.SPELL && entity.deployTimer <= 0) {
             // IMPACT SPELLS: Arrows, Fireball, Rocket, Snowball
             // The visual travel is handled by GameCanvas/EntityComponent during deployTimer. 
             // When deployTimer ends, the effect is instantaneous.
             if (['fireball', 'arrows', 'rocket', 'snowball'].includes(entity.defId)) {
                 const radius = entity.stats.radius || 2.5;
                 
                 // Apply AoE Damage
                 state.entities.forEach(t => {
                     // Check overlap: Distance <= Spell Radius + Target Hitbox (buildings are bigger)
                     const hitRadius = getHitboxRadius(t);
                     if (t.hp > 0 && t.side !== entity.side && getDistance(entity, t) <= (radius + hitRadius)) {
                         let damage = entity.stats.damage;
                         if (t.type === CardType.TOWER) damage *= 0.35; // Reduced damage to towers

                         // Apply damage to the correct instance
                         // Check if 't' has already been processed and moved to newEntities
                         const processedEntity = newEntities.find(e => e.id === t.id);
                         if (processedEntity) {
                             processedEntity.hp -= damage;
                             if (entity.defId === 'snowball') processedEntity.frozenTimer = 1000;
                         } else {
                             // Not processed yet, modify source (will be cloned later in this loop)
                             t.hp -= damage;
                             if (entity.defId === 'snowball') t.frozenTimer = 1000;
                         }
                     }
                 });

                 // Visuals
                 if (entity.defId === 'arrows') {
                     // Multiple small impacts
                     for(let k=0; k<5; k++) {
                         newParticles.push({
                             id: generateId(), 
                             x: entity.x + (Math.random()-0.5)*radius*1.5, 
                             y: entity.y + (Math.random()-0.5)*radius*1.5, 
                             type: 'hit', color: '#cbd5e1', size: 2, createdAt: now, duration: 300
                         });
                     }
                 } else {
                     // Single Big Explosion
                     const color = entity.defId === 'fireball' ? '#f97316' : (entity.defId === 'rocket' ? '#ef4444' : '#e0f2fe');
                     newParticles.push({
                         id: generateId(), 
                         x: entity.x, 
                         y: entity.y, 
                         type: 'explosion', 
                         color: color, 
                         size: radius * 2, 
                         createdAt: now, 
                         duration: 300
                     });
                 }
                 entity.hp = 0; // Consume spell
             }
             // GOBLIN BARREL
             else if (entity.defId === 'goblinbarrel') {
                 const offsets = getSpawnPattern(3);
                 const stats = calculateStats(CARDS.find(c => c.id === 'goblins')!.stats, 9); 
                 offsets.forEach((off, idx) => {
                    newEntities.push({
                        id: generateId(), defId: 'goblins', type: CardType.TROOP, side: entity.side,
                        x: entity.x + off.x, y: entity.y + off.y,
                        hp: stats.hp, maxHp: stats.hp, shieldHp: 0, maxShieldHp: 0,
                        stats: stats, level: 9, lastAttackTime: 0, lastDamageTime: 0, lastSpawnTime: 0,
                        targetId: null, state: 'IDLE', deployTimer: 500, frozenTimer: 0, stunTimer: 0, rageTimer: 0, rootTimer: 0, chargeTimer: 0, isCharging: false
                    });
                 });
                 newParticles.push({id: generateId(), x: entity.x, y: entity.y, type: 'explosion', color: '#4ade80', size: 10, createdAt: now, duration: 300});
                 entity.hp = 0;
             }
             // ZAP (Instant)
             else if (entity.defId === 'zap') {
                 const radius = entity.stats.radius || 2.5;
                 state.entities.forEach(t => {
                     const hitRadius = getHitboxRadius(t);
                     if (t.hp > 0 && t.side !== entity.side && getDistance(entity, t) <= (radius + hitRadius)) {
                         let damage = entity.stats.damage;
                         if (t.type === CardType.TOWER) damage *= 0.35;

                         const processedEntity = newEntities.find(e => e.id === t.id);
                         if (processedEntity) {
                             processedEntity.hp -= damage;
                             processedEntity.stunTimer = 500;
                             newParticles.push({id: generateId(), x: t.x, y: t.y, type: 'hit', color: '#0ea5e9', size: 3, createdAt: now, duration: 300});
                         } else {
                             t.hp -= damage;
                             t.stunTimer = 500;
                             newParticles.push({id: generateId(), x: t.x, y: t.y, type: 'hit', color: '#0ea5e9', size: 3, createdAt: now, duration: 300});
                         }
                     }
                 });
                 newParticles.push({id: generateId(), x: entity.x, y: entity.y, type: 'explosion', color: '#0ea5e9', size: radius*2, createdAt: now, duration: 200});
                 entity.hp = 0;
             }
             // LOG (Projectile)
             else if (entity.defId === 'log') {
                 const range = entity.stats.range || 10;
                 const dirY = entity.side === PlayerSide.PLAYER ? -1 : 1;
                 newProjectiles.push({
                    id: generateId(),
                    visualType: 'log',
                    startX: entity.x, startY: entity.y,
                    destX: entity.x, destY: entity.y + (range * dirY * 3), // Visual destination
                    x: entity.x, y: entity.y,
                    targetId: null,
                    speed: 15,
                    damage: entity.stats.damage,
                    areaRadius: 2, // Width
                    ownerSide: entity.side,
                    arcHeight: 0,
                    progress: 0,
                    effect: 'LOG'
                 });
                 entity.hp = 0;
             }
             // DURATION (Poison, Rage, Freeze)
             else if (['poison', 'rage', 'freeze'].includes(entity.defId)) {
                 if (entity.hp === 1) { // Init duration (using HP as timer ticks)
                     entity.hp = 240; // ~8 seconds @ 30fps
                     entity.maxHp = 240; 
                 }
                 entity.hp -= 1; // Decrement life
                 
                 const radius = entity.stats.radius || 3.5;
                 // Apply effect periodically
                 if (entity.hp % 10 === 0 || entity.defId === 'freeze') {
                     state.entities.forEach(t => {
                         if (t.hp <= 0) return;
                         const hitRadius = getHitboxRadius(t);
                         const dist = getDistance(entity, t);
                         
                         if (dist <= (radius + hitRadius)) {
                             if (entity.defId === 'poison' && t.side !== entity.side) {
                                 const processedEntity = newEntities.find(e => e.id === t.id);
                                 let damage = entity.stats.damage / 24;
                                 if (t.type === CardType.TOWER) damage *= 0.35;

                                 if (processedEntity) processedEntity.hp -= damage;
                                 else t.hp -= damage;

                                 if(Math.random() > 0.7) newParticles.push({id: generateId(), x: t.x, y: t.y, type: 'hit', color: '#f97316', size: 1, createdAt: now, duration: 200});
                             }
                             if (entity.defId === 'freeze' && t.side !== entity.side) {
                                 const processedEntity = newEntities.find(e => e.id === t.id);
                                 if (processedEntity) processedEntity.frozenTimer = 500;
                                 else t.frozenTimer = 500;
                             }
                             if (entity.defId === 'rage' && t.side === entity.side) {
                                 const processedEntity = newEntities.find(e => e.id === t.id);
                                 if (processedEntity) processedEntity.rageTimer = 500;
                                 else t.rageTimer = 500;
                             }
                         }
                     });
                 }
             }
        }

        if (entity.hp <= 0) return; // Don't add dead entities (spells or troops)

        // Clone entity for next frame
        const nextEntity = { ...entity };
        
        // Status Effects
        if (nextEntity.frozenTimer > 0) nextEntity.frozenTimer -= dt;
        if (nextEntity.stunTimer > 0) nextEntity.stunTimer -= dt;
        if (nextEntity.rageTimer > 0) nextEntity.rageTimer -= dt;
        
        // RAGE MODE: Infinite Rage
        if (state.gameMode === 'RAGE' && nextEntity.type !== CardType.SPELL) {
            nextEntity.rageTimer = 100;
        }

        // Skip logic if deploying or stunned/frozen (unless spell)
        if (nextEntity.deployTimer > 0 || nextEntity.type === CardType.SPELL) {
            newEntities.push(nextEntity);
            return;
        }
        if (nextEntity.frozenTimer > 0 || nextEntity.stunTimer > 0) {
            newEntities.push(nextEntity);
            return;
        }

        // --- BUILDING LOGIC (Decay & Spawning) ---
        if (nextEntity.type === CardType.BUILDING) {
            // Decay
            const lifetime = 35; // Generic 35s lifetime for most buildings
            const decay = (nextEntity.maxHp / lifetime) * (dt / 1000);
            nextEntity.hp -= decay;

            // Spawner Logic
            let spawnDefId = null;
            let spawnInterval = 0;
            let spawnCount = 1;

            if (nextEntity.defId === 'goblin_hut') {
                spawnDefId = 'spear_goblins';
                spawnInterval = 4500;
            } else if (nextEntity.defId === 'tombstone') {
                spawnDefId = 'skeletons';
                spawnInterval = 3500;
            }

            if (spawnDefId && (now - nextEntity.lastSpawnTime >= spawnInterval)) {
                spawnUnits(spawnDefId, spawnCount, nextEntity.side, nextEntity.x, nextEntity.y, nextEntity.level, newEntities);
                nextEntity.lastSpawnTime = now;
            }
        }

        // --- TROOP AI (Targeting & Movement) ---
        // 1. Acquire Target
        const enemies = state.entities.filter(e => e.side !== nextEntity.side && e.hp > 0 && e.deployTimer <= 0 && !e.isInvisible);
        let target = enemies.find(e => e.id === nextEntity.targetId);

        // Validation & Switching
        if (target) {
             const dist = getDistance(nextEntity, target);
             const reach = nextEntity.stats.range + getHitboxRadius(target) + getHitboxRadius(nextEntity) - 0.5;
             
             // Buildings (Towers) should not stick to targets outside their range
             if (nextEntity.stats.isBuilding && dist > reach) {
                 target = undefined;
                 nextEntity.targetId = null;
             }
             else if (target.type === CardType.TOWER && nextEntity.stats.targets !== 'BUILDING') {
                 // Switch if tower targeted but troop is closer
                 let closerThreat = enemies.find(e => e.type !== CardType.TOWER && getDistance(nextEntity, e) < 6 && getDistance(nextEntity, e) < dist);
                 if (closerThreat && ((nextEntity.stats.targets === 'GROUND' && closerThreat.stats.movementType === 'GROUND') || nextEntity.stats.targets === 'ALL')) {
                     target = closerThreat;
                     nextEntity.targetId = closerThreat.id;
                 }
             }
        } 
        
        if (!target) {
            // Find new target
            let bestTarget = null;
            let minDist = Infinity;
            
            enemies.forEach(e => {
                if (nextEntity.stats.targets === 'BUILDING' && !e.stats.isBuilding) return;
                if (nextEntity.stats.targets === 'GROUND' && e.stats.movementType === 'AIR') return;
                
                // If I am a building (Tower), I can only target things within my range
                if (nextEntity.stats.isBuilding) {
                    const reach = nextEntity.stats.range + getHitboxRadius(e) + getHitboxRadius(nextEntity) - 0.5;
                    const d = getDistance(nextEntity, e);
                    if (d > reach) return; // Skip out of range for buildings
                    if (d < minDist) {
                        minDist = d;
                        bestTarget = e;
                    }
                } else {
                    const d = getDistance(nextEntity, e);
                    if (d < minDist) {
                        minDist = d;
                        bestTarget = e;
                    }
                }
            });

            // Default to King/Princess if nothing found AND we are mobile
            if (!bestTarget && !nextEntity.stats.isBuilding && (nextEntity.stats.targets === 'ALL' || nextEntity.stats.targets === 'BUILDING')) {
                 const towers = enemies.filter(e => e.type === CardType.TOWER);
                 towers.forEach(t => {
                     const d = getDistance(nextEntity, t);
                     if (d < minDist) {
                         minDist = d;
                         bestTarget = t;
                     }
                 });
            }
            
            if (bestTarget) {
                target = bestTarget;
                nextEntity.targetId = bestTarget.id;
            }
        }

        // 2. Act
        if (target) {
            const dist = getDistance(nextEntity, target);
            const range = nextEntity.stats.range;
            const reach = range + getHitboxRadius(target) + getHitboxRadius(nextEntity) - 0.5;

            if (dist <= reach) {
                // Attack
                nextEntity.state = 'ATTACKING';
                nextEntity.isCharging = false;
                
                if (now - nextEntity.lastAttackTime >= nextEntity.stats.hitSpeed * 1000) {
                    nextEntity.lastAttackTime = now;
                    const dmg = nextEntity.stats.damage * (nextEntity.rageTimer > 0 ? 1.35 : 1);
                    
                    // Threshold set to 5.5 to distinguish extended melee (4.5 like Knight) from ranged (6.0 like Minions)
                    if (range > 5.5) {
                        // Ranged
                        newProjectiles.push({
                            id: generateId(),
                            visualType: nextEntity.defId.includes('wizard') ? 'fireball' : (nextEntity.defId.includes('witch') ? 'magic' : (nextEntity.defId.includes('dragon') ? 'fireball' : 'arrow')),
                            startX: nextEntity.x, startY: nextEntity.y,
                            destX: target.x, destY: target.y,
                            x: nextEntity.x, y: nextEntity.y,
                            targetId: target.id,
                            speed: 30,
                            damage: dmg,
                            areaRadius: nextEntity.stats.radius || 0,
                            ownerSide: nextEntity.side,
                            arcHeight: 5,
                            progress: 0
                        });
                    } else {
                        // Melee
                        const processedTarget = newEntities.find(e => e.id === target!.id);
                        if (processedTarget) {
                            processedTarget.hp -= dmg;
                        } else {
                            target.hp -= dmg;
                        }
                        
                        newParticles.push({id: generateId(), x: target.x, y: target.y, type: 'hit', color: '#fff', size: 2, createdAt: now, duration: 200});
                    }
                }
            } else {
                // Move
                if (!nextEntity.stats.isBuilding) {
                    nextEntity.state = 'MOVING';
                    if (nextEntity.stats.canCharge) {
                        nextEntity.chargeTimer += dt;
                        if (nextEntity.chargeTimer > 2000) nextEntity.isCharging = true;
                    }
                    
                    let speed = nextEntity.stats.speed * 8 * (dt/1000); // Speed Mult
                    if (nextEntity.rageTimer > 0) speed *= 1.35;
                    if (nextEntity.isCharging) speed *= 2.0;

                    // Calculate desired direction
                    let dx = target.x - nextEntity.x;
                    let dy = target.y - nextEntity.y;
                    let dLen = Math.sqrt(dx*dx + dy*dy);
                    if (dLen > 0) { dx /= dLen; dy /= dLen; }

                    // Add avoidance (Steering)
                    const avoid = getAvoidanceVector(nextEntity, state.entities);
                    dx += avoid.x;
                    dy += avoid.y;
                    
                    // Normalize vector again
                    const finalLen = Math.sqrt(dx*dx + dy*dy);
                    if (finalLen > 0) { dx /= finalLen; dy /= finalLen; }
                    
                    // Bridge Pathing for Ground Units
                    if (nextEntity.stats.movementType === 'GROUND' && nextEntity.y > 40 && nextEntity.y < 60) {
                        // Check horizontal distance to bridges
                        const leftDist = Math.abs(nextEntity.x - BRIDGE_LEFT_X);
                        const rightDist = Math.abs(nextEntity.x - BRIDGE_RIGHT_X);
                        // If far from bridge, move towards nearest one horizontally
                        if (leftDist > 5 && rightDist > 5) {
                            const bridgeX = leftDist < rightDist ? BRIDGE_LEFT_X : BRIDGE_RIGHT_X;
                            const bridgeDir = Math.sign(bridgeX - nextEntity.x);
                            nextEntity.x += bridgeDir * speed;
                            // Reduced Y movement to ensure alignment before crossing
                            nextEntity.y += dy * speed * 0.3;
                        } else {
                            // On/Near bridge, move normally with avoidance
                            nextEntity.x += dx * speed;
                            nextEntity.y += dy * speed;
                        }
                    } else {
                        nextEntity.x += dx * speed;
                        nextEntity.y += dy * speed;
                    }
                }
            }
        } else {
            // Idle / Move to Lane
            if (!nextEntity.stats.isBuilding) {
                nextEntity.state = 'MOVING';
                const targetY = nextEntity.side === PlayerSide.PLAYER ? 5 : 95;
                const laneX = nextEntity.x < 50 ? 20 : 80;
                
                let dx = laneX - nextEntity.x;
                let dy = targetY - nextEntity.y;
                let dLen = Math.sqrt(dx*dx + dy*dy);
                if (dLen > 0) { dx /= dLen; dy /= dLen; }

                // Add avoidance
                const avoid = getAvoidanceVector(nextEntity, state.entities);
                dx += avoid.x;
                dy += avoid.y;
                
                const finalLen = Math.sqrt(dx*dx + dy*dy);
                if (finalLen > 0) { dx /= finalLen; dy /= finalLen; }

                let speed = nextEntity.stats.speed * 8 * (dt/1000);
                if (nextEntity.rageTimer > 0) speed *= 1.35;
                
                nextEntity.x += dx * speed;
                nextEntity.y += dy * speed;
            }
        }

        // Collision & Physics
        if (!nextEntity.stats.isBuilding) {
            // Check against ALL entities (Ground vs Ground/Building, Air vs Air)
            state.entities.forEach(other => {
                if (other.id === nextEntity.id) return;
                if (other.hp <= 0) return;

                const isMyGround = nextEntity.stats.movementType === 'GROUND';
                const isOtherGround = other.stats.movementType === 'GROUND' || other.stats.isBuilding;
                
                const isMyAir = nextEntity.stats.movementType === 'AIR';
                const isOtherAir = other.stats.movementType === 'AIR';

                if ((isMyGround && isOtherGround) || (isMyAir && isOtherAir)) {
                    const dist = getDistance(nextEntity, other);
                    const minDist = getHitboxRadius(nextEntity) + getHitboxRadius(other);
                    
                    if (dist < minDist) {
                        const angle = Math.atan2(nextEntity.y - other.y, nextEntity.x - other.x);
                        const push = (minDist - dist) * 0.1;
                        
                        const m1 = getMass(nextEntity);
                        const m2 = getMass(other);
                        
                        // Push away logic
                        if (m1 !== Infinity) {
                            const ratio = m2 === Infinity ? 1.0 : (m2 / (m1 + m2));
                            nextEntity.x += Math.cos(angle) * push * ratio;
                            nextEntity.y += Math.sin(angle) * push * ratio;
                        }
                    }
                }
            });

            // River Bounds (Ground Only)
            if (nextEntity.stats.movementType === 'GROUND') {
                if (nextEntity.y > 42 && nextEntity.y < 58) {
                    const onLeft = Math.abs(nextEntity.x - BRIDGE_LEFT_X) < 6;
                    const onRight = Math.abs(nextEntity.x - BRIDGE_RIGHT_X) < 6;
                    if (!onLeft && !onRight) {
                        // Push out
                        if (nextEntity.y < 50) nextEntity.y = 42;
                        else nextEntity.y = 58;
                    }
                }
            }
        }

        // Clamp
        nextEntity.x = Math.max(2, Math.min(98, nextEntity.x));
        nextEntity.y = Math.max(2, Math.min(98, nextEntity.y));

        newEntities.push(nextEntity);
    });

    // 3. Process Projectiles
    for (let i = newProjectiles.length - 1; i >= 0; i--) {
        const p = newProjectiles[i];
        
        // Homing
        const target = newEntities.find(e => e.id === p.targetId);
        if (target) {
            p.destX = target.x;
            p.destY = target.y;
        }

        // Move
        const dx = p.destX - p.x;
        const dy = p.destY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const move = p.speed * (dt/1000);

        if (move >= dist) {
            // Hit
            p.x = p.destX;
            p.y = p.destY;
            
            // Effect / Damage
            if (p.effect === 'GOBLIN_BARREL') {
                // Handled in spell logic now, but kept for safety if projectile spawned
            } else if (p.areaRadius > 0) {
                // AoE Damage
                newEntities.forEach(e => {
                    const hitRadius = getHitboxRadius(e);
                    if (e.side !== p.ownerSide && getDistance(p, e) <= (p.areaRadius + hitRadius)) {
                        let damage = p.damage;
                        if (e.type === CardType.TOWER) damage *= 0.35; // Crown Tower Damage Reduction for projectiles too if they are "spells" but mostly troops don't have this.
                        
                        e.hp -= damage;
                        if (p.effect === 'LOG') {
                            e.x += (p.ownerSide === PlayerSide.PLAYER ? 0 : 0); // Knockback?
                        }
                    }
                });
                newParticles.push({id: generateId(), x: p.x, y: p.y, type: 'explosion', color: '#f97316', size: p.areaRadius*2, createdAt: now, duration: 300});
            } else if (target) {
                // Single Target
                target.hp -= p.damage;
                newParticles.push({id: generateId(), x: target.x, y: target.y, type: 'hit', color: '#fff', size: 2, createdAt: now, duration: 200});
            }

            newProjectiles.splice(i, 1);
        } else {
            p.x += (dx/dist) * move;
            p.y += (dy/dist) * move;
            p.progress = 1 - (dist / Math.sqrt(Math.pow(p.destX-p.startX, 2) + Math.pow(p.destY-p.startY, 2))); // Approx progress
        }
    }

    // 4. End Game Check
    const playerKing = newEntities.find(e => e.defId === 'king_tower' && e.side === PlayerSide.PLAYER);
    const enemyKing = newEntities.find(e => e.defId === 'king_tower' && e.side === PlayerSide.ENEMY);

    if (!playerKing || playerKing.hp <= 0) {
        gameOver = true;
        winner = PlayerSide.ENEMY;
        state.enemyCrowns = 3;
    } else if (!enemyKing || enemyKing.hp <= 0) {
        gameOver = true;
        winner = PlayerSide.PLAYER;
        state.playerCrowns = 3;
    }

    let currentPCrowns = 3 - newEntities.filter(e => e.side === PlayerSide.ENEMY && e.type === CardType.TOWER).length;
    let currentECrowns = 3 - newEntities.filter(e => e.side === PlayerSide.PLAYER && e.type === CardType.TOWER).length;

    // Sudden Death Rule
    if (state.gameMode === 'SUDDEN_DEATH' && !gameOver) {
        if (currentPCrowns > currentECrowns) { gameOver = true; winner = PlayerSide.PLAYER; }
        else if (currentECrowns > currentPCrowns) { gameOver = true; winner = PlayerSide.ENEMY; }
    } else if (phase === 'OVERTIME' && !gameOver) {
        if (currentPCrowns > state.playerCrowns) { gameOver = true; winner = PlayerSide.PLAYER; }
        else if (currentECrowns > state.enemyCrowns) { gameOver = true; winner = PlayerSide.ENEMY; }
    }

    // Trophy Change
    let trophyChange = state.trophyChange;
    if (gameOver && trophyChange === undefined) {
        const baseChange = Math.floor(Math.random() * (34 - 26 + 1)) + 26;
        trophyChange = winner === PlayerSide.PLAYER ? baseChange : (winner === null ? 0 : -baseChange);
    }

    return {
        ...state,
        gameTime: Math.max(0, newGameTime),
        entities: newEntities,
        projectiles: newProjectiles,
        particles: newParticles,
        activeEmotes: activeEmotes,
        playerElixir: newPlayerElixir,
        enemyElixir: newEnemyElixir,
        gameOver,
        winner,
        playerCrowns: currentPCrowns,
        enemyCrowns: currentECrowns,
        phase,
        trophyChange
    };
};
