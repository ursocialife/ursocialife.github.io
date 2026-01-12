
import React, { useState } from 'react';
import { GameMode } from '../types';
import { playButtonSound, playClickSound } from '../services/audio';

interface MultiplayerScreenProps {
    onStartHosting: (mode: GameMode) => Promise<string>; // Returns code
    onJoinGame: (code: string) => Promise<void>;
    connectionStatus: 'IDLE' | 'CONNECTING' | 'WAITING' | 'CONNECTED' | 'ERROR';
    errorMessage?: string;
    onCancel: () => void;
}

const MODES: { id: GameMode; name: string; description: string; color: string; icon: string }[] = [
    { id: 'STANDARD', name: 'Ranked 1v1', description: 'Standard Rules', color: 'bg-yellow-600', icon: '🏆' },
    { id: 'TRIPLE_ELIXIR', name: 'Triple Elixir', description: '3x Elixir Speed', color: 'bg-purple-600', icon: '⚡' },
    { id: 'SUDDEN_DEATH', name: 'Sudden Death', description: 'First Tower Wins', color: 'bg-red-600', icon: '💀' },
    { id: 'MIRROR', name: 'Mirror Match', description: 'Same Deck, Same Level', color: 'bg-blue-600', icon: '🎭' },
    { id: 'RAGE', name: 'Infinite Rage', description: 'Entire Arena Raged', color: 'bg-orange-600', icon: '😡' },
];

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({ onStartHosting, onJoinGame, connectionStatus, errorMessage, onCancel }) => {
    const [view, setView] = useState<'MENU' | 'CREATE' | 'JOIN'>('MENU');
    const [joinCode, setJoinCode] = useState('');
    const [hostCode, setHostCode] = useState('');

    const handleCreate = async (mode: GameMode) => {
        const code = await onStartHosting(mode);
        setHostCode(code);
    };

    const handleJoin = () => {
        if (joinCode.length === 6) {
            playButtonSound();
            onJoinGame(joinCode);
        }
    };

    if (connectionStatus === 'WAITING' && hostCode) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
                <div className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-widest">Waiting for Opponent</div>
                
                <div className="bg-white/10 p-8 rounded-2xl border-4 border-dashed border-white/20 mb-8 animate-pulse">
                    <div className="text-6xl font-black font-mono tracking-[0.5em] text-center pl-4">{hostCode}</div>
                </div>
                
                <p className="text-sm text-center text-gray-500 max-w-xs mb-12">
                    Share this code with your friend. They must enter it in the "Join Party" menu.
                </p>

                <button 
                    onClick={onCancel}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (connectionStatus === 'CONNECTING') {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                <div className="text-2xl font-black uppercase tracking-widest">Connecting...</div>
                <button onClick={onCancel} className="mt-8 text-gray-500 hover:text-white underline">Cancel</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto pb-24">
            <h1 className="text-3xl font-black uppercase italic tracking-widest text-center mb-8 text-blue-400 drop-shadow-md">
                Battle Arena
            </h1>

            {errorMessage && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-center text-sm font-bold">
                    {errorMessage}
                </div>
            )}
            
            {view === 'MENU' && (
                <div className="flex flex-col gap-4 max-w-sm mx-auto w-full mt-8">
                    <button 
                        onClick={() => { playClickSound(); setView('CREATE'); }}
                        className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl border-4 border-blue-400 shadow-xl flex items-center justify-between px-6 active:scale-95 transition-all group"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-black uppercase italic">Create Party</span>
                            <span className="text-xs text-blue-200 font-bold">Host a game and invite a friend</span>
                        </div>
                        <span className="text-5xl group-hover:scale-110 transition-transform">⚔️</span>
                    </button>

                    <button 
                        onClick={() => { playClickSound(); setView('JOIN'); }}
                        className="h-32 bg-gradient-to-r from-green-600 to-green-800 rounded-xl border-4 border-green-400 shadow-xl flex items-center justify-between px-6 active:scale-95 transition-all group"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-black uppercase italic">Join Party</span>
                            <span className="text-xs text-green-200 font-bold">Enter a code to join a friend</span>
                        </div>
                        <span className="text-5xl group-hover:scale-110 transition-transform">🔑</span>
                    </button>
                </div>
            )}

            {view === 'CREATE' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setView('MENU')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">⬅</button>
                        <h2 className="text-lg font-bold uppercase text-gray-400">Select Mode</h2>
                    </div>
                    {MODES.map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => { playButtonSound(); handleCreate(mode.id); }}
                            className={`relative w-full overflow-hidden rounded-xl border-4 border-white/10 shadow-lg cursor-pointer active:scale-95 transition-transform group text-left h-24`}
                        >
                            <div className={`absolute inset-0 ${mode.color} opacity-80 transition-opacity group-hover:opacity-100`}></div>
                            <div className="relative z-10 p-4 flex items-center justify-between h-full">
                                <div>
                                    <h2 className="text-xl font-black uppercase italic drop-shadow-md">{mode.name}</h2>
                                    <p className="text-[10px] font-bold text-white/80">{mode.description}</p>
                                </div>
                                <div className="text-4xl">{mode.icon}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {view === 'JOIN' && (
                <div className="flex flex-col items-center mt-12 max-w-xs mx-auto">
                    <div className="flex items-center gap-2 mb-8 self-start">
                        <button onClick={() => setView('MENU')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">⬅</button>
                        <h2 className="text-lg font-bold uppercase text-gray-400">Enter Code</h2>
                    </div>

                    <input 
                        type="text" 
                        pattern="[0-9]*"
                        maxLength={6}
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full bg-black/40 border-b-4 border-gray-500 focus:border-blue-500 outline-none text-center text-5xl font-mono tracking-[0.2em] py-4 rounded-t-lg transition-colors placeholder-gray-700 mb-8"
                    />

                    <button 
                        onClick={handleJoin}
                        disabled={joinCode.length !== 6}
                        className={`
                            w-full py-4 rounded-xl font-black text-xl uppercase tracking-wider shadow-lg transition-all
                            ${joinCode.length === 6 ? 'bg-green-500 hover:bg-green-400 text-white active:scale-95' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        Join Battle
                    </button>
                </div>
            )}
        </div>
    );
};
