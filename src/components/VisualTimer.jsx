import React, { useState, useEffect } from 'react';
import './VisualTimer.css';

export const VisualTimer = ({ durationMinutes = 25, onComplete }) => {
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const percentage = (timeLeft / totalSeconds) * 100;
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalSeconds);
  };

  // Determinar color basado en progreso para ser amigable
  let progressColor = 'var(--color-success-olive)'; // Empieza relajado
  if (percentage < 50) progressColor = 'var(--color-accent-peach)'; // Aviso suave
  if (percentage < 20) progressColor = 'var(--color-accent-terracotta)'; // Último empujón

  return (
    <div className="visual-timer-container">
      <div className="timer-bar-bg">
        <div 
          className="timer-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: progressColor
          }}
        />
      </div>
      <div className="timer-controls">
        <button onClick={toggleTimer} className="timer-btn">
          {isActive ? 'Pausar' : 'Iniciar Foco'}
        </button>
        <button onClick={resetTimer} className="timer-btn timer-btn-outline">
          Reiniciar
        </button>
      </div>
    </div>
  );
};
