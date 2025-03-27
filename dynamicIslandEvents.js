(function() {
  // Get references from the DOM or from window (exposed by script.js)
  const dynamicIsland = window.dynamicIsland || document.getElementById('dynamicIsland');
  const dynamicIslandVideo = document.getElementById('dynamicIslandVideo');

  dynamicIsland.addEventListener('click', (e) => {
    // If the click is on the video element (or inside it), do nothing.
    if (e.target === dynamicIslandVideo || e.target.closest('#dynamicIslandVideo')) {
      return;
    }
    
    // Check if the clicked element is one of the control buttons.
    const isControlButton = e.target.classList.contains('material-icons') && (
      e.target.classList.contains('prev') ||
      e.target.classList.contains('play-pause') ||
      e.target.classList.contains('next')
    );
    
    if (!isControlButton) {
      dynamicIsland.classList.toggle('expanded');
      if (typeof window.updateVideoVisibility === 'function') {
        window.updateVideoVisibility();
      }
      
      // If a video URL is set and the island is expanded, show the video.
      if (window.currentVideoUrl && dynamicIsland.classList.contains('expanded')) {
        dynamicIslandVideo.style.display = 'block';
      } else {
        dynamicIslandVideo.style.display = 'none';
      }
    }
  });
})();