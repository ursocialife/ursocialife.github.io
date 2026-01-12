
import React, { useState } from 'react';
import { CardDef, PlayerCollection, PlayerSide, CardType } from '../types';
import { CARDS, RARITY_INFO, MAX_LEVEL, getUpgradeRequirements, calculateStats, ARENAS } from '../constants';
import { UnitModel } from './UnitModels';
import { playClickSound, playButtonSound } from '../services/audio';
import { GoldIcon } from './ResourceIcons';

interface CardDetailsModalProps {
  card: CardDef;
  collection: PlayerCollection;
  gold?: number;
  gems?: number;
  onClose: () => void;
  onUpgrade?: (cardId: string, currentLevel: number) => void;
  onBuyCards?: (cardId: string, count: number, cost: number) => void;
  onSelectTower?: (towerId: string) => void;
  selectedTowerId?: string;
  currentDeck?: string[];
  onEquip?: (cardId: string, slotIndex: number) => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  collection,
  gold = 0,
  gems = 0,
  onClose,
  onUpgrade,
  onBuyCards,
  onSelectTower,
  selectedTowerId,
  currentDeck,
  onEquip
}) => {
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  
  const isOwned = !!collection[card.id];
  const data = collection[card.id] || { level: RARITY_INFO[card.rarity].startLevel, count: 0 };
  const stats = calculateStats(card.stats, data.level);
  const nextLevelStats = data.level < MAX_LEVEL ? calculateStats(card.stats, data.level + 1) : null;
  const upgradeCost = getUpgradeRequirements(card.rarity, data.level);
  const canUpgrade = isOwned && data.level < MAX_LEVEL && data.count >= upgradeCost.cards && gold >= upgradeCost.gold;
  const progressPct = upgradeCost.cards > 0 ? Math.min(100, (data.count / upgradeCost.cards) * 100) : 100;

  const isTower = card.type === CardType.TOWER;
  const isSelectedTower = isTower && selectedTowerId === card.id;

  const handleEquipSlot = (slotIndex: number) => {
      if (onEquip) {
          playButtonSound();
          onEquip(card.id, slotIndex);
          setShowDeckSelector(false);
          onClose();
      }
  };

  const handleUseClick = () => {
      if (!isOwned) return;
      playClickSound();
      if (isTower) {
          if (onSelectTower) {
              onSelectTower(card.id);
              onClose();
          }
      } else if (currentDeck && onEquip) {
          setShowDeckSelector(true);
      }
  };

  const renderStatRow = (label: string, value: number | string, nextValue?: number | string, unit: string = '') => (
      <div className="flex flex-col py-2 px-2 border border-gray-100 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-black/20">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</span>
          <div className="flex items-center gap-1.5">
              <span className="font-black text-gray-800 dark:text-white text-base">{value}{unit}</span>
              {nextValue !== undefined && nextValue !== value && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/40 px-1.5 py-0.5 rounded shadow-sm">
                      +{typeof nextValue === 'number' && typeof value === 'number' ? Math.round((nextValue - value) * 10) / 10 : ''}
                  </span>
              )}
          </div>
      </div>
  );

  // Deck Selector Overlay
  if (showDeckSelector && currentDeck) {
      return (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeckSelector(false)}>
              <div className="w-[95%] max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 animate-in zoom-in duration-300 shadow-2xl border-2 border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Select slot to replace</h3>
                      <button 
                        onClick={() => setShowDeckSelector(false)} 
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-2">
                      {currentDeck.map((deckCardId, idx) => {
                          const deckCard = CARDS.find(c => c.id === deckCardId);
                          if (!deckCard) return null;
                          const isTarget = deckCard.id === card.id;
                          return (
                              <button 
                                key={idx} 
                                onClick={() => handleEquipSlot(idx)}
                                className={`aspect-[3/4] relative rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center p-1 bg-gray-100 dark:bg-gray-700 transition-all duration-200 active:scale-95 ${isTarget ? 'border-green-500 ring-4 ring-green-500/30 scale-105 z-10 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 hover:scale-105 hover:shadow-md'}`}
                              >
                                  <div className="w-full h-full relative z-10 pointer-events-none">
                                      <UnitModel defId={deckCard.id} side={PlayerSide.PLAYER} variant="card" />
                                  </div>
                                  {isTarget && (
                                      <div className="absolute inset-0 bg-green-500/40 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                          <span className="text-[10px] font-black text-white bg-green-600 px-2 py-1 rounded shadow-lg border border-white/20">CURRENT</span>
                                      </div>
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  const rarityInfo = RARITY_INFO[card.rarity];

  return (
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              
              {/* Header / Card Preview */}
              <div className={`relative h-64 flex items-center justify-center p-6 ${rarityInfo.color} border-b-4 border-black/10`}>
                  <div className={`absolute inset-0 opacity-20 ${rarityInfo.color.replace('border-', 'bg-')}`}></div>
                  
                  <div className="absolute top-4 right-4 z-20">
                      <button onClick={onClose} className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full text-white flex items-center justify-center font-bold text-lg transition-colors">✕</button>
                  </div>

                  <div className="relative w-48 h-56 transform hover:scale-105 transition-transform duration-300 z-10 drop-shadow-2xl">
                        {/* Card Frame */}
                        <div className={`w-full h-full bg-white dark:bg-gray-800 rounded-lg border-[3px] overflow-hidden flex flex-col relative ${rarityInfo.color} ${!isOwned ? 'grayscale' : ''}`}>
                             <div className={`absolute inset-0 opacity-20 ${rarityInfo.color.replace('border-', 'bg-')}`}></div>
                             <div className="relative flex-1 flex items-center justify-center pb-6">
                                  <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
                             </div>
                             {/* Level Badge */}
                             {isOwned && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black px-2 py-0.5 rounded border border-blue-400 shadow-md text-xs z-20">
                                    Level {data.level}
                                </div>
                             )}
                             {/* Elixir */}
                             {!isTower && (
                                 <div className="absolute -top-1 -left-1 w-8 h-8 z-20">
                                      <div className="w-full h-full bg-purple-600 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                          <span className="text-white font-black text-sm">{card.cost}</span>
                                      </div>
                                 </div>
                             )}
                             {/* Name */}
                             <div className="absolute bottom-2 w-full text-center z-20 px-1">
                                 <span className="text-white font-black uppercase text-sm drop-shadow-md tracking-tight">{card.name}</span>
                             </div>
                             
                             {!isOwned && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
                                     <span className="text-4xl">🔒</span>
                                 </div>
                             )}
                        </div>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900">
                  
                  {/* Upgrade Section */}
                  {isOwned && data.level < MAX_LEVEL && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold text-gray-500 uppercase">Cards</span>
                              <span className={`text-sm font-black ${data.count >= upgradeCost.cards ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>
                                  {data.count} / {upgradeCost.cards}
                              </span>
                          </div>
                          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                              <div className={`h-full ${canUpgrade ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`} style={{ width: `${progressPct}%` }}></div>
                          </div>
                          
                          {canUpgrade ? (
                              <button 
                                onClick={() => onUpgrade && onUpgrade(card.id, data.level)}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                              >
                                  <span>UPGRADE</span>
                                  <div className="flex items-center bg-black/20 px-2 py-0.5 rounded gap-1">
                                      <span className="text-sm">{upgradeCost.gold}</span>
                                      <div className="w-4 h-4"><GoldIcon /></div>
                                  </div>
                              </button>
                          ) : (
                              <div className="flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700/50 py-2 rounded-lg">
                                  Not enough cards or gold
                              </div>
                          )}
                      </div>
                  )}
                  {!isOwned && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl mb-2">🔒</span>
                          <h3 className="font-bold text-gray-600 dark:text-gray-300">Unlock this card</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Found in chests from Arena {card.unlockTrophies > 0 ? ARENAS.find(a => card.unlockTrophies === a.minTrophies)?.id : 0}+</p>
                      </div>
                  )}

                  {/* Stats Grid */}
                  <div className="space-y-2">
                      <h3 className="font-black text-gray-800 dark:text-white uppercase text-sm">Stats</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3">
                          {stats.hp > 0 && renderStatRow("Hitpoints", stats.hp, nextLevelStats?.hp)}
                          {stats.shieldHp && stats.shieldHp > 0 && renderStatRow("Shield Hitpoints", stats.shieldHp, nextLevelStats?.shieldHp)}
                          {stats.damage > 0 && renderStatRow(card.type === CardType.SPELL ? "Damage" : "Damage", stats.damage, nextLevelStats?.damage)}
                          {stats.damage > 0 && stats.hitSpeed > 0 && renderStatRow("DPS", Math.round(stats.damage / stats.hitSpeed), nextLevelStats ? Math.round(nextLevelStats.damage / nextLevelStats.hitSpeed) : undefined)}
                          {stats.hitSpeed > 0 && renderStatRow("Hit Speed", stats.hitSpeed, undefined, "s")}
                          {stats.range > 0 && renderStatRow("Range", stats.range)}
                          {renderStatRow("Targets", stats.targets)}
                          {renderStatRow("Speed", stats.speed > 0.8 ? 'Fast' : (stats.speed < 0.5 ? 'Slow' : 'Medium'))}
                          {card.spawnCount > 1 && renderStatRow("Count", card.spawnCount, undefined, "x")}
                      </div>
                  </div>
                  
                  {/* Description */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic text-center">"{card.description}"</p>
                  </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-4 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                  {onEquip && !isTower && (
                      <button 
                        onClick={handleUseClick}
                        disabled={!isOwned}
                        className={`flex-1 font-bold py-3 rounded-xl shadow-lg border-b-4 transition-all uppercase
                            ${isOwned 
                                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800 active:scale-95' 
                                : 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-500 cursor-not-allowed'}
                        `}
                      >
                          {isOwned ? 'Use' : 'Locked'}
                      </button>
                  )}
                  {onSelectTower && isTower && (
                      <button 
                        onClick={handleUseClick}
                        disabled={isSelectedTower || !isOwned}
                        className={`flex-1 font-bold py-3 rounded-xl shadow-lg border-b-4 transition-all uppercase
                            ${isSelectedTower 
                                ? 'bg-gray-400 border-gray-600 text-white cursor-default' 
                                : (!isOwned 
                                    ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white active:scale-95')
                            }
                        `}
                      >
                          {isSelectedTower ? 'Selected' : (isOwned ? 'Select' : 'Locked')}
                      </button>
                  )}
              </div>
          </div>
      </div>
  );
};
