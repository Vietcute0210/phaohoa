// =========================================================================
// HẰNG SỐ CẤU HÌNH PHÁO HOA (FIREWORKS CONFIGURATION CONSTANTS)
// Dễ dàng tùy chỉnh số hạt, tốc độ, trọng lực, màu sắc và hiệu năng
// =========================================================================
const FIREWORKS_CONFIG = {
  MAX_PARTICLES: 3000,             // Giới hạn hạt tối đa trong bộ nhớ đệm (Object Pool)
  PARTICLES_PER_FIREWORK: 140,     // Số hạt cơ bản cho mỗi quả pháo bình thường
  PARTICLES_BIG_FIREWORK: 260,     // Số hạt cho quả pháo to (Grand Finale / Dạ có)
  MIN_PARTICLES: 60,               // Số hạt tối thiểu khi tự động hạ đồ họa
  MAX_PARTICLES_LOD: 220,          // Số hạt tối đa khi thiết bị siêu mượt (60fps)
  GRAVITY: 0.052,                  // Trọng lực kéo hạt rơi xuống
  AIR_RESISTANCE: 0.964,           // Lực cản không khí làm chậm hạt
  TRAIL_FADE_ALPHA: 0.20,          // Độ mờ của vệt đuôi mỗi frame (0.15 - 0.25)
  ROCKET_SPEED_MIN: 9.0,           // Tốc độ phóng tối thiểu
  ROCKET_SPEED_MAX: 12.5,          // Tốc độ phóng tối đa
  AUTO_LAUNCH_INTERVAL: 2800,      // Thời gian tự động bắn pháo hoa nền (ms)
  SHOW_STATS: true                 // Bật/tắt hiển thị FPS & số hạt
};

// =========================================================================
// STATE MANAGEMENT CỦA ỨNG DỤNG
// =========================================================================
const state = {
  currentScreen: 1,
  selectedDay: 10, // Cố định ngày 10/10/2026
  selectedMonth: 10,
  selectedYear: 2026,
  selectedHour: '20',
  selectedMinute: '05',
  selectedFood: 'Đồ Hàn',
  userEmail: 'vietqhoa0210@gmail.com',
  isMusicPlaying: false,
  isMuted: false
};

// Câu từ chối hài hước cho nút "Nô"
const noPhrases = [
  'Để em nghĩ đã 🙈',
  'Em bận rùiii ạ',
  'Bố mẹ em ở nhà ý',
  'Em có hẹn rùi',
  'Em hơi ngạii ạ...',
  'Tha cho em đi mà 🥺',
  'Hôm khác được hem',
  'Nô nô nô 😜'
];
let noPhraseIndex = 0;

// Chuỗi ngày cố định
function getFixedDateString() {
  return 'Thứ Bảy, 10/10/2026';
}

// =========================================================================
// DOM ELEMENTS
// =========================================================================
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');

const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');
const btnNoText = document.getElementById('btnNoText');
const buttonsPlayground = document.getElementById('buttonsPlayground');

const calendarDays = document.getElementById('calendarDays');
const calendarHint = document.getElementById('calendarHint');
const hourPicker = document.getElementById('hourPicker');
const minutePicker = document.getElementById('minutePicker');
const livePreviewText = document.getElementById('livePreviewText');
const foodList = document.getElementById('foodList');
const btnConfirm = document.getElementById('btnConfirm');
const btnRepick = document.getElementById('btnRepick');

const summaryDynamicText = document.getElementById('summaryDynamicText');
const ticketDate = document.getElementById('ticketDate');
const ticketTime = document.getElementById('ticketTime');
const ticketFood = document.getElementById('ticketFood');
const sendStatus = document.getElementById('sendStatus');

const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
const bgmAudio = document.getElementById('bgmAudio');

const statsBadge = document.getElementById('statsBadge');
const fpsCounter = document.getElementById('fpsCounter');
const particleCounter = document.getElementById('particleCounter');

// =========================================================================
// KHỞI CHẠY ỨNG DỤNG (DOMContentLoaded)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initHighPerformanceFireworks();
  initAudioSystem();
  initRunawayButton();
  initCalendarOct2026();
  initTimePickers();
  initFoodSelection();
  updateLivePreview();
  initNavigation();
  initStatsToggle();

  // Chạm lần đầu để kích hoạt âm thanh Web Audio
  const unlockAudioOnFirstInteraction = () => {
    startMusic();
    document.removeEventListener('click', unlockAudioOnFirstInteraction);
    document.removeEventListener('touchstart', unlockAudioOnFirstInteraction);
  };
  document.addEventListener('click', unlockAudioOnFirstInteraction);
  document.addEventListener('touchstart', unlockAudioOnFirstInteraction, { passive: true });
});

// =========================================================================
// 1. WEB AUDIO API SYNTHESIZER: ÂM THANH PHÁO HOA & NHẠC DU DƯƠNG
// =========================================================================
let audioCtx = null;
let synthBgmInterval = null;
let synthBgmGainNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Giả lập tiếng pháo hoa chân thực (tiếng nổ trầm ấm + tiếng lách tách kim tuyến)
function playFireworkSound(volume = 0.16, isBig = false) {
  if (state.isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const actualVol = isBig ? Math.min(0.60, volume * 2.6) : Math.min(0.25, volume);

  // 1. Tiếng nổ trầm sub-bass boom
  const boomOsc = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boomOsc.type = 'sine';
  boomOsc.frequency.setValueAtTime(isBig ? 130 : 95, now);
  boomOsc.frequency.exponentialRampToValueAtTime(32, now + (isBig ? 0.65 : 0.42));

  boomGain.gain.setValueAtTime(actualVol * 0.9, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + (isBig ? 0.75 : 0.48));

  boomOsc.connect(boomGain);
  boomGain.connect(ctx.destination);
  boomOsc.start(now);
  boomOsc.stop(now + (isBig ? 0.8 : 0.5));

  // 2. Tiếng xé gió nổ bung (Filtered Noise)
  try {
    const bufferSize = Math.floor(ctx.sampleRate * (isBig ? 0.35 : 0.22));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isBig ? 420 : 600, now);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(actualVol * 0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isBig ? 0.35 : 0.22));

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
  } catch (e) {
    // Dự phòng an toàn nếu trình duyệt chặn createBuffer
  }

  // 3. Tiếng lách tách kim tuyến rơi (Crackles)
  if (isBig || Math.random() > 0.4) {
    const crackleCount = isBig ? 4 : 2;
    for (let c = 0; c < crackleCount; c++) {
      const crackleDelay = 0.15 + c * 0.08 + Math.random() * 0.05;
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'square';
      cOsc.frequency.setValueAtTime(600 + Math.random() * 1200, now + crackleDelay);

      cGain.gain.setValueAtTime(actualVol * 0.12, now + crackleDelay);
      cGain.gain.exponentialRampToValueAtTime(0.0001, now + crackleDelay + 0.04);

      cOsc.connect(cGain);
      cGain.connect(ctx.destination);

      cOsc.start(now + crackleDelay);
      cOsc.stop(now + crackleDelay + 0.05);
    }
  }
}

