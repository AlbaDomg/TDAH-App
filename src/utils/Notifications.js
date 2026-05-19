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

export const sendNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: '/vite.svg', // Icono por defecto (se puede cambiar luego por uno de la app)
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      ...options
    });
  }
};
