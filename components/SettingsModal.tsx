
import React, { useState } from 'react';

interface SettingsModalProps {
  username: string;
  onUpdateUsername: (name: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClose: () => void;
  muteEmotes: boolean;
  onToggleMuteEmotes: () => void;
  autoOpenRewards: boolean;
  onToggleAutoOpenRewards: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    username, 
    onUpdateUsername, 
    theme, 
    onToggleTheme, 
    onClose,
    muteEmotes,
    onToggleMuteEmotes,
    autoOpenRewards,
    onToggleAutoOpenRewards,
    musicEnabled,
    onToggleMusic,
    sfxEnabled,
    onToggleSfx
}) => {
    const [tempName, setTempName] = useState(username);
    const [showWipeConfirm, setShowWipeConfirm] = useState(false);

    const handleSave = () => {
        if(tempName.trim()) {
            onUpdateUsername(tempName.trim());
        }
        onClose();
    };

    const handleWipeSave = () => {
        localStorage.removeItem('CR_APP_DATA_V1');
        window.location.reload();
    };

    if (showWipeConfirm) {
        return (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border-2 border-red-500">
                    <div className="p-6 text-center space-y-4">
                        <div className="text-5xl animate-bounce">⚠️</div>
                        <h2 className="text-2xl font-black text-red-600 uppercase tracking-wide">Delete Save?</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                            This will permanently delete your progress, cards, and purchases. <br/><span className="font-bold text-red-500">This cannot be undone.</span>
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowWipeConfirm(false)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors uppercase text-sm tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWipeSave}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all uppercase text-sm tracking-wider"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-600">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-black uppercase tracking-wider text-gray-800 dark:text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-bold text-xl">✕</button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {/* Name Change Section */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                maxLength={12}
                             />
                        </div>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                    {/* Audio Settings */}
                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="font-bold text-gray-800 dark:text-white">Music</span>
                             <span className="text-xs text-gray-500">Toggle background music</span>
                         </div>
                         <button 
                             onClick={onToggleMusic}
                             className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${musicEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                         >
                             <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${musicEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </button>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="font-bold text-gray-800 dark:text-white">Sound Effects</span>
                             <span className="text-xs text-gray-500">Toggle game sounds</span>
                         </div>
                         <button 
                             onClick={onToggleSfx}
                             className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${sfxEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                         >
                             <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${sfxEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </button>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 dark:text-white">Dark Mode</span>
                            <span className="text-xs text-gray-500">Toggle app theme</span>
                        </div>
                        <button 
                            onClick={onToggleTheme}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Mute Emotes Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 dark:text-white">Mute Emotes</span>
                            <span className="text-xs text-gray-500">Hide player and enemy emotes</span>
                        </div>
                        <button 
                            onClick={onToggleMuteEmotes}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${muteEmotes ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${muteEmotes ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Auto Open Rewards Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 dark:text-white">Auto Open Rewards</span>
                            <span className="text-xs text-gray-500">Show rewards on home screen</span>
                        </div>
                        <button 
                            onClick={onToggleAutoOpenRewards}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${autoOpenRewards ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${autoOpenRewards ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                    {/* Wipe Save Button */}
                    <div>
                        <button 
                            onClick={() => setShowWipeConfirm(true)}
                            className="w-full py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span className="text-lg">🗑️</span>
                            Wipe Save Data
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-wide text-sm"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
}
