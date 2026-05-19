import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import './ParalysisMode.css';

const MICRO_TASKS = [
  "Bebe un vaso de agua.",
  "Estírate durante 30 segundos.",
  "Guarda un objeto que no esté en su sitio.",
  "Cierra los ojos y respira hondo 5 veces.",
  "Abre la ventana y mira afuera 1 minuto.",
  "Lávate la cara con agua fresca."
];

export const ParalysisMode = ({ onExit, onComplete }) => {
  const [currentTask, setCurrentTask] = useState(
    MICRO_TASKS[Math.floor(Math.random() * MICRO_TASKS.length)]
  );

  const handleNextTask = () => {
    setCurrentTask(MICRO_TASKS[Math.floor(Math.random() * MICRO_TASKS.length)]);
  };

  const handleComplete = () => {
    onComplete();
    handleNextTask();
  };

  return (
    <div className="paralysis-mode fade-in">
      <div className="paralysis-header">
        <h2>Modo Rescate</h2>
        <p>Está bien sentirse abrumado. Vamos a hacer algo muy sencillo primero.</p>
      </div>

      <div className="micro-task-card pulse">
        <Sparkles className="sparkle-icon" size={32} />
        <h3>{currentTask}</h3>
      </div>

      <div className="paralysis-actions">
        <button className="success" onClick={handleComplete}>
          ¡Hecho!
        </button>
        <button onClick={handleNextTask}>
          Otra sugerencia
        </button>
      </div>

      <button className="back-btn" onClick={onExit}>
        <ArrowLeft size={20} />
        Volver a mi tarea principal
      </button>
    </div>
  );
};