// Khởi tạo hệ thống nhạc nền
function initAudioSystem() {
  if (bgmAudio) {
    bgmAudio.volume = 0.28;
    bgmAudio.addEventListener('error', () => {
      // Fallback sang tiếng piano acoustic synthesizer
      if (state.isMusicPlaying) {
        startSynthesizedRomanticMelody();
      }
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }
}

function toggleMusic() {
  if (state.isMusicPlaying) {
    pauseMusic();
  } else {
    startMusic();
  }
}

function startMusic() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }

  state.isMuted = false;
  state.isMusicPlaying = true;
  updateMusicUI(true);

  if (bgmAudio && bgmAudio.src && !bgmAudio.error) {
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        startSynthesizedRomanticMelody();
      });
    }
  } else {
    startSynthesizedRomanticMelody();
  }
}

function pauseMusic() {
  state.isMusicPlaying = false;
  updateMusicUI(false);

  if (bgmAudio) {
    bgmAudio.pause();
  }
  if (synthBgmInterval) {
    clearInterval(synthBgmInterval);
    synthBgmInterval = null;
  }
}

function updateMusicUI(isPlaying) {
  if (!musicToggle) return;
  if (isPlaying) {
    musicToggle.classList.remove('muted');
    if (musicIcon) musicIcon.textContent = '🎵';
  } else {
    musicToggle.classList.add('muted');
    if (musicIcon) musicIcon.textContent = '🔇';
  }
}

// Điệu đàn piano lãng mạn nhẹ nhàng (Cmaj7 -> Am7 -> Fmaj7 -> G7)
function startSynthesizedRomanticMelody() {
  if (synthBgmInterval) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  state.isMusicPlaying = true;
  updateMusicUI(true);

  const melodyNotes = [
    261.63, 329.63, 392.00, 493.88, 523.25, // C - E - G - B - C5
    220.00, 261.63, 329.63, 440.00, 493.88, // A - C - E - A - B
    174.61, 220.00, 261.63, 349.23, 440.00, // F - A - C - F - A
    196.00, 246.94, 293.66, 392.00, 493.88  // G - B - D - G - B
  ];

  let noteIdx = 0;
  synthBgmGainNode = ctx.createGain();
  synthBgmGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  synthBgmGainNode.connect(ctx.destination);

  function playNextPianoNote() {
    if (!state.isMusicPlaying || state.isMuted) return;
    const freq = melodyNotes[noteIdx % melodyNotes.length];
    noteIdx++;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'triangle'; // Âm sắc chuông ấm áp
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.065, now + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(noteGain);
    noteGain.connect(synthBgmGainNode);

    osc.start(now);
    osc.stop(now + 1.7);
  }

  synthBgmInterval = setInterval(playNextPianoNote, 420);
}

// =========================================================================
// 2. CANVAS 2D FIREWORKS ENGINE SIÊU HIỆU NĂNG (60 FPS MƯỢT MÀ)
// - 1 Canvas duy nhất, requestAnimationFrame với delta time
// - Object Pool hoàn chỉnh với TypedArrays (Float32Array & Uint8Array)
// - TUYỆT ĐỐI không shadowBlur, không tạo per-particle gradient
// - Pre-rendered Offscreen Glowing Sprites (vẽ bằng drawImage)
// - Additive blending (globalCompositeOperation = 'lighter')
// - Fade đuôi vệt mờ không lưu lịch sử vị trí
// - Gom nhóm theo Sprite, bỏ qua hạt ngoài màn hình
// - DevicePixelRatio giới hạn tối đa 2.0
// - Tự động điều chỉnh chất lượng (LOD thích ứng FPS)
// - Tạm dừng khi ẩn tab (visibilitychange)
// - Nhiều kiểu nổ: Tròn, Trái tim, Ngôi sao, Đa tầng, Nổ kép (Double burst)
// =========================================================================

let fwCanvas, fwCtx;
let dpr = 1;
let cssWidth = window.innerWidth;
let cssHeight = window.innerHeight;
let animId = null;
let lastTimestamp = 0;
let isGrandFinale = false;
let ambientTimer = null;

// Thích ứng chất lượng theo FPS (LOD)
let currentParticlesPerFirework = FIREWORKS_CONFIG.PARTICLES_PER_FIREWORK;
let fpsRollingAverage = 60;
let frameCount = 0;
let fpsLastTime = performance.now();

// -------------------------------------------------------------------------
// TẠO PRE-RENDERED GLOW SPRITES TRÊN OFFSCREEN CANVASES
// -------------------------------------------------------------------------
// 8 Bảng màu lãng mạn rực rỡ theo hệ HSL
const SPRITE_PALETTES = [
  { name: 'Rose',    hue: 340, sat: 100, lit: 65 },  // 0: Hồng ngọt ngào
  { name: 'Gold',    hue: 45,  sat: 100, lit: 60 },  // 1: Vàng kim tuyến
  { name: 'Violet',  hue: 280, sat: 100, lit: 70 },  // 2: Tím mộng mơ
  { name: 'Cyan',    hue: 190, sat: 100, lit: 65 },  // 3: Xanh ngọc neon
  { name: 'Ruby',    hue: 0,   sat: 100, lit: 65 },  // 4: Đỏ ruby
  { name: 'White',   hue: 0,   sat: 0,   lit: 100 }, // 5: Trắng tinh khôi
  { name: 'Lime',    hue: 130, sat: 100, lit: 65 },  // 6: Xanh lá neon
  { name: 'Orange',  hue: 25,  sat: 100, lit: 60 },  // 7: Cam hoàng hôn
  { name: 'Glitter', hue: 50,  sat: 100, lit: 80 }   // 8: Tia lửa lách tách
];
const NUM_SPRITES = SPRITE_PALETTES.length;
const offscreenSprites = [];
const SPRITE_SIZE = 64; // Kích thước sprite chuẩn nét cao

