import React, { useState } from 'react';
import { Play, Check, Trash2, Plus, Clock, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import './TaskDashboard.css';

export const TaskDashboard = ({ 
  tasks = [], 
  onStartFocus, 
  onCompleteTask, 
  onDeleteTask, 
  onAddTask,
  onResetDay
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(25);
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), parseInt(newDuration) || 25, newScheduledTime || null);
      setNewTitle('');
      setNewScheduledTime('');
      setShowAddForm(false);
    }
  };

  // Formatear segundos restantes como "MM:SS" o "X min"
  const formatRemainingTime = (task) => {
    if (task.remainingSeconds !== undefined) {
      const m = Math.floor(task.remainingSeconds / 60);
      const s = task.remainingSeconds % 60;
      return `Restan ${m}m ${s}s`;
    }
    return `${task.duration || 25} min`;
  };

  const pendingTasksList = tasks.filter(t => !t.completed);
  const completedTasksList = tasks.filter(t => t.completed);

  return (
    <div className="task-dashboard fade-in">
      <div className="dashboard-header-card">
        <Sparkles className="sparkles-icon" size={24} />
        <div className="header-text">
          <h3>Tus metas de hoy</h3>
          <p>Elige en qué enfocar tu mente. Una sola cosa a la vez es suficiente.</p>
        </div>
      </div>

      {pendingTasksList.length === 0 && completedTasksList.length > 0 && (
        <div className="celebration-card fade-in">
          <div className="celebration-icon-wrapper">
            <Trophy size={40} className="celebration-trophy" />
          </div>
          <h3>¡Increíble, has completado todas tus metas! 🎉</h3>
          <p>Has hecho un trabajo espectacular hoy enfocando tu mente. Tu cerebro se merece un gran descanso.</p>
          <button className="primary reset-day-btn" onClick={onResetDay}>
            Nueva planificación diaria
          </button>
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          className={`toggle-add-btn ${showAddForm ? 'active' : ''}`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={18} />
          {showAddForm ? 'Cancelar' : 'Añadir tarea rápida'}
        </button>
      </div>

      {showAddForm && (
        <form className="quick-add-form fade-in" onSubmit={handleSubmit}>
          <input 
            type="text"
            placeholder="¿Qué vas a conseguir ahora?..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="quick-input-title"
            autoFocus
            required
          />
          <div className="quick-form-row">
            <div className="duration-selector">
              <label>Duración:</label>
              <select 
                value={newDuration} 
                onChange={(e) => setNewDuration(e.target.value)}
                className="quick-select-duration"
              >
                <option value={10}>10 min (Cortito)</option>
                <option value={15}>15 min (Rápido)</option>
                <option value={25}>25 min (Estándar)</option>
                <option value={45}>45 min (Profundo)</option>
              </select>
            </div>

            <div className="time-selector">
              <label>Hora (opcional):</label>
              <input 
                type="datetime-local"
                value={newScheduledTime}
                onChange={(e) => setNewScheduledTime(e.target.value)}
                className="quick-time-input"
              />
            </div>
          </div>
          <button type="submit" className="primary submit-quick-btn" disabled={!newTitle.trim()}>
            Añadir a la lista
          </button>
        </form>
      )}

      <div className="dashboard-task-list">
        {pendingTasksList.length === 0 && completedTasksList.length === 0 ? (
          <div className="empty-dashboard">
            <p>¡No tienes tareas pendientes hoy!</p>
            {!showAddForm && (
              <button className="primary" onClick={() => setShowAddForm(true)}>
                Crear primera tarea
              </button>
            )}
          </div>
        ) : (
          pendingTasksList.map((task) => {
            const isPaused = task.remainingSeconds !== undefined && task.remainingSeconds < (task.duration * 60);
            return (
              <div 
                key={task.id} 
                className={`dashboard-task-card ${isPaused ? 'paused-task' : ''}`}
              >
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <div className="task-meta-tags">
                    <span className={`duration-tag ${isPaused ? 'paused-tag' : ''}`}>
                      {formatRemainingTime(task)}
                    </span>
                    {task.scheduledTime && (
                      <span className="scheduled-tag">
                        <Clock size={12} />
                        {new Date(task.scheduledTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button 
                    className="action-btn focus-btn success"
                    onClick={() => onStartFocus(task.id)}
                    title={isPaused ? "Retomar Foco" : "Iniciar Foco"}
                  >
                    <Play size={16} fill="white" />
                    <span>{isPaused ? 'Retomar' : 'Enfocar'}</span>
                  </button>

                  <button 
                    className="action-btn complete-btn"
                    onClick={() => onCompleteTask(task.id)}
                    title="Completar sin temporizador"
                  >
                    <Check size={18} />
                  </button>

                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDeleteTask(task.id)}
                    title="Eliminar tarea"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {completedTasksList.length > 0 && (
          <div className="completed-section fade-in">
            <h4 className="completed-section-title">Completadas hoy ({completedTasksList.length})</h4>
            <div className="completed-task-list">
              {completedTasksList.map((task) => (
                <div key={task.id} className="dashboard-task-card completed-task-card">
                  <div className="task-info">
                    <span className="task-title completed-title">{task.title}</span>
                    <div className="task-meta-tags">
                      <span className="duration-tag completed-duration-tag">
                        Completado
                      </span>
                      {task.completedAt && (
                        <span className="scheduled-tag completed-time-tag">
                          <CheckCircle2 size={12} className="check-circle-icon" />
                          a las {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => onDeleteTask(task.id)}
                      title="Eliminar tarea definitivamente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
