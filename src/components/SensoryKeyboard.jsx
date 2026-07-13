import { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, Trash2, Volume2, Lock } from 'lucide-react';
import './SensoryKeyboard.css';

// Audio Context Singleton and Synth Helpers
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 1. Mechanical Keyboard Sound
const playMechanicalClick = (now, ctx) => {
  // Noise transient
  const bufferSize = ctx.sampleRate * 0.015; // 15ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(1500, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.08, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);

  // Tonal click
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.02);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.12, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.02);
  osc.start(now);
  osc.stop(now + 0.02);
};

// 2. Bubble Pop Sound
const playBubblePop = (now, ctx) => {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(2200, now + 0.012);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.18, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
};

// 3. Raindrop Sound (Pentatonic scales for harmony)
const playRaindrop = (now, ctx) => {
  const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
  const randomFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(randomFreq, now);
  osc.frequency.exponentialRampToValueAtTime(randomFreq * 1.5, now + 0.06);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  // Subtle lowpass to make it warmer/wetter
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
};

// 4. Wood Block Sound
const playWoodBlock = (now, ctx) => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(580, now);
  osc2.frequency.setValueAtTime(810, now); // non-harmonic ratio

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();

  gain1.gain.setValueAtTime(0.18, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  gain2.gain.setValueAtTime(0.1, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(650, now);
  filter.Q.setValueAtTime(1.8, now);

  osc1.connect(gain1);
  osc2.connect(gain2);

  gain1.connect(filter);
  gain2.connect(filter);
  filter.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.07);
  osc2.start(now);
  osc2.stop(now + 0.07);
};

export const SensoryKeyboard = ({
  unlockedSoundpacks = ['mechanical'],
  currentSoundpack = 'mechanical',
  setCurrentSoundpack,
  onGoToStore
}) => {
  const [text, setText] = useState('');
  const [activeKey, setActiveKey] = useState(null);
  const [ripples, setRipples] = useState([]);
  const keyboardContainerRef = useRef(null);

  // Soundpack Options Metadata
  const soundpacks = [
    { id: 'mechanical', name: 'Teclado Mecánico', cost: 0, description: 'Clics mecánicos retro.' },
    { id: 'bubbles', name: 'Burbujas Pop', cost: 150, description: 'Burbujas táctiles agudas.' },
    { id: 'rain', name: 'Gotas de Lluvia', cost: 200, description: 'Bloops musicales fluidos.' },
    { id: 'wood', name: 'Bloques de Madera', cost: 150, description: 'Sonidos de percusión secos.' }
  ];

  // Play audio based on soundpack
  const triggerSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (currentSoundpack === 'mechanical') playMechanicalClick(now, ctx);
      else if (currentSoundpack === 'bubbles') playBubblePop(now, ctx);
      else if (currentSoundpack === 'rain') playRaindrop(now, ctx);
      else if (currentSoundpack === 'wood') playWoodBlock(now, ctx);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }, [currentSoundpack]);

  // Handle a keypress (virtual or physical)
  const handleKeyPress = useCallback((char) => {
    triggerSound();

    // Visual ripple effect
    const id = Date.now() + Math.random().toString();
    const newRipple = {
      id,
      x: Math.random() * 80 + 10, // random position in display
      y: Math.random() * 80 + 10,
      color: `hsl(${Math.random() * 360}, 85%, 75%)`
    };
    setRipples(prev => [...prev, newRipple].slice(-20)); // Limit to max 20 ripples at once

    // Update text
    if (char === 'SPACE') {
      setText(prev => prev + ' ');
    } else if (char === 'BACKSPACE') {
      setText(prev => prev.slice(0, -1));
    } else {
      setText(prev => prev + char);
    }
  }, [triggerSound]);

  // Listen to physical keyboard keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is pressing control/meta keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      let char = null;
      if (e.key === ' ') {
        char = 'SPACE';
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        char = 'BACKSPACE';
        e.preventDefault();
      } else if (e.key.length === 1) {
        char = e.key.toUpperCase();
      }

      if (char) {
        const keyEl = char === 'SPACE' ? 'SPACE' : char;
        setActiveKey(keyEl);
        handleKeyPress(char);
        setTimeout(() => setActiveKey(null), 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.filter(r => Date.now() - parseFloat(r.id) < 800));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Keyboard Rows
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div className="sensory-keyboard-view fade-in" ref={keyboardContainerRef}>
      <div className="keyboard-header">
        <Volume2 className="keyboard-icon" size={28} />
        <h2>Teclado Sensorial</h2>
        <p>Una zona libre para escribir y relajarse con sonidos ASMR interactivos.</p>
      </div>

      {/* Soundpack Selector */}
      <div className="soundpack-selector">
        {soundpacks.map(pack => {
          const isUnlocked = unlockedSoundpacks.includes(pack.id);
          const isActive = currentSoundpack === pack.id;

          return (
            <button
              key={pack.id}
              className={`soundpack-btn ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => {
                if (isUnlocked) {
                  setCurrentSoundpack(pack.id);
                  // Play a small preview
                  try {
                    const ctx = getAudioContext();
                    const now = ctx.currentTime;
                    if (pack.id === 'mechanical') playMechanicalClick(now, ctx);
                    else if (pack.id === 'bubbles') playBubblePop(now, ctx);
                    else if (pack.id === 'rain') playRaindrop(now, ctx);
                    else if (pack.id === 'wood') playWoodBlock(now, ctx);
                  } catch (e) {
                    console.warn("Error playing preview:", e);
                  }
                } else {
                  onGoToStore();
                }
              }}
              title={pack.description}
            >
              {!isUnlocked && <Lock size={14} className="lock-icon" />}
              <span className="pack-name">{pack.name}</span>
              {!isUnlocked && <span className="cost-tag">{pack.cost} pts</span>}
            </button>
          );
        })}
      </div>

      {/* Sensory Text Display area */}
      <div className="sensory-display">
        <div className="ripples-overlay">
          {ripples.map(r => (
            <span
              key={r.id}
              className="sensory-ripple"
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                backgroundColor: r.color,
                boxShadow: `0 0 16px ${r.color}`
              }}
            />
          ))}
        </div>
        
        <textarea
          className="display-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe algo aquí o usa tu teclado físico..."
          rows={4}
        />

        {text && (
          <button 
            className="clear-display-btn" 
            onClick={() => {
              setText('');
              triggerSound();
            }}
            title="Limpiar texto"
          >
            <Trash2 size={18} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* On-screen Virtual Keyboard */}
      <div className="virtual-keyboard">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="keyboard-row">
            {row.map(key => {
              const isBackspace = key === 'BACKSPACE';
              const isKeyActive = activeKey === key;

              return (
                <button
                  key={key}
                  className={`keyboard-key ${isBackspace ? 'backspace-key' : ''} ${isKeyActive ? 'pressed' : ''}`}
                  onClick={() => handleKeyPress(key)}
                >
                  {isBackspace ? <Delete size={20} /> : key}
                </button>
              );
            })}
          </div>
        ))}
        <div className="keyboard-row">
          <button
            className={`keyboard-key space-key ${activeKey === 'SPACE' ? 'pressed' : ''}`}
            onClick={() => handleKeyPress('SPACE')}
          >
            Espacio
          </button>
        </div>
      </div>
    </div>
  );
};
