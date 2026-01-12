
import React, { useState, useEffect } from 'react';
import { CardDef, ArenaDef, PlayerCollection, CardType, PlayerSide } from '../types';
import { CARDS, ARENAS, UPGRADE_COSTS, MAX_LEVEL, calculateStats, RARITY_INFO, TOWERS, getUpgradeRequirements, DEFAULT_EMOTES, SHOP_EMOTES } from '../constants';
import { UnitModel } from './UnitModels';
import { GoldIcon, KingXPIcon } from './ResourceIcons';
import { ArenaIcon } from './ArenaVisuals';
import { playClickSound, playButtonSound, playLevelUpSound } from '../services/audio';
import { CardDetailsModal } from './CardDetailsModal';

interface CollectionScreenProps {
  currentTrophies: number;
  currentDeck: string[]; // List of Card IDs
  onUpdateDeck: (newDeckIds: string[]) => void;
  activeDeckIndex: number;
  onSwitchDeckIndex: (index: number) => void;
  collection: PlayerCollection;
  gold: number;
  gems: number;
  onUpgradeCard: (cardId: string) => void;
  onBuyCards: (cardId: string, count: number, gemCost: number) => void;
  selectedTowerId: string;
  onSelectTower: (towerId: string) => void;
  unlockedEmotes: string[];
  emoteDeck: string[];
  onSetEmoteDeck: (emotes: string[]) => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  currentTrophies,
  currentDeck,
  onUpdateDeck,
  activeDeckIndex,
  onSwitchDeckIndex,
  collection,
  gold,
  gems,
  onUpgradeCard,
  onBuyCards,
  selectedTowerId,
  onSelectTower,
  unlockedEmotes,
  emoteDeck,
  onSetEmoteDeck
}) => {
  const [selectedDeckSlot, setSelectedDeckSlot] = useState<number | null>(null);
  const [cardDetailId, setCardDetailId] = useState<string | null>(null);
  const [levelUpState, setLevelUpState] = useState<{ cardId: string; oldLevel: number; } | null>(null);
  const [isViewingTowers, setIsViewingTowers] = useState(false);
  const [isViewingEmotes, setIsViewingEmotes] = useState(false);

  const handleDeckCardClick = (index: number) => {
    playClickSound();
    setSelectedDeckSlot(index === selectedDeckSlot ? null : index);
  };

  const handleCollectionCardClick = (card: CardDef) => {
    playClickSound();
    const isOwned = !!collection[card.id];
    
    if (card.type === CardType.TOWER) {
        setCardDetailId(card.id);
        return;
    }

    if (selectedDeckSlot !== null) {
      if (!isOwned) {
          // Can't equip, just view details
          setCardDetailId(card.id);
          setSelectedDeckSlot(null); // Cancel slot selection to avoid confusion
          return;
      }
      // Equip logic
      const existingIndex = currentDeck.indexOf(card.id);
      const newDeck = [...currentDeck];
      if (existingIndex !== -1) {
        const cardAtSlot = newDeck[selectedDeckSlot];
        newDeck[selectedDeckSlot] = card.id;
        newDeck[existingIndex] = cardAtSlot;
      } else {
        newDeck[selectedDeckSlot] = card.id;
      }
      onUpdateDeck(newDeck);
      setSelectedDeckSlot(null);
    } else {
       setCardDetailId(card.id);
    }
  };

  const handleUpgradeClick = (cardId: string, currentLevel: number) => {
      playLevelUpSound();
      onUpgradeCard(cardId);
      setLevelUpState({ cardId, oldLevel: currentLevel });
  };

  const handleEquipFromModal = (cardId: string, slotIndex: number) => {
      const newDeck = [...currentDeck];
      // Check if already in deck
      const existingIndex = newDeck.indexOf(cardId);
      
      if (existingIndex !== -1) {
          // Swap positions
          const otherCard = newDeck[slotIndex];
          newDeck[slotIndex] = cardId;
          newDeck[existingIndex] = otherCard;
      } else {
          // Replace
          newDeck[slotIndex] = cardId;
      }
      onUpdateDeck(newDeck);
  };

  const handleEmoteClick = (emote: string, isLocked: boolean) => {
      if (isLocked) return;
      playClickSound();

      const inDeckIndex = emoteDeck.indexOf(emote);
      if (inDeckIndex !== -1) {
          // Remove if in deck
          const newDeck = emoteDeck.filter(e => e !== emote);
          onSetEmoteDeck(newDeck);
      } else {
          // Add if not in deck and have space
          if (emoteDeck.length < 8) {
              onSetEmoteDeck([...emoteDeck, emote]);
          }
      }
  };

  // Consolidate all available emotes to display locked ones
  const allAvailableEmotes = Array.from(new Set([...DEFAULT_EMOTES, ...SHOP_EMOTES]));

  // Hexagon Clip Path for Tower Cards
  const hexClipPath = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

  const renderCard = (card: CardDef, inDeck: boolean, isArenaLocked: boolean, isSmall: boolean = false) => {
      const data = collection[card.id] || { level: RARITY_INFO[card.rarity].startLevel, count: 0 };
      const isOwned = !!collection[card.id];
      const nextLevelRequirements = getUpgradeRequirements(card.rarity, data.level);
      
      const canUpgrade = isOwned && data.level < MAX_LEVEL && data.count >= nextLevelRequirements.cards && gold >= nextLevelRequirements.gold;
      const progressPct = nextLevelRequirements.cards > 0 ? Math.min(100, (data.count / nextLevelRequirements.cards) * 100) : 0;
      
      const isTrulyLocked = !isOwned && isArenaLocked;
      const isDiscoveredButNotOwned = !isOwned && !isArenaLocked;
      const rarityStyle = RARITY_INFO[card.rarity];
      let borderColor = rarityStyle.color;
      
      const isTower = card.type === CardType.TOWER;
      const isSelectedTower = isTower && selectedTowerId === card.id;

      if (canUpgrade) borderColor = 'border-green-500 dark:border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
      if (isTrulyLocked || isDiscoveredButNotOwned) borderColor = 'border-gray-300 dark:border-gray-700';

      return (
        <div 
            key={card.id}
            onClick={() => handleCollectionCardClick(card)}
            className={`
                relative bg-white dark:bg-gray-800 flex flex-col items-center justify-center p-1
                cursor-pointer active:scale-95
                ${isTrulyLocked || isDiscoveredButNotOwned ? 'grayscale opacity-70' : ''}
                ${selectedDeckSlot !== null && isOwned && !isSmall && !isTower ? 'animate-pulse ring-2 ring-blue-400' : ''}
                ${inDeck && !isSmall && !isTower ? 'opacity-50 saturate-50' : ''}
                ${borderColor}
                shadow-sm
                overflow-hidden
                ${isTower ? '' : 'rounded-lg border-b-4 aspect-[3/4]'} 
            `}
            style={isTower ? { clipPath: hexClipPath, aspectRatio: '1/1', padding: '5%' } : {}}
        >
             {/* If Tower, wrap in another div to handle border simulation since clip-path cuts borders */}
            {isTower && (
                <div className={`absolute inset-0 z-0 bg-current opacity-20 ${rarityStyle.color.replace('border-', 'bg-')}`}></div>
            )}
            
            {!isTrulyLocked && !isTower && (
                 <div className={`absolute inset-0 opacity-20 ${rarityStyle.color.replace('border-', 'bg-')}`}></div>
            )}
            
            <div className={`relative z-10 w-full h-full flex items-center justify-center pb-4`}>
                <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
            </div>
            
            {isOwned && (
                 <div className="absolute top-1 left-1 text-[10px] font-bold text-white bg-blue-600 px-1 rounded shadow-sm border border-blue-400 z-20">
                     Lv.{data.level}
                 </div>
            )}
            
            {inDeck && !isSmall && !isTower && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">IN DECK</span>
                </div>
            )}
            
            {!isTrulyLocked && !isTower && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-white dark:border-gray-900 z-20 text-white">
                    {card.cost}
                </div>
            )}
            
            {!isTrulyLocked && !isSmall && (
                <div className="absolute bottom-2 left-1 right-1 bg-black/60 rounded px-1 py-0.5 flex justify-center items-center z-20 border border-white/10">
                    <span className="text-[9px] text-white font-bold uppercase truncate tracking-tight">{card.name}</span>
                </div>
            )}

            {isSelectedTower && (
                <div className="absolute top-2 right-2 z-30 bg-green-500 text-white rounded-full p-1 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
            )}

            {!isSmall && isOwned && data.level < MAX_LEVEL && (
                <div className="absolute bottom-8 left-2 right-2 h-1.5 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 z-20">
                    <div 
                        className={`h-full ${canUpgrade ? 'bg-green-500' : 'bg-blue-500'} transition-all`} 
                        style={{ width: `${progressPct}%` }}></div>
                </div>
            )}
            {canUpgrade && !isSmall && (
                 <div className="absolute bottom-6 w-full flex justify-center z-30">
                     <div className="bg-green-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-green-400 shadow-sm animate-bounce">
                         UPGRADE
                     </div>
                 </div>
            )}
            {isTrulyLocked && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-black/10 z-20">
                    <span className="text-2xl">🔒</span>
                </div>
            )}
        </div>
      );
  };

  const selectedCardDef = cardDetailId ? [...CARDS, ...TOWERS].find(c => c.id === cardDetailId) : null;
  const selectedTowerDef = TOWERS.find(t => t.id === selectedTowerId);

  // Prepare Level Up Data
  const levelUpCardDef = levelUpState ? [...CARDS, ...TOWERS].find(c => c.id === levelUpState.cardId) : null;
  const levelUpOldStats = levelUpState && levelUpCardDef ? calculateStats(levelUpCardDef.stats, levelUpState.oldLevel) : null;
  const levelUpNewStats = levelUpState && levelUpCardDef ? calculateStats(levelUpCardDef.stats, levelUpState.oldLevel + 1) : null;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Collection</h1>
        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-black/40 px-3 py-1 rounded-full border border-yellow-300 dark:border-yellow-800/50">
            <span className="text-yellow-700 dark:text-yellow-400 font-bold">{gold.toLocaleString()}</span>
            <div className="w-4 h-4"><GoldIcon /></div>
        </div>
      </div>
      
      {/* Deck Selector / Mode Tabs */}
      <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800/50 gap-4">
            
            {/* Deck Tabs (Only show if not viewing towers or emotes) */}
            {!isViewingTowers && !isViewingEmotes && (
                <div className="flex justify-center gap-2">
                        {[0, 1, 2].map(i => (
                            <button
                                key={i}
                                onClick={() => { playClickSound(); onSwitchDeckIndex(i); setSelectedDeckSlot(null); }}
                                className={`px-4 py-1 rounded-full font-bold text-xs border transition-colors ${activeDeckIndex === i ? 'bg-yellow-500 border-yellow-300 text-white dark:text-black' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                Deck {i + 1}
                            </button>
                        ))}
                </div>
            )}

            {/* Customization Slots */}
            <div className="flex items-center justify-center gap-6">
                {/* Tower Slot */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Tower Troop</span>
                    <div 
                        onClick={() => { playClickSound(); setIsViewingTowers(true); setIsViewingEmotes(false); }}
                        className={`w-16 h-16 bg-gray-300 dark:bg-gray-700 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg relative ${isViewingTowers ? 'ring-2 ring-yellow-400' : ''}`}
                        style={{ clipPath: hexClipPath }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/20 pointer-events-none"></div>
                        {selectedTowerDef && (
                            <div className="w-[80%] h-[80%] relative z-10">
                                <UnitModel defId={selectedTowerDef.id} side={PlayerSide.PLAYER} variant="card" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Emote Slot */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Emotes</span>
                    <div 
                        onClick={() => { playClickSound(); setIsViewingEmotes(true); setIsViewingTowers(false); }}
                        className={`w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-xl cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg border-2 ${isViewingEmotes ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-gray-400 dark:border-gray-600'}`}
                    >
                        <span className="text-3xl animate-bounce">
                            {emoteDeck[0] || '😀'}
                        </span>
                    </div>
                </div>
            </div>
      </div>

      {/* Main Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {isViewingTowers ? (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-center px-2 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg p-2 border border-gray-300 dark:border-gray-700">
                     <h2 className="font-black text-gray-600 dark:text-gray-300 uppercase tracking-wide text-sm">Tower Skins</h2>
                     <button 
                        onClick={() => { playButtonSound(); setIsViewingTowers(false); }} 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow active:scale-95 transition-all"
                     >
                        Close
                     </button>
                 </div>
                 <div className="grid grid-cols-3 gap-4 pb-20">
                    {TOWERS.map(tower => {
                        // Check unlock logic for towers (mostly trophies)
                        const isUnlocked = currentTrophies >= tower.unlockTrophies;
                        return renderCard(tower, false, !isUnlocked);
                    })}
                 </div>
             </div>
        ) : isViewingEmotes ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-center px-2 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg p-2 border border-gray-300 dark:border-gray-700">
                     <h2 className="font-black text-gray-600 dark:text-gray-300 uppercase tracking-wide text-sm">Emote Deck</h2>
                     <button 
                        onClick={() => { playButtonSound(); setIsViewingEmotes(false); }} 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow active:scale-95 transition-all"
                     >
                        Close
                     </button>
                 </div>

                 {/* Current Deck Grid */}
                 <div className="mb-6">
                     <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase px-1">Selected ({emoteDeck.length}/8)</h3>
                     <div className="grid grid-cols-4 gap-3 bg-gray-200 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-300 dark:border-gray-700">
                         {Array.from({length: 8}).map((_, i) => {
                             const emote = emoteDeck[i];
                             return (
                                 <button 
                                    key={i}
                                    onClick={() => emote && handleEmoteClick(emote, false)}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-3xl shadow-sm border-2 transition-all active:scale-95 ${emote ? 'bg-white dark:bg-gray-700 border-white dark:border-gray-600 hover:border-red-400' : 'bg-black/10 border-dashed border-gray-400 dark:border-gray-600'}`}
                                 >
                                     {emote}
                                 </button>
                             );
                         })}
                     </div>
                 </div>

                 {/* Collection Grid */}
                 <div>
                     <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase px-1">Collection</h3>
                     <div className="grid grid-cols-4 gap-3 pb-20">
                         {allAvailableEmotes.map((emote, i) => {
                             const isUnlocked = unlockedEmotes.includes(emote);
                             const isSelected = emoteDeck.includes(emote);
                             
                             return (
                                 <button
                                    key={i}
                                    onClick={() => handleEmoteClick(emote, !isUnlocked)}
                                    disabled={!isUnlocked}
                                    className={`
                                        aspect-square rounded-lg flex items-center justify-center text-3xl shadow-sm border-2 transition-all active:scale-95 relative
                                        ${isSelected ? 'bg-green-100 dark:bg-green-900/30 border-green-500 opacity-50 grayscale' : ''}
                                        ${!isUnlocked ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed' : 'bg-white dark:bg-gray-700 border-white dark:border-gray-600 hover:border-blue-400'}
                                    `}
                                 >
                                     <span className={!isUnlocked ? 'grayscale blur-[1px]' : ''}>{emote}</span>
                                     {isSelected && (
                                         <div className="absolute inset-0 flex items-center justify-center">
                                             <span className="text-green-600 font-bold text-xs bg-white/80 px-1 rounded">EQUIPPED</span>
                                         </div>
                                     )}
                                     {!isUnlocked && (
                                         <div className="absolute inset-0 flex items-center justify-center">
                                             <span className="text-sm">🔒</span>
                                         </div>
                                     )}
                                 </button>
                             );
                         })}
                     </div>
                 </div>
            </div>
        ) : (
            <>
                {/* Active Deck View */}
                <div className="grid grid-cols-4 gap-2">
                    {currentDeck.map((cardId, index) => {
                        const card = CARDS.find(c => c.id === cardId);
                        if (!card) return null;
                        const isSelected = selectedDeckSlot === index;
                        const data = collection[card.id] || { level: RARITY_INFO[card.rarity].startLevel, count: 0 };
                        const rarityInfo = RARITY_INFO[card.rarity];
                        
                        return (
                            <div 
                                key={index}
                                onClick={() => handleDeckCardClick(index)}
                                className={`
                                    relative aspect-[3/4] bg-white dark:bg-gray-700 rounded-lg border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all overflow-hidden
                                    ${isSelected ? 'border-yellow-400 -translate-y-2 shadow-yellow-500/20 shadow-lg' : `${rarityInfo.color}`}
                                `}
                            >
                                {/* Background Tint */}
                                <div className={`absolute inset-0 opacity-20 ${rarityInfo.color.replace('border-', 'bg-')}`}></div>
                                
                                <div className="relative z-10 w-full h-full flex items-center justify-center pb-3">
                                    <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
                                </div>

                                <div className="absolute top-0.5 left-0.5 text-[8px] bg-blue-600 px-1 rounded text-white z-20 border border-blue-400">Lv.{data.level}</div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-[9px] font-bold border border-white z-20 text-white">
                                    {card.cost}
                                </div>
                                
                                <div className="absolute bottom-0 w-full bg-black/50 text-[6px] text-white text-center font-bold truncate px-0.5">
                                    {card.name}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Collection Groups by Arena */}
                <div className="space-y-8 pb-20 mt-6">
                    {ARENAS.map(arena => {
                        const arenaCards = CARDS.filter(c => c.unlockTrophies === arena.minTrophies);
                        if (arenaCards.length === 0) return null;
                        const isArenaUnlocked = currentTrophies >= arena.minTrophies;

                        return (
                            <div key={arena.id}>
                                <div className="flex items-center gap-2 mb-3 px-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <div className="w-6 h-6"><ArenaIcon id={arena.id} /></div>
                                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">{arena.name}</h3>
                                    {!isArenaUnlocked && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">Locked</span>}
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {arenaCards.map(card => {
                                        const inDeck = currentDeck.includes(card.id);
                                        return renderCard(card, inDeck, !isArenaUnlocked);
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </div>

      {/* Card Details Modal */}
      {selectedCardDef && (
          <CardDetailsModal 
              card={selectedCardDef}
              collection={collection}
              gold={gold}
              gems={gems}
              onClose={() => setCardDetailId(null)}
              onUpgrade={handleUpgradeClick}
              onBuyCards={onBuyCards}
              onSelectTower={onSelectTower}
              selectedTowerId={selectedTowerId}
              currentDeck={currentDeck}
              onEquip={handleEquipFromModal}
          />
      )}
    </div>
  );
};
