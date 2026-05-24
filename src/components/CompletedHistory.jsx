import React from 'react';
import { CheckCircle2, Trophy, Trash2 } from 'lucide-react';
import './CompletedHistory.css';

export const CompletedHistory = ({ completedTasks = [], onClearHistory }) => {
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
                <CheckCircle2 className="check-icon" size={24} />
                <div className="history-task-info">
                  <span className="history-task-title">{task.title}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
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
