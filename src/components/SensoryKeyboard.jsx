import { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, Trash2, Volume2 } from 'lucide-react';
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



export const SensoryKeyboard = () => {
  const [text, setText] = useState('');
  const [activeKey, setActiveKey] = useState(null);
  const [ripples, setRipples] = useState([]);
  const keyboardContainerRef = useRef(null);

  // Play mechanical click audio
  const triggerSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      playMechanicalClick(now, ctx);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }, []);

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