function createPreRenderedSprites() {
  offscreenSprites.length = 0;

  SPRITE_PALETTES.forEach((palette) => {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = SPRITE_SIZE;
    sCanvas.height = SPRITE_SIZE;
    const sCtx = sCanvas.getContext('2d');

    const center = SPRITE_SIZE / 2;
    const radius = SPRITE_SIZE / 2;

    const grad = sCtx.createRadialGradient(center, center, 0, center, center, radius);
    if (palette.sat === 0) {
      // Trắng tinh khôi
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(240, 245, 255, 0.45)');
      grad.addColorStop(0.85, 'rgba(220, 230, 255, 0.15)');
      grad.addColorStop(1.0, 'rgba(200, 220, 255, 0.0)');
    } else {
      // Màu HSL rực rỡ với tâm trắng nóng sáng (White-hot core)
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.18, `hsla(${palette.hue}, ${palette.sat}%, ${Math.min(95, palette.lit + 25)}%, 0.95)`);
      grad.addColorStop(0.48, `hsla(${palette.hue}, ${palette.sat}%, ${palette.lit}%, 0.7)`);
      grad.addColorStop(0.8,  `hsla(${palette.hue}, ${palette.sat}%, ${palette.lit}%, 0.22)`);
      grad.addColorStop(1.0,  `hsla(${palette.hue}, ${palette.sat}%, ${palette.lit}%, 0.0)`);
    }

    sCtx.fillStyle = grad;
    sCtx.beginPath();
    sCtx.arc(center, center, radius, 0, Math.PI * 2);
    sCtx.fill();

    offscreenSprites.push(sCanvas);
  });
}

// -------------------------------------------------------------------------
// OBJECT POOL HẠT BẰNG TYPED ARRAYS (Float32Array & Uint8Array)
// Cấp phát cố định một lần duy nhất, tái sử dụng 100%, 0 Garbage Collection
// -------------------------------------------------------------------------
const MAX_P = FIREWORKS_CONFIG.MAX_PARTICLES;
const pX = new Float32Array(MAX_P);
const pY = new Float32Array(MAX_P);
const pVx = new Float32Array(MAX_P);
const pVy = new Float32Array(MAX_P);
const pLife = new Float32Array(MAX_P);       // Thời lượng sống từ 1.0 về 0.0
const pDecay = new Float32Array(MAX_P);      // Tốc độ giảm sự sống mỗi giây
const pBaseSize = new Float32Array(MAX_P);   // Kích thước vẽ cơ sở
const pSpriteIdx = new Uint8Array(MAX_P);    // Chỉ số sprite màu (0..8)
const pTwinkle = new Uint8Array(MAX_P);      // Cờ nhấp nháy
const pSubBurst = new Uint8Array(MAX_P);     // Cờ nổ lần 2 (Double burst)
const pActive = new Uint8Array(MAX_P);       // 1 = đang hoạt động, 0 = nghỉ

// Danh sách quản lý chỉ số hoạt động & ngăn xếp tự do
const activeIndices = new Int32Array(MAX_P);
let activeCount = 0;
const freeStack = new Int32Array(MAX_P);
let freeCount = MAX_P;

for (let i = 0; i < MAX_P; i++) {
  freeStack[i] = i;
}

// Lấy 1 hạt từ Pool
function spawnParticle(x, y, vx, vy, spriteIdx, size, decay, twinkle = 0, subBurst = 0) {
  if (freeCount <= 0) return -1;
  const idx = freeStack[--freeCount];

  pX[idx] = x;
  pY[idx] = y;
  pVx[idx] = vx;
  pVy[idx] = vy;
  pLife[idx] = 1.0;
  pDecay[idx] = decay;
  pBaseSize[idx] = size;
  pSpriteIdx[idx] = spriteIdx;
  pTwinkle[idx] = twinkle;
  pSubBurst[idx] = subBurst;
  pActive[idx] = 1;

  activeIndices[activeCount++] = idx;
  return idx;
}

// -------------------------------------------------------------------------
// QUẢ PHÁO BAY LÊN (ROCKET OBJECT POOL)
// -------------------------------------------------------------------------
const MAX_ROCKETS = 16;
const rockets = [];

class Rocket {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.targetY = 0;
    this.type = 0; // 0: CIRCLE, 1: HEART, 2: STAR, 3: LAYERED, 4: DOUBLE
    this.primarySprite = 0;
    this.secondarySprite = 1;
    this.isBig = false;
    this.sparkTimer = 0;
  }

  launch(startX, startY, targetY, vx, vy, type, pSprite, sSprite, isBig) {
    this.active = true;
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.primarySprite = pSprite;
    this.secondarySprite = sSprite;
    this.isBig = isBig;
    this.sparkTimer = 0;
  }
}

// Khởi tạo trước mảng Rockets
for (let r = 0; r < MAX_ROCKETS; r++) {
  rockets.push(new Rocket());
}

function spawnRocket(targetX, targetY, isBig = false) {
  const rocket = rockets.find(r => !r.active);
  if (!rocket) return;

  const startX = targetX !== undefined ? targetX : Math.random() * (cssWidth * 0.7) + cssWidth * 0.15;
  const finalTargetY = targetY !== undefined ? targetY : Math.random() * (cssHeight * 0.45) + cssHeight * 0.12;
  const startY = cssHeight + 10;

  // Tính vận tốc phóng hướng tới mục tiêu
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.18;
  const speed = isBig
    ? Math.random() * 2.5 + FIREWORKS_CONFIG.ROCKET_SPEED_MIN + 1.5
    : Math.random() * 2.0 + FIREWORKS_CONFIG.ROCKET_SPEED_MIN;

  const vx = Math.cos(angle) * (speed * 0.35);
  const vy = -speed;

  // Chọn ngẫu nhiên kiểu nổ:
  // 0: CIRCLE (tròn), 1: HEART (trái tim), 2: STAR (ngôi sao), 3: LAYERED (nhiều tầng), 4: DOUBLE (nổ kép)
  const randPattern = Math.random();
  let type = 0;
  if (randPattern < 0.28) type = 1;      // 28% Trái tim
  else if (randPattern < 0.48) type = 0; // 20% Tròn kinh điển
  else if (randPattern < 0.68) type = 3; // 20% Đa tầng
  else if (randPattern < 0.85) type = 2; // 17% Ngôi sao
  else type = 4;                         // 15% Nổ kép phân mảnh

  const pSprite = Math.floor(Math.random() * (NUM_SPRITES - 1));
  const sSprite = (pSprite + Math.floor(Math.random() * 3) + 1) % NUM_SPRITES;

  rocket.launch(startX, startY, finalTargetY, vx, vy, type, pSprite, sSprite, isBig);
}

