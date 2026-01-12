
import React, { useState } from 'react';
import { CardDef, PlayerCollection, PlayerSide } from '../types';
import { calculateStats, RARITY_INFO, DEFAULT_EMOTES } from '../constants';
import { UnitModel } from './UnitModels';
import { playClickSound } from '../services/audio';

interface CardHandProps {
  cards: CardDef[];
  selectedCardId: string | null;
  onSelectCard: (card: CardDef) => void;
  elixir: number;
  nextCard: CardDef;
  collection: PlayerCollection;
  onEmote?: (emote: string) => void;
  emoteDeck?: string[];
}

export const CardHand: React.FC<CardHandProps> = ({ cards, selectedCardId, onSelectCard, elixir, nextCard, collection, onEmote, emoteDeck }) => {
  const [showEmoteMenu, setShowEmoteMenu] = useState(false);
  
  // Use passed deck or fallback to defaults
  const currentEmotes = (emoteDeck && emoteDeck.length > 0) ? emoteDeck : DEFAULT_EMOTES;

  const renderCardContent = (card: CardDef, isNext: boolean = false) => {
      const data = collection[card.id] || { level: RARITY_INFO[card.rarity].startLevel, count: 0 };
      const rarityConfig = RARITY_INFO[card.rarity];
      const canAfford = elixir >= card.cost;
      
      return (
          <div className="w-full h-full relative overflow-hidden rounded-md flex flex-col">
              {/* Background Image/Gradient based on rarity */}
              <div className={`absolute inset-0 opacity-20 ${rarityConfig.color.replace('border-', 'bg-')}`}></div>
              
              {/* Character Model Container */}
              <div className="flex-1 flex items-center justify-center relative bg-gradient-to-b from-transparent to-black/20 z-0 p-1">
                  <div className={`w-full h-full transform transition-transform ${!isNext && canAfford ? 'group-active:scale-90' : ''}`}>
                      {/* Use 'card' variant to show swarm visuals if applicable */}
                      <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
                  </div>
              </div>

              {/* Elixir Drop (Top Left) */}
              <div className="absolute top-0.5 left-0.5 w-5 h-6 z-10 filter drop-shadow-md">
                   <svg viewBox="0 0 24 30" className="w-full h-full fill-purple-600 stroke-purple-800 stroke-2">
                       <path d="M12 2 C12 2 4 12 4 19 C4 25 12 30 12 30 C12 30 20 25 20 19 C20 12 12 2 12 2 Z" />
                   </svg>
                   <span className="absolute inset-0 flex items-center justify-center text-white font-black text-xs pt-0.5 shadow-black">{card.cost}</span>
              </div>

              {/* Level (Bottom Center) */}
              {!isNext && (
                  <div className="absolute bottom-5 w-full text-center z-10">
                      <span className="text-[8px] font-black text-white px-1 py-px bg-black/50 rounded border border-white/20">Lv.{data.level}</span>
                  </div>
              )}

              {/* Name Plate (Bottom) */}
              {!isNext && (
                  <div className="h-4 bg-black/60 flex items-center justify-center z-10 border-t border-white/10">
                      <span className="text-[8px] font-bold text-white uppercase tracking-tight truncate px-1">{card.name}</span>
                  </div>
              )}
              
              {/* Unavailable Overlay */}
              {!isNext && !canAfford && (
                  <div className="absolute inset-0 bg-black/40 z-20 grayscale flex items-center justify-center">
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="h-36 bg-[#5d4037] border-t-4 border-[#3e2723] flex items-end pb-2 px-2 gap-2 relative z-40 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
      
      {/* Background Wood Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.2) 50px, rgba(0,0,0,0.2) 52px), 
                              repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)` 
        }}
      ></div>

      {/* Emote Menu Popover */}
      {showEmoteMenu && onEmote && (
          <div className="absolute bottom-36 left-2 bg-white rounded-xl shadow-xl p-2 grid grid-cols-4 gap-2 z-50 animate-in slide-in-from-bottom-5 w-48">
              {currentEmotes.map((emote, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { playClickSound(); onEmote(emote); setShowEmoteMenu(false); }}
                    className="text-3xl hover:scale-125 transition-transform flex items-center justify-center h-10 w-10"
                  >
                      {emote}
                  </button>
              ))}
          </div>
      )}

      {/* Next Card Slot & Emote Button */}
      <div className="flex flex-col items-center justify-end mb-1 mr-1 gap-1">
        {onEmote && (
            <button 
                onClick={() => { playClickSound(); setShowEmoteMenu(!showEmoteMenu); }}
                className="w-8 h-8 bg-white/10 rounded-full border border-white/20 text-lg flex items-center justify-center active:scale-95 transition-all mb-1 hover:bg-white/20 relative"
            >
                💬
                {showEmoteMenu && <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>}
            </button>
        )}
        <span className="text-[#d7ccc8] text-[8px] font-black uppercase tracking-widest drop-shadow-sm">Next</span>
        <div className="w-12 h-14 rounded-lg bg-black/40 border-2 border-[#3e2723] p-1 opacity-80 scale-90 grayscale shadow-inner">
           {renderCardContent(nextCard, true)}
        </div>
      </div>

      {/* Active Hand */}
      <div className="flex-1 flex justify-between items-end gap-1">
        {cards.map((card) => {
          const canAfford = elixir >= card.cost;
          const isSelected = selectedCardId === card.id;

          return (
            <button
              key={card.id}
              onClick={() => canAfford && onSelectCard(card)}
              disabled={!canAfford}
              className={`
                group relative w-[23%] aspect-[3/4] rounded-lg transition-all duration-150 ease-out
                ${isSelected ? 'transform -translate-y-4 z-20 ring-4 ring-yellow-400 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : 'hover:-translate-y-1'}
                ${canAfford ? 'cursor-pointer' : 'cursor-not-allowed transform scale-95 opacity-80'}
              `}
            >
              {/* Card Container */}
              <div className={`
                  w-full h-full rounded-lg border-2 bg-[#5d6d7e] overflow-hidden shadow-md
                  ${RARITY_INFO[card.rarity].color}
              `}>
                  {renderCardContent(card)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
