import React, { useState, useEffect } from 'react';
import { Wind, CircleDashed, Eye, ArrowLeft } from 'lucide-react';
import './CalmingGame.css';

// 1. Juego de Respiración (El que ya teníamos)
const BreathingGame = () => {
  const [phase, setPhase] = useState('inhale');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    let timer;
    if (isStarted) {
      if (phase === 'inhale') {
        timer = setTimeout(() => setPhase('hold'), 4000);
      } else if (phase === 'hold') {
        timer = setTimeout(() => setPhase('exhale'), 4000);
      } else if (phase === 'exhale') {
        timer = setTimeout(() => setPhase('inhale'), 4000);
      }
    }
    return () => clearTimeout(timer);
  }, [phase, isStarted]);

  return (
    <div className="game-container fade-in">
      <div className="calm-header">
        <Wind className="wind-icon" size={32} />
        <h2>Respiración Guiada</h2>
        <p>Sigue el círculo. Te ayudará a bajar el ritmo.</p>
      </div>
      <div className="breathing-container">
        {!isStarted ? (
          <button className="start-breathe-btn" onClick={() => setIsStarted(true)}>Empezar</button>
        ) : (
          <div className={`breathing-circle ${phase}`}>
            <span className="breathing-text">
              {phase === 'inhale' && 'Inhala...'}
              {phase === 'hold' && 'Mantén...'}
              {phase === 'exhale' && 'Exhala...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Juego Sensorial: Plástico de burbujas suave
const BubbleWrapGame = () => {
  const [bubbles, setBubbles] = useState(Array.from({ length: 20 }, (_, i) => ({ id: i, popped: false })));

  const popBubble = (id) => {
    setBubbles(bubbles.map(b => b.id === id ? { ...b, popped: true } : b));
  };

  const resetBubbles = () => {
    setBubbles(bubbles.map(b => ({ ...b, popped: false })));
  };

  const allPopped = bubbles.every(b => b.popped);

  return (
    <div className="game-container fade-in">
      <div className="calm-header">
        <CircleDashed className="wind-icon" size={32} style={{color: 'var(--color-accent-peach)'}} />
        <h2>Burbujas Sensoriales</h2>
        <p>Explota las burbujas a tu ritmo para liberar tensión.</p>
      </div>
      <div className="bubble-grid">
        {bubbles.map(bubble => (
          <div 
            key={bubble.id} 
            className={`bubble ${bubble.popped ? 'popped' : ''}`}
            onClick={() => !bubble.popped && popBubble(bubble.id)}
          />
        ))}
      </div>
      {allPopped && (
        <button className="primary mt-4 fade-in" onClick={resetBubbles}>
          Rellenar burbujas
        </button>
      )}
    </div>
  );
};

// 3. Juego de Enraizamiento 5-4-3-2-1
const GroundingGame = () => {
  const steps = [
    { num: 5, text: "cosas que puedas VER a tu alrededor.", icon: <Eye size={48} /> },
    { num: 4, text: "cosas que puedas TOCAR ahora mismo.", icon: <span style={{fontSize:'3rem'}}>✋</span> },
    { num: 3, text: "cosas que puedas ESCUCHAR.", icon: <span style={{fontSize:'3rem'}}>👂</span> },
    { num: 2, text: "cosas que puedas OLER.", icon: <span style={{fontSize:'3rem'}}>👃</span> },
    { num: 1, text: "cosa que puedas SABOREAR.", icon: <span style={{fontSize:'3rem'}}>👅</span> },
    { num: 0, text: "¡Estás aquí y ahora. Estás a salvo!", icon: <span style={{fontSize:'3rem'}}>✨</span> }
  ];
  
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="game-container fade-in text-center">
      <div className="calm-header">
        <h2>Técnica de Enraizamiento</h2>
        <p>Encuentra las cosas a tu alrededor para volver al presente.</p>
      </div>
      <div className="grounding-step slide-in">
        <div className="grounding-icon">{steps[currentStep].icon}</div>
        {steps[currentStep].num > 0 && (
          <h3 className="grounding-title">Encuentra {steps[currentStep].num}</h3>
        )}
        <p className="grounding-text">{steps[currentStep].text}</p>
      </div>
      <div className="grounding-actions mt-4">
        {currentStep < steps.length - 1 ? (
          <button className="success" onClick={() => setCurrentStep(prev => prev + 1)}>
            Lo he encontrado
          </button>
        ) : (
          <button className="primary" onClick={() => setCurrentStep(0)}>
            Volver a empezar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Principal
export const CalmingGame = () => {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 'breathing') return <><BackButton onBack={() => setActiveGame(null)} /><BreathingGame /></>;
  if (activeGame === 'bubbles') return <><BackButton onBack={() => setActiveGame(null)} /><BubbleWrapGame /></>;
  if (activeGame === 'grounding') return <><BackButton onBack={() => setActiveGame(null)} /><GroundingGame /></>;

  return (
    <div className="calming-game fade-in">
      <div className="calm-header">
        <h2>Tu refugio de calma</h2>
        <p>Elige una actividad corta para centrarte y reducir la ansiedad.</p>
      </div>

      <div className="games-menu">
        <button className="game-option-card" onClick={() => setActiveGame('breathing')}>
          <Wind size={40} className="game-icon" style={{color: 'var(--color-success-olive)'}}/>
          <h3>Respiración Guiada</h3>
          <p>Un ejercicio suave para estabilizar tu ritmo cardíaco.</p>
        </button>

        <button className="game-option-card" onClick={() => setActiveGame('bubbles')}>
          <CircleDashed size={40} className="game-icon" style={{color: 'var(--color-accent-peach)'}}/>
          <h3>Burbujas Sensoriales</h3>
          <p>Explota burbujas virtuales para liberar energía contenida.</p>
        </button>

        <button className="game-option-card" onClick={() => setActiveGame('grounding')}>
          <Eye size={40} className="game-icon" style={{color: 'var(--color-accent-terracotta)'}}/>
          <h3>Enraizamiento (5-4-3-2-1)</h3>
          <p>Conecta con tus sentidos para volver al momento presente.</p>
        </button>
      </div>
    </div>
  );
};

const BackButton = ({ onBack }) => (
  <button className="back-btn-calm" onClick={onBack}>
    <ArrowLeft size={20} />
    Volver al menú de calma
  </button>
);
