export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Este navegador no soporta notificaciones de escritorio.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const playNotificationSound = (soundType = 'chime') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    switch (soundType) {
      case 'waterDrop': {
        // Gota de agua zen: dos gotitas consecutivas rápidas con pitch glide hacia arriba
        const playDrop = (delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          
          osc.frequency.setValueAtTime(350, now + delay);
          osc.frequency.exponentialRampToValueAtTime(1100, now + delay + 0.12);
          
          gain.gain.setValueAtTime(0.18, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.15);
        };
        playDrop(0);
        playDrop(0.1);
        break;
      }
      
      case 'magicArpeggio': {
        // Arpa mágica: arpegio rápido en escala pentatónica de Do mayor (Do5 - Re5 - Mi5 - Sol5 - La5 - Do6)
        const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        freqs.forEach((freq, index) => {
          const time = now + index * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.005, time + 0.35);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.45);
        });
        break;
      }
      
      case 'retroGame': {
        // Sonido retro de 8 bits (estilo Mario coin): onda cuadrada de Si5 seguida de Mi6
        const playPulse = (freq, start, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + start);
          
          gain.gain.setValueAtTime(0.08, now + start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + duration);
        };
        
        playPulse(987.77, 0, 0.08); // Si5
        playPulse(1318.51, 0.08, 0.22); // Mi6
        break;
      }
      
      case 'chime':
      default: {
        // Campana clásica: arpegio triple (Do5 - Mi5 - Sol5) arpegiado suave
        const notes = [523.25, 659.25, 783.99]; 
        notes.forEach((freq, index) => {
          const time = now + index * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.2, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.7);
        });
        break;
      }
    }
  } catch (error) {
    console.warn("No se pudo reproducir el sonido sintetizado de la notificación:", error);
  }
};

import { createTimerWorker } from './workerTimer';

let alarmWorker = null;
let cachedSWRegistration = null;

// Precargar el Service Worker al iniciar para uso síncrono
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    cachedSWRegistration = reg;
  }).catch(() => {});
}

export const startAlarm = (soundType = 'chime') => {
  if (alarmWorker) {
    alarmWorker.postMessage({ command: 'stop' });
    alarmWorker.terminate();
  }
  
  // Reproducir inmediatamente
  playNotificationSound(soundType);
  
  // Repetir cada 4 segundos de forma súper robusta con un worker en segundo plano
  alarmWorker = createTimerWorker();
  alarmWorker.onmessage = () => {
    playNotificationSound(soundType);
  };
  alarmWorker.postMessage({ command: 'start', interval: 4000 });
};

export const stopAlarm = () => {
  if (alarmWorker) {
    alarmWorker.postMessage({ command: 'stop' });
    alarmWorker.terminate();
    alarmWorker = null;
  }
};

export const sendNotification = (title, options = {}, soundType = 'chime') => {
  // Reproducir el sonido correspondiente (una sola vez para la notificación normal)
  playNotificationSound(soundType);

  if (!("Notification" in window)) {
    return null;
  }

  let notification = null;
  if (Notification.permission === "granted") {
    // Delegar la notificación directamente al Service Worker vía postMessage
    // Esto evade el bloqueo de Android a notificaciones originadas desde ventanas en segundo plano
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: title,
        options: {
          icon: '/favicon.png',
          badge: '/favicon.png',
          vibrate: [200, 100, 200],
          ...options
        }
      });
    } else if (cachedSWRegistration) {
      cachedSWRegistration.showNotification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [200, 100, 200],
        ...options
      }).catch(err => console.warn('Error SW Notification:', err));
    } else {
      // Fallback si no hay Service Worker (navegadores de PC tradicionales)
      try {
        notification = new Notification(title, {
          icon: '/favicon.png',
          badge: '/favicon.png',
          vibrate: [200, 100, 200],
          ...options
        });
      } catch (e) {
        console.error("Fallo al crear notificación nativa clásica:", e);
      }
    }
  }
  
  return notification;
};
