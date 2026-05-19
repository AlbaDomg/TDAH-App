import React, { useState } from 'react';
import { Wand2, CheckCircle2, Circle } from 'lucide-react';
import './TaskBreakdown.css';

export const TaskBreakdown = ({ taskName, onStepComplete }) => {
  const [steps, setSteps] = useState([]);
  const [isFragmenting, setIsFragmenting] = useState(false);

  // Simula una "IA" o botón mágico que divide la tarea
  const handleMagicFragment = () => {
    setIsFragmenting(true);
    // Simulamos un pequeño retraso para efecto mágico
    setTimeout(() => {
      setSteps([
        { id: 1, text: 'Preparar el material necesario', completed: false },
        { id: 2, text: 'Hacer el primer paso visible', completed: false },
        { id: 3, text: 'Revisar y finalizar', completed: false }
      ]);
      setIsFragmenting(false);
    }, 600);
  };

  const toggleStep = (id) => {
    setSteps(steps.map(step => {
      if (step.id === id) {
        const isNowCompleted = !step.completed;
        if (isNowCompleted && onStepComplete) {
          onStepComplete();
        }
        return { ...step, completed: isNowCompleted };
      }
      return step;
    }));
  };

  return (
    <div className="task-breakdown">
      {steps.length === 0 ? (
        <button 
          className="magic-btn" 
          onClick={handleMagicFragment}
          disabled={isFragmenting}
        >
          <Wand2 size={18} />
          {isFragmenting ? 'Fragmentando...' : 'Fragmentar Mágicamente'}
        </button>
      ) : (
        <ul className="steps-list">
          {steps.map(step => (
            <li 
              key={step.id} 
              className={`step-item ${step.completed ? 'completed' : ''}`}
              onClick={() => toggleStep(step.id)}
            >
              {step.completed ? (
                <CheckCircle2 className="step-icon checked" size={24} />
              ) : (
                <Circle className="step-icon" size={24} />
              )}
              <span className="step-text">{step.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
