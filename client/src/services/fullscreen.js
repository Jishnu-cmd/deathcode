// Fullscreen helper utility for Death Code Kira Protocol

export function isFullScreen() {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

export function requestFullScreen() {
  if (typeof document === 'undefined') return Promise.resolve();
  const el = document.documentElement;

  try {
    if (el.requestFullscreen) {
      return el.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request rejected or denied by browser:', err);
      });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  } catch (err) {
    console.warn('Fullscreen invocation error:', err);
  }
  return Promise.resolve();
}

export function exitFullScreen() {
  if (typeof document === 'undefined') return Promise.resolve();

  try {
    if (document.exitFullscreen) {
      return document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } catch (err) {
    console.warn('Exit fullscreen error:', err);
  }
  return Promise.resolve();
}

export function toggleFullScreen() {
  if (isFullScreen()) {
    return exitFullScreen();
  } else {
    return requestFullScreen();
  }
}

export function addFullscreenChangeListener(handler) {
  if (typeof document === 'undefined') return () => {};

  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
  ];

  events.forEach((evt) => document.addEventListener(evt, handler));

  return () => {
    events.forEach((evt) => document.removeEventListener(evt, handler));
  };
}
