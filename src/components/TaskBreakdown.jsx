import React, { useState } from 'react';
import { Wand2, CheckCircle2, Circle, PenTool } from 'lucide-react';
import './TaskBreakdown.css';

export const TaskBreakdown = ({ taskName, onStepComplete }) => {
  const [steps, setSteps] = useState([]);
  const [isFragmenting, setIsFragmenting] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualInputs, setManualInputs] = useState(['', '', '']);

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

  const handleManualSetup = () => {
    setIsManual(true);
  };

  const saveManualSteps = () => {
    const newSteps = manualInputs
      .filter(t => t.trim() !== '')
      .map((text, i) => ({ id: i + 1, text, completed: false }));
    
    if (newSteps.length > 0) {
      setSteps(newSteps);
      setIsManual(false);
    }
  };

  const updateManualInput = (index, value) => {
    const newInputs = [...manualInputs];
    newInputs[index] = value;
    setManualInputs(newInputs);
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
      {steps.length === 0 && !isManual ? (
        <div className="breakdown-options">
          <button 
            className="magic-btn" 
            onClick={handleMagicFragment}
            disabled={isFragmenting}
          >
            <Wand2 size={18} />
            {isFragmenting ? 'Fragmentando...' : 'Fragmentar Mágicamente'}
          </button>
          <button className="manual-btn" onClick={handleManualSetup}>
            <PenTool size={18} />
            Escribir mis 3 pasos
          </button>
        </div>
      ) : isManual ? (
        <div className="manual-steps-setup">
          <p className="manual-steps-title">¿Cuáles son los 3 pequeños pasos para completar esto?</p>
          <div className="manual-inputs-container">
            {manualInputs.map((val, i) => (
              <input 
                key={i}
                type="text"
                placeholder={`Paso ${i + 1}...`}
                value={val}
                onChange={(e) => updateManualInput(i, e.target.value)}
                className="manual-step-input"
              />
            ))}
          </div>
          <button className="primary save-steps-btn" onClick={saveManualSteps} disabled={manualInputs.every(v => v.trim() === '')}>
            Guardar Pasos
          </button>
        </div>
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