// -------------------------------------------------------------------------
// THUẬT TOÁN TẠO CÁC KIỂU NỔ PHÁO HOA
// -------------------------------------------------------------------------
function explodeRocket(rocket) {
  const count = rocket.isBig
    ? FIREWORKS_CONFIG.PARTICLES_BIG_FIREWORK
    : currentParticlesPerFirework;

  const x = rocket.x;
  const y = rocket.y;
  const pSprite = rocket.primarySprite;
  const sSprite = rocket.secondarySprite;

  playFireworkSound(rocket.isBig ? 0.45 : 0.18, rocket.isBig);

  switch (rocket.type) {
    case 1: // KIỂU TRÁI TIM (HEART)
      explodeHeart(x, y, count, pSprite, sSprite, rocket.isBig);
      break;
    case 2: // KIỂU NGÔI SAO (STAR)
      explodeStar(x, y, count, pSprite, sSprite, rocket.isBig);
      break;
    case 3: // KIỂU HÌNH CẦU NHIỀU TẦNG (SPHERE_LAYERED)
      explodeLayered(x, y, count, pSprite, sSprite, rocket.isBig);
      break;
    case 4: // KIỂU NỔ PHÂN MẢNH LẦN HAI (DOUBLE_BURST)
      explodeDoubleBurst(x, y, count, pSprite, sSprite, rocket.isBig);
      break;
    case 0: // KIỂU TRÒN ĐỒNG TÂM (CIRCLE)
    default:
      explodeCircle(x, y, count, pSprite, sSprite, rocket.isBig);
      break;
  }
}

// 1. Nổ tròn rực rỡ
function explodeCircle(cx, cy, count, pSprite, sSprite, isBig) {
  const maxSpd = isBig ? 6.8 : 4.8;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.pow(Math.random(), 0.55) * maxSpd + 0.6;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const sprite = Math.random() > 0.3 ? pSprite : sSprite;
    const size = Math.random() * (isBig ? 14 : 10) + 12;
    const decay = Math.random() * 0.45 + 0.55;
    const twinkle = Math.random() > 0.5 ? 1 : 0;
    spawnParticle(cx, cy, vx, vy, sprite, size, decay, twinkle, 0);
  }
}

// 2. Nổ hình trái tim lãng mạn
function explodeHeart(cx, cy, count, pSprite, sSprite, isBig) {
  const scale = isBig ? 0.38 : 0.26;
  for (let i = 0; i < count; i++) {
    const t = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.08;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    const spdNoise = Math.random() * 0.2 + 0.9;
    const vx = (hx * scale * spdNoise) + (Math.random() - 0.5) * 0.4;
    const vy = (hy * scale * spdNoise) + (Math.random() - 0.5) * 0.4;

    const sprite = Math.random() > 0.25 ? pSprite : 0; // Ưu tiên màu Rose
    const size = Math.random() * (isBig ? 13 : 9) + 11;
    const decay = Math.random() * 0.40 + 0.50;
    const twinkle = Math.random() > 0.4 ? 1 : 0;
    spawnParticle(cx, cy, vx, vy, sprite, size, decay, twinkle, 0);
  }
}

// 3. Nổ hình ngôi sao 5 cánh
function explodeStar(cx, cy, count, pSprite, sSprite, isBig) {
  const maxSpd = isBig ? 6.2 : 4.4;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    // Phương trình cánh sao 5 đỉnh
    const rMod = 0.55 + 0.45 * Math.abs(Math.cos((5 * angle) / 2));
    const speed = (maxSpd * rMod) * (0.85 + Math.random() * 0.3);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const sprite = Math.random() > 0.4 ? pSprite : sSprite;
    const size = Math.random() * 11 + 10;
    const decay = Math.random() * 0.45 + 0.55;
    spawnParticle(cx, cy, vx, vy, sprite, size, decay, 1, 0);
  }
}

