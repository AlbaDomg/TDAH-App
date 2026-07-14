import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Registrar el Service Worker para notificaciones nativas en móviles
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = (import.meta.env.BASE_URL || '/') + 'sw.js';
    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
      .catch(err => console.warn('Error al registrar el Service Worker:', err));
  });
}
