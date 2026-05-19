import confetti from 'canvas-confetti';

// Paleta de colores cálida para el confeti
const warmColors = ['#E28F79', '#F6B8A2', '#A4B494', '#F4EFE6', '#D98C8C'];

export const triggerReward = () => {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: warmColors,
      disableForReducedMotion: true
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: warmColors,
      disableForReducedMotion: true
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};