// 4. Nổ nhiều tầng đồng tâm (Layered Spheres)
function explodeLayered(cx, cy, count, pSprite, sSprite, isBig) {
  const outerCount = Math.floor(count * 0.55);
  const innerCount = count - outerCount;

  // Tầng ngoài tốc độ cao, màu primary
  const outSpd = isBig ? 6.5 : 4.6;
  for (let i = 0; i < outerCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + (outSpd - 1.5);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = Math.random() * 10 + 12;
    const decay = Math.random() * 0.4 + 0.55;
    spawnParticle(cx, cy, vx, vy, pSprite, size, decay, 0, 0);
  }

  // Tầng trong tốc độ thấp, màu tương phản secondary + ánh vàng
  const inSpd = isBig ? 3.4 : 2.4;
  for (let i = 0; i < innerCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.2 + (inSpd - 1.2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = Math.random() * 9 + 11;
    const decay = Math.random() * 0.35 + 0.65;
    spawnParticle(cx, cy, vx, vy, sSprite, size, decay, 1, 0);
  }
}

// 5. Nổ phân mảnh lần hai (Double Burst)
function explodeDoubleBurst(cx, cy, count, pSprite, sSprite, isBig) {
  const primaryCount = Math.floor(count * 0.65);
  const subShellCount = Math.floor(count * 0.35);

  // Hạt chính tỏa đều
  for (let i = 0; i < primaryCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.2 + 0.8;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = Math.random() * 10 + 10;
    const decay = Math.random() * 0.45 + 0.6;
    spawnParticle(cx, cy, vx, vy, pSprite, size, decay, 0, 0);
  }

  // Đầu đạn phụ bay ra ngoài rồi kích hoạt nổ nhỏ lần 2
  for (let i = 0; i < subShellCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.6 + 2.4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = Math.random() * 12 + 14;
    const decay = 0.85; // Sống vừa đủ để kịp nổ lần 2
    spawnParticle(cx, cy, vx, vy, sSprite, size, decay, 1, 1);
  }
}

// Kích hoạt nổ phụ lần 2 tại vị trí hạt con
function triggerSubBurst(x, y, spriteIdx) {
  const subCount = 6;
  for (let k = 0; k < subCount; k++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.8 + 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    spawnParticle(x, y, vx, vy, 8 /* Glitter */, 12, 1.4, 1, 0);
  }
}

// -------------------------------------------------------------------------
// KHỞI TẠO CANVAS ENGINE & VÒNG LẶP RENDER (Delta Time & Additive Blending)
// -------------------------------------------------------------------------
function initHighPerformanceFireworks() {
  fwCanvas = document.getElementById('fireworksCanvas');
  if (!fwCanvas) return;

  fwCtx = fwCanvas.getContext('2d', { alpha: true, desynchronized: true });
  createPreRenderedSprites();

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.0); // Giới hạn DPR tối đa 2.0 theo yêu cầu 8
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    fwCanvas.width = Math.floor(cssWidth * dpr);
    fwCanvas.height = Math.floor(cssHeight * dpr);

    if (fwCtx) {
      fwCtx.setTransform(1, 0, 0, 1, 0, 0);
      fwCtx.scale(dpr, dpr);
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Lắng nghe Click / Chạm toàn màn hình để bắn thêm pháo hoa
  initScreenInteraction();

  // Vòng lặp Animation Frame chính
  lastTimestamp = performance.now();
  fpsLastTime = lastTimestamp;

  function renderLoop(currentTimestamp) {
    // Tính delta time chính xác (Yêu cầu 1)
    const rawDt = (currentTimestamp - lastTimestamp) / 1000;
    lastTimestamp = currentTimestamp;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.1); // Kẹp dt chống nhảy vọt khi lag

    // Đo FPS trung bình và điều chỉnh chất lượng thích ứng (Yêu cầu 9)
    measureAndAdaptQuality(currentTimestamp, dt);

    // Xóa/Phủ mờ frame tạo vệt đuôi mượt (Yêu cầu 6: destination-out không lưu lịch sử vị trí)
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = `rgba(0, 0, 0, ${FIREWORKS_CONFIG.TRAIL_FADE_ALPHA})`;
    fwCtx.fillRect(0, 0, cssWidth, cssHeight);

    // Kích hoạt Additive Blending để hạt chồng nhau sáng rực (Yêu cầu 5)
    fwCtx.globalCompositeOperation = 'lighter';

    // 1. CẬP NHẬT VÀ VẼ QUẢ PHÁO (ROCKETS)
    updateAndDrawRockets(dt);

    // 2. CẬP NHẬT VÀ VẼ CÁC HẠT NỔ (PARTICLES VỚI OBJECT POOL)
    updateAndDrawParticles(dt);

    // Cập nhật thẻ thông số FPS & Active Particles góc màn hình
    updateStatsDisplay();

    animId = requestAnimationFrame(renderLoop);
  }

  animId = requestAnimationFrame(renderLoop);

  // Tạm dừng khi chuyển tab (Yêu cầu 10)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    } else {
      lastTimestamp = performance.now();
      fpsLastTime = lastTimestamp;
      if (!animId) {
        animId = requestAnimationFrame(renderLoop);
      }
    }
  });

  // Khởi động bắn pháo tự động nhẹ nhàng
  startAmbientAutoLaunch();
}

// -------------------------------------------------------------------------
// CẬP NHẬT & VẼ ROCKETS
// -------------------------------------------------------------------------
function updateAndDrawRockets(dt) {
  const dtScale = dt * 60; // Chuẩn hóa về thang 60fps

  for (let i = 0; i < MAX_ROCKETS; i++) {
    const r = rockets[i];
    if (!r.active) continue;

    r.x += r.vx * dtScale;
    r.y += r.vy * dtScale;
    r.vy += FIREWORKS_CONFIG.GRAVITY * 0.6 * dtScale; // Nhẹ nhàng chịu trọng lực

    // Nhả tia lửa đuôi (Rocket spark trail) vào hạt pool
    r.sparkTimer += dt;
    if (r.sparkTimer > 0.02) {
      r.sparkTimer = 0;
      const sparkSize = r.isBig ? 12 : 9;
      spawnParticle(
        r.x + (Math.random() - 0.5) * 2,
        r.y + 4,
        (Math.random() - 0.5) * 0.8,
        Math.random() * 1.5 + 0.8,
        8, // Sprite tia lửa
        sparkSize,
        3.2,
        1,
        0
      );
    }

    // Vẽ đầu quả pháo bằng Sprite sáng rực
    const headSprite = offscreenSprites[5]; // White Core
    const headSize = r.isBig ? 14 : 10;
    if (headSprite) {
      fwCtx.drawImage(headSprite, r.x - headSize / 2, r.y - headSize / 2, headSize, headSize);
    }

    // Khi đạt đỉnh hoặc bắt đầu rơi xuống => Kích nổ!
    if (r.y <= r.targetY || r.vy >= -0.8) {
      r.active = false;
      explodeRocket(r);
    }
  }
}

