import { useState } from 'react';
import { Wand2, CheckCircle2, Circle, PenTool } from 'lucide-react';
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

  // Fragmenta la tarea dinámicamente con IA Local adaptada
  const handleMagicFragment = () => {
    setIsFragmenting(true);
    // Retraso para un efecto visual agradable
    setTimeout(() => {
      const localSteps = getLocalADHDSteps(taskName);
      setSteps(localSteps);
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
        <div className="steps-container">
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
        </div>
      )}
    </div>
  );
};
