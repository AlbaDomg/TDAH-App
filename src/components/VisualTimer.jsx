import React, { useState, useEffect, useRef } from 'react';
import './VisualTimer.css';

import { createTimerWorker } from '../utils/workerTimer';

export const VisualTimer = ({ durationMinutes = 25, remainingSeconds, onComplete, onTimeUpdate, onTimerStateChange }) => {
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(() => {
    return remainingSeconds !== undefined ? remainingSeconds : totalSeconds;
  });
  const [isActive, setIsActive] = useState(false);

  // Mantener una referencia al tiempo restante actual para poder guardarlo al desmontar
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Guardar el tiempo al desmontar (por ejemplo, al salir de foco)
  useEffect(() => {
    return () => {
      if (onTimeUpdate) {
        onTimeUpdate(timeLeftRef.current);
      }
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    let worker = null;
    if (isActive && timeLeft > 0) {
      worker = createTimerWorker();
      worker.onmessage = () => {
        setTimeLeft((prev) => prev - 1);
      };
      worker.postMessage({ command: 'start', interval: 1000 });
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
      if (onTimerStateChange) onTimerStateChange(false);
    }
    return () => {
      if (worker) {
        worker.postMessage({ command: 'stop' });
        worker.terminate();
      }
    };
  }, [isActive, timeLeft, onComplete]);

  const percentage = (timeLeft / totalSeconds) * 100;
  
  const toggleTimer = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    // Persistir al pausar
    if (!nextActive && onTimeUpdate) {
      onTimeUpdate(timeLeft);
    }
    if (onTimerStateChange) {
      onTimerStateChange(nextActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalSeconds);
    // Persistir al reiniciar
    if (onTimeUpdate) {
      onTimeUpdate(totalSeconds);
    }
    if (onTimerStateChange) {
      onTimerStateChange(false);
    }
  };

  // Formatear el tiempo en MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Determinar color basado en progreso para ser amigable
  let progressColor = 'var(--color-success-olive)'; // Empieza relajado
  if (percentage < 50) progressColor = 'var(--color-accent-peach)'; // Aviso suave
  if (percentage < 20) progressColor = 'var(--color-accent-terracotta)'; // Último empujón

  return (
    <div className="visual-timer-container">
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
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

