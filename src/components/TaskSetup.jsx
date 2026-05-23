import React, { useState } from 'react';
import { Plus, Play, Trash2, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './TaskSetup.css';

export const TaskSetup = ({ onStart }) => {
  const [tasks, setTasks] = useLocalStorage('adhd_task_setup_draft', []);
  const [inputValue, setInputValue] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        title: inputValue.trim(),
        duration: 25, // Por defecto 25 min
        scheduledTime: scheduledTime || null
      }]);
      setInputValue('');
      setScheduledTime('');
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStart = () => {
    if (tasks.length > 0) {
      onStart(tasks);
      // Limpiar el borrador después de empezar el día
      setTasks([]);
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
          <div className="time-input-wrapper" title="Programar tarea para más tarde">
            <Clock size={18} className="time-icon" />
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="task-time-input"
            />
          </div>
        </div>
        <button type="submit" className="add-btn" disabled={!inputValue.trim()}>
          <Plus size={24} />
        </button>
      </form>

      {tasks.length > 0 && (
        <div className="task-list-preview">
          <h3>Tu lista para hoy:</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="preview-item">
                <div className="preview-task-info">
                  <span className="preview-title">{task.title}</span>
                  {task.scheduledTime && (
                    <span className="preview-time">
                      <Clock size={14} /> 
                      {new Date(task.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <button className="delete-btn" onClick={() => removeTask(task.id)}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tasks.length > 0 && (
        <button className="primary start-day-btn" onClick={handleStart}>
          <Play size={20} />
          ¡A por ello!
        </button>
      )}
    </div>
  );
};
