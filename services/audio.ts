
// Enhanced Procedural Audio System for AI Clash Royale

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

// --- MUSIC ENGINE STATE ---
let masterGain: GainNode | null = null;
let isMusicPlaying = false;
let currentTrackType: 'MENU' | 'BATTLE' | null = null;
let schedulerTimerId: any = null;
let nextNoteTime = 0;
let currentStep = 0;

const NOTES: Record<string, number> = {
    'Bb1': 58.27, 'B1': 61.74,
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00
};

// --- COMPOSITIONS ---

interface StepData {
    melody?: string;
    bass?: string;
    harmony?: string[];
    kick?: boolean;
    snare?: boolean;
    hat?: boolean;
}

const MENU_SEQ: StepData[] = [
    { melody: 'C4', bass: 'C2', harmony: ['E3', 'G3'], kick: true, hat: true },
    { hat: true },
    { melody: 'E4', hat: true },
    { hat: true },
    { melody: 'G4', bass: 'G2', harmony: ['B3', 'D4'], snare: true, hat: true },
    { hat: true },
    { melody: 'B4', hat: true },
    { hat: true },
    { melody: 'A4', bass: 'A2', harmony: ['C4', 'E4'], kick: true, hat: true },
    { hat: true },
    { melody: 'G4', hat: true },
    { hat: true },
    { melody: 'E4', bass: 'F2', harmony: ['A3', 'C4'], snare: true, hat: true },
    { hat: true },
    { melody: 'C4', hat: true },
    { hat: true },
];

