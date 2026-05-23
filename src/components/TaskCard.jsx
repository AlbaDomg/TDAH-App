import React, { useState } from 'react';
import { VisualTimer } from './VisualTimer';
import { TaskBreakdown } from './TaskBreakdown';
import { Check, Edit2, Save, ArrowLeft } from 'lucide-react';
import './TaskCard.css';

export const TaskCard = ({ task, onComplete, onStepComplete, onUpdateTitle, onExitFocus, onTimeUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task ? task.title : '');

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(task.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  if (!task) return null;

  return (
    <div className="task-card fade-in">
      <div className="task-header">
        {isEditing ? (
          <div className="edit-title-container">
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-title-input"
              autoFocus
            />
            <button className="icon-btn" onClick={handleSaveTitle}>
              <Save size={20} />
            </button>
          </div>
        ) : (
          <div className="title-container">
            <h2>{task.title}</h2>
            <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
            </button>
          </div>
        )}
        {task.description && <p>{task.description}</p>}
      </div>

      <VisualTimer 
        durationMinutes={task.duration || 25} 
        remainingSeconds={task.remainingSeconds}
        onTimeUpdate={onTimeUpdate}
      />
      
      <TaskBreakdown 
        taskName={task.title} 
        onStepComplete={onStepComplete} 
      />

      <div className="task-actions-container" style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '32px' }}>
        <button className="primary complete-main-btn" onClick={onComplete} style={{ flex: 2, marginTop: 0 }}>
          <Check size={24} />
          Completar Tarea
        </button>
        <button className="exit-focus-btn" onClick={onExitFocus} style={{ flex: 1 }}>
          <ArrowLeft size={20} />
          Salir
        </button>
      </div>
    </div>
  );
};

