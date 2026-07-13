export const createTimerWorker = () => {
  const workerCode = `
    let timerId = null;
    self.onmessage = function(e) {
      if (e.data.command === 'start') {
        const interval = e.data.interval || 1000;
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
          self.postMessage('tick');
        }, interval);
      } else if (e.data.command === 'stop') {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }
    };
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};
