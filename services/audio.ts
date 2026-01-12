
// Audio Utilities for UI Feedback

const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

// --- SETTINGS STATE ---
let isMusicEnabled = true;
let isSfxEnabled = true;

export const setMusicEnabled = (enabled: boolean) => {
    isMusicEnabled = enabled;
    if (!enabled) {
        stopMusic();
    }
};

export const setSfxEnabled = (enabled: boolean) => {
    isSfxEnabled = enabled;
};

// --- MUSIC STATE ---
let musicGainNode: GainNode | null = null;
let isMusicPlaying = false;
let currentTrackType: 'MENU' | 'BATTLE' | null = null;
let nextNoteTime = 0;
let schedulerTimerId: any = null;

// Frequencies
const NOTES: Record<string, number> = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25,
};

// Sequences
const MENU_BPM = 100;
const MENU_NOTES = [
    {n:'C4', d:0.5}, {n:'E4', d:0.5}, {n:'G4', d:0.5}, {n:'B4', d:0.5},
    {n:'A4', d:0.5}, {n:'G4', d:0.5}, {n:'E4', d:0.5}, {n:'C4', d:0.5},
    {n:'F4', d:0.5}, {n:'A4', d:0.5}, {n:'C5', d:0.5}, {n:'A4', d:0.5},
    {n:'G4', d:1.0}, {n:'E4', d:1.0},
];

const BATTLE_BPM = 130;
const BATTLE_NOTES = [
    {n:'D3', d:0.25}, {n:'D3', d:0.25}, {n:'F3', d:0.25}, {n:'A3', d:0.25}, 
    {n:'D3', d:0.25}, {n:'D3', d:0.25}, {n:'F3', d:0.25}, {n:'A3', d:0.25},
    {n:'E3', d:0.25}, {n:'E3', d:0.25}, {n:'G3', d:0.25}, {n:'B3', d:0.25}, 
    {n:'C4', d:0.5},  {n:'A3', d:0.5},
];

export const initAudio = (options?: AudioContextOptions) => {
    if (!audioCtx && AudioContextClass) {
        audioCtx = new AudioContextClass(options);
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {}); 
    }
    return audioCtx;
};

// --- MUSIC FUNCTIONS ---

export const stopMusic = () => {
    isMusicPlaying = false;
    currentTrackType = null;
    if (schedulerTimerId) {
        clearTimeout(schedulerTimerId);
        schedulerTimerId = null;
    }
    if (musicGainNode) {
        try {
            const ctx = initAudio();
            if (ctx) {
                // Fade out
                musicGainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
                const node = musicGainNode;
                setTimeout(() => { 
                    try { node.disconnect(); } catch(e){} 
                }, 200);
            }
        } catch(e) {}
        musicGainNode = null;
    }
};

const playTone = (ctx: AudioContext, noteName: string, time: number, duration: number, track: 'MENU' | 'BATTLE') => {
    if (!musicGainNode) return;
    
    const freq = NOTES[noteName];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = track === 'MENU' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    
    // Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(track === 'MENU' ? 0.3 : 0.1, time + 0.05);
    gain.gain.setValueAtTime(track === 'MENU' ? 0.3 : 0.1, time + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    
    osc.connect(gain);
    gain.connect(musicGainNode);
    
    osc.start(time);
    osc.stop(time + duration);
    
    // Bass line for battle
    if (track === 'BATTLE') {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'square';
        bassOsc.frequency.setValueAtTime(freq / 2, time);
        
        bassGain.gain.setValueAtTime(0, time);
        bassGain.gain.linearRampToValueAtTime(0.05, time + 0.05);
        bassGain.gain.linearRampToValueAtTime(0, time + duration);
        
        bassOsc.connect(bassGain);
        bassGain.connect(musicGainNode);
        bassOsc.start(time);
        bassOsc.stop(time + duration);
    }
    
    // Harmony for menu (Triangle wave)
    if (track === 'MENU') {
        const harmOsc = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(freq / 2, time);
        
        harmGain.gain.setValueAtTime(0, time);
        harmGain.gain.linearRampToValueAtTime(0.1, time + 0.1);
        harmGain.gain.linearRampToValueAtTime(0, time + duration);
        
        harmOsc.connect(harmGain);
        harmGain.connect(musicGainNode);
        harmOsc.start(time);
        harmOsc.stop(time + duration);
    }
};

const schedule = (track: 'MENU' | 'BATTLE') => {
    const ctx = initAudio();
    if (!ctx || !isMusicPlaying) return;

    // Resync if behind (e.g. tab background or suspend)
    if (nextNoteTime < ctx.currentTime) {
        nextNoteTime = ctx.currentTime + 0.1;
    }

    const sequence = track === 'MENU' ? MENU_NOTES : BATTLE_NOTES;
    const bpm = track === 'MENU' ? MENU_BPM : BATTLE_BPM;
    const beatTime = 60 / bpm;

    let loopDuration = 0;
    sequence.forEach(note => {
        playTone(ctx, note.n, nextNoteTime + loopDuration, note.d * beatTime, track);
        loopDuration += note.d * beatTime;
    });
    
    nextNoteTime += loopDuration;
    
    // Schedule next loop calculation slightly before this one ends
    const delay = (nextNoteTime - ctx.currentTime - 0.5) * 1000;
    schedulerTimerId = setTimeout(() => schedule(track), Math.max(100, delay));
};

export const startMusic = (track: 'MENU' | 'BATTLE') => {
    if (!isMusicEnabled) {
        if (isMusicPlaying) stopMusic();
        return;
    }

    if (currentTrackType === track && isMusicPlaying) return;
    
    stopMusic();

    const ctx = initAudio();
    if (!ctx) return;

    currentTrackType = track;
    isMusicPlaying = true;
    
    // Setup Master Music Gain
    musicGainNode = ctx.createGain();
    musicGainNode.gain.value = 0.05; // Low background volume
    musicGainNode.connect(ctx.destination);

    // Reset timing
    nextNoteTime = ctx.currentTime + 0.1;
    
    schedule(track);
};

// --- SFX FUNCTIONS ---

// Generic Light Click (Tabs, Small Buttons)
export const playClickSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);
};

