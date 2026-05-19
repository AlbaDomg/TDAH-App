import React, { useState } from 'react';
import { VisualTimer } from './VisualTimer';
import { TaskBreakdown } from './TaskBreakdown';
import { Check, Edit2, Save } from 'lucide-react';
import './TaskCard.css';

export const TaskCard = ({ task, onComplete, onStepComplete, onUpdateTitle }) => {
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

      <VisualTimer durationMinutes={task.duration || 25} />
      
      <TaskBreakdown 
        taskName={task.title} 
        onStepComplete={onStepComplete} 
      />

      <button className="primary complete-main-btn" onClick={onComplete}>
        <Check size={24} />
        Completar Tarea Principal
      </button>
    </div>
  );
};
