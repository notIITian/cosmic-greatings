/**
 * Celestial Wishes - Handcrafted Sound & Music Engine
 * Organic procedural sound design + polyphonic ambient music synthesizer.
 * 100% Web Audio API - Zero external audio files required, offline & instant response.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmGain = null;
    this.sfxGain = null;
    this.currentTrack = 'cosmic'; // 'cosmic' | 'birthday' | 'triumph'
    this.musicTimer = null;
    this.customAudio = null;

    // Load preferences from localStorage
    try {
      this.muted = localStorage.getItem('celestial_muted') === 'true';
    } catch (e) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Master gain nodes
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.muted ? 0.0 : 0.8;
        this.sfxGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.muted ? 0.0 : 0.35;
        this.bgmGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    try {
      localStorage.setItem('celestial_muted', this.muted);
    } catch (e) {}

    if (this.sfxGain && this.bgmGain) {
      const now = this.ctx.currentTime;
      this.sfxGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.setValueAtTime(this.muted ? 0.0 : 0.8, now);
      this.bgmGain.gain.setValueAtTime(this.muted ? 0.0 : 0.35, now);
    }

    if (this.customAudio) {
      this.customAudio.muted = this.muted;
    }

    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // --- PROCEDURAL REVERB & SPATIAL DUST ---
  createImpulseResponse(duration = 2.0, decay = 2.0) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  // --- ORGANIC SOUND EFFECTS ---

  // 1. Heavy Wooden Door Knock (Authentic tactile thump)
  playDoorKnock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low frequency timber thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);

    // Subtle metallic knock echo
    setTimeout(() => {
      if (this.ctx && !this.muted) {
        const subNow = this.ctx.currentTime;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(75, subNow);
        subGain.gain.setValueAtTime(0.25, subNow);
        subGain.gain.exponentialRampToValueAtTime(0.001, subNow + 0.14);
        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(subNow);
        subOsc.stop(subNow + 0.14);
      }
    }, 70);
  }

  // 2. Realistic Antique Wooden Door Creak & Iron Latch
  playDoorCreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Organic creaking timber (FM synthesis)
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(85, now);
    carrier.frequency.linearRampToValueAtTime(130, now + 0.4);
    carrier.frequency.linearRampToValueAtTime(70, now + 1.2);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(22, now);
    modulator.frequency.linearRampToValueAtTime(8, now + 1.2);
    modGain.gain.setValueAtTime(45, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(580, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 1.4);
    carrier.stop(now + 1.4);

    // Antique heavy lock bolt opening
    this.playLockUnlock(now);
  }

  // 3. Ornate Lock Tumbler Click & Golden Resonance
  playLockUnlock(startTime) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = startTime || this.ctx.currentTime;

    // Metallic latch tumbler click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1600, now);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 0.08);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Resonant golden chime of release
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.04); // A5
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.35); // A6

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.25, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.9);
  }

  // 4. Access Denied: Mechanical lock refusal & cyber alert
  playAccessDenied() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Dissonant dual square waves (alarm buzzer)
    [165, 208].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.setValueAtTime(0.02, now + 0.15);
      gain.gain.setValueAtTime(0.22, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.65);
    });

    // Metallic chain rattle
    const noiseLen = this.ctx.sampleRate * 0.4;
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1400;

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.15, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  // 5. Black Hole Relativistic Singularity Warp (Epic cinematic plunge)
  playWarp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub-bass gravitational singularity hum (40Hz -> 180Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(38, now);
    subOsc.frequency.exponentialRampToValueAtTime(160, now + 2.2);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.5, now + 1.0);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 2.6);

    // Hyperspace dimensional whoosh (swept bandpass white noise)
    const bufferSize = this.ctx.sampleRate * 2.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(3600, now + 1.9);
    filter.Q.value = 4.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 1.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.5);
  }

  // 6. Futuristic Cyber Telemetry Blip
  playCyberBeep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freqs = [1200, 1500, 1800, 2100, 2400, 2700];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 7. Tactile UI Click
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 8. Grand Celebration Fanfare (Polyphonic harmonic chimes)
  playCelebrationFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Harmonic celestial arpeggio (C major 9th into high crystal bell)
    const notes = [
      { f: 523.25, t: 0.00 }, // C5
      { f: 659.25, t: 0.12 }, // E5
      { f: 783.99, t: 0.24 }, // G5
      { f: 987.77, t: 0.36 }, // B5
      { f: 1046.50, t: 0.48 }, // C6
      { f: 1318.51, t: 0.62 }, // E6
      { f: 1567.98, t: 0.78 }  // G6
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(0.24, now + n.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 1.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + n.t);
      osc.stop(now + n.t + 1.4);
    });
  }

  // --- PROCEDURAL AMBIENT MUSIC ENGINE ---
  // Loops beautiful celestial chords & acoustic harmonies
  startBackgroundMusic(track = 'cosmic') {
    this.init();
    this.currentTrack = track;
    this.stopBackgroundMusic();
    this.bgmPlaying = true;

    // Track Chords
    const tracks = {
      // Deep space ambient chords (Ethereal & calming)
      cosmic: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G7
      ],
      // Birthday / Joyful music-box progression
      birthday: [
        [261.63, 329.63, 392.00], // C
        [196.00, 246.94, 293.66], // G
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63]  // F
      ],
      // Triumphant / Motivational fanfare progression
      triumph: [
        [293.66, 369.99, 440.00], // D
        [220.00, 277.18, 329.63], // A
        [246.94, 311.13, 369.99], // Bm
        [196.00, 246.94, 293.66]  // G
      ]
    };

    const chords = tracks[track] || tracks.cosmic;
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.bgmPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx];
      const chordDuration = track === 'birthday' ? 2.6 : 4.0;

      currentChord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = track === 'birthday' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * (track === 'birthday' ? 1.5 : 1.0), now + idx * 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1400, now + chordDuration * 0.5);
        filter.frequency.linearRampToValueAtTime(600, now + chordDuration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration - 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + chordDuration);
      });

      chordIdx = (chordIdx + 1) % chords.length;
      this.musicTimer = setTimeout(playChordStep, chordDuration * 1000 - 300);
    };

    playChordStep();
  }

  stopBackgroundMusic() {
    this.bgmPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleBackgroundMusic() {
    if (this.bgmPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic(this.currentTrack);
      return true;
    }
  }
}

window.SoundSystem = new SoundSystem();
