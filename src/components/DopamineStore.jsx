import { useState } from 'react';
import { Sparkles, Palette, Volume2, Gift, Plus, Trash, Check, Lock } from 'lucide-react';
import './DopamineStore.css';

export const DopamineStore = ({
  dopaminePoints,
  setDopaminePoints,
  activeTheme,
  setActiveTheme,
  unlockedThemes = ['default', 'slate'],
  setUnlockedThemes,
  unlockedSoundpacks = ['mechanical'],
  setUnlockedSoundpacks,
  currentSoundpack,
  setCurrentSoundpack,
  customRewards = [],
  setCustomRewards,
  triggerConfetti
}) => {
  const [activeTab, setActiveTab] = useState('themes'); // 'themes', 'sounds', 'custom'
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState(100);

  // Themes List
  const themes = [
    { id: 'default', name: 'Arena Cálida', cost: 0, description: 'Fondo beige clásico, relajante y agradable.', class: '' },
    { id: 'slate', name: 'Gris Minimalista', cost: 0, description: 'Estilo monocromático para evitar distracciones.', class: 'theme-slate' },
    { id: 'lavender', name: 'Lavanda Relajante', cost: 100, description: 'Violetas suaves para momentos de estrés.', class: 'theme-lavender' },
    { id: 'sunset', name: 'Atardecer Acogedor', cost: 150, description: 'Corales y naranjas cálidos inspiradores.', class: 'theme-sunset' },
    { id: 'forest', name: 'Bosque Esmeralda', cost: 200, description: 'Verdes musgo centrados en la naturaleza.', class: 'theme-forest' },
    { id: 'cyberpunk', name: 'Cyberpunk Neón', cost: 250, description: 'Modo oscuro con colores de alto contraste.', class: 'theme-cyberpunk' }
  ];

  // Soundpacks List
  const soundpacks = [
    { id: 'mechanical', name: 'Teclado Mecánico', cost: 0, description: 'Clics mecánicos nítidos retro.' },
    { id: 'bubbles', name: 'Burbujas Pop', cost: 150, description: 'Sonido seco y agudo de burbuja.' },
    { id: 'wood', name: 'Bloques de Madera', cost: 150, description: 'Golpes de madera resonantes y secos.' },
    { id: 'rain', name: 'Gotas de Lluvia', cost: 200, description: 'Tonos acuáticos melódicos fluidos.' }
  ];

  // Purchase theme
  const handleBuyTheme = (theme) => {
    if (dopaminePoints >= theme.cost) {
      setDopaminePoints(prev => prev - theme.cost);
      setUnlockedThemes([...unlockedThemes, theme.id]);
      setActiveTheme(theme.id);
      if (triggerConfetti) triggerConfetti();
      alert(`¡Has desbloqueado el tema "${theme.name}"!`);
    } else {
      alert("No tienes suficientes puntos de dopamina. ¡Completa más tareas!");
    }
  };

  // Purchase soundpack
  const handleBuySoundpack = (pack) => {
    if (dopaminePoints >= pack.cost) {
      setDopaminePoints(prev => prev - pack.cost);
      setUnlockedSoundpacks([...unlockedSoundpacks, pack.id]);
      setCurrentSoundpack(pack.id);
      if (triggerConfetti) triggerConfetti();
      alert(`¡Has desbloqueado el sonido "${pack.name}"!`);
    } else {
      alert("No tienes suficientes puntos de dopamina. ¡Sigue adelante!");
    }
  };

  // Add custom self-reward
  const handleAddCustomReward = (e) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    const newReward = {
      id: Date.now().toString(),
      title: rewardTitle,
      cost: parseInt(rewardCost) || 50
    };

    setCustomRewards([...customRewards, newReward]);
    setRewardTitle('');
    setRewardCost(100);
  };

  // Delete custom reward
  const handleDeleteCustomReward = (id) => {
    setCustomRewards(customRewards.filter(r => r.id !== id));
  };

  // Redeem custom reward
  const handleRedeemCustomReward = (reward) => {
    if (dopaminePoints >= reward.cost) {
      setDopaminePoints(prev => prev - reward.cost);
      if (triggerConfetti) triggerConfetti();
      alert(`¡Canjeado con éxito! Disfruta de tu recompensa: "${reward.title}"`);
    } else {
      alert("No tienes suficientes puntos de dopamina para canjear esta recompensa.");
    }
  };

  return (
    <div className="dopamine-store-view fade-in">
      <div className="store-header">
        <Sparkles className="store-title-icon" size={32} />
        <h2>Tienda de Dopamina</h2>
        <p>¡Canjea los puntos ganados con tu esfuerzo por recompensas reales y visuales!</p>
      </div>

      <div className="store-tabs">
        <button 
          className={`store-tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette size={20} />
          <span>Temas</span>
        </button>
        <button 
          className={`store-tab ${activeTab === 'sounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('sounds')}
        >
          <Volume2 size={20} />
          <span>Sonidos</span>
        </button>
        <button 
          className={`store-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <Gift size={20} />
          <span>Auto-Recompensas</span>
        </button>
      </div>

      <div className="store-content">
        {/* THEMES TAB */}
        {activeTab === 'themes' && (
          <div className="store-grid">
            {themes.map(theme => {
              const isUnlocked = unlockedThemes.includes(theme.id);
              const isActive = activeTheme === theme.id;
              const canAfford = dopaminePoints >= theme.cost;

              return (
                <div key={theme.id} className={`store-card theme-preview-card ${theme.id} ${isActive ? 'active-item' : ''}`}>
                  <div className="theme-color-dots">
                    <span className="dot dot-bg"></span>
                    <span className="dot dot-primary"></span>
                    <span className="dot dot-accent"></span>
                  </div>
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                  
                  <div className="card-actions">
                    {isUnlocked ? (
                      isActive ? (
                        <span className="badge active-badge"><Check size={16} /> Activo</span>
                      ) : (
                        <button 
                          className="secondary btn-sm"
                          onClick={() => setActiveTheme(theme.id)}
                        >
                          Activar
                        </button>
                      )
                    ) : (
                      <button 
                        className={`primary btn-sm ${!canAfford ? 'disabled-btn' : ''}`}
                        onClick={() => handleBuyTheme(theme)}
                        disabled={!canAfford}
                      >
                        <Lock size={14} /> {theme.cost} pts
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SOUNDS TAB */}
        {activeTab === 'sounds' && (
          <div className="store-grid">
            {soundpacks.map(pack => {
              const isUnlocked = unlockedSoundpacks.includes(pack.id);
              const isActive = currentSoundpack === pack.id;
              const canAfford = dopaminePoints >= pack.cost;

              return (
                <div key={pack.id} className={`store-card sound-card ${isActive ? 'active-item' : ''}`}>
                  <div className="sound-card-icon">
                    <Volume2 size={24} />
                  </div>
                  <h3>{pack.name}</h3>
                  <p>{pack.description}</p>
                  
                  <div className="card-actions">
                    {isUnlocked ? (
                      isActive ? (
                        <span className="badge active-badge"><Check size={16} /> Activo</span>
                      ) : (
                        <button 
                          className="secondary btn-sm"
                          onClick={() => setCurrentSoundpack(pack.id)}
                        >
                          Activar
                        </button>
                      )
                    ) : (
                      <button 
                        className={`primary btn-sm ${!canAfford ? 'disabled-btn' : ''}`}
                        onClick={() => handleBuySoundpack(pack)}
                        disabled={!canAfford}
                      >
                        <Lock size={14} /> {pack.cost} pts
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CUSTOM REWARDS TAB */}
        {activeTab === 'custom' && (
          <div className="custom-rewards-section">
            <form onSubmit={handleAddCustomReward} className="add-reward-form">
              <h3>Crear Auto-Recompensa</h3>
              <p className="form-help">Añade pequeños caprichos para motivarte en tu día a día.</p>
              
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Ej: 15 min de descanso para jugar" 
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group inline-group">
                  <label>Coste en Puntos:</label>
                  <input 
                    type="number" 
                    min={10} 
                    max={2000} 
                    step={10}
                    value={rewardCost}
                    onChange={(e) => setRewardCost(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="primary btn-add">
                  <Plus size={20} /> Añadir
                </button>
              </div>
            </form>

            <div className="rewards-list">
              <h3>Tus Recompensas Disponibles</h3>
              {customRewards.length === 0 ? (
                <div className="empty-rewards">
                  <p>Aún no has creado ninguna recompensa personalizada. Añade una arriba (ej. chocolate, un paseo, jugar consola, etc.).</p>
                </div>
              ) : (
                <div className="rewards-grid">
                  {customRewards.map(reward => {
                    const canAfford = dopaminePoints >= reward.cost;
                    return (
                      <div key={reward.id} className="reward-item-card">
                        <div className="reward-info">
                          <h4>{reward.title}</h4>
                          <span className="reward-cost-badge">{reward.cost} pts</span>
                        </div>
                        <div className="reward-actions">
                          <button 
                            className={`success btn-sm ${!canAfford ? 'disabled-btn' : ''}`}
                            onClick={() => handleRedeemCustomReward(reward)}
                            disabled={!canAfford}
                          >
                            Canjear
                          </button>
                          <button 
                            className="delete-reward-btn" 
                            onClick={() => handleDeleteCustomReward(reward.id)}
                            title="Eliminar recompensa"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
