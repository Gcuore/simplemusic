// Update mobile detection at startup
document.addEventListener('DOMContentLoaded', () => {
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const mobileWarning = document.getElementById('mobileWarning');
  const warningText = document.getElementById('warningText');
  const continueButton = document.getElementById('continueButton');
  const installProfile = document.getElementById('installProfile');
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    mobileWarning.style.display = 'flex';
    
    if (iOS) {
      warningText.innerHTML = 'Install our profile to enable StandBy mode (top left button). Note: iOS can sometimes be unreliable with custom profiles - if installation fails, try again later.';
      installProfile.style.display = 'block';
      
      installProfile.addEventListener('click', () => {
        // Trigger mobileconfig download
        const link = document.createElement('a');
        link.href = '/Standby.mobileconfig';
        link.download = 'Websim_StandBy.mobileconfig';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
    
    continueButton.addEventListener('click', () => {
      mobileWarning.style.display = 'none';
      document.body.style.overflow = ''; 
    });
    
    document.body.style.overflow = 'hidden';
    mobileWarning.addEventListener('click', (e) => {
      if (e.target === mobileWarning) {
        mobileWarning.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
});

// Enable inline playback on iOS devices to prevent the video from going fullscreen
document.addEventListener('DOMContentLoaded', () => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    const dynamicIslandVideo = document.getElementById('dynamicIslandVideo');
    if (dynamicIslandVideo) {
      dynamicIslandVideo.setAttribute('playsinline', '');
      dynamicIslandVideo.setAttribute('webkit-playsinline', '');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const dynamicIslandVideo = document.getElementById('dynamicIslandVideo');
  const progressBar = document.querySelector('.progress');
  if (dynamicIslandVideo && progressBar) {
    dynamicIslandVideo.addEventListener('timeupdate', () => {
      if (dynamicIslandVideo.duration) {
        const progress = (dynamicIslandVideo.currentTime / dynamicIslandVideo.duration) * 100;
        progressBar.style.width = `${progress}%`;
      }
    });
  }
});

let isPlaying = false;
let progress = 0;
let progressInterval;
let seekInterval;
const dynamicIsland = document.getElementById('dynamicIsland');
const playPauseBtn = document.querySelector('.play-pause');
const progressBar = document.querySelector('.progress');
const playerContent = document.querySelector('.player-content');
let audio = new Audio();
let currentVideoUrl = null;

document.querySelectorAll('.play-pause').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
  });
});

document.querySelector('.prev').addEventListener('click', (e) => {
  e.stopPropagation();
  startSeeking(-5);
});

document.querySelector('.next').addEventListener('click', (e) => {
  e.stopPropagation();
  startSeeking(5);
});

['mouseup', 'mouseleave'].forEach(event => {
  document.querySelector('.prev').addEventListener(event, stopSeeking);
  document.querySelector('.next').addEventListener(event, stopSeeking);
});

document.getElementById('openPlaylist').addEventListener('click', (e) => {
  e.stopPropagation();
  openSpotifyPlayer();
});

document.querySelector('.close-player').addEventListener('click', (e) => {
  e.stopPropagation();
  closeSpotifyPlayer();
});

function togglePlayPause() {
  if (!audio.src) return;
  isPlaying = !isPlaying;
  
  if(isPlaying) {
    if(audio.readyState < 2) {
      showLoading();
    }
    audio.play().catch(err => {
      console.log('Playback interrupted, will retry when possible');
      isPlaying = false;
      hideLoading();
    });
    
    // Update icon in Dynamic Island and Standby Mode
    playPauseBtn.textContent = 'pause';
    document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'pause');
    
  } else {
    audio.pause();
    hideLoading();
    // Update icon in Dynamic Island and Standby Mode
    playPauseBtn.textContent = 'play_arrow';
    document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'play_arrow');
  }
}

