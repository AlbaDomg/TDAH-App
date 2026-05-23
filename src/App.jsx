import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TaskCard } from './components/TaskCard';
import { ParalysisMode } from './components/ParalysisMode';
import { TaskSetup } from './components/TaskSetup';
import { CompletedHistory } from './components/CompletedHistory';
import { CalmingGame } from './components/CalmingGame';
import { TaskDashboard } from './components/TaskDashboard';
import { triggerReward } from './utils/RewardSystem';
import { requestNotificationPermission, sendNotification } from './utils/Notifications';
import { Star, ShieldAlert, ListTodo, Trophy, Wind, LayoutList } from 'lucide-react';
import './App.css';

function App() {
  const [dopaminePoints, setDopaminePoints] = useLocalStorage('adhd_points', 0);
  const [completedTasks, setCompletedTasks] = useLocalStorage('adhd_completed_tasks', []);
  const [pendingTasks, setPendingTasks] = useLocalStorage('adhd_pending_tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage('adhd_active_task_id', null);
  
  // 'setup', 'focus', 'history', 'calm', 'paralysis'
  const [currentView, setCurrentView] = useLocalStorage('adhd_current_view', pendingTasks.length > 0 ? 'focus' : 'setup');

  useEffect(() => {
    // Pedir permiso de notificaciones al inicio
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // Revisar recordatorios cada minuto
    const checkSchedules = setInterval(() => {
      const now = new Date();
      pendingTasks.forEach(task => {
        if (task.scheduledTime && !task.completed) {
          const scheduledDate = new Date(task.scheduledTime);
          const diffInMinutes = (scheduledDate - now) / (1000 * 60);

          // Si falta entre 0 y 1 minuto (hora exacta)
          if (diffInMinutes > 0 && diffInMinutes <= 1) {
            sendNotification("¡Es hora de tu tarea programada!", {
              body: `Tu tarea "${task.title}" toca ahora. ¡A por ella!`
            });
          }
          // Recordatorio anticipado (15 minutos antes)
          else if (diffInMinutes > 14 && diffInMinutes <= 15) {
            sendNotification("Recordatorio anticipado", {
              body: `Faltan 15 minutos para tu tarea: "${task.title}".`
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(checkSchedules);
  }, [pendingTasks]);

  const handleStartDay = (tasks) => {
    setPendingTasks(tasks);
    if (tasks.length > 0) {
      setActiveTaskId(tasks[0].id);
    }
    setCurrentView('focus');
    sendNotification("¡Día planificado!", { body: "Es hora de empezar con tu primera tarea." });
  };

  const currentTask = pendingTasks.find(t => t.id === activeTaskId && !t.completed) || null;

  const handleCompleteTaskById = (taskId) => {
    const taskToComplete = pendingTasks.find(t => t.id === taskId);
    if (taskToComplete) {
      triggerReward();
      setDopaminePoints(prev => prev + 50);
      const completedTime = new Date().toISOString();
      setCompletedTasks([...completedTasks, { ...taskToComplete, completed: true, completedAt: completedTime }]);
      
      setPendingTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, completed: true, completedAt: completedTime } : t)
      );
      
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
      
      const remainingTasks = pendingTasks.filter(t => !t.completed && t.id !== taskId);
      if (remainingTasks.length > 0) {
        sendNotification("¡Tarea completada!", { body: "¡Gran trabajo! Tómate un respiro antes de seguir." });
      } else {
        sendNotification("¡Día completado!", { body: "Has terminado todas tus tareas. ¡Disfruta tu descanso!" });
        alert("¡Has completado todas tus tareas de hoy! Eres genial.");
        setCurrentView('history');
      }
    }
  };

  const handleTaskComplete = () => {
    if (currentTask) {
      handleCompleteTaskById(currentTask.id);
    }
  };

  const handleDeleteTask = (taskId) => {
    setPendingTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const handleAddTaskDuringDay = (title, duration, scheduledTime) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      duration,
      scheduledTime: scheduledTime || null
    };
    setPendingTasks(prev => [...prev, newTask]);
    sendNotification("Tarea añadida", { body: `Añadiste "${title}" a tu lista diaria.` });
  };

  const handleUpdateRemainingTime = (taskId, seconds) => {
    setPendingTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, remainingSeconds: seconds } : t)
    );
  };

  const handleStepComplete = () => {
    triggerReward();
    setDopaminePoints(prev => prev + 10);
  };

  const handleMicroTaskComplete = () => {
    triggerReward();
    setDopaminePoints(prev => prev + 5);
  };

  const handleUpdateTitle = (id, newTitle) => {
    setPendingTasks(tasks => 
      tasks.map(t => t.id === id ? { ...t, title: newTitle } : t)
    );
  };

  const handleResetDay = () => {
    setPendingTasks([]);
    setActiveTaskId(null);
    setCurrentView('setup');
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Seguro que quieres borrar todo tu historial de logros? Esto no afectará a tus puntos de dopamina.")) {
      setCompletedTasks([]);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="dopamine-counter">
          <Star className="star-icon" fill="var(--color-accent-peach)" size={28} />
          <span className="points">{dopaminePoints} pts</span>
        </div>
        
        {currentView !== 'paralysis' && (
          <button 
            className="paralysis-trigger-btn"
            onClick={() => setCurrentView('paralysis')}
            title="Me siento abrumado"
          >
            <ShieldAlert size={20} />
            Socorro
          </button>
        )}
      </header>

      <main className="main-content">
        {currentView === 'setup' && (
          <TaskSetup onStart={handleStartDay} />
        )}

        {currentView === 'focus' && (
          currentTask ? (
            <TaskCard 
              key={currentTask.id}
              task={currentTask} 
              onComplete={handleTaskComplete}
              onStepComplete={handleStepComplete}
              onUpdateTitle={handleUpdateTitle}
              onExitFocus={() => setActiveTaskId(null)}
              onTimeUpdate={(seconds) => handleUpdateRemainingTime(currentTask.id, seconds)}
            />
          ) : pendingTasks.length > 0 ? (
            <TaskDashboard 
              tasks={pendingTasks}
              onStartFocus={(id) => setActiveTaskId(id)}
              onCompleteTask={handleCompleteTaskById}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTaskDuringDay}
              onResetDay={handleResetDay}
            />
          ) : (
            <div className="no-tasks-view fade-in">
              <h2>No hay tareas activas</h2>
              <button className="primary" onClick={() => setCurrentView('setup')}>
                Planificar nuevas tareas
              </button>
            </div>
          )
        )}

        {currentView === 'paralysis' && (
          <ParalysisMode 
            onExit={() => setCurrentView('focus')}
            onComplete={handleMicroTaskComplete}
          />
        )}

        {currentView === 'history' && (
          <CompletedHistory completedTasks={completedTasks} onClearHistory={handleClearHistory} />
        )}

        {currentView === 'calm' && (
          <CalmingGame />
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentView === 'focus' || currentView === 'setup' || currentView === 'paralysis' ? 'active' : ''}`}
          onClick={() => setCurrentView(pendingTasks.length > 0 ? 'focus' : 'setup')}
        >
          <ListTodo size={24} />
          <span>Foco</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <Trophy size={24} />
          <span>Logros</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'calm' ? 'active' : ''}`}
          onClick={() => setCurrentView('calm')}
        >
          <Wind size={24} />
          <span>Calma</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