// Heavier Button Click (Main Actions)
export const playButtonSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
};

// Menu Transition Swoosh (Swish-like)
export const playMenuTransitionSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    // Generate brief white noise buffer
    const bufferSize = ctx.sampleRate * 0.5; // 0.5s buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.5; 

    const gain = ctx.createGain();

    // Filter sweep for "swish" effect (Low -> High)
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.25);

    // Volume envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3); // Fade out

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(t);
    noise.stop(t + 0.3);
};

export const playAttackSound = (defId: string) => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Differentiate sounds slightly based on unit type (simple synth)
    if (defId.includes('archer') || defId.includes('spear')) {
        // High pitch zip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    } else if (defId.includes('pekka') || defId.includes('giant')) {
        // Low thud
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    } else if (defId.includes('wizard') || defId.includes('witch') || defId.includes('dragon') || defId.includes('electro') || defId.includes('zap')) {
        // Fire/Magic noise
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
    } else if (defId.includes('prince') || defId.includes('ram')) {
        // Gallop/Charge hit
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
    } else {
        // Generic hit
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    }
};

// Shared Sound Generators

export const playOscillator = (
    ctx: AudioContext, 
    type: OscillatorType, 
    freqStart: number, 
    freqEnd: number | null, 
    startTime: number, 
    duration: number, 
    vol: number
) => {
    if (!isSfxEnabled) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
    }
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const playItemRevealSound = (rarity: string = 'COMMON') => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    playOscillator(ctx, 'triangle', 300, 600, t, 0.1, 0.2);
    if (rarity === 'RARE') {
        playOscillator(ctx, 'square', 440, 440, t, 0.1, 0.1);
        playOscillator(ctx, 'square', 880, 880, t + 0.05, 0.1, 0.1);
    } else if (rarity === 'EPIC') {
        playOscillator(ctx, 'sawtooth', 220, 880, t, 0.4, 0.2);
    } else if (rarity === 'LEGENDARY') {
        playOscillator(ctx, 'sine', 880, 1760, t, 0.8, 0.3);
        playOscillator(ctx, 'sine', 1108, 2217, t + 0.1, 0.8, 0.3);
    }
};

export const playCoinSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    playOscillator(ctx, 'sine', 1200, 1200, t, 0.05, 0.2);
    playOscillator(ctx, 'sine', 1600, 1600, t + 0.05, 0.05, 0.1);
};

export const playGemSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    playOscillator(ctx, 'triangle', 1500, 2000, t, 0.3, 0.2);
};

export const playLevelUpSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    
    // Fanfare
    const notes = [440, 554.37, 659.25, 880]; // A Major arpeggio
    notes.forEach((freq, i) => {
         playOscillator(ctx, 'triangle', freq, freq, ctx.currentTime + (i * 0.1), 0.1, 0.2);
    });
    
    // Swell
    playOscillator(ctx, 'sine', 440, 880, ctx.currentTime, 0.6, 0.1);
};
