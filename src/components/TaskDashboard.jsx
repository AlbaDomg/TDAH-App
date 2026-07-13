import React, { useState } from 'react';
import { Play, Check, Trash2, Plus, Clock, Sparkles, Trophy, CheckCircle2, Edit2, X } from 'lucide-react';
import './TaskDashboard.css';

export const TaskDashboard = ({ 
  tasks = [], 
  onStartFocus, 
  onCompleteTask, 
  onDeleteTask, 
  onAddTask,
  onResetDay,
  onUpdateTask
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(25);
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Estados de edición inline de tareas activas
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(25);
  const [editScheduledTime, setEditScheduledTime] = useState('');

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDuration(task.duration || 25);
    setEditScheduledTime(task.scheduledTime || '');
  };

  const handleSave = (taskId) => {
    if (editTitle.trim()) {
      onUpdateTask(taskId, {
        title: editTitle.trim(),
        duration: parseInt(editDuration) || 25,
        scheduledTime: editScheduledTime || null
      });
      setEditingTaskId(null);
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
  };

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

  const pendingTasksList = tasks;

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
          {showAddForm ? 'Cancelar' : 'Añadir una tarea'}
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
                <option value={60}>60 min (1 hora)</option>
                <option value={90}>90 min (1.5 horas)</option>
                <option value={120}>120 min (2 horas)</option>
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
        {pendingTasksList.length === 0 ? (
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
                {editingTaskId === task.id ? (
                  <div className="dashboard-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '2px solid var(--color-bg-secondary)',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: 'var(--color-text-main)',
                        outline: 'none',
                        backgroundColor: 'var(--color-bg)'
                      }}
                      required
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: '130px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Duración:</span>
                        <select
                          value={editDuration}
                          onChange={(e) => setEditDuration(parseInt(e.target.value) || 25)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}
                        >
                          <option value={5}>5 min</option>
                          <option value={10}>10 min</option>
                          <option value={15}>15 min</option>
                          <option value={25}>25 min</option>
                          <option value={40}>40 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                          <option value={120}>120 min</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', flex: 1.5, minWidth: '180px' }}>
                        <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <input 
                          type="datetime-local"
                          value={editScheduledTime}
                          onChange={(e) => setEditScheduledTime(e.target.value)}
                          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--color-text-main)', fontFamily: 'inherit', width: '100%' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button className="primary save-btn" onClick={() => handleSave(task.id)} style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <Check size={16} />
                        Guardar
                      </button>
                      <button className="cancel-btn" onClick={handleCancel} style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <div className="task-meta-tags">
                        <span className={`duration-tag ${isPaused ? 'paused-tag' : ''}`}>
                          {formatRemainingTime(task)}
                        </span>
                        {task.scheduledTime && (
                          <span className="scheduled-tag">
                            <Clock size={12} />
                            {new Date(task.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
                        className="action-btn edit-btn"
                        onClick={() => startEditing(task)}
                        title="Editar tarea"
                        style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        <Edit2 size={18} />
                      </button>



                      <button 
                        className="action-btn delete-btn"
                        onClick={() => onDeleteTask(task.id)}
                        title="Eliminar tarea"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
