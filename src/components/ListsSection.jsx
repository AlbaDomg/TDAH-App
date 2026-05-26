import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Plus, 
  Check, 
  Square, 
  CheckSquare, 
  ListPlus, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import './ListsSection.css';

const QUICK_SUGGESTIONS = [
  { name: '🛒 Supermercado', color: '#E28F79' },
  { name: '✈️ Maleta Viaje', color: '#A4B494' },
  { name: '🧹 Tareas Casa', color: '#F6B8A2' },
  { name: '📚 Estudio / Trabajo', color: '#D98C8C' },
  { name: '💡 Ideas / Notas', color: '#8B8378' }
];

export const ListsSection = ({ lists, setLists, onAddPoints, triggerConfetti }) => {
  const [activeListId, setActiveListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  
  // Estados para editar nombres de listas
  const [editingListId, setEditingListId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const editInputRef = useRef(null);

  // Autofoco para cuando se edita un nombre
  useEffect(() => {
    if (editingListId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingListId]);

  const activeList = lists.find(l => l.id === activeListId) || null;

  // Crear una nueva lista
  const handleCreateList = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newList = {
      id: Date.now().toString(),
      name: trimmedName,
      items: [],
      createdAt: new Date().toISOString()
    };

    setLists([...lists, newList]);
    setNewListName('');
    setIsCreating(false);
    setActiveListId(newList.id); // Ir directo a la nueva lista
  };

  // Eliminar una lista completa
  const handleDeleteList = (listId, e) => {
    if (e) e.stopPropagation(); // Evita entrar a la lista si se hace clic en borrar
    if (window.confirm('¿Seguro que quieres eliminar esta lista por completo?')) {
      setLists(lists.filter(l => l.id !== listId));
      if (activeListId === listId) {
        setActiveListId(null);
      }
    }
  };

  // Iniciar edición de nombre de lista
  const startEditingName = (listId, currentName, e) => {
    if (e) e.stopPropagation();
    setEditingListId(listId);
    setEditingNameValue(currentName);
  };

  // Guardar edición de nombre de lista
  const saveListName = (listId, e) => {
    if (e) e.stopPropagation();
    const trimmed = editingNameValue.trim();
    if (trimmed) {
      setLists(lists.map(l => l.id === listId ? { ...l, name: trimmed } : l));
    }
    setEditingListId(null);
    setEditingNameValue('');
  };

  // Añadir elemento a la lista activa
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !activeList) return;

    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedLists = lists.map(l => {
      if (l.id === activeList.id) {
        return {
          ...l,
          items: [...l.items, newItem]
        };
      }
      return l;
    });

    setLists(updatedLists);
    setNewItemText('');
  };

  // Cambiar estado de completado de un elemento
  const handleToggleItem = (itemId) => {
    if (!activeList) return;

    let pointsAwarded = 0;
    let listCompletedNow = false;

    const updatedLists = lists.map(l => {
      if (l.id === activeList.id) {
        const updatedItems = l.items.map(item => {
          if (item.id === itemId) {
            const nextCompleted = !item.completed;
            if (nextCompleted) {
              pointsAwarded = 2; // +2 pts al completar item
            }
            return { ...item, completed: nextCompleted };
          }
          return item;
        });

        // Verificar si la lista se completó en este paso
        const allCompleted = updatedItems.length > 0 && updatedItems.every(i => i.completed);
        const wasAllCompletedBefore = l.items.length > 0 && l.items.every(i => i.completed);
        
        if (allCompleted && !wasAllCompletedBefore) {
          listCompletedNow = true;
          pointsAwarded += 10; // +10 pts de bonus por completar lista
        }

        return {
          ...l,
          items: updatedItems
        };
      }
      return l;
    });

    setLists(updatedLists);

    // Otorgar puntos si corresponde
    if (pointsAwarded > 0) {
      onAddPoints(pointsAwarded);
    }

    // Disparar confeti si se completó la lista entera
    if (listCompletedNow) {
      triggerConfetti();
      setTimeout(() => {
        alert('¡Increíble! Has tachado todas las tareas de la lista. ¡Recibes +10 puntos extra y una lluvia de confeti! 🥳✨');
      }, 500);
    }
  };

  // Limpiar elementos completados
  const handleClearCompletedItems = () => {
    if (!activeList) return;
    
    const updatedLists = lists.map(l => {
      if (l.id === activeList.id) {
        return {
          ...l,
          items: l.items.filter(item => !item.completed)
        };
      }
      return l;
    });
    setLists(updatedLists);
  };

  // Calcular el progreso de una lista
  const getListProgress = (list) => {
    if (!list.items || list.items.length === 0) return { percent: 0, text: 'Vacía' };
    const completedCount = list.items.filter(i => i.completed).length;
    const totalCount = list.items.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    return {
      percent,
      text: `${completedCount}/${totalCount}`,
      isDone: percent === 100
    };
  };

  return (
    <div className="lists-section fade-in">
      {!activeList ? (
        // VISTA PRINCIPAL: PANEL DE LISTAS (DASHBOARD)
        <div className="lists-dashboard">
          <div className="lists-header">
            <h2>Mis Listas de Tareas</h2>
            <p>Descarga tu mente apuntando cosas aquí. Sin prisas ni horarios específicos.</p>
          </div>

          {/* Tarjeta para crear lista */}
          {isCreating ? (
            <div className="create-list-card fade-in">
              <h3>Crear una lista nueva</h3>
              
              <div className="suggestions-grid">
                <p className="section-label">Sugerencias rápidas:</p>
                <div className="suggestions-list">
                  {QUICK_SUGGESTIONS.map((sug, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className="suggestion-chip"
                      onClick={() => handleCreateList(sug.name)}
                      style={{ borderLeft: `4px solid ${sug.color}` }}
                    >
                      {sug.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-create-row">
                <input 
                  type="text" 
                  placeholder="O escribe otro nombre..." 
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="list-name-input"
                  maxLength={40}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateList(newListName);
                  }}
                />
                <button 
                  className="primary" 
                  onClick={() => handleCreateList(newListName)}
                  disabled={!newListName.trim()}
                >
                  Crear
                </button>
              </div>

              <button className="cancel-btn" onClick={() => setIsCreating(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="primary add-list-btn pulse" onClick={() => setIsCreating(true)}>
              <ListPlus size={20} />
              Nueva Lista
            </button>
          )}

          {/* Grid de listas del usuario */}
          <div className="lists-grid">
            {lists.length === 0 ? (
              <div className="empty-lists-state">
                <div className="empty-icon-bubble">📋</div>
                <p className="empty-title">Tu mente está libre de listas</p>
                <p className="empty-desc">Crea listas de la compra, maletas de viaje, recordatorios o ideas rápidas para vaciar tu cabeza.</p>
              </div>
            ) : (
              lists.map(list => {
                const progress = getListProgress(list);
                const isEditing = editingListId === list.id;
                
                return (
                  <div 
                    key={list.id} 
                    className={`list-card ${progress.isDone ? 'completed-card' : ''}`}
                    onClick={() => !isEditing && setActiveListId(list.id)}
                  >
                    <div className="list-card-header">
                      {isEditing ? (
                        <div className="inline-edit-row" onClick={e => e.stopPropagation()}>
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingNameValue}
                            onChange={e => setEditingNameValue(e.target.value)}
                            maxLength={40}
                            className="inline-edit-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveListName(list.id, e);
                              if (e.key === 'Escape') setEditingListId(null);
                            }}
                          />
                          <button 
                            className="icon-save-btn" 
                            onClick={e => saveListName(list.id, e)}
                            title="Guardar"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="list-title-text">{list.name}</h3>
                      )}
                      
                      <div className="list-card-actions">
                        {!isEditing && (
                          <>
                            <button 
                              className="action-icon-btn edit" 
                              onClick={(e) => startEditingName(list.id, list.name, e)}
                              title="Cambiar nombre de la lista"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="action-icon-btn delete" 
                              onClick={(e) => handleDeleteList(list.id, e)}
                              title="Eliminar lista"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="list-card-body">
                      <div className="progress-info">
                        <span className="items-count">{progress.text} completados</span>
                        {progress.isDone && <span className="completed-badge">¡Completada! ✨</span>}
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar-fill"
                          style={{ 
                            width: `${progress.percent}%`,
                            backgroundColor: progress.isDone ? 'var(--color-success-olive)' : 'var(--color-accent-terracotta)'
                          }}
                        />
                      </div>
                    </div>
                    
                    {!isEditing && (
                      <div className="list-card-footer">
                        <span>Ver lista</span>
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        // VISTA INTERNA: DENTRO DE UNA LISTA ESPECÍFICA
        <div className="active-list-view fade-in">
          <header className="active-list-header">
            <button className="back-btn-icon" onClick={() => setActiveListId(null)} title="Volver al panel">
              <ArrowLeft size={22} />
              <span>Volver</span>
            </button>
            
            <div className="active-title-container">
              {editingListId === activeList.id ? (
                <div className="inline-title-edit">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingNameValue}
                    onChange={e => setEditingNameValue(e.target.value)}
                    maxLength={40}
                    className="inline-title-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveListName(activeList.id, e);
                      if (e.key === 'Escape') setEditingListId(null);
                    }}
                  />
                  <button className="title-save-btn" onClick={e => saveListName(activeList.id, e)}>
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <div className="active-title-display">
                  <h2>{activeList.name}</h2>
                  <button 
                    className="edit-title-btn" 
                    onClick={(e) => startEditingName(activeList.id, activeList.name, e)}
                    title="Editar nombre"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Barra de progreso de la lista activa */}
            {(() => {
              const progress = getListProgress(activeList);
              return (
                <div className="active-progress-section">
                  <div className="progress-text-row">
                    <span>Progreso: {progress.percent}%</span>
                    <span>{progress.text} completados</span>
                  </div>
                  <div className="active-progress-bar">
                    <div 
                      className="active-progress-fill" 
                      style={{ 
                        width: `${progress.percent}%`,
                        backgroundColor: progress.isDone ? 'var(--color-success-olive)' : 'var(--color-accent-terracotta)'
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </header>

          {/* Formulario para añadir elementos */}
          <form className="add-item-form" onSubmit={handleAddItem}>
            <input 
              type="text" 
              placeholder="¿Qué quieres recordar? Ej: Comprar leche..." 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="new-item-input"
              maxLength={80}
              autoFocus
            />
            <button type="submit" className="add-item-submit" disabled={!newItemText.trim()}>
              <Plus size={20} />
            </button>
          </form>

          {/* Listado de elementos */}
          <div className="items-list-container">
            {activeList.items.length === 0 ? (
              <div className="empty-items-state">
                <p>Esta lista está vacía.</p>
                <p className="subtext">Empieza a escribir arriba para rellenarla.</p>
              </div>
            ) : (
              <>
                {/* Elementos Pendientes */}
                {activeList.items.filter(i => !i.completed).length > 0 && (
                  <div className="items-group pending-group">
                    <h4 className="group-label">Por hacer</h4>
                    {activeList.items.filter(i => !i.completed).map(item => (
                      <div 
                        key={item.id} 
                        className="todo-item pending fade-in"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <div className="checkbox-icon">
                          <Square size={20} className="empty-sq" />
                        </div>
                        <span className="item-text">{item.text}</span>
                        <div className="dopamine-badge" title="Tachar esto te da +2 puntos de dopamina">
                          <Sparkles size={12} fill="var(--color-accent-peach)" />
                          <span>+2 pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Elementos Completados */}
                {activeList.items.filter(i => i.completed).length > 0 && (
                  <div className="items-group completed-group">
                    <h4 className="group-label">Completados</h4>
                    {activeList.items.filter(i => i.completed).map(item => (
                      <div 
                        key={item.id} 
                        className="todo-item completed fade-in"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <div className="checkbox-icon checked">
                          <CheckSquare size={20} className="check-sq" />
                        </div>
                        <span className="item-text text-strike">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer de opciones de la lista */}
          <footer className="active-list-footer">
            <button 
              className="footer-action-btn clean"
              onClick={handleClearCompletedItems}
              disabled={activeList.items.filter(i => i.completed).length === 0}
            >
              Limpiar completados
            </button>
            
            <button 
              className="footer-action-btn delete"
              onClick={() => handleDeleteList(activeList.id)}
            >
              <Trash2 size={16} />
              Eliminar Lista
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};
