
import React, { useState } from 'react';
import { CardDef, ShopItem, ChestType, PlayerSide } from '../types';
import { CARDS, EXCHANGE_RATES, CHEST_CONFIG, RARITY_INFO } from '../constants';
import { UnitModel } from './UnitModels';
import { ChestModel } from './ChestModel';
import { GoldIcon, GemIcon } from './ResourceIcons';
import { playClickSound, playItemRevealSound } from '../services/audio';

interface ShopScreenProps {
  coins: number;
  gems: number;
  dailyDeals: ShopItem[];
  dailyEmoteDeals: ShopItem[];
  onBuyItem: (item: ShopItem) => void;
  onExchange: (type: 'GEMS_TO_COINS' | 'COINS_TO_GEMS', amount: number) => void;
  onReroll: () => void;
}

// Simple Audio Synth for generic purchase (Emotes)
const playPurchaseSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const t = ctx.currentTime;

    // Coin/Cash Register Sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.start(t);
    osc.stop(t + 0.3);

    // Success Chord
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chord.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t + 0.1);
        g.gain.linearRampToValueAtTime(0.1, t + 0.15 + (i * 0.02));
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        o.start(t + 0.1);
        o.stop(t + 0.8);
    });
};

export const ShopScreen: React.FC<ShopScreenProps> = ({ 
  coins, 
  gems, 
  dailyDeals, 
  dailyEmoteDeals,
  onBuyItem, 
  onExchange,
  onReroll
}) => {
  const [purchasedItemOverlay, setPurchasedItemOverlay] = useState<ShopItem | null>(null);

  const handleBuyClick = (item: ShopItem) => {
      onBuyItem(item);
      
      // Only show overlay for Cards and Emotes (Chests have their own modal in App.tsx)
      if (item.type !== 'CHEST') {
          if (item.type === 'CARD' && item.cardId) {
              const card = CARDS.find(c => c.id === item.cardId);
              playItemRevealSound(card?.rarity);
          } else {
              playPurchaseSound();
          }
          setPurchasedItemOverlay(item);
      }
  };

  const renderCard = (card: CardDef) => {
      const rarityConfig = RARITY_INFO[card.rarity];
      return (
          <div className={`relative w-full h-full rounded border-2 overflow-hidden flex items-center justify-center ${rarityConfig.color}`}>
              {/* Background Tint */}
              <div className={`absolute inset-0 opacity-20 ${rarityConfig.color.replace('border-', 'bg-')}`}></div>
              {/* Unit Model */}
              <div className="relative z-10 w-[80%] h-[80%] flex items-center justify-center">
                  <UnitModel defId={card.id} side={PlayerSide.PLAYER} variant="card" />
              </div>
          </div>
      );
  };

  // Helper to get card def for overlay
  const getPurchasedCardDef = () => {
      if (purchasedItemOverlay?.type === 'CARD' && purchasedItemOverlay.cardId) {
          return CARDS.find(c => c.id === purchasedItemOverlay.cardId);
      }
      return null;
  };

  const purchasedCard = getPurchasedCardDef();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg border-b border-gray-200 dark:border-gray-700 flex justify-center items-center z-10 transition-colors">
        <h1 className="text-xl font-black uppercase tracking-widest text-green-600 dark:text-green-400">Shop</h1>
      </div>

      {/* Resources Bar */}
      <div className="flex justify-center gap-4 py-2 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600">
             <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{coins.toLocaleString()}</span>
             <div className="w-4 h-4"><GoldIcon /></div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-full border border-green-300 dark:border-green-800">
             <span className="text-sm font-bold text-green-600 dark:text-green-400">{gems.toLocaleString()}</span>
             <div className="w-4 h-4"><GemIcon /></div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20">
        
        {/* Daily Deals (Cards) */}
        <section>
            <div className="flex justify-between items-center mb-3 ml-2 mr-2">
                <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm">Daily Cards</h2>
                <button 
                    onClick={() => { playClickSound(); onReroll(); }}
                    disabled={gems < 10}
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 transition-all ${gems >= 10 ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 active:scale-95' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-400 cursor-not-allowed'}`}
                >
                    <span>Reroll</span>
                    <span className="bg-green-500 text-white rounded px-1 text-[9px] flex items-center gap-0.5">10 <div className="w-2.5 h-2.5 inline-block"><GemIcon /></div></span>
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {dailyDeals.map(item => {
                    const card = CARDS.find(c => c.id === item.cardId);
                    if (!card) return null;
                    const canAfford = item.isFree || (item.currency === 'GOLD' ? coins >= item.cost : gems >= item.cost);

                    return (
                        <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col items-center border ${item.purchased ? 'border-gray-200 dark:border-gray-700 opacity-80' : 'border-gray-200 dark:border-gray-700'} relative overflow-hidden shadow-sm aspect-[3/5]`}>
                            
                            {/* Card Visual */}
                            <div className="flex-1 w-full mb-1">
                                {renderCard(card)}
                            </div>

                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-0.5">x{item.amount}</div>
                            <div className="text-xs font-bold text-center leading-none h-4 flex items-center justify-center text-gray-800 dark:text-gray-200 truncate w-full">{card.name}</div>
                            
                            {!item.purchased ? (
                                <button 
                                    disabled={!canAfford}
                                    onClick={() => handleBuyClick(item)}
                                    className={`
                                        w-full mt-1 py-1 px-1 rounded text-xs font-bold flex items-center justify-center gap-1 z-20
                                        ${item.isFree 
                                            ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse' 
                                            : (canAfford ? 'bg-orange-500 text-white shadow-sm active:scale-95' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed')
                                        }
                                    `}
                                >
                                    {item.isFree ? (
                                        <span>FREE</span>
                                    ) : (
                                        <>
                                            <span>{item.cost}</span>
                                            <div className="w-3 h-3">{item.currency === 'GOLD' ? <GoldIcon /> : <GemIcon />}</div>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="w-full mt-1 py-1 px-1 rounded text-xs font-bold flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-default">
                                    SOLD
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Daily Emotes */}
        {dailyEmoteDeals.length > 0 && (
          <section>
              <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm mb-3 ml-2">Daily Emotes</h2>
              <div className="grid grid-cols-3 gap-3">
                  {dailyEmoteDeals.map(item => {
                      const canAfford = item.currency === 'GOLD' ? coins >= item.cost : gems >= item.cost;
                      return (
                          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center border ${item.purchased ? 'border-gray-200 dark:border-gray-700 opacity-80' : 'border-gray-200 dark:border-gray-700'} relative overflow-hidden shadow-sm`}>
                              <div className="mb-2 text-4xl animate-bounce">{item.emoteContent}</div>
                              <div className="text-xs font-bold text-center leading-none h-6 flex items-center justify-center text-gray-800 dark:text-gray-200">Emote</div>
                              
                              {!item.purchased ? (
                                  <button 
                                      disabled={!canAfford}
                                      onClick={() => handleBuyClick(item)}
                                      className={`
                                          w-full mt-2 py-1 px-2 rounded text-xs font-bold flex items-center justify-center gap-1
                                          ${canAfford ? 'bg-green-500 hover:bg-green-400 text-white shadow-sm active:scale-95' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                                      `}
                                  >
                                      <span>{item.cost}</span>
                                      <div className="w-3 h-3">{item.currency === 'GOLD' ? <GoldIcon /> : <GemIcon />}</div>
                                  </button>
                              ) : (
                                  <div className="w-full mt-2 py-1 px-2 rounded text-xs font-bold flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-default">
                                      OWNED
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </section>
        )}

        {/* Chests */}
        <section>
             <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm mb-3 ml-2">Chests</h2>
             <div className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2">
                 {(['MYSTERY', 'SILVER', 'GOLDEN', 'MAGICAL'] as ChestType[]).map(type => {
                     const config = CHEST_CONFIG[type];
                     const cost = (config as any).cost || (type === 'SILVER' ? 30 : type === 'GOLDEN' ? 80 : 300);
                     const canAfford = gems >= cost;

                     return (
                         <div key={type} className="flex-shrink-0 w-32 bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center border border-gray-200 dark:border-gray-700 shadow-md">
                             <div className="w-24 h-24 mb-2 filter drop-shadow">
                                 <ChestModel type={type} />
                             </div>
                             <div className="text-xs font-black uppercase text-gray-600 dark:text-gray-300 mb-2">{type === 'MYSTERY' ? 'Mystery Box' : type}</div>
                             <button
                                 onClick={() => {
                                     playClickSound();
                                     if(canAfford) onBuyItem({ id: `shop_chest_${type}_${Date.now()}`, type: 'CHEST', chestType: type, chestLevel: 1, amount: 1, cost: cost, currency: 'GEMS', purchased: false });
                                 }}
                                 disabled={!canAfford}
                                 className={`
                                     w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1
                                     ${canAfford ? 'bg-green-500 hover:bg-green-400 text-white shadow active:scale-95' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'}
                                 `}
                             >
                                 <span>{cost}</span>
                                 <div className="w-3 h-3"><GemIcon /></div>
                             </button>
                         </div>
                     );
                 })}
             </div>
        </section>

        {/* Currency Exchange */}
        <section>
            <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm mb-3 ml-2">Treasure</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="w-16 h-16 mb-2 relative">
                        <div className="absolute inset-0 scale-150"><GoldIcon /></div>
                    </div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white mb-2">1000 Gold</div>
                    <button 
                        onClick={() => {
                            if(gems >= 11) {
                                playClickSound();
                                onExchange('GEMS_TO_COINS', 1000);
                            }
                        }}
                        disabled={gems < 11}
                        className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${gems >= 11 ? 'bg-green-500 hover:bg-green-400 text-white active:scale-95' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'}`}
                    >
                        <span>11</span>
                        <div className="w-3 h-3"><GemIcon /></div>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="w-16 h-16 mb-2 relative">
                        <div className="absolute inset-0 scale-150"><GemIcon /></div>
                    </div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white mb-2">10 Gems</div>
                    <button 
                        onClick={() => {
                            if(coins >= 1100) {
                                playClickSound();
                                onExchange('COINS_TO_GEMS', 1100);
                            }
                        }}
                        disabled={coins < 1100}
                        className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${coins >= 1100 ? 'bg-orange-500 hover:bg-orange-400 text-white active:scale-95' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'}`}
                    >
                        <span>1100</span>
                        <div className="w-3 h-3"><GoldIcon /></div>
                    </button>
                </div>
            </div>
        </section>
      </div>

      {/* Purchased Overlay */}
      {purchasedItemOverlay && (
          <div 
            onClick={() => setPurchasedItemOverlay(null)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in duration-200"
          >
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="relative mb-8">
                      {/* Rays */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-white/20 to-transparent rounded-full animate-spin [animation-duration:10s]">
                        <div className="w-full h-full rounded-full" style={{ background: 'repeating-conic-gradient(transparent 0deg 15deg, rgba(255,255,255,0.1) 15deg 30deg)' }}></div>
                      </div>
                      
                      {/* Card or Emote */}
                      <div className="relative z-10 transform scale-150">
                          {purchasedItemOverlay.type === 'CARD' && purchasedCard ? (
                              <div className={`w-32 h-40 rounded-lg border-4 bg-white dark:bg-gray-800 shadow-2xl flex flex-col items-center overflow-hidden ${RARITY_INFO[purchasedCard.rarity].color}`}>
                                  <div className={`absolute inset-0 opacity-20 ${RARITY_INFO[purchasedCard.rarity].color.replace('border-', 'bg-')}`}></div>
                                  <div className="relative z-10 w-full h-full flex items-center justify-center pb-4">
                                      <UnitModel defId={purchasedCard.id} side={PlayerSide.PLAYER} variant="card" />
                                  </div>
                                  <div className="absolute bottom-0 w-full bg-black/50 text-[10px] text-white text-center font-bold px-1 py-0.5">
                                      {purchasedCard.name}
                                  </div>
                              </div>
                          ) : (
                              <div className="text-8xl animate-bounce">
                                  {purchasedItemOverlay.emoteContent}
                              </div>
                          )}
                      </div>
                  </div>

                  <h2 className="text-4xl font-black text-white uppercase drop-shadow-lg mb-2">Purchased!</h2>
                  
                  {purchasedItemOverlay.type === 'CARD' && (
                      <div className="text-2xl font-bold text-green-400 mb-8">
                          x{purchasedItemOverlay.amount}
                      </div>
                  )}

                  <div className="text-white/50 text-sm animate-pulse">Tap to close</div>
              </div>
          </div>
      )}
    </div>
  );
};
