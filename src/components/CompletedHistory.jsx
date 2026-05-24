import React, { useState } from 'react';
import { CheckCircle2, Trophy, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import './CompletedHistory.css';

export const CompletedHistory = ({ 
  completedTasks = [], 
  onClearHistory,
  onDeleteTask,
  onUpdateTask
}) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(25);
  const [editCompletedAt, setEditCompletedAt] = useState('');

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDuration(task.duration || 25);
    
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      const tzoffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 16);
      setEditCompletedAt(localISOTime);
    } else {
      setEditCompletedAt('');
    }
  };

  const handleSave = (taskId) => {
    if (editTitle.trim()) {
      onUpdateTask(taskId, {
        title: editTitle.trim(),
        duration: parseInt(editDuration) || 25,
        completedAt: editCompletedAt ? new Date(editCompletedAt).toISOString() : new Date().toISOString()
      });
      setEditingTaskId(null);
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
  };

  return (
    <div className="completed-history fade-in">
      <div className="history-header">
        <Trophy className="trophy-icon" size={32} />
        <h2>Tus logros de hoy</h2>
        <p>Mira todo lo que has conseguido. ¡Celebra cada pequeño paso!</p>
      </div>

      {completedTasks.length === 0 ? (
        <div className="empty-history">
          <p>Aún no has completado ninguna tarea, ¡pero el día es joven!</p>
        </div>
      ) : (
        <>
          <ul className="history-list">
            {completedTasks.map((task, index) => (
              <li key={task.id || index} className="history-item slide-in">
                {editingTaskId === task.id ? (
                  <div className="history-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
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
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Duración:</span>
                        <input 
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          style={{ width: '45px', background: 'transparent', border: 'none', fontWeight: '700', outline: 'none', color: 'var(--color-text-main)', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>min</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', flex: 1 }}>
                        <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <input 
                          type="datetime-local"
                          value={editCompletedAt}
                          onChange={(e) => setEditCompletedAt(e.target.value)}
                          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--color-text-main)', fontFamily: 'inherit', width: '100%' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button className="icon-btn save-btn" onClick={() => handleSave(task.id)} style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--color-success-olive)', color: 'white', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <Check size={16} />
                        Guardar
                      </button>
                      <button className="icon-btn cancel-btn" onClick={handleCancel} style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="check-icon" size={24} style={{ marginRight: '4px' }} />
                    <div className="history-task-info" style={{ flex: 1 }}>
                      <span className="history-task-title">{task.title}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="history-duration-tag" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {task.duration || 25} min
                        </span>
                        {task.completedAt && (
                          <span className="history-time" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(task.completedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="history-item-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => startEditing(task)}
                        title="Editar logro"
                        style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => onDeleteTask(task.id)}
                        title="Eliminar logro"
                        style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--color-danger-soft)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button className="clear-history-btn" onClick={onClearHistory}>
            <Trash2 size={18} />
            Borrar Historial
          </button>
        </>
      )}
    </div>
  );
};
