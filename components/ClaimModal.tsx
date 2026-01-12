
import React, { useEffect } from 'react';
import { GoldIcon, GemIcon } from './ResourceIcons';
import { playCoinSound, playGemSound } from '../services/audio';

interface ClaimModalProps {
  type: 'GOLD' | 'GEMS' | 'EMOTE';
  amount: number;
  content?: string;
  onClose: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ type, amount, content, onClose }) => {
    useEffect(() => {
        if (type === 'GOLD') {
            playCoinSound();
        } else if (type === 'GEMS') {
            playGemSound();
        }
        // Emote sound is handled by the parent component (App.tsx) via playItemRevealSound
    }, [type]);

    return (
        <div 
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-200 overflow-hidden"
        >
            <div className="flex flex-col items-center animate-in zoom-in duration-300 relative z-10">
                
                {/* Glow Effect */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-pulse ${type === 'GOLD' ? 'bg-yellow-500' : (type === 'GEMS' ? 'bg-green-500' : 'bg-purple-500')}`}></div>

                {/* Light Rays */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full animate-spin [animation-duration:10s]">
                    <div className="w-full h-full rounded-full" style={{ background: 'repeating-conic-gradient(transparent 0deg 15deg, rgba(255,255,255,0.1) 15deg 30deg)' }}></div>
                </div>

                <h2 className="text-4xl font-black text-white uppercase drop-shadow-lg mb-8 tracking-wider scale-110">Claimed!</h2>

                <div className="w-48 h-48 mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce relative flex items-center justify-center">
                    {type === 'GOLD' && <GoldIcon />}
                    {type === 'GEMS' && <GemIcon />}
                    {type === 'EMOTE' && <div className="text-9xl filter drop-shadow-xl">{content}</div>}
                </div>

                {type !== 'EMOTE' && (
                    <div className={`text-6xl font-black stroke-black drop-shadow-xl mb-12 ${type === 'GOLD' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {amount.toLocaleString()}
                    </div>
                )}
                
                {type === 'EMOTE' && (
                    <div className="text-3xl font-black text-purple-300 stroke-black drop-shadow-xl mb-12 uppercase">
                        New Emote
                    </div>
                )}

                <div className="text-white/60 font-bold text-sm animate-pulse uppercase tracking-widest">Tap to Continue</div>
            </div>
        </div>
    );
};
