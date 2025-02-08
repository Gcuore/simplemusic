// Add mobile detection at startup
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mobileWarning = document.getElementById('mobileWarning');
  
  if (isMobile) {
    mobileWarning.style.display = 'flex';
    
    document.querySelector('.visionos-confirm').addEventListener('click', () => {
      mobileWarning.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    mobileWarning.addEventListener('click', (e) => {
      if (e.target === mobileWarning) {
        mobileWarning.style.display = 'none';
        document.body.style.overflow = '';
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

dynamicIsland.addEventListener('click', () => {
  dynamicIsland.classList.toggle('expanded');
});

playPauseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  togglePlayPause();
});

document.querySelector('.prev').addEventListener('mousedown', (e) => {
  e.stopPropagation();
  startSeeking(-5);
});

document.querySelector('.next').addEventListener('mousedown', (e) => {
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
  isPlaying = !isPlaying;
  if(!audio.src) return;
  
  if(isPlaying) {
    if(audio.readyState < 2) { // 2 = HAVE_CURRENT_DATA
      showLoading();
    }
    audio.play();
  } else {
    audio.pause();
    hideLoading();
  }
}

function playSong(title, artist, filename) {
  const songInfo = document.querySelector('.song-info');
  songInfo.querySelector('h3').textContent = title;
  songInfo.querySelector('p').textContent = artist;
  
  const albumArt = document.querySelector('.album-art');
  const playlistItems = document.querySelectorAll('.playlist-item');
  let playlistItem;
  
  // Find matching playlist item by title text
  for (const item of playlistItems) {
    if (item.querySelector('h3').textContent.trim() === title.trim()) {
      playlistItem = item;
      break;
    }
  }

  if (playlistItem) {
    albumArt.src = playlistItem.querySelector('img').src;
  }
  
  audio.src = filename;
  
  audio.onwaiting = () => {
    showLoading();
    isPlaying = true;
  };
  
  audio.oncanplay = () => {
    if(isPlaying) {
      hideLoading();
      audio.play();
    }
  };

  if (!isPlaying) togglePlayPause();
  else audio.play();
  
  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    progressBar.style.width = `${progress}%`;
  });
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