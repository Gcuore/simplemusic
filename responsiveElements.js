// New file: Handles responsive scaling for the clock and standby video container.
// When the viewport width is below a threshold, these elements will gradually shrink.

function updateResponsiveScale() {
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  // Define a base threshold: at 800px viewport width, scale is 1.
  // For smaller widths, calculate a linear scaling factor clamped between 0.6 and 1.
  const scale = Math.min(1, Math.max(0.6, vw / 800));
  const clock = document.querySelector('.clock');
  const videoContainer = document.querySelector('.standby-video-container');
  
  if (clock) {
    clock.style.transform = `scale(${scale})`;
    clock.style.transformOrigin = 'top left'; // NEW: Ensure clock scales from its top left
  }
  if (videoContainer) {
    videoContainer.style.transform = `scale(${scale})`;
    videoContainer.style.transformOrigin = 'top left';
  }
}

window.addEventListener('resize', updateResponsiveScale);

document.addEventListener('DOMContentLoaded', () => {
  const clock = document.querySelector('.clock');
  const videoContainer = document.querySelector('.standby-video-container');
  if (clock) {
    clock.style.transition = 'transform 0.5s ease';
  }
  if (videoContainer) {
    videoContainer.style.transition = 'transform 0.5s ease';
  }
  updateResponsiveScale();
});