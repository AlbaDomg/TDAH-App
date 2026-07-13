import { useState, useCallback } from 'react';
import { Wand2, CheckCircle2, Circle, PenTool, Settings } from 'lucide-react';
import './TaskBreakdown.css';

// Generador inteligente local de pasos TDAH
const getLocalADHDSteps = (task) => {
  const t = task.toLowerCase();
  
  if (t.includes('limpiar') || t.includes('ordenar') || t.includes('organizar') || t.includes('casa') || t.includes('habitación') || t.includes('cocina') || t.includes('baño') || t.includes('ropa') || t.includes('fregar')) {
    return [
      { id: 1, text: 'Ponte auriculares con tu música favorita o un podcast motivador.', completed: false },
      { id: 2, text: 'Recoge únicamente los objetos grandes del suelo o superficies.', completed: false },
      { id: 3, text: 'Elige una sola encimera o una pequeña zona y límpiala (no toda la habitación).', completed: false },
      { id: 4, text: 'Pon en su sitio 5 cosas que estén fuera de lugar.', completed: false },
      { id: 5, text: 'Lleva la bolsa de basura a la puerta y celebra el avance.', completed: false }
    ];
  }
  
  if (t.includes('estudiar') || t.includes('deberes') || t.includes('examen') || t.includes('leer') || t.includes('libro') || t.includes('escribir') || t.includes('redactar') || t.includes('curso') || t.includes('clase') || t.includes('aprender')) {
    return [
      { id: 1, text: 'Prepara un vaso de agua y despeja todo tu escritorio de objetos visuales molestos.', completed: false },
      { id: 2, text: 'Abre únicamente el documento o libro que necesitas (cierra las demás pestañas).', completed: false },
      { id: 3, text: 'Ponte un temporizador de 10 minutos para leer o escribir sin presiones.', completed: false },
      { id: 4, text: 'Escribe 3 ideas principales o resume un párrafo corto.', completed: false },
      { id: 5, text: 'Haz un descanso de 2 minutos para estirarte antes de continuar.', completed: false }
    ];
  }
  
  if (t.includes('cocinar') || t.includes('comida') || t.includes('cena') || t.includes('receta') || t.includes('desayuno') || t.includes('plato') || t.includes('almuerzo')) {
    return [
      { id: 1, text: 'Saca de la nevera y despensa todos los ingredientes que vas a usar.', completed: false },
      { id: 2, text: 'Lava y corta los ingredientes antes de encender el fuego.', completed: false },
      { id: 3, text: 'Cocina siguiendo los pasos básicos (fríe, hierve o calienta).', completed: false },
      { id: 4, text: 'Sirve la comida y pon en remojo la sartén u olla usada para facilitar la limpieza posterior.', completed: false },
      { id: 5, text: '¡Siéntate a disfrutar de tu plato!', completed: false }
    ];
  }
  
  if (t.includes('comprar') || t.includes('supermercado') || t.includes('lista') || t.includes('tienda') || t.includes('súper')) {
    return [
      { id: 1, text: 'Anota en tu móvil las 3 o 4 cosas indispensables que necesitas (no intentes recordarlas).', completed: false },
      { id: 2, text: 'Revisa si llevas las llaves, cartera y bolsas reutilizables.', completed: false },
      { id: 3, text: 'Ve directo a la sección de los artículos indispensables de tu lista.', completed: false },
      { id: 4, text: 'Paga y guarda los artículos organizadamente.', completed: false },
      { id: 5, text: 'Al llegar a casa, coloca la compra en su sitio inmediatamente para evitar que se quede fuera.', completed: false }
    ];
  }
  
  if (t.includes('ejercicio') || t.includes('gimnasio') || t.includes('entrenar') || t.includes('correr') || t.includes('deporte') || t.includes('caminar') || t.includes('estirar')) {
    return [
      { id: 1, text: 'Ponte la ropa deportiva y las zapatillas (este es el paso más difícil, hazlo primero).', completed: false },
      { id: 2, text: 'Llena tu botella de agua y tenla cerca.', completed: false },
      { id: 3, text: 'Haz 5 minutos de calentamiento suave o camina un poco.', completed: false },
      { id: 4, text: 'Realiza tu rutina corta o camina/corre por 15 minutos.', completed: false },
      { id: 5, text: 'Toma agua, descansa y felicítate por haber empezado.', completed: false }
    ];
  }
  
  if (t.includes('programar') || t.includes('código') || t.includes('desarrollar') || t.includes('web') || t.includes('computadora') || t.includes('pc') || t.includes('trabajar') || t.includes('informe') || t.includes('redactar') || t.includes('documento')) {
    return [
      { id: 1, text: 'Cierra todas las redes sociales y pon tu teléfono en modo "No molestar".', completed: false },
      { id: 2, text: 'Abre el editor de código o documento y define en una frase qué vas a programar/escribir.', completed: false },
      { id: 3, text: 'Escribe las primeras 5 líneas de código o el primer párrafo sin preocuparte por que sea perfecto.', completed: false },
      { id: 4, text: 'Prueba o revisa tu avance corto.', completed: false },
      { id: 5, text: 'Guarda los cambios o haz commit, y toma un respiro de 2 minutos.', completed: false }
    ];
  }
  
  if (t.includes('médico') || t.includes('cita') || t.includes('llamar') || t.includes('teléfono') || t.includes('gestión') || t.includes('papeleo') || t.includes('banco') || t.includes('pagar') || t.includes('factura')) {
    return [
      { id: 1, text: 'Ten a mano el papel, bolígrafo o documento que necesitas consultar durante la llamada.', completed: false },
      { id: 2, text: 'Busca el número de teléfono o la web de la gestión.', completed: false },
      { id: 3, text: 'Realiza la llamada o entra a la web y haz la solicitud.', completed: false },
      { id: 4, text: 'Anota la fecha confirmada o el número de referencia inmediatamente.', completed: false },
      { id: 5, text: 'Guarda o archiva el documento y da por finalizado el trámite.', completed: false }
    ];
  }
  
  // Genérico TDAH
  return [
    { id: 1, text: 'Elimina las distracciones visuales de tu alrededor y toma un trago de agua.', completed: false },
    { id: 2, text: 'Reúne el material mínimo necesario para esta tarea.', completed: false },
    { id: 3, text: 'Haz solo una acción muy pequeña relacionada con la tarea durante 5 minutos.', completed: false },
    { id: 4, text: 'Date permiso para avanzar despacio, paso a paso, sin presiones.', completed: false },
    { id: 5, text: 'Revisa tu pequeño avance y celebra que has empezado.', completed: false }
  ];
};

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

    const urlsToTry = [
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${savedKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${savedKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${savedKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${savedKey}`
    ];

    let success = false;
    let lastError = null;

    try {
      for (const url of urlsToTry) {
        try {
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
            let errorMsg = `Código de error HTTP ${response.status}`;
            try {
              const errorJson = await response.json();
              if (errorJson?.error?.message) {
                errorMsg = errorJson.error.message;
              }
            } catch (e) {
              console.error("Error parsing error response:", e);
            }
            throw new Error(errorMsg);
          }

          const data = await response.json();
          const textResponse = data.candidates[0].content.parts[0].text;
          
          let parsedSteps;
          try {
            parsedSteps = JSON.parse(textResponse.trim());
          } catch {
            const cleanText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedSteps = JSON.parse(cleanText);
          }

          if (Array.isArray(parsedSteps)) {
            setSteps(parsedSteps.map(s => ({ ...s, completed: false })));
            success = true;
            break;
          } else {
            throw new Error("El formato devuelto no es un array.");
          }
        } catch (err) {
          console.warn(`Failed fetch on ${url}:`, err.message);
          lastError = err;
        }
      }

      if (!success) {
        console.error("All Gemini API attempts failed:", lastError);
        const errMsg = lastError?.message || 'Error desconocido';
        const isQuotaError = errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('limit');
        
        if (isQuotaError) {
          setApiError("Tu clave API gratuita de Gemini tiene un límite de cuota de 0 peticiones (esto ocurre por restricciones de Google en España/Europa para cuentas sin tarjeta de facturación). ¡No te preocupes! Hemos activado la IA Local de la aplicación:");
        } else {
          setApiError(`Error al conectar con la IA: ${errMsg}. Revisa tu clave o prueba la IA Local.`);
        }
        
        // Generamos dinámicamente según la tarea
        setSteps(getLocalADHDSteps(taskName));
      }
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
                  setApiError("Utilizando la IA Local integrada en la App:");
                  setSteps(getLocalADHDSteps(taskName));
                }}
              >
                Usar IA Local (Sin Clave)
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