function playSong(title, artist, filename) {
  // Clear any existing video
  currentVideoUrl = null;
  document.getElementById('dynamicIslandVideo').src = '';
  document.getElementById('dynamicIslandVideo').style.display = 'none';
  
  // Show player info in standby mode
  document.getElementById('standbyAlbumArt').style.display = 'block';
  document.getElementById('standbySongTitle').style.display = 'block';
  document.getElementById('standbyArtistName').style.display = 'block';
  document.querySelector('.standby-controls').style.display = 'flex';
  document.getElementById('standbyVideoContainer').style.display = 'none';
  
  const songInfo = document.querySelector('.song-info');
  songInfo.querySelector('h3').textContent = title;
  songInfo.querySelector('p').textContent = artist;
  
  const albumArt = document.querySelector('.album-art');
  const playlistItems = document.querySelectorAll('.playlist-item');
  let playlistItem;
  
  for (const item of playlistItems) {
    if (item.querySelector('h3').textContent.trim() === title.trim()) {
      playlistItem = item;
      break;
    }
  }

  if (playlistItem) {
    albumArt.src = playlistItem.querySelector('img').src;
  }
  
  // Stop current audio before loading new one
  if(audio.src) {
    audio.pause();
  }
  
  audio.src = filename;
  
  audio.onwaiting = () => {
    showLoading();
    isPlaying = true;
    // Update icon in Dynamic Island and Standby Mode
    playPauseBtn.textContent = 'pause';
    document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'pause');
  };
  
  audio.oncanplay = () => {
    if(isPlaying) {
      hideLoading();
      audio.play().catch(err => {
        // Handle play interruption gracefully
        console.log('Playback interrupted, will retry when possible');
        isPlaying = false;
        hideLoading();
        // Update icon in Dynamic Island and Standby Mode
        playPauseBtn.textContent = 'play_arrow';
        document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'play_arrow');
      });
    }
  };

  if (!isPlaying) {
    togglePlayPause();
  } else {
    audio.play().catch(err => {
      console.log('Playback interrupted, will retry when possible');
      isPlaying = false;
      hideLoading();
       // Update icon in Dynamic Island and Standby Mode
      playPauseBtn.textContent = 'play_arrow';
      document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'play_arrow');
    });
  }
  
  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    progressBar.style.width = `${progress}%`;
  });
  
  // Update standby mode info
  document.getElementById('standbySongTitle').textContent = title;
  document.getElementById('standbyArtistName').textContent = artist;
  document.getElementById('standbyAlbumArt').src = albumArt.src;
}

function playVideo(title, artist, filename, videoUrl) {
  // Clear any audio that might be playing
  if(isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = 'play_arrow';
    document.querySelectorAll('.play-pause').forEach(btn => btn.textContent = 'play_arrow');
  }
  
  // Set information in the dynamic island
  const songInfo = document.querySelector('.song-info');
  songInfo.querySelector('h3').textContent = title;
  songInfo.querySelector('p').textContent = artist;
  
  const albumArt = document.querySelector('.album-art');
  const videoItems = document.querySelectorAll('.video-item');
  let videoItem;
  
  for (const item of videoItems) {
    if (item.querySelector('h3').textContent.trim() === title.trim()) {
      videoItem = item;
      break;
    }
  }

  if (videoItem) {
    albumArt.src = videoItem.querySelector('img').src;
  }
  
  // Set the video source for the dynamic island video element
  const dynamicIslandVideo = document.getElementById('dynamicIslandVideo');
  dynamicIslandVideo.src = videoUrl;
  
  // Show the video if the island is expanded
  if (dynamicIsland.classList.contains('expanded')) {
    dynamicIslandVideo.style.display = 'block';
  }
  
  // Update standby mode info and hide player elements
  document.getElementById('standbySongTitle').textContent = title;
  document.getElementById('standbyArtistName').textContent = artist;
  document.getElementById('standbyAlbumArt').src = albumArt.src;
  
  // Hide player info in standby mode when video is playing
  document.getElementById('standbyAlbumArt').style.display = 'none';
  document.getElementById('standbySongTitle').style.display = 'none';
  document.getElementById('standbyArtistName').style.display = 'none';
  document.querySelector('.standby-controls').style.display = 'none';
  
  // Show video container in standby mode
  document.getElementById('standbyVideoContainer').style.display = 'block';
  
  currentVideoUrl = videoUrl;
  
  // Auto-expand the dynamic island
  dynamicIsland.classList.add('expanded');
}

