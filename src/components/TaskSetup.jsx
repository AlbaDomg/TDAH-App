import React, { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import './TaskSetup.css';

export const TaskSetup = ({ onAddTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(25);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(
        inputValue.trim(),
        duration,
        scheduledTime || null
      );
      setInputValue('');
      setScheduledTime('');
      setDuration(25); // reset a 25 min estándar
    }
  };

  return (
    <div className="task-setup fade-in">
      <div className="setup-header">
        <h2>¿Qué vamos a conseguir hoy?</h2>
        <p>Añade todo lo que tienes en la cabeza. Luego nos centraremos solo en una cosa a la vez.</p>
      </div>

      <form className="add-task-form" onSubmit={handleAddTask}>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Ej: Escribir el informe, Llamar al dentista..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="task-input"
            autoFocus
          />
          <div className="setup-controls-row" style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
            <div className="time-input-wrapper" title="Programar tarea para más tarde" style={{ flex: 1, minWidth: '180px' }}>
              <Clock size={18} className="time-icon" />
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="task-time-input"
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="duration-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bg-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: '180px', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Duración:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 25)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}
              >
                <option value={5}>5 min (Super rápido)</option>
                <option value={10}>10 min (Cortito)</option>
                <option value={15}>15 min (Rápido)</option>
                <option value={25}>25 min (Estándar)</option>
                <option value={40}>40 min (Enfoque)</option>
                <option value={60}>60 min (Foco profundo)</option>
              </select>
            </div>
          </div>
        </div>
        <button type="submit" className="registrar-tarea-btn" disabled={!inputValue.trim()}>
          <Plus size={20} />
          Registrar Tarea
        </button>
      </form>

    </div>
  );
};
