
import React, { useEffect, useState, useRef } from 'react';
import { ChestResult, PlayerSide } from '../types';
import { UnitModel } from './UnitModels';
import { ChestModel } from './ChestModel';
import { RARITY_INFO } from '../constants';
import { GoldIcon, GemIcon } from './ResourceIcons';
import { initAudio, playOscillator, playItemRevealSound, playCoinSound, playGemSound } from '../services/audio';

interface ChestModalProps {
  result: ChestResult;
  onClose: () => void;
}

const playChestOpenSound = (chestType: string) => {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (chestType === 'SILVER') {
        playOscillator(ctx, 'square', 200, 100, t, 0.2, 0.2);
        playOscillator(ctx, 'sawtooth', 800, 400, t, 0.1, 0.1);
        playOscillator(ctx, 'sine', 1200, 800, t, 0.3, 0.1); 
    } else if (chestType === 'GOLDEN') {
        playOscillator(ctx, 'square', 150, 50, t, 0.4, 0.3);
        playOscillator(ctx, 'triangle', 400, 300, t, 0.5, 0.2);
        setTimeout(() => playOscillator(ctx, 'sine', 880, null, ctx.currentTime, 0.2, 0.1), 100);
        setTimeout(() => playOscillator(ctx, 'sine', 1108, null, ctx.currentTime, 0.2, 0.1), 200);
    } else {
        playOscillator(ctx, 'sawtooth', 100, 50, t, 0.8, 0.3); 
        const chord = [440, 554, 659, 880, 1108];
        chord.forEach((freq, i) => {
             playOscillator(ctx, 'sine', freq, freq * 2, t + (i * 0.1), 0.6, 0.15);
        });
        playOscillator(ctx, 'triangle', 2000, 4000, t, 1.0, 0.05);
    }
};

export const ChestModal: React.FC<ChestModalProps> = ({ result, onClose }) => {
  const [stage, setStage] = useState(0);
  const showGems = result.gems > 0;
  const cardsStartIndex = showGems ? 3 : 2; 
  const totalItems = 1 + (showGems ? 1 : 0) + result.cards.length;
  const isFinished = stage > totalItems;

  const handleClick = () => {
    if (isFinished) {
        onClose();
    } else {
        setStage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (stage === 1) {
        playChestOpenSound(result.type);
        setTimeout(playCoinSound, 300); 
    } else if (stage === 2 && showGems) {
        playGemSound();
    } else if (stage >= cardsStartIndex && !isFinished) {
        const cardIndex = stage - cardsStartIndex;
        const reward = result.cards[cardIndex];
        if (reward) {
            playItemRevealSound(reward.def.rarity);
        }
    }
  }, [stage, result, showGems, cardsStartIndex, isFinished]);

  useEffect(() => {
    if (stage === 0) {
        const timer = setTimeout(() => setStage(1), 1000);
        return () => clearTimeout(timer);
    }
  }, [stage]);

  const renderContent = () => {
      if (stage === 0) {
          return (
              <div className="w-48 h-48 animate-bounce filter drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                  <ChestModel type={result.type} />
              </div>
          );
      }

      if (isFinished) {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-300 p-4">
                  <h2 className="text-3xl font-black text-white uppercase mb-4 drop-shadow-md tracking-wider shrink-0">Rewards</h2>
                  
                  <div className="w-full overflow-y-auto no-scrollbar flex-1 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                          {/* Gold */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col items-center justify-center aspect-[3/4] shadow-lg border-2 border-yellow-400 relative">
                              <div className="w-8 h-8 mb-1"><GoldIcon /></div>
                              <div className="font-bold text-yellow-600">{result.gold}</div>
                              <div className="absolute bottom-1 text-[8px] text-gray-400 uppercase font-bold">Gold</div>
                          </div>
                          
                          {/* Gems */}
                          {result.gems > 0 && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col items-center justify-center aspect-[3/4] shadow-lg border-2 border-green-400 relative">
                                  <div className="w-8 h-8 mb-1"><GemIcon /></div>
                                  <div className="font-bold text-green-600">{result.gems}</div>
                                  <div className="absolute bottom-1 text-[8px] text-gray-400 uppercase font-bold">Gems</div>
                              </div>
                          )}

                          {/* Cards */}
                          {result.cards.map((reward, idx) => {
                              const rarityInfo = RARITY_INFO[reward.def.rarity];
                              return (
                                  <div key={idx} className={`bg-white dark:bg-gray-800 rounded-lg p-1 flex flex-col items-center aspect-[3/4] shadow-lg border-2 relative overflow-hidden ${rarityInfo.color}`}>
                                      <div className={`absolute inset-0 opacity-20 ${rarityInfo.color.replace('border-', 'bg-')}`}></div>
                                      <div className="relative w-full h-full pb-4 flex items-center justify-center">
                                        <UnitModel defId={reward.def.id} side={PlayerSide.PLAYER} variant="card" />
                                      </div>
                                      <div className="absolute bottom-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded border border-blue-400 z-10">
                                          x{reward.count}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
                  
                  <div className="mt-6 text-white text-sm animate-pulse shrink-0">Tap to Close</div>
              </div>
          );
      }

      // Single Item View
      let content = null;
      let label = "";
      let subLabel = "";
      let colorClass = "";

      if (stage === 1) {
          // Gold
          label = result.gold.toString();
          subLabel = "Gold";
          colorClass = "text-yellow-400";
          content = <div className="w-32 h-32 filter drop-shadow-lg"><GoldIcon /></div>;
      } else if (stage === 2 && showGems) {
          // Gems
          label = result.gems.toString();
          subLabel = "Gems";
          colorClass = "text-green-400";
          content = <div className="w-32 h-32 filter drop-shadow-lg"><GemIcon /></div>;
      } else {
          // Card
          const cardIndex = stage - cardsStartIndex;
          const reward = result.cards[cardIndex];
          if (reward) {
              const rarityInfo = RARITY_INFO[reward.def.rarity];
              label = `x${reward.count}`;
              subLabel = reward.def.name;
              colorClass = "text-white";
              
              content = (
                  <div className={`relative w-48 h-64 bg-white dark:bg-gray-800 rounded-xl border-4 shadow-2xl overflow-hidden flex items-center justify-center ${rarityInfo.color}`}>
                      <div className={`absolute inset-0 opacity-20 ${rarityInfo.color.replace('border-', 'bg-')}`}></div>
                      <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                        <UnitModel defId={reward.def.id} side={PlayerSide.PLAYER} variant="card" />
                      </div>
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white bg-black/50 ${rarityInfo.textColor}`}>
                          {reward.def.rarity}
                      </div>
                  </div>
              );
          }
      }

      return (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-150">
              <h3 className="text-white font-bold uppercase tracking-widest text-xl mb-8 animate-pulse">Item {stage} / {totalItems}</h3>
              
              <div className="mb-8 transform transition hover:scale-110 duration-200">
                  {content}
              </div>

              <h1 className={`text-6xl font-black stroke-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${colorClass}`}>
                  {label}
              </h1>
              <h2 className="text-2xl font-bold text-gray-300 mt-2 uppercase">{subLabel}</h2>
              
              <div className="mt-12 text-gray-400 text-sm">Tap to Continue</div>
          </div>
      );
  };

  return (
    <div 
        onClick={handleClick}
        className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-white/10 to-transparent rounded-full animate-spin [animation-duration:10s]">
                <div className="w-full h-full rounded-full" style={{ background: 'repeating-conic-gradient(transparent 0deg 15deg, rgba(255,255,255,0.1) 15deg 30deg)' }}></div>
             </div>
        </div>
        {renderContent()}
    </div>
  );
};