// -------------------------------------------------------------------------
// CẬP NHẬT & VẼ HẠT (GOM NHÓM THEO SPRITE, 0 SHADOWBLUR, 0 SAVE/RESTORE)
// (Yêu cầu 3, 4, 7)
// -------------------------------------------------------------------------
function updateAndDrawParticles(dt) {
  const dtScale = dt * 60;
  const gravity = FIREWORKS_CONFIG.GRAVITY * dtScale;
  const friction = Math.pow(FIREWORKS_CONFIG.AIR_RESISTANCE, dtScale);

  let writePtr = 0;

  // 1. Pha cập nhật vị trí & sự sống
  for (let i = 0; i < activeCount; i++) {
    const idx = activeIndices[i];

    pVx[idx] *= friction;
    pVy[idx] *= friction;
    pVy[idx] += gravity;

    pX[idx] += pVx[idx] * dtScale;
    pY[idx] += pVy[idx] * dtScale;

    pLife[idx] -= pDecay[idx] * dt;

    // Kiểm tra nổ lần 2 nếu có cờ subBurst
    if (pSubBurst[idx] === 1 && pLife[idx] <= 0.45 && pLife[idx] > 0.05) {
      pSubBurst[idx] = 0; // Kích hoạt 1 lần duy nhất
      triggerSubBurst(pX[idx], pY[idx], pSpriteIdx[idx]);
    }

    const x = pX[idx];
    const y = pY[idx];

    // Bỏ qua nếu đã hết vòng đời hoặc nằm ngoài biên màn hình (Yêu cầu 7)
    if (pLife[idx] <= 0 || x < -50 || x > cssWidth + 50 || y < -50 || y > cssHeight + 50) {
      pActive[idx] = 0;
      freeStack[freeCount++] = idx;
    } else {
      activeIndices[writePtr++] = idx;
    }
  }

  activeCount = writePtr;

  // 2. Pha vẽ gom nhóm theo Sprite (Grouped Draw Calls - Yêu cầu 7)
  // TUYỆT ĐỐI không gọi ctx.save() / ctx.restore(), dùng trực tiếp drawImage
  for (let i = 0; i < activeCount; i++) {
    const idx = activeIndices[i];
    const life = pLife[idx];

    // Hiệu ứng nhấp nháy (Twinkle) và mờ dần khi sắp tắt
    let alpha = life;
    if (pTwinkle[idx] && life > 0.2) {
      alpha *= 0.65 + 0.35 * Math.sin(life * 35);
    }
    if (alpha <= 0.02) continue;

    const baseSize = pBaseSize[idx];
    const drawSize = baseSize * Math.min(1.0, life * 1.3);
    const sprite = offscreenSprites[pSpriteIdx[idx]];

    if (sprite) {
      fwCtx.globalAlpha = Math.min(1.0, alpha);
      fwCtx.drawImage(
        sprite,
        pX[idx] - drawSize * 0.5,
        pY[idx] - drawSize * 0.5,
        drawSize,
        drawSize
      );
    }
  }

  // Khôi phục globalAlpha chuẩn
  fwCtx.globalAlpha = 1.0;
}

// -------------------------------------------------------------------------
// TỰ ĐỘNG ĐIỀU CHỈNH CHẤT LƯỢNG (FPS ADAPTIVE QUALITY LOD - Yêu cầu 9)
// -------------------------------------------------------------------------
function measureAndAdaptQuality(timestamp, dt) {
  frameCount++;
  const elapsed = timestamp - fpsLastTime;

  if (elapsed >= 500) { // Cập nhật đo mỗi 500ms
    const currentFps = (frameCount * 1000) / elapsed;
    fpsRollingAverage = Math.round(fpsRollingAverage * 0.7 + currentFps * 0.3);
    frameCount = 0;
    fpsLastTime = timestamp;

    // Nếu FPS < 50 => Giảm dần số hạt để giữ 60fps mượt mà
    if (fpsRollingAverage < 50) {
      currentParticlesPerFirework = Math.max(
        FIREWORKS_CONFIG.MIN_PARTICLES,
        currentParticlesPerFirework - 12
      );
    }
    // Nếu thiết bị ổn định > 58fps => Tăng dần số hạt cho rực rỡ
    else if (fpsRollingAverage > 58) {
      currentParticlesPerFirework = Math.min(
        FIREWORKS_CONFIG.MAX_PARTICLES_LOD,
        currentParticlesPerFirework + 6
      );
    }
  }
}

// -------------------------------------------------------------------------
// THÔNG SỐ FPS & SỐ HẠT ĐANG HOẠT ĐỘNG
// -------------------------------------------------------------------------
let lastStatsTextUpdate = 0;
function updateStatsDisplay() {
  const now = performance.now();
  if (now - lastStatsTextUpdate < 250) return; // Không gây layout reflow liên tục
  lastStatsTextUpdate = now;

  if (fpsCounter) {
    fpsCounter.textContent = `${Math.min(120, Math.max(15, fpsRollingAverage))} FPS`;
  }
  if (particleCounter) {
    particleCounter.textContent = `${activeCount} hạt`;
  }
}

function initStatsToggle() {
  if (statsBadge) {
    statsBadge.addEventListener('click', () => {
      statsBadge.classList.toggle('hidden-stats');
    });
  }
}

// -------------------------------------------------------------------------
// CHẠM/CLICK VÀO MÀN HÌNH ĐỂ BẮN THÊM PHÁO HOA
// -------------------------------------------------------------------------
function initScreenInteraction() {
  const handlePointerLaunch = (e) => {
    // Không bắn đè khi người dùng đang bấm nút hoặc chọn đồ ăn/giờ
    if (e.target.closest('button, input, textarea, a, .stats-badge, .wheel-item, .cal-cell')) {
      return;
    }
    const targetX = e.clientX;
    const targetY = e.clientY;
    spawnRocket(targetX, targetY, false);
  };

  window.addEventListener('pointerdown', handlePointerLaunch, { passive: true });
}

// Pháo hoa tự động bắn định kỳ nhẹ nhàng
function startAmbientAutoLaunch() {
  if (ambientTimer) clearInterval(ambientTimer);
  ambientTimer = setInterval(() => {
    if (!isGrandFinale) {
      spawnRocket(undefined, undefined, false);
    }
  }, FIREWORKS_CONFIG.AUTO_LAUNCH_INTERVAL);
}

// Hàm gọi ra ngoài toàn cục
window.launchFirework = function(isBig = false, targetX, targetY) {
  spawnRocket(targetX, targetY, isBig);
};

// Đợt bắn pháo hoa cực hoành tráng khi đồng ý (Grand Finale)
function triggerGrandFinale() {
  isGrandFinale = true;

  // Bắn 3 quả pháo lớn liên tiếp
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const x = cssWidth * (0.2 + i * 0.2);
      const y = cssHeight * (0.16 + (i % 2) * 0.12);
      spawnRocket(x, y, true);
    }, i * 260);
  }

  // Tiếp tục bắn dồn dập trong màn hình xác nhận
  const finaleInterval = setInterval(() => {
    if (state.currentScreen === 3) {
      spawnRocket(undefined, undefined, true);
      if (Math.random() > 0.4) {
        setTimeout(() => spawnRocket(undefined, undefined, false), 220);
      }
    } else {
      clearInterval(finaleInterval);
      isGrandFinale = false;
    }
  }, 1200);
}