function startSeeking(seconds) {
  if (!audio.src) return;
  
  const seekStep = () => {
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
    progress = (audio.currentTime / audio.duration) * 100 || 0;
    progressBar.style.width = `${progress}%`;
  };
  
  seekStep(); // Initial seek
  seekInterval = setInterval(seekStep, seconds > 0 ? 100 : 150); // Faster forward seeking
}

function stopSeeking() {
  clearInterval(seekInterval);
  if(isPlaying) audio.play(); // Resume playback if playing
}

const progressBarContainer = document.querySelector('.progress-bar');

progressBarContainer.addEventListener('click', (e) => {
  if (!audio.src) return;
  
  const rect = progressBarContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;
  const percentage = x / width;
  
  audio.currentTime = percentage * audio.duration;
});

let isDragging = false;

progressBarContainer.addEventListener('mousedown', (e) => {
  if (!audio.src) return;
  isDragging = true;
  
  // Pause while dragging
  if(isPlaying) {
    audio.pause();
  }
  
  // Update position based on mouse
  updateProgressFromMouse(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    updateProgressFromMouse(e);
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    if (isPlaying) {
      audio.play();
    }
  }
});

function updateProgressFromMouse(e) {
  const rect = progressBarContainer.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percentage = x / rect.width;
  
  audio.currentTime = percentage * audio.duration;
}

function showLoading() {
  playPauseBtn.innerHTML = '<div class="spinner"></div>';
}

function hideLoading() {
  playPauseBtn.textContent = isPlaying ? 'pause' : 'play_arrow';
}

function openSpotifyPlayer() {
  dynamicIsland.classList.add('expanded-player');
  dynamicIsland.querySelector('.island-content').style.display = 'none';
  playerContent.style.display = 'block';
}

function closeSpotifyPlayer() {
  dynamicIsland.classList.remove('expanded-player');
  dynamicIsland.querySelector('.island-content').style.display = 'flex';
  playerContent.style.display = 'none';
  
  // Resume audio if it was playing
  if(isPlaying) {
    audio.play().catch(() => {/* Handle potential pause */});
  }
}

// Simulate initial animation
setTimeout(() => {
  dynamicIsland.style.transform = 'translateX(-50%) scale(1)';
  dynamicIsland.style.opacity = '1';
}, 100);

// Add Standby Mode functionality
const standbyButton = document.getElementById('standbyButton');
const standbyMode = document.getElementById('standbyMode');

standbyButton.addEventListener('click', () => {
  standbyMode.classList.add('active');
  
  // Initialize clock points if not already present
  let points = document.querySelector(".points");
  if (!points.hasChildNodes()) {
    let j = 12;
    for (var i = 0; i < 360; i += 6) {
      let point = document.createElement("span");
      point.className = "point";
      if ((i / 6) % 5 == 0) {
        point.className = "point big";
        let text = document.createElement("span");
        text.className = "text";
        text.innerHTML = j;
        text.style.transform = `rotate(${-i}deg) translateY(2px)`;
        if (j == 12) { j = 0; }
        j = j + 1;
        point.appendChild(text);
      }
      point.style.transform = `rotate(${i}deg) translateY(-150px)`;
      points.appendChild(point);
    }
  }
  
  // If a video is playing, move the dynamic island video element to the standby container
  if (currentVideoUrl) {
    const videoElement = document.getElementById('dynamicIslandVideo');
    const standbyContainer = document.getElementById('standbyVideoContainer');
    standbyContainer.innerHTML = ""; // Clear any existing content
    standbyContainer.appendChild(videoElement);
    videoElement.style.display = 'block';
  }
});

