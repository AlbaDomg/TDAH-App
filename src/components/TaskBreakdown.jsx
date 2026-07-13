import { useState, useCallback } from 'react';
import { Wand2, CheckCircle2, Circle, PenTool, Settings } from 'lucide-react';
import './TaskBreakdown.css';

export const TaskBreakdown = ({ taskName, onStepComplete }) => {
  const [steps, setSteps] = useState([]);
  const [isFragmenting, setIsFragmenting] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualInputs, setManualInputs] = useState(['', '', '']);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('adhd_gemini_api_key') || '');
  const [apiError, setApiError] = useState(null);

  // Genera pasos dinámicamente con la API de Gemini
  const handleMagicFragment = useCallback(async () => {
    const savedKey = localStorage.getItem('adhd_gemini_api_key');
    if (!savedKey) {
      setShowKeyInput(true);
      return;
    }

    setIsFragmenting(true);
    setApiError(null);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres un asistente experto en TDAH. Divide la tarea "${taskName}" en pasos secuenciales extremadamente sencillos, concretos, visuales y libres de abrumación para una persona con TDAH.
Requisitos:
- Genera entre 3 y 6 pasos como máximo.
- Haz que el primer paso sea prepararse o quitar distracciones (ej. ponerse música, preparar agua, despejar mesa).
- Devuelve la respuesta en formato JSON estrictamente como un array de objetos con este formato: [{"id": 1, "text": "..."}]. No uses bloques de código Markdown ni explicaciones adicionales, devuelve SOLO el array JSON.`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Código de error: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      let parsedSteps;
      try {
        parsedSteps = JSON.parse(textResponse.trim());
      } catch {
        // Intenta limpiar si la respuesta contiene markdown
        const cleanText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedSteps = JSON.parse(cleanText);
      }

      if (Array.isArray(parsedSteps)) {
        setSteps(parsedSteps.map(s => ({ ...s, completed: false })));
      } else {
        throw new Error("El formato devuelto no es un array.");
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      setApiError("Hubo un problema al generar los pasos con la IA. Por favor, verifica tu API Key.");
      
      // Fallback simple por si falla para que el usuario no se quede bloqueado
      setSteps([
        { id: 1, text: 'Preparar el material y eliminar distracciones', completed: false },
        { id: 2, text: 'Paso 1: Empezar con lo más pequeño por 5 minutos', completed: false },
        { id: 3, text: 'Paso 2: Continuar a tu propio ritmo', completed: false },
        { id: 4, text: 'Completar y celebrar', completed: false }
      ]);
    } finally {
      setIsFragmenting(false);
    }
  }, [taskName]);

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
      {/* API Key Modal/Setup */}
      {showKeyInput && (
        <div className="api-key-setup-overlay">
          <div className="api-key-setup-card fade-in">
            <h3>Fragmentar con IA Real (Gemini)</h3>
            <p className="api-key-desc">
              Esta función analiza el título de tu tarea y genera pasos secuenciales simplificados adaptados a usuarios con TDAH. Necesitas una Gemini API Key gratuita.
            </p>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="api-key-link"
            >
              Consigue una API Key gratis aquí ↗
            </a>
            
            <input 
              type="password"
              placeholder="Introduce tu Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="api-key-input"
            />
            
            <div className="api-key-actions">
              <button 
                className="primary btn-sm"
                onClick={() => {
                  if (apiKey.trim()) {
                    localStorage.setItem('adhd_gemini_api_key', apiKey.trim());
                    setShowKeyInput(false);
                    // Dispara la fragmentación
                    setTimeout(() => {
                      handleMagicFragment();
                    }, 100);
                  }
                }}
                disabled={!apiKey.trim()}
              >
                Guardar y Continuar
              </button>
              <button 
                className="secondary btn-sm"
                onClick={() => {
                  setShowKeyInput(false);
                  setApiError(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {steps.length === 0 && !isManual ? (
        <div className="breakdown-options-container">
          <div className="breakdown-options">
            <button 
              className="magic-btn" 
              onClick={handleMagicFragment}
              disabled={isFragmenting}
            >
              <Wand2 size={18} />
              {isFragmenting ? 'IA Fragmentando...' : 'Fragmentar Mágicamente con IA'}
            </button>
            <button className="manual-btn" onClick={handleManualSetup}>
              <PenTool size={18} />
              Escribir mis 3 pasos
            </button>
          </div>
          
          {localStorage.getItem('adhd_gemini_api_key') && (
            <button 
              className="change-key-btn" 
              onClick={() => setShowKeyInput(true)}
              title="Cambiar API Key de Gemini"
            >
              <Settings size={16} />
              <span>Ajustes de IA</span>
            </button>
          )}
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
        <div className="steps-container">
          {apiError && <p className="api-error-message">{apiError}</p>}
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
          
          {localStorage.getItem('adhd_gemini_api_key') && (
            <button 
              className="change-key-btn mt-4" 
              onClick={() => setShowKeyInput(true)}
              title="Cambiar API Key de Gemini"
            >
              <Settings size={14} />
              <span>Ajustes de IA</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
