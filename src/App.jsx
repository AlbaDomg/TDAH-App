import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TaskCard } from './components/TaskCard';
import { ParalysisMode } from './components/ParalysisMode';
import { TaskSetup } from './components/TaskSetup';
import { CompletedHistory } from './components/CompletedHistory';
import { CalmingGame } from './components/CalmingGame';
import { TaskDashboard } from './components/TaskDashboard';
import { ListsSection } from './components/ListsSection';
import { triggerReward } from './utils/RewardSystem';
import { requestNotificationPermission, sendNotification, startAlarm, stopAlarm, playNotificationSound } from './utils/Notifications';
import { Star, ShieldAlert, ListTodo, Trophy, Wind, LayoutList, ShoppingBag, LogOut, Cloud, RefreshCw, Bell } from 'lucide-react';
import './App.css';
import { DopamineStore } from './components/DopamineStore';
import { subscribeAuth, logOut, getUserData, saveUserData } from './firebase';
import { Auth } from './components/Auth';

function App() {
  const [dopaminePoints, setDopaminePoints] = useLocalStorage('adhd_points', 0);
  const [completedTasks, setCompletedTasks] = useLocalStorage('adhd_completed_tasks', []);
  const [pendingTasks, setPendingTasks] = useLocalStorage('adhd_pending_tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage('adhd_active_task_id', null);
  const [lists, setLists] = useLocalStorage('adhd_custom_lists', []);
  
  // 'setup', 'focus', 'history', 'calm', 'paralysis', 'lists', 'store'
  const [currentView, setCurrentView] = useLocalStorage('adhd_current_view', pendingTasks.length > 0 ? 'focus' : 'setup');

  const [activeTheme, setActiveTheme] = useLocalStorage('adhd_active_theme', 'default');
  const [unlockedThemes, setUnlockedThemes] = useLocalStorage('adhd_unlocked_themes', ['default', 'slate']);
  const [customRewards, setCustomRewards] = useLocalStorage('adhd_custom_rewards', []);
  const [activeSound, setActiveSound] = useLocalStorage('adhd_active_sound', 'chime');

  // Estados de notificaciones y alarmas
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [activeAlarmTask, setActiveAlarmTask] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mantener referencia de tareas pendientes para evitar reiniciar el intervalo de recordatorios
  const pendingTasksRef = useRef(pendingTasks);
  useEffect(() => {
    pendingTasksRef.current = pendingTasks;
  }, [pendingTasks]);

  // Referencia para sonido activo para evitar stale closures en el temporizador
  const activeSoundRef = useRef(activeSound);
  useEffect(() => {
    activeSoundRef.current = activeSound;
  }, [activeSound]);

  const handleRequestNotifPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    playNotificationSound(activeSound); // Sonido de prueba para desbloquear audio del móvil
  };

  // 1. Suscribirse al estado de autenticación
  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Cargar datos del usuario desde la nube
        try {
          const docSnap = await getUserData(user.uid);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.dopaminePoints !== undefined) setDopaminePoints(data.dopaminePoints);
            if (data.completedTasks !== undefined) setCompletedTasks(data.completedTasks);
            if (data.pendingTasks !== undefined) setPendingTasks(data.pendingTasks);
            if (data.activeTaskId !== undefined) setActiveTaskId(data.activeTaskId);
            if (data.lists !== undefined) setLists(data.lists);
            if (data.activeTheme !== undefined) setActiveTheme(data.activeTheme);
            if (data.unlockedThemes !== undefined) setUnlockedThemes(data.unlockedThemes);
            if (data.customRewards !== undefined) setCustomRewards(data.customRewards);
            if (data.activeSound !== undefined) setActiveSound(data.activeSound);
            if (data.currentView !== undefined) setCurrentView(data.currentView);
          }
        } catch (error) {
          console.error("Error al cargar datos de la nube:", error);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronizar datos automáticamente (con debounce de 2 segundos)
  useEffect(() => {
    if (!currentUser || authLoading) return;

    const dataToSync = {
      dopaminePoints,
      completedTasks,
      pendingTasks,
      activeTaskId,
      lists,
      activeTheme,
      unlockedThemes,
      customRewards,
      activeSound,
      currentView,
      lastSynced: new Date().toISOString()
    };

    const timer = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveUserData(currentUser.uid, dataToSync);
      } catch (error) {
        console.error("Error al sincronizar con la nube:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    dopaminePoints,
    completedTasks,
    pendingTasks,
    activeTaskId,
    lists,
    activeTheme,
    unlockedThemes,
    customRewards,
    activeSound,
    currentView,
    currentUser,
    authLoading
  ]);

  const handleAuthSuccess = async (user, migrate) => {
    setCurrentUser(user);
    if (migrate) {
      // Migrar datos de invitado a la nube inmediatamente
      const dataToSync = {
        dopaminePoints,
        completedTasks,
        pendingTasks,
        activeTaskId,
        lists,
        activeTheme,
        unlockedThemes,
        customRewards,
        activeSound,
        currentView,
        lastSynced: new Date().toISOString()
      };
      try {
        setIsSyncing(true);
        await saveUserData(user.uid, dataToSync);
      } catch (error) {
        console.error("Error migrando datos:", error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión?")) {
      try {
        await logOut();
        // Limpiar estados locales para la siguiente sesión
        setDopaminePoints(0);
        setCompletedTasks([]);
        setPendingTasks([]);
        setActiveTaskId(null);
        setLists([]);
        setActiveTheme('default');
        setUnlockedThemes(['default', 'slate']);
        setCustomRewards([]);
        setActiveSound('chime');
        setCurrentView('setup');
      } catch (error) {
        console.error("Error cerrando sesión:", error);
      }
    }
  };

  useEffect(() => {
    // Aplicar tema de color activo al body
    const themeClasses = ['theme-lavender', 'theme-forest', 'theme-sunset', 'theme-cyberpunk', 'theme-slate', 'theme-sakura', 'theme-stars'];
    themeClasses.forEach(cls => document.body.classList.remove(cls));
    if (activeTheme && activeTheme !== 'default') {
      document.body.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  useEffect(() => {
    // Pedir permiso de notificaciones al inicio
    requestNotificationPermission();
    
    // Limpiar borrador obsoleto para evitar conflictos
    try {
      localStorage.removeItem('adhd_task_setup_draft');
    } catch (e) {
      console.warn('Error clearing legacy draft:', e);
    }
  }, []);

  useEffect(() => {
    // Revisar recordatorios cada 15 segundos para mayor precisión (tolerante a suspensión del navegador)
    const checkSchedules = setInterval(() => {
      const now = new Date();
      let hasUpdates = false;
      const currentTasks = pendingTasksRef.current;
      
      const updatedTasks = currentTasks.map(task => {
        if (task.scheduledTime && !task.completed) {
          const scheduledDate = new Date(task.scheduledTime);
          const diffInMinutes = (scheduledDate - now) / (1000 * 60);
          let notifiedExact = task.notifiedExact || false;
          let notifiedEarly = task.notifiedEarly || false;
          let updatedTask = null;

          // 1. Recordatorio a la hora exacta (si ya ha pasado la hora y no se ha enviado aún)
          if (now >= scheduledDate && !notifiedExact) {
            // Empezar alarma en bucle continuo y mostrar modal
            startAlarm(activeSoundRef.current);
            setActiveAlarmTask(task);

            const notif = sendNotification("¡Es hora de tu tarea programada!", {
              body: `Tu tarea "${task.title}" toca ahora. ¡Haz clic para empezar!`,
              requireInteraction: true // mantener visible en pantalla
            }, activeSoundRef.current);

            if (notif) {
              notif.onclick = () => {
                window.focus();
                stopAlarm();
                setActiveAlarmTask(null);
                setActiveTaskId(task.id);
                setCurrentView('focus');
              };
            }

            notifiedExact = true;
            updatedTask = { ...task, notifiedExact };
            hasUpdates = true;
          }
          // 2. Recordatorio anticipado (si faltan 15 minutos o menos y no se ha enviado aún)
          else if (diffInMinutes > 0 && diffInMinutes <= 15 && !notifiedEarly) {
            // Notificación normal simple
            const notif = sendNotification("Recordatorio anticipado", {
              body: `Faltan 15 minutos para tu tarea: "${task.title}".`
            }, activeSoundRef.current);

            if (notif) {
              notif.onclick = () => {
                window.focus();
                setActiveTaskId(task.id);
                setCurrentView('focus');
              };
            }

            notifiedEarly = true;
            updatedTask = { ...task, notifiedEarly };
            hasUpdates = true;
          }

          return updatedTask || task;
        }
        return task;
      });

      if (hasUpdates) {
        setPendingTasks(updatedTasks);
      }
    }, 15000);

    return () => clearInterval(checkSchedules);
  }, [setPendingTasks, setActiveTaskId, setCurrentView]);


  const currentTask = pendingTasks.find(t => t.id === activeTaskId) || null;

  const handleCompleteTaskById = (taskId) => {
    const taskToComplete = pendingTasks.find(t => t.id === taskId);
    if (taskToComplete) {
      triggerReward();
      setDopaminePoints(prev => prev + 50);
      const completedTime = new Date().toISOString();
      setCompletedTasks([...completedTasks, { ...taskToComplete, completed: true, completedAt: completedTime }]);
      
      // Eliminar la tarea de la lista de pendientes (Foco)
      setPendingTasks(prev => prev.filter(t => t.id !== taskId));
      
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
      
      sendNotification("¡Tarea completada!", { body: "¡Buen trabajo! La tarea se ha guardado en logros." });
      alert("¡Tarea completada! Se ha guardado en tus Logros.");
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

  const handleAddTaskFromSetup = (title, duration, scheduledTime) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      duration,
      scheduledTime: scheduledTime || null
    };
    setPendingTasks(prev => [...prev, newTask]);
    setCurrentView('focus');
    setActiveTaskId(null); // Asegura ir a la lista de tareas del dashboard
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

  const handleUpdateTask = (taskId, updatedFields) => {
    setPendingTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t)
    );
  };

  if (authLoading) {
    return (
      <div className="app-loading-screen">
        <RefreshCw className="spinner spin" size={48} />
        <p>Cargando tu espacio...</p>
      </div>
    );
  }

  if (!currentUser) {
    const guestProgress = {
      dopaminePoints,
      completedTasks,
      pendingTasks,
      lists,
      activeTheme,
      unlockedThemes,
      customRewards
    };
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess} 
        guestProgress={guestProgress}
      />
    );
  }

  return (
    <div className="app-container">
      {notifPermission !== 'granted' && (
        <div className="permission-banner fade-in">
          <div className="permission-banner-content">
            <Bell size={20} className="bell-pulse" />
            <span>Activa las notificaciones y alarmas de sonido para no olvidar tus tareas.</span>
          </div>
          <button onClick={handleRequestNotifPermission} className="permission-btn btn-sm">
            Activar Alertas
          </button>
        </div>
      )}

      <header className="app-header">
        <div className="header-left">
          <div className="dopamine-counter">
            <Star className="star-icon" fill="var(--color-accent-peach)" size={28} />
            <span className="points">{dopaminePoints} pts</span>
          </div>
          <div className="sync-status">
            {isSyncing ? (
              <RefreshCw className="sync-icon spin" size={16} title="Sincronizando con la nube..." />
            ) : (
              <Cloud className="sync-icon synced" size={16} title="Progreso guardado en la nube" />
            )}
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-profile-header">
            <span className="user-email" title={currentUser.email}>
              {currentUser.email.split('@')[0]}
            </span>
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
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
        </div>
      </header>

      <main className="main-content">
        {currentView === 'setup' && (
          <TaskSetup onAddTask={handleAddTaskFromSetup} />
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
              onUpdateTask={handleUpdateTask}
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
          <CompletedHistory 
            completedTasks={completedTasks} 
            onClearHistory={handleClearHistory}
          />
        )}

        {currentView === 'calm' && (
          <CalmingGame />
        )}

        {currentView === 'lists' && (
          <ListsSection 
            lists={lists} 
            setLists={setLists} 
            onAddPoints={(points) => setDopaminePoints(prev => prev + points)}
            triggerConfetti={triggerReward}
          />
        )}

        {currentView === 'store' && (
          <DopamineStore
            dopaminePoints={dopaminePoints}
            setDopaminePoints={setDopaminePoints}
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            unlockedThemes={unlockedThemes}
            setUnlockedThemes={setUnlockedThemes}
            customRewards={customRewards}
            setCustomRewards={setCustomRewards}
            triggerConfetti={triggerReward}
            activeSound={activeSound}
            setActiveSound={setActiveSound}
          />
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
          className={`nav-item ${currentView === 'lists' ? 'active' : ''}`}
          onClick={() => setCurrentView('lists')}
        >
          <LayoutList size={24} />
          <span>Listas</span>
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
        <button 
          className={`nav-item ${currentView === 'store' ? 'active' : ''}`}
          onClick={() => setCurrentView('store')}
        >
          <ShoppingBag size={24} />
          <span>Tienda</span>
        </button>
      </nav>

      {activeAlarmTask && (
        <div className="alarm-overlay">
          <div className="alarm-card scale-up">
            <div className="alarm-card-icon-container">
              <Bell className="alarm-bell-pulse" size={48} />
            </div>
            <h2>🔔 ¡Es hora de empezar!</h2>
            <p>Tu tarea programada toca ahora:</p>
            <div className="alarm-task-box">
              <h3>{activeAlarmTask.title}</h3>
              {activeAlarmTask.duration && <span>⏱️ {activeAlarmTask.duration} minutos</span>}
            </div>
            <button 
              className="primary alarm-stop-btn"
              onClick={() => {
                stopAlarm();
                setActiveAlarmTask(null);
                setActiveTaskId(activeAlarmTask.id);
                setCurrentView('focus');
              }}
            >
              Detener Alarma y Empezar Tarea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