// =========================================================================
// 3. ĐIỀU HƯỚNG MÀN HÌNH & NÚT "NÔ" CHẠY TRỐN
// =========================================================================
function switchScreen(screenNum) {
  const allScreens = [screen1, screen2, screen3];
  allScreens.forEach(s => s && s.classList.remove('active'));

  const target = document.getElementById(`screen${screenNum}`);
  if (target) {
    target.classList.add('active');
    const viewport = document.querySelector('.screen-viewport');
    if (viewport) viewport.scrollTop = 0;

    if (screenNum === 2 && window.syncTimeWheels) {
      setTimeout(window.syncTimeWheels, 80);
    }
    if (screenNum === 3) {
      triggerGrandFinale();
    }
  }
  state.currentScreen = screenNum;
}

// Nút "Nô" thông minh chạy trốn khi crush lướt qua hoặc chạm vào
function initRunawayButton() {
  if (!btnNo || !buttonsPlayground) return;

  const moveButton = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const playgroundRect = buttonsPlayground.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    btnNo.style.position = 'absolute';
    btnNo.style.transition = 'all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)';

    const maxLeft = Math.max(10, playgroundRect.width - btnRect.width - 16);
    const maxTop = Math.max(10, playgroundRect.height - btnRect.height - 16);

    const randomLeft = Math.max(8, Math.floor(Math.random() * maxLeft));
    const randomTop = Math.max(8, Math.floor(Math.random() * maxTop));

    btnNo.style.left = `${randomLeft}px`;
    btnNo.style.top = `${randomTop}px`;

    if (btnNoText) {
      btnNoText.textContent = noPhrases[noPhraseIndex];
      noPhraseIndex = (noPhraseIndex + 1) % noPhrases.length;
    }
  };

  btnNo.addEventListener('mouseenter', moveButton);
  btnNo.addEventListener('touchstart', moveButton, { passive: false });
  btnNo.addEventListener('pointerover', moveButton);
}

// =========================================================================
// 4. LỊCH THÁNG 10/2026 (CỐ ĐỊNH NGÀY 10/10)
// =========================================================================
function initCalendarOct2026() {
  if (!calendarDays) return;
  calendarDays.innerHTML = '';

  // 1/10/2026 là Thứ Năm => 3 ô trống trước ngày 1
  for (let e = 0; e < 3; e++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-cell empty';
    calendarDays.appendChild(emptyCell);
  }

  // Tháng 10 có 31 ngày
  for (let day = 1; day <= 31; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    cell.textContent = day;

    if (day === 10) {
      cell.classList.add('fixed-active');
      cell.innerHTML = `<span>10 🎆</span>`;
      cell.title = 'Thứ Bảy, 10/10/2026 - Đêm hội pháo hoa Hà Nội';

      cell.addEventListener('click', () => {
        window.launchFirework(true);
        if (calendarHint) {
          calendarHint.innerHTML = `<span>🎆 Đúng rồi nè! Ngày 10/10 mình cùng ngắm pháo hoa nha! ❤️✨</span>`;
        }
      });
    } else {
      cell.addEventListener('click', () => {
        if (calendarHint) {
          calendarHint.innerHTML = `<span>😜 Hôm này không có pháo hoa đâu em ơi! Chỉ 10/10 mới có pháo hoa thui nè! 🎆❤️</span>`;
          calendarHint.classList.remove('pulse-subtle');
          void calendarHint.offsetWidth;
          calendarHint.classList.add('pulse-subtle');
        }
      });
    }

    calendarDays.appendChild(cell);
  }
}

// =========================================================================
// 5. BỘ CHỌN GIỜ & PHÚT DẠNG CUỘN (WHEEL PICKER)
// =========================================================================
function initTimePickers() {
  if (!hourPicker || !minutePicker) return;
  const ITEM_HEIGHT = 38;

  function selectHour(val, scroll = false) {
    state.selectedHour = val;
    const items = hourPicker.querySelectorAll('.wheel-item');
    items.forEach((item, idx) => {
      if (item.textContent.trim() === val) {
        item.classList.add('selected');
        if (scroll) {
          hourPicker.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
        }
      } else {
        item.classList.remove('selected');
      }
    });
    updateLivePreview();
  }

  function selectMinute(val, scroll = false) {
    state.selectedMinute = val;
    const items = minutePicker.querySelectorAll('.wheel-item');
    items.forEach((item, idx) => {
      if (item.textContent.trim() === val) {
        item.classList.add('selected');
        if (scroll) {
          minutePicker.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
        }
      } else {
        item.classList.remove('selected');
      }
    });
    updateLivePreview();
  }

  // Giờ: từ 00 đến 23
  hourPicker.innerHTML = '';
  for (let h = 0; h <= 23; h++) {
    const hourStr = String(h).padStart(2, '0');
    const item = document.createElement('div');
    item.className = 'wheel-item';
    if (hourStr === state.selectedHour) item.classList.add('selected');
    item.textContent = hourStr;

    item.addEventListener('click', () => {
      selectHour(hourStr, true);
    });

    hourPicker.appendChild(item);
  }

  // Phút: từ 00 đến 55 bước 5
  minutePicker.innerHTML = '';
  for (let m = 0; m <= 55; m += 5) {
    const minStr = String(m).padStart(2, '0');
    const item = document.createElement('div');
    item.className = 'wheel-item';
    if (minStr === state.selectedMinute) item.classList.add('selected');
    item.textContent = minStr;

    item.addEventListener('click', () => {
      selectMinute(minStr, true);
    });

    minutePicker.appendChild(item);
  }

  // Lắng nghe cuộn người dùng
  let hourScrollTimer;
  hourPicker.addEventListener('scroll', () => {
    clearTimeout(hourScrollTimer);
    hourScrollTimer = setTimeout(() => {
      const items = hourPicker.querySelectorAll('.wheel-item');
      const idx = Math.min(items.length - 1, Math.max(0, Math.round(hourPicker.scrollTop / ITEM_HEIGHT)));
      if (items[idx]) {
        selectHour(items[idx].textContent.trim(), false);
      }
    }, 50);
  }, { passive: true });

  let minScrollTimer;
  minutePicker.addEventListener('scroll', () => {
    clearTimeout(minScrollTimer);
    minScrollTimer = setTimeout(() => {
      const items = minutePicker.querySelectorAll('.wheel-item');
      const idx = Math.min(items.length - 1, Math.max(0, Math.round(minutePicker.scrollTop / ITEM_HEIGHT)));
      if (items[idx]) {
        selectMinute(items[idx].textContent.trim(), false);
      }
    }, 50);
  }, { passive: true });

  window.syncTimeWheels = function() {
    const hItems = hourPicker.querySelectorAll('.wheel-item');
    hItems.forEach((item, idx) => {
      if (item.textContent.trim() === state.selectedHour) {
        hourPicker.scrollTop = idx * ITEM_HEIGHT;
      }
    });
    const mItems = minutePicker.querySelectorAll('.wheel-item');
    mItems.forEach((item, idx) => {
      if (item.textContent.trim() === state.selectedMinute) {
        minutePicker.scrollTop = idx * ITEM_HEIGHT;
      }
    });
  };

  setTimeout(window.syncTimeWheels, 150);
}

