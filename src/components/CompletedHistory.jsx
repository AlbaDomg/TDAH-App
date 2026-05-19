import React from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import './CompletedHistory.css';

export const CompletedHistory = ({ completedTasks = [] }) => {
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
        <ul className="history-list">
          {completedTasks.map((task, index) => (
            <li key={index} className="history-item slide-in">
              <CheckCircle2 className="check-icon" size={24} />
              <div className="history-task-info">
                <span className="history-task-title">{task.title}</span>
                {task.completedAt && (
                  <span className="history-time">
                    {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
