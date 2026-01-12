
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GameEntity, PlayerSide, CardType, ActiveEmote, GameProjectile, GameParticle, MovementType, PlayerCollection } from '../types';
import { UnitModel } from './UnitModels';
import { getArenaBackgroundStyle, getArenaEffects, ArenaDecorations } from './ArenaVisuals';
import { CARDS, getSpawnPattern, RARITY_INFO } from '../constants';

const TRAVELING_SPELLS = ['fireball', 'arrows', 'rocket', 'poison', 'rage', 'freeze', 'snowball', 'goblinbarrel'];

const EntityComponent: React.FC<{ entity: GameEntity, aspectRatio: number }> = ({ entity, aspectRatio }) => {
    const isEnemy = entity.side === PlayerSide.ENEMY;
    const isBuilding = entity.stats.isBuilding;
    const hpPct = Math.max(0, (entity.hp / entity.maxHp) * 100);
    const shieldPct = entity.maxShieldHp > 0 ? Math.max(0, (entity.shieldHp / entity.maxShieldHp) * 100) : 0;
    
    let action: 'IDLE' | 'MOVING' | 'ATTACKING' | 'CASTING' = entity.state;
    let facing: 'front' | 'back' = isEnemy ? 'front' : 'back';
    
    const isDeploying = entity.deployTimer > 0;
    const isSpell = entity.type === CardType.SPELL;

    const sizeMultiplier = isBuilding ? 2.5 : 1.6; 
    const baseSize = 6 * sizeMultiplier; 
    
    if (isSpell) {
        if (isDeploying) {
             const isTraveling = TRAVELING_SPELLS.includes(entity.defId);
             
             if (isTraveling) {
                 const cardDef = CARDS.find(c => c.id === entity.defId);
                 const totalDeployTime = cardDef?.stats.deployTime || 1000;
                 const progress = Math.max(0, Math.min(1, 1 - (entity.deployTimer / totalDeployTime)));
                 
                 const startX = 50;
                 const startY = entity.side === PlayerSide.PLAYER ? 95 : 5;
                 
                 const targetX = entity.x;
                 const targetY = entity.y;
                 
                 const currentX = startX + (targetX - startX) * progress;
                 const currentY = startY + (targetY - startY) * progress;
                 
                 const arcHeight = entity.defId === 'rocket' || entity.defId === 'goblinbarrel' ? 25 : 0; 
                 const heightOffset = Math.sin(progress * Math.PI) * arcHeight;
                 
                 const dx = targetX - startX;
                 const dy = targetY - startY;
                 let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                 if (entity.defId === 'fireball' || entity.defId === 'poison' || entity.defId === 'goblinbarrel') angle += progress * 720;

                 if (entity.defId === 'arrows') {
                     const offsets = [
                         {x:0, y:0}, {x:-1, y:1}, {x:1, y:1}, 
                         {x:-2, y:2}, {x:2, y:2}, {x:0, y:1.5},
                         {x:-1.5, y:3}, {x:1.5, y:3}
                     ];
                     
                     return (
                        <div
                            className="absolute z-[100] will-change-transform pointer-events-none"
                            style={{
                                left: `${currentX}%`,
                                top: `${currentY - heightOffset}%`,
                                width: `${baseSize}%`, 
                                height: `${baseSize * aspectRatio}%`,
                                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                            }}
                        >
                            {offsets.map((off, i) => (
                                <div 
                                    key={i} 
                                    className="absolute w-full h-full"
                                    style={{
                                        transform: `translate(${off.x * 20}%, ${off.y * 20}%) scale(0.5)`
                                    }}
                                >
                                    <UnitModel defId="arrows" side={entity.side} variant="unit" />
                                </div>
                            ))}
                        </div>
                     );
                 }

                 return (
                    <div
                        className="absolute z-[100] will-change-transform pointer-events-none"
                        style={{
                            left: `${currentX}%`,
                            top: `${currentY - heightOffset}%`,
                            width: `${baseSize * 0.7}%`, 
                            height: `${baseSize * 0.7 * aspectRatio}%`,
                            transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${0.5 + progress * 0.5})`,
                        }}
                    >
                        <UnitModel defId={entity.defId} side={entity.side} variant="unit" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-50 blur-sm scale-110">
                             <UnitModel defId={entity.defId} side={entity.side} variant="unit" />
                        </div>
                    </div>
                 );
             } else {
                 return (
                    <div
                        className="absolute z-[100] transition-transform duration-100 linear will-change-transform"
                        style={{
                            left: `${entity.x}%`,
                            top: `${entity.y}%`,
                            width: `${baseSize * 0.7}%`, 
                            height: `${baseSize * 0.7 * aspectRatio}%`,
                            transform: `translate(-50%, -50%) scale(${0.5 + (1 - Math.min(1, entity.deployTimer/1000)) * 0.5})`,
                            opacity: 1
                        }}
                    >
                        <UnitModel defId={entity.defId} side={entity.side} variant="unit" />
                    </div>
                 );
             }
        } else if (entity.hp > 0) {
            const radius = entity.stats.radius || 3;
            return (
                <div 
                    className="absolute rounded-full pointer-events-none mix-blend-overlay z-10"
                    style={{
                        left: `${entity.x}%`,
                        top: `${entity.y}%`,
                        width: `${radius * 2}%`,
                        height: `${radius * 2 * aspectRatio}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: entity.defId === 'rage' ? '#a855f7' : (entity.defId === 'poison' ? '#f97316' : (entity.defId === 'freeze' ? '#06b6d4' : '#10b981')),
                        opacity: 0.4
                    }}
                >
                    <div className="w-full h-full animate-pulse opacity-50 bg-current rounded-full blur-md"></div>
                </div>
            );
        }
        return null; 
    }

    const opacity = entity.isInvisible ? 0.4 : 1;
    let visualOpacityClass = 'opacity-100';
    if (isDeploying) {
        visualOpacityClass = isEnemy ? 'opacity-0' : 'opacity-50 grayscale';
    }

    // Status Bar Logic
    const showStatusBar = !isDeploying && (entity.hp < entity.maxHp || entity.type === CardType.TOWER);

    return (
      <div
        className="absolute transition-transform duration-100 linear will-change-transform"
        style={{
          left: `${entity.x}%`,
          top: `${entity.y}%`,
          transform: `translate(-50%, -50%)`,
          zIndex: Math.floor(entity.y), 
          width: `${baseSize}%`,
          height: `${baseSize * aspectRatio}%`,
          opacity: opacity
        }}
      >
        {isDeploying && !isEnemy && (
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
               <div className="w-4 h-4 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
               <div className="text-[8px] font-bold text-white drop-shadow-md bg-black/40 px-1 rounded mt-1">{(entity.deployTimer/1000).toFixed(1)}</div>
           </div>
        )}
  
        {showStatusBar && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-40 pointer-events-none transform -translate-y-1">
             {/* Level Badge */}
             <div className={`
                flex items-center justify-center w-3.5 h-3.5 rounded-full border-[1px] border-black/50
                ${isEnemy ? 'bg-red-600' : 'bg-blue-600'}
                text-[8px] font-black text-white shadow-sm leading-none z-10
             `}>
                 {entity.level}
             </div>

             <div className="flex flex-col gap-px">
                 {/* Shield Bar */}
                 {entity.shieldHp > 0 && (
                    <div className="w-8 h-1.5 bg-black/60 rounded-sm overflow-hidden border border-black/30 relative mb-px">
                        <div className="absolute inset-0 bg-gray-800"></div>
                        <div 
                          className="h-full bg-purple-400 relative" 
                          style={{ width: `${shieldPct}%` }}
                        />
                    </div>
                 )}
                 {/* Health Bar */}
                 <div className="w-8 h-2 bg-black/60 rounded-sm overflow-hidden border border-black/30 relative">
                    <div className="absolute inset-0 bg-gray-800"></div>
                    <div 
                      className={`h-full ${isEnemy ? 'bg-red-500' : 'bg-blue-500'} relative`} 
                      style={{ width: `${hpPct}%` }}
                    />
                 </div>
             </div>
          </div>
        )}
  
        {entity.frozenTimer > 0 && <div className="absolute inset-0 bg-cyan-400/50 rounded-lg animate-pulse z-30 mix-blend-overlay"></div>}
        {entity.rageTimer > 0 && <div className="absolute inset-0 bg-purple-500/40 rounded-lg animate-pulse z-30 mix-blend-overlay border-2 border-purple-500"></div>}
        {entity.stunTimer > 0 && (
             <div className="absolute -top-6 left-0 w-full flex justify-center z-50">
                 <span className="text-yellow-400 text-xs font-black animate-bounce">⚡</span>
             </div>
        )}
  
        <div className={`w-full h-full ${visualOpacityClass} transition-all duration-200`}>
            <UnitModel 
                defId={entity.defId} 
                side={entity.side} 
                facing={facing} 
                action={action}
                isCharging={entity.isCharging}
                hasShield={entity.shieldHp > 0}
                isInvisible={entity.isInvisible}
            />
        </div>
      </div>
    );
};