// =========================================================================
// 6. CHỌN MÓN ĂN & MÓN TỰ CHỌN KHÁC
// =========================================================================
function initFoodSelection() {
  if (!foodList) return;
  const cards = foodList.querySelectorAll('.food-item-card');
  const customFoodWrap = document.getElementById('customFoodWrap');
  const customFoodInput = document.getElementById('customFoodInput');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target === customFoodInput) return;

      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const foodType = card.getAttribute('data-food');
      if (foodType === 'custom') {
        if (customFoodWrap) customFoodWrap.style.display = 'block';
        if (customFoodInput) {
          customFoodInput.focus();
          state.selectedFood = customFoodInput.value.trim() || 'Món em thích tự chọn';
        }
      } else {
        if (customFoodWrap) customFoodWrap.style.display = 'none';
        state.selectedFood = foodType;
      }
    });
  });

  if (customFoodInput) {
    customFoodInput.addEventListener('input', () => {
      state.selectedFood = customFoodInput.value.trim() || 'Món em thích tự chọn';
    });
  }
}

// Cập nhật xem trước thời gian trực tiếp
function updateLivePreview() {
  if (!livePreviewText) return;
  const dateFormatted = getFixedDateString();
  const timeFormatted = `${state.selectedHour}:${state.selectedMinute}`;
  livePreviewText.innerHTML = `<span>💕 ${dateFormatted} lúc ${timeFormatted} (Đêm pháo hoa 🎆)</span>`;
}

// =========================================================================
// 7. XÁC NHẬN KÈO & GỬI THÔNG BÁO FORMSUBMIT
// =========================================================================
function initNavigation() {
  // Màn 1: Dạ cóooo
  if (btnYes) {
    btnYes.addEventListener('click', () => {
      startMusic();
      window.launchFirework(true);
      switchScreen(2);
    });
  }

  // Màn 2: Xác nhận chốt kèo
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      // Kiểm tra món tự chọn nếu đang mở
      const activeFoodCard = foodList ? foodList.querySelector('.food-item-card.active') : null;
      if (activeFoodCard && activeFoodCard.getAttribute('data-food') === 'custom') {
        const customFoodInput = document.getElementById('customFoodInput');
        state.selectedFood = (customFoodInput && customFoodInput.value.trim()) || 'Món em thích tự chọn';
      }

      // Đảm bảo lấy đúng giờ chính xác
      const ITEM_HEIGHT = 38;
      if (hourPicker) {
        const hItems = hourPicker.querySelectorAll('.wheel-item');
        if (hItems.length > 0) {
          const hIdx = Math.min(hItems.length - 1, Math.max(0, Math.round(hourPicker.scrollTop / ITEM_HEIGHT)));
          if (hItems[hIdx]) state.selectedHour = hItems[hIdx].textContent.trim();
        }
      }
      if (minutePicker) {
        const mItems = minutePicker.querySelectorAll('.wheel-item');
        if (mItems.length > 0) {
          const mIdx = Math.min(mItems.length - 1, Math.max(0, Math.round(minutePicker.scrollTop / ITEM_HEIGHT)));
          if (mItems[mIdx]) state.selectedMinute = mItems[mIdx].textContent.trim();
        }
      }

      const dateFormatted = getFixedDateString();
      const timeFormatted = `${state.selectedHour}:${state.selectedMinute}`;

      // Điền nội dung cho Màn 3
      if (summaryDynamicText) {
        summaryDynamicText.innerHTML = `Được rùiii, vậy <b>${dateFormatted}</b> mình đi ăn <b>${state.selectedFood}</b> rồi cùng nhau ngắm pháo hoa lúc <b>${timeFormatted}</b> nha 💕`;
      }
      if (ticketDate) ticketDate.textContent = `${dateFormatted} 🎆`;
      if (ticketTime) ticketTime.textContent = timeFormatted;
      if (ticketFood) ticketFood.textContent = state.selectedFood;

      // Chuyển màn 3 và bắn đại bác pháo hoa chúc mừng
      switchScreen(3);

      // Gửi email qua FormSubmit.co
      sendEmailNotification({
        date: dateFormatted,
        time: timeFormatted,
        food: state.selectedFood
      });
    });
  }

  // Màn 3: Chọn lại
  if (btnRepick) {
    btnRepick.addEventListener('click', () => {
      switchScreen(2);
    });
  }
}

// Gửi email ngầm không chuyển trang
async function sendEmailNotification(data) {
  if (!sendStatus) return;
  sendStatus.innerHTML = `
    <span class="status-icon">🎆</span>
    <span class="status-msg">Đang gửi kèo pháo hoa cho anh Việt...</span>
  `;

  try {
    const payload = {
      _subject: '🎆 Chốt kèo pháo hoa 10/10 thành công! Tâm đã đồng ý đi chơi với Việt!',
      NguoiMoi: 'Việt',
      NguoiDuocMoi: 'Tâm',
      NgayHen: `${data.date} (Đêm hội pháo hoa)`,
      GioHen: data.time,
      MonAnDaChon: data.food,
      ThoiGianXacNhan: new Date().toLocaleString('vi-VN'),
      _captcha: 'false'
    };

    const response = await fetch(`https://formsubmit.co/ajax/${state.userEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      sendStatus.innerHTML = `
        <span class="status-icon">🎉</span>
        <span class="status-msg" style="color:#2e7d32">Đã báo cho anh Việt rồi nha, lên đồ xinh đợi anh qua đón! 🎆</span>
      `;
    } else {
      sendStatus.innerHTML = `
        <span class="status-icon">✨</span>
        <span class="status-msg">Kèo đã lưu trong tim anh Việt rồi nha 💕</span>
      `;
    }
  } catch (err) {
    sendStatus.innerHTML = `
      <span class="status-icon">✨</span>
      <span class="status-msg">Kèo đã lưu trong tim anh Việt rồi nha 💕</span>
    `;
  }
}