document.querySelector('#standbyMode .standby-close').addEventListener('click', () => {
  closeStandby();
});

function closeStandby() {
  standbyMode.classList.remove('active');
  
  // If a video is playing, move it back to dynamic island
  if (currentVideoUrl) {
    const videoElement = document.getElementById('dynamicIslandVideo');
    const islandContent = document.querySelector('.dynamic-island .island-content');
    islandContent.appendChild(videoElement);
    updateVideoVisibility();
  }
}

document.getElementById('standbyMode').addEventListener('click', (e) => {
  if (e.target === document.getElementById('standbyMode')) {
    closeStandby();
  }
});

// Clock update interval
setInterval(() => {
  if (!standbyMode.classList.contains('active')) return;
  
  var date = new Date();
  let secondsPoint = document.querySelector(".seconds");
  let minutesPoint = document.querySelector(".minutes");
  let hoursPoint = document.querySelector(".hours");

  let secPosition = date.getSeconds() * 6;
  let minPosition = date.getMinutes() * 6;
  let hourPosition = date.getHours() * 30;

  if (secPosition == 0) {
    secondsPoint.style.transition = "none";
  } else {
    secondsPoint.style.transition = "0.25s";
  }
  if (minPosition == 0) {
    minutesPoint.style.transition = "none";
  } else {
    minutesPoint.style.transition = "0.25s";
  }
  if (hourPosition == 0) {
    hoursPoint.style.transition = "none";
  } else {
    hoursPoint.style.transition = "0.25s";
  }

  secondsPoint.style.transform = `rotate(${secPosition - 180}deg)`;
  minutesPoint.style.transform = `rotate(${minPosition - 180}deg)`;
  hoursPoint.style.transform = `rotate(${hourPosition - 180}deg)`;
}, 1000);

// Standby Mode Controls
document.querySelector('#standbyMode .prev').addEventListener('click', (e) => {
  e.stopPropagation();
  startSeeking(-5);
});

document.querySelector('#standbyMode .next').addEventListener('click', (e) => {
  e.stopPropagation();
  startSeeking(5);
});

document.querySelector('#standbyMode .play-pause').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
});

// Add repeat functionality
let isRepeat = false;
audio.addEventListener('ended', () => {
  if(isRepeat) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log('Replay interrupted');
    });
  }
});

document.getElementById('repeatButton').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent standby mode from closing
  isRepeat = !isRepeat;
  document.getElementById('repeatButton').classList.toggle('active');
});

function updateVideoVisibility() {
  if (currentVideoUrl) {
    if (dynamicIsland.classList.contains('expanded')) {
      document.getElementById('dynamicIslandVideo').style.display = 'block';
      // Hide song info when expanded and video is playing
      document.querySelector('.island-content .song-info').style.display = 'none';
      document.querySelector('.island-content .album-art').style.display = 'none';
      document.querySelector('.island-content .controls').style.display = 'none';
    } else {
      document.getElementById('dynamicIslandVideo').style.display = 'none';
      // Show song info when collapsed
      document.querySelector('.island-content .song-info').style.display = 'block';
      document.querySelector('.island-content .album-art').style.display = 'block';
      document.querySelector('.island-content .controls').style.display = 'flex';
    }
  } else {
    // Always show song info for normal songs (no video)
    document.querySelector('.island-content .song-info').style.display = 'block';
    document.querySelector('.island-content .album-art').style.display = 'block';
    document.querySelector('.island-content .controls').style.display = 'flex';
  }
}

// Add listener for expanded state
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === "class") {
      updateVideoVisibility();
    }
  });
});

observer.observe(dynamicIsland, { attributes: true });

// Expose globals for use in the new dynamic island events file:
window.dynamicIsland = dynamicIsland;
window.currentVideoUrl = currentVideoUrl;
window.updateVideoVisibility = updateVideoVisibility;