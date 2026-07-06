class AudioManager {
  constructor() {
    this.volume = parseFloat(localStorage.getItem('musicVol')) || 0.7;
    this.sfxVol = parseFloat(localStorage.getItem('sfxVol')) || 0.8;
    this.muted = localStorage.getItem('muted') === 'true';
    this.currentTrack = null;
    this.audioCache = {};
    
    this.init();
  }

  async init() {
    // Preload all audio
    const tracks = ['bgm', 'menu', 'game', 'victory', 'defeat'];
    const sfx = ['card_draw', 'card_place', 'shuffle', 'win', 'lose', 'button', 'countdown'];
    
    tracks.forEach(t => {
      this.audioCache[t] = new Audio(`assets/music/${t}.mp3`);
      this.audioCache[t].loop = t !== 'victory' && t !== 'defeat';
      this.audioCache[t].volume = this.muted ? 0 : this.volume;
    });
    
    sfx.forEach(s => {
      this.audioCache[s] = new Audio(`assets/sfx/${s}.mp3`);
      this.audioCache[s].volume = this.muted ? 0 : this.sfxVol;
    });
  }

  fadeSwitch(trackName) {
    if (this.currentTrack) {
      this.fadeOut(this.currentTrack, 500);
      setTimeout(() => this.audioCache[this.currentTrack].pause(), 500);
    }
    setTimeout(() => {
      this.currentTrack = trackName;
      this.audioCache[trackName].currentTime = 0;
      this.fadeIn(trackName, 500);
      this.audioCache[trackName].play().catch(() => {});
    }, 500);
  }

  fadeIn(track, duration) {
    const audio = this.audioCache[track];
    audio.volume = 0;
    let step = this.volume / (duration / 50);
    const interval = setInterval(() => {
      if (audio.volume + step >= this.volume) {
        audio.volume = this.muted ? 0 : this.volume;
        clearInterval(interval);
      } else audio.volume += step;
    }, 50);
  }

  fadeOut(track, duration) {
    const audio = this.audioCache[track];
    let step = this.volume / (duration / 50);
    const interval = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        clearInterval(interval);
      } else audio.volume -= step;
    }, 50);
  }

  playSFX(name) {
    if (this.muted) return;
    const s = this.audioCache[name];
    s.currentTime = 0;
    s.play().catch(() => {});
  }

  setMusicVol(v) {
    this.volume = v;
    localStorage.setItem('musicVol', v);
    Object.values(this.audioCache).forEach(a => a.volume = this.muted ? 0 : v);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('muted', this.muted);
    Object.values(this.audioCache).forEach(a => a.volume = this.muted ? 0 : this.volume);
  }
}

// Global instance
const Audio = new AudioManager();