const generateBattleTrack = (): StepData[] => {
    // Helper to merge step data
    const merge = (base: StepData[], overlay: StepData[]): StepData[] => {
        return base.map((s, i) => ({ ...s, ...(overlay[i] || {}) }));
    };

    // --- PATTERNS ---
    const drumSilence = Array(8).fill({});
    
    const drumIntro = [
        { kick: true }, { hat: true }, { kick: true }, { hat: true },
        { kick: true }, { hat: true }, { kick: true }, { hat: true }
    ];

    const drumBasic = [
        { kick: true, hat: true }, { hat: true }, { snare: true, hat: true }, { hat: true },
        { kick: true, hat: true }, { hat: true }, { snare: true, hat: true }, { hat: true }
    ];

    const drumHeavy = [
        { kick: true, hat: true }, { kick: true, hat: true }, { snare: true, hat: true }, { hat: true },
        { kick: true, hat: true }, { kick: true, hat: true }, { snare: true, hat: true }, { kick: true, hat: true }
    ];

    const drumRoll = [
        { snare: true }, { snare: true }, { snare: true }, { snare: true },
        { snare: true }, { snare: true }, { snare: true, kick: true }, { snare: true, kick: true }
    ];

    // Melodic Motifs (8 steps / 1 bar)
    // D Minor
    const motifA = [
        { melody: 'D4', bass: 'D2' }, { melody: 'F4' }, { melody: 'A4' }, { melody: 'D5' },
        { melody: 'A4', bass: 'D2' }, { melody: 'F4' }, { melody: 'E4' }, { melody: 'D4' }
    ];
    
    // Bb Major
    const motifB = [
        { melody: 'Bb3', bass: 'Bb1' }, { melody: 'D4' }, { melody: 'F4' }, { melody: 'Bb4' },
        { melody: 'F4', bass: 'Bb1' }, { melody: 'D4' }, { melody: 'C4' }, { melody: 'Bb3' }
    ];

    // C Major
    const motifC = [
        { melody: 'C4', bass: 'C2' }, { melody: 'E4' }, { melody: 'G4' }, { melody: 'C5' },
        { melody: 'G4', bass: 'C2' }, { melody: 'E4' }, { melody: 'D4' }, { melody: 'C4' }
    ];

    // A Major (Turnaround)
    const motifD = [
        { melody: 'A3', bass: 'A1' }, { melody: 'C#4' }, { melody: 'E4' }, { melody: 'A4' },
        { melody: 'G4', bass: 'A1' }, { melody: 'E4' }, { melody: 'C#4' }, { melody: 'A3' }
    ];

    // High Energy Motif
    const motifHighA = [
        { melody: 'D5', bass: 'D2', harmony: ['F3','A3'] }, {}, { melody: 'A4' }, {},
        { melody: 'F5', bass: 'D2' }, {}, { melody: 'D5' }, {}
    ];

    let track: StepData[] = [];

    // --- ARRANGEMENT (Target ~56 bars) ---

    // 1. INTRO (4 Bars)
    // Subtle start
    track.push(...merge(drumIntro, [{bass:'D2'},{},{},{},{bass:'D2'},{},{},{}])); 
    track.push(...merge(drumIntro, [{bass:'D2'},{},{},{},{bass:'D2'},{},{},{}])); 
    track.push(...merge(drumBasic, [{bass:'A1'},{},{},{},{bass:'A1'},{},{},{}]));
    track.push(...merge(drumRoll, [{bass:'A1'},{},{},{},{bass:'A1'},{},{},{}]));

    // 2. THEME A (8 Bars)
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, motifB));
    track.push(...merge(drumBasic, motifC));
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, motifD)); // Build tension
    track.push(...merge(drumRoll, motifD));

    // 3. VARIATION (8 Bars)
    // Higher octave, fuller drums
    const motifA_High = motifA.map(s => s.melody ? ({...s, melody: s.melody.replace('4','5').replace('2','2')}) : s); // Simple octave shift logic won't work with string replace perfectly for all notes but okay for this set
    track.push(...merge(drumHeavy, motifHighA));
    track.push(...merge(drumHeavy, motifHighA));
    track.push(...merge(drumHeavy, motifB));
    track.push(...merge(drumHeavy, motifC));
    track.push(...merge(drumHeavy, motifA));
    track.push(...merge(drumHeavy, motifA));
    track.push(...merge(drumHeavy, motifD));
    track.push(...merge(drumRoll, motifD));

    // 4. BREAKDOWN (8 Bars)
    // Sparse, focus on bass
    const bassRun = [{bass:'D2'},{},{bass:'F2'},{},{bass:'E2'},{},{bass:'D2'},{}];
    track.push(...merge(drumIntro, bassRun));
    track.push(...merge(drumIntro, bassRun));
    track.push(...merge(drumIntro, bassRun));
    track.push(...merge(drumIntro, bassRun));
    // Arpeggios entering
    const arp = [{harmony:['F3','A3']},{harmony:['D3']},{harmony:['A3']},{harmony:['F3']}, {harmony:['D3']},{},{},{}];
    track.push(...merge(drumBasic, arp));
    track.push(...merge(drumBasic, arp));
    track.push(...merge(drumBasic, arp));
    track.push(...merge(drumRoll, arp));

    // 5. CLIMAX (16 Bars)
    // Full power
    for(let i=0; i<2; i++) {
        track.push(...merge(drumHeavy, motifA));
        track.push(...merge(drumHeavy, motifB));
        track.push(...merge(drumHeavy, motifC));
        track.push(...merge(drumHeavy, motifD));
    }
    for(let i=0; i<2; i++) {
        track.push(...merge(drumHeavy, motifHighA));
        track.push(...merge(drumHeavy, motifB));
        track.push(...merge(drumHeavy, motifC));
        track.push(...merge(drumHeavy, motifD));
    }

    // 6. OUTRO (4 Bars)
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, motifA));
    track.push(...merge(drumBasic, [{bass:'D2', melody:'D4'},{},{},{},{},{},{},{}]));
    track.push(...merge(drumSilence, [{bass:'D1', melody:'D3'},{},{},{},{},{},{},{}]));

    return track;
};

const BATTLE_SEQ = generateBattleTrack();

// --- CORE ENGINE ---

export const initAudio = (options?: AudioContextOptions) => {
    if (!audioCtx && AudioContextClass) {
        audioCtx = new AudioContextClass(options);
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
};

const playDrum = (ctx: AudioContext, type: 'kick' | 'snare' | 'hat', time: number) => {
    if (!masterGain) return;
    
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    gain.connect(masterGain);

    if (type === 'kick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.connect(gain);
        osc.start(time);
        osc.stop(time + 0.1);
    } else if (type === 'snare') {
        // Noise Snare
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        noise.connect(filter);
        filter.connect(gain);
        
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        noise.start(time);
        noise.stop(time + 0.1);

        // Snap
        const snap = ctx.createOscillator();
        snap.type = 'triangle';
        snap.frequency.setValueAtTime(200, time);
        snap.connect(gain);
        snap.start(time);
        snap.stop(time + 0.05);
    } else if (type === 'hat') {
        const bufferSize = ctx.sampleRate * 0.02;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        noise.connect(filter);
        filter.connect(gain);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
        
        noise.start(time);
        noise.stop(time + 0.02);
    }
};

const playSynth = (ctx: AudioContext, freq: number, time: number, duration: number, type: 'lead' | 'bass' | 'chord') => {
    if (!masterGain || !freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    if (type === 'lead') {
        osc.type = 'sawtooth'; // Changed to sawtooth for more "battle" feel
        // Simple Envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        // Filter for less harshness
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, time);
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);

    } else if (type === 'bass') {
        osc.type = 'square';
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);

    } else if (type === 'chord') {
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    }

    osc.frequency.setValueAtTime(freq, time);
    osc.start(time);
    osc.stop(time + duration);
};

const scheduleNextStep = () => {
    const ctx = initAudio();
    if (!ctx || !isMusicPlaying || !masterGain) return;

    // Lookahead logic
    while (nextNoteTime < ctx.currentTime + 0.2) {
        const sequence = currentTrackType === 'MENU' ? MENU_SEQ : BATTLE_SEQ;
        const bpm = currentTrackType === 'MENU' ? 120 : 140;
        const secondsPerStep = 60 / (bpm * 2); // 8th notes

        const step = sequence[currentStep];

        // Drums
        if (step.kick) playDrum(ctx, 'kick', nextNoteTime);
        if (step.snare) playDrum(ctx, 'snare', nextNoteTime);
        if (step.hat) playDrum(ctx, 'hat', nextNoteTime);

        // Synth layers
        if (step.melody) playSynth(ctx, NOTES[step.melody], nextNoteTime, secondsPerStep * 0.9, 'lead');
        if (step.bass) playSynth(ctx, NOTES[step.bass], nextNoteTime, secondsPerStep * 2, 'bass');
        if (step.harmony) {
            step.harmony.forEach(note => {
                playSynth(ctx, NOTES[note], nextNoteTime, secondsPerStep * 4, 'chord');
            });
        }

        nextNoteTime += secondsPerStep;
        currentStep = (currentStep + 1) % sequence.length;
    }

    schedulerTimerId = setTimeout(scheduleNextStep, 50);
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
    currentStep = 0;
    
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    // Reduced music volume down by 30% from 0.8 to 0.56
    masterGain.gain.linearRampToValueAtTime(0.56, ctx.currentTime + 1); // Fade in
    masterGain.connect(ctx.destination);

    nextNoteTime = ctx.currentTime + 0.1;
    scheduleNextStep();
};

export const stopMusic = () => {
    isMusicPlaying = false;
    currentTrackType = null;
    if (schedulerTimerId) {
        clearTimeout(schedulerTimerId);
        schedulerTimerId = null;
    }
    if (masterGain) {
        try {
            const ctx = initAudio();
            if (ctx) {
                masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
                const node = masterGain;
                setTimeout(() => { try { node.disconnect(); } catch(e){} }, 500);
            }
        } catch(e) {}
        masterGain = null;
    }
};

// --- SFX FUNCTIONS ---

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
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
};

export const playMenuTransitionSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
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

    if (defId.includes('archer') || defId.includes('spear')) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    } else if (defId.includes('pekka') || defId.includes('giant')) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    }
};

export const playOscillator = (ctx: AudioContext, type: OscillatorType, freqStart: number, freqEnd: number | null, startTime: number, duration: number, vol: number) => {
    if (!isSfxEnabled) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
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
    } else if (rarity === 'EPIC') {
        playOscillator(ctx, 'sawtooth', 220, 880, t, 0.4, 0.2);
    } else if (rarity === 'LEGENDARY') {
        playOscillator(ctx, 'sine', 880, 1760, t, 0.8, 0.3);
    }
};

export const playCoinSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    playOscillator(ctx, 'sine', 1200, 1200, t, 0.05, 0.2);
};

export const playGemSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    playOscillator(ctx, 'triangle', 1500, 2000, ctx.currentTime, 0.3, 0.2);
};

export const playLevelUpSound = () => {
    if (!isSfxEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
         playOscillator(ctx, 'triangle', freq, freq, ctx.currentTime + (i * 0.1), 0.1, 0.2);
    });
};