const ProjectileComponent: React.FC<{ projectile: GameProjectile, aspectRatio: number }> = ({ projectile, aspectRatio }) => {
    const heightOffsetPercent = 4 * (projectile.arcHeight || 0) * projectile.progress * (1 - projectile.progress);
    const dx = projectile.destX - projectile.startX;
    const dy = projectile.destY - projectile.startY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let rotation = angle + 90; 
    if (projectile.visualType === 'log') rotation = angle; 
    if (projectile.visualType === 'axe') rotation = (Date.now() / 2) % 360; 
    
    const renderVisual = () => {
        switch(projectile.visualType) {
            case 'arrow': 
                return (
                    <div className="w-1 h-4 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-300 transform rotate-45 border border-black"></div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-neutral-700"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-red-500"></div>
                    </div>
                );
            case 'fireball': 
                return <div className="w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] border border-orange-700"></div>;
            case 'rocket': 
                return (
                    <div className="w-3 h-8 bg-red-700 rounded-full border border-black relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-2 bg-yellow-400 animate-pulse"></div>
                    </div>
                );
            case 'log': 
                return (
                    <div className="w-8 h-3 bg-amber-800 rounded-full border border-black relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_3px)]"></div>
                        <div className="absolute -top-1 left-2 w-1 h-2 bg-neutral-600"></div>
                        <div className="absolute -bottom-1 right-2 w-1 h-2 bg-neutral-600"></div>
                    </div>
                );
            case 'rock': 
                return <div className="w-3 h-3 rounded-full bg-stone-600 border border-stone-800 shadow-sm"></div>;
            case 'barrel': 
                return (
                    <div className="w-4 h-5 bg-green-800 rounded border border-black flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-1 bg-black/30 absolute top-1"></div>
                        <div className="w-full h-1 bg-black/30 absolute bottom-1"></div>
                    </div>
                );
            case 'cannonball': 
                return <div className="w-2.5 h-2.5 rounded-full bg-black border border-gray-600 shadow-sm"></div>;
            case 'bullet': 
                return <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm"></div>;
            case 'axe': 
                return (
                    <div className="w-6 h-6 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-amber-900"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-4 bg-gray-300 border border-gray-500 rounded-full clip-path-axe"></div>
                    </div>
                );
            case 'magic': 
                return <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] border border-white"></div>;
            default: 
                return <div className="w-2 h-2 rounded-full bg-black"></div>;
        }
    }

    return (
        <div 
            className="absolute pointer-events-none z-[100] transition-transform duration-100 linear"
            style={{
                left: `${projectile.x}%`,
                top: `${projectile.y - heightOffsetPercent}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
        >
            {renderVisual()}
        </div>
    );
};

interface GameCanvasProps {
  entities: GameEntity[];
  onPlaceCard: (x: number, y: number) => void;
  selectedCardId: string | null;
  selectedCardType: CardType | null;
  activeEmotes: ActiveEmote[];
  muteEmotes: boolean;
  arenaId: number;
  projectiles?: GameProjectile[]; 
  particles?: GameParticle[];
  collection: PlayerCollection;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
    entities, 
    onPlaceCard, 
    selectedCardId, 
    selectedCardType, 
    activeEmotes, 
    muteEmotes, 
    arenaId, 
    projectiles = [], 
    particles = [],
    collection
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [arenaAspectRatio, setArenaAspectRatio] = useState(0.56); 
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const updateRatio = () => {
        if (arenaRef.current) {
            setArenaAspectRatio(arenaRef.current.clientWidth / arenaRef.current.clientHeight);
        }
    };
    updateRatio();
    const observer = new ResizeObserver(updateRatio);
    if (arenaRef.current) observer.observe(arenaRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!arenaRef.current || !selectedCardId) return;
      const rect = arenaRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top) / rect.height) * 100;
      
      const tileW = 5; 
      const tileH = 100/30; 
      
      const snappedX = Math.floor(rawX / tileW) * tileW + (tileW / 2);
      const snappedY = Math.floor(rawY / tileH) * tileH + (tileH / 2);

      setMousePos({ x: snappedX, y: snappedY });
  };

  const leftTowerAlive = entities.some(e => e.side === PlayerSide.ENEMY && e.defId === 'tower_princess' && e.x < 50);
  const rightTowerAlive = entities.some(e => e.side === PlayerSide.ENEMY && e.defId === 'tower_princess' && e.x > 50);

  const checkPlacementValidity = (x: number, y: number, cardId: string | null) => {
      if (!cardId) return false;
      const card = CARDS.find(c => c.id === cardId);
      const isSpell = card?.type === CardType.SPELL;
      const canPlaceAnywhere = card?.stats.canPlaceAnywhere;

      if (isSpell || canPlaceAnywhere) return true;

      // Pocket Logic
      const isPocketOpenLeft = !leftTowerAlive;
      const isPocketOpenRight = !rightTowerAlive;

      // If pocket is open, allow placement deep into enemy territory (including bridge)
      if (isPocketOpenLeft && x < 50 && y > 25) return true;
      if (isPocketOpenRight && x >= 50 && y > 25) return true;

      // Default Player Territory (Behind River/Bridge)
      if (y > 55) return true;

      return false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!selectedCardId || !arenaRef.current || !mousePos) return;
    
    if (checkPlacementValidity(mousePos.x, mousePos.y, selectedCardId)) {
        onPlaceCard(mousePos.x, mousePos.y);
        setMousePos(null);
    }
  };

  const sortedEntities = [...entities].sort((a, b) => a.y - b.y);
  const arenaStyle = getArenaBackgroundStyle(arenaId);
  const effects = getArenaEffects(arenaId);

  const gridTiles = useMemo(() => {
      if (!selectedCardId) return null;
      
      const cols = 20; 
      const rows = 30; 
      const tiles = [];

      for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
              const x = (c * 5) + 2.5; 
              const y = (r * 3.33) + 1.66;
              const isValid = checkPlacementValidity(x, y, selectedCardId);
              
              const isDeepEnemy = y < 45; 
              if (isDeepEnemy && !isValid) continue;

              tiles.push(
                  <div 
                      key={`${r}-${c}`}
                      className={`absolute border-[0.5px] border-white/5 ${isValid ? 'bg-white/10 shadow-[0_0_4px_rgba(255,255,255,0.1)]' : 'bg-red-500/20'}`}
                      style={{
                          left: `${c * 5}%`,
                          top: `${r * 3.33}%`,
                          width: '5%',
                          height: '3.33%',
                      }}
                  />
              );
          }
      }
      return tiles;
  }, [selectedCardId, leftTowerAlive, rightTowerAlive]);

  return (
    <div 
      ref={arenaRef}
      className="relative flex-1 overflow-hidden cursor-crosshair select-none bg-[#1c1c1c]"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      <style>{`
        @keyframes walk-bob {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-3%) scaleY(1.02); }
        }
        @keyframes snow-fall {
            0% { background-position: 0 0; }
            100% { background-position: 50px 500px; }
        }
        @keyframes ember-rise {
            0% { background-position: 0 0; opacity: 0; }
            50% { opacity: 1; }
            100% { background-position: -20px -200px; opacity: 0; }
        }
        @keyframes rain-fall {
            0% { background-position: 0 0; }
            100% { background-position: -10px 200px; }
        }
        @keyframes river-flow {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 40px 0, 50px 0; }
        }
        @keyframes arena-breathe {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-700"
        style={{
            ...arenaStyle,
            animation: 'arena-breathe 20s ease-in-out infinite alternate'
        }}
      ></div>

      <ArenaDecorations id={arenaId} />

      {selectedCardId && (
          <div className="absolute inset-0 pointer-events-none z-[4]">
              {gridTiles}
          </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
           {(effects.clouds || effects.snow) && (
             <>
               <div className="absolute top-[10%] left-0 w-full h-32 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" style={{ animation: 'cloud-drift 40s linear infinite' }}></div>
               <div className="absolute top-[60%] left-0 w-full h-40 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl" style={{ animation: 'cloud-drift 60s linear infinite reverse', animationDelay: '-20s' }}></div>
             </>
           )}
           {effects.snow && (
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEwIDEwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] opacity-40 animate-[snow-fall_10s_linear_infinite]"></div>
           )}
           {effects.rain && (
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB4PSI5IiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxMCIgZmlsbD0iIzYwYTVmYSIgb3BhY2l0eT0iMC4zIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSkiLz48L3N2Zz4=')] opacity-30 animate-[rain-fall_1s_linear_infinite]"></div>
           )}
           {effects.embers && (
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSIjZmM4MTgxIiBvcGFjaXR5PSIwLjYiLz48L3N2Zz4=')] animate-[ember-rise_4s_linear_infinite]"></div>
           )}
           {effects.spirits && (
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#d8b4fe_0%,transparent_50%)] animate-pulse"></div>
           )}
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.5)_100%)] z-[3]"></div>

      <div className="absolute top-1/2 left-0 w-full h-[12%] -mt-[6%] z-0 select-none pointer-events-none">
          <div className={`absolute inset-0 ${effects.embers ? 'bg-orange-900 border-[#450a0a]' : (effects.snow ? 'bg-[#bae6fd] border-[#0284c7]' : 'bg-[#3b82f6] border-[#4a362f]')} border-y-[5px] shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] overflow-hidden`}>
              <div className="absolute inset-0 opacity-40" 
                  style={{
                      backgroundImage: effects.embers 
                          ? `radial-gradient(circle at center, #fdba74 1px, transparent 1px), radial-gradient(circle at center, #fb923c 2px, transparent 2px)`
                          : `radial-gradient(circle at center, #bfdbfe 1px, transparent 1px), radial-gradient(circle at center, #60a5fa 2px, transparent 2px)`,
                      backgroundSize: '24px 24px, 40px 40px',
                      backgroundPosition: '0 0, 20px 20px',
                      animation: 'river-flow 4s linear infinite'
                  }}>
              </div>
              <div className={`absolute top-0 left-0 w-full h-1.5 ${effects.embers ? 'bg-orange-500/40' : 'bg-white/20'} blur-[2px]`}></div>
              <div className={`absolute bottom-0 left-0 w-full h-1.5 ${effects.embers ? 'bg-orange-500/40' : 'bg-white/20'} blur-[2px]`}></div>
          </div>
      </div>

      {[20, 80].map(leftPos => (
          <div key={leftPos} className="absolute top-1/2 w-[15%] h-[16%] -mt-[8%] z-1" style={{ left: `${leftPos}%`, transform: 'translateX(-50%)' }}>
              <div className="w-full h-full relative flex flex-col justify-between">
                  <div className="absolute inset-0 bg-black/40 translate-y-3 translate-x-1 blur-[6px] rounded-lg -z-10"></div>
                  <div className={`w-full h-full ${effects.electric ? 'bg-[#334155] border-[#1e293b]' : (effects.snow ? 'bg-[#94a3b8] border-[#475569]' : 'bg-[#5d4037] border-[#3e2723]')} border-x-[3px] rounded-sm overflow-hidden flex flex-col relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}>
                      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '4px 100%' }}></div>
                      {Array.from({length: 12}).map((_, i) => (
                          <div key={i} className={`flex-1 border-b ${effects.electric ? 'border-slate-600 bg-slate-700' : 'border-[#2d1b16]/60 bg-gradient-to-r from-[#795548] to-[#8d6e63]'} relative`}>
                              <div className="absolute top-1/2 -translate-y-1/2 left-1 w-1 h-1 bg-black/30 rounded-full"></div>
                              <div className="absolute top-1/2 -translate-y-1/2 right-1 w-1 h-1 bg-black/30 rounded-full"></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      ))}

      {projectiles.map(p => (
          <div 
            key={`shadow_${p.id}`}
            className="absolute rounded-full bg-black/30 blur-[2px]"
            style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: '1%',
                height: `${1 * arenaAspectRatio}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5
            }}
          ></div>
      ))}

      {sortedEntities.map(entity => (
        <EntityComponent key={entity.id} entity={entity} aspectRatio={arenaAspectRatio} />
      ))}

      {projectiles.map(p => (
          <ProjectileComponent key={p.id} projectile={p} aspectRatio={arenaAspectRatio} />
      ))}

      {particles.map(p => (
          <div 
              key={p.id}
              className={`absolute rounded-full pointer-events-none z-[60] ${p.type === 'hit' ? 'animate-ping' : ''}`}
              style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}%`,
                  height: `${p.size * arenaAspectRatio}%`,
                  backgroundColor: p.color,
                  transform: 'translate(-50%, -50%)',
                  opacity: p.type === 'hit' ? 0.7 : 1,
                  animation: p.type === 'explosion' ? `ping 0.5s cubic-bezier(0, 0, 0.2, 1) forwards` : undefined
              }}
          >
              {p.type === 'explosion' && (
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>
              )}
          </div>
      ))}

      {activeEmotes.filter(e => !muteEmotes).map(emote => (
          <div 
            key={emote.id}
            className="absolute z-[70] animate-bounce"
            style={{
                left: emote.side === PlayerSide.PLAYER ? '20%' : '80%',
                top: emote.side === PlayerSide.PLAYER ? '65%' : '25%',
            }}
          >
              <div className="bg-white rounded-xl p-2 shadow-2xl border-4 border-black relative">
                  <div className="text-4xl">{emote.content}</div>
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-4 border-r-4 border-black transform rotate-45"></div>
              </div>
          </div>
      ))}

      {mousePos && selectedCardId && (
        <div className="absolute inset-0 pointer-events-none z-[200]">
            {(() => {
                const card = CARDS.find(c => c.id === selectedCardId);
                if (!card) return null;
                
                const offsets = getSpawnPattern(card.spawnCount);
                const isBuilding = card.stats.isBuilding;
                const sizeMultiplier = isBuilding ? 2.5 : 1.6;
                const baseSize = 6 * sizeMultiplier; 
                
                const isValid = checkPlacementValidity(mousePos.x, mousePos.y, selectedCardId);
                const level = collection ? (collection[card.id]?.level || 1) : 1;
                const rarityColor = RARITY_INFO[card.rarity].color;

                return (
                    <>
                        <div 
                            className="absolute transform -translate-x-1/2 flex flex-col items-center z-[201]"
                            style={{
                                left: `${mousePos.x}%`,
                                top: `${mousePos.y}%`,
                                transform: 'translate(-50%, -4.5rem)'
                            }}
                        >
                            <div className={`px-2 py-1 !bg-black/80 rounded text-white text-xs font-black uppercase tracking-tight border-2 ${rarityColor} shadow-lg backdrop-blur-sm whitespace-nowrap`}>
                                Lvl {level} {card.name}
                            </div>
                            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/80"></div>
                        </div>

                        {(card.stats.radius || card.stats.range) && (
                            <div 
                                className={`absolute rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 ${isValid ? 'border-white bg-white/20' : 'border-red-500 bg-red-500/20'}`}
                                style={{
                                    left: `${mousePos.x}%`,
                                    top: `${mousePos.y}%`,
                                    width: `${(card.stats.radius || card.stats.range) * 2}%`,
                                    height: `${(card.stats.radius || card.stats.range) * 2 * arenaAspectRatio}%`
                                }}
                            />
                        )}

                        {offsets.map((offset, i) => (
                            <div 
                                key={i}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isValid ? 'opacity-70' : 'grayscale opacity-30'}`}
                                style={{
                                    left: `${mousePos.x + offset.x}%`, 
                                    top: `${mousePos.y + offset.y}%`,
                                    width: `${baseSize}%`,
                                    height: `${baseSize * arenaAspectRatio}%`,
                                }}
                            >
                                <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="unit" />
                            </div>
                        ))}
                    </>
                );
            })()}
        </div>
      )}

    </div>
  );
};
