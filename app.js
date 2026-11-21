/**
 * Celestial Wishes - Core Application Orchestrator
 * Seamless navigation between Root, Send Category, and Receive Category.
 * Optimized for Desktop Chrome and Android Mobile.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    currentView: 'root', // 'root' | 'send' | 'receive'
    selectedWishType: 'birthday', // 'birthday' | 'congrats' | 'other'
    customWishText: '',
    selectedDate: new Date().toISOString().split('T')[0],
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
    slideEditor: null,
    blackHole: null,
    unlockedGreeting: null,
    isProcessingUnlock: false,
    greetingAudioData: null,
    previewAudio: null,
    revealAudioObj: null,
    blackHoleTheme: 'gargantua',
    doorWoodTheme: 'wood-oak',
    nebulaTheme: 'nebula-deep',
    ambientEngine: null
  };

  // --- HANDCRAFTED AMBIENT CANVAS (STARDUST & SHOOTING STARS) ---
  class AmbientCanvasEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.meteors = [];
      this.shootingStarsEnabled = true;
      this.resize();
      this.initParticles();
      window.addEventListener('resize', () => this.resize());
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);

      // Periodically trigger realistic shooting stars
      setInterval(() => {
        if (this.shootingStarsEnabled && Math.random() > 0.3) {
          this.spawnMeteor();
        }
      }, 4000);
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    initParticles() {
      this.particles = [];
      const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -Math.random() * 0.35 - 0.1,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    spawnMeteor() {
      const startX = Math.random() * this.canvas.width * 0.8 + 50;
      const startY = Math.random() * this.canvas.height * 0.35;
      const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 deg downward
      const speed = Math.random() * 8 + 12;
      this.meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 110 + 80,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.018
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 1. Draw Stardust particles
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.twinkleSpeed;
        if (p.y < -10) { p.y = this.canvas.height + 10; p.x = Math.random() * this.canvas.width; }
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(226, 232, 240, ${currentAlpha})`;
        this.ctx.shadowBlur = p.size * 3;
        this.ctx.shadowColor = '#38bdf8';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      // 2. Draw Shooting Stars / Meteors
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;

        if (m.life <= 0 || m.x > this.canvas.width + 100 || m.y > this.canvas.height + 100) {
          this.meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - (m.vx / 14) * m.length;
        const tailY = m.y - (m.vy / 14) * m.length;

        const grad = this.ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1.0, m.life * 1.5)})`);
        grad.addColorStop(0.3, `rgba(56, 189, 248, ${m.life * 0.8})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(m.x, m.y);
        this.ctx.lineTo(tailX, tailY);
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = 2.0;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }

      requestAnimationFrame(this.animate);
    }
  }

  // Safe confetti trigger (with pure canvas fallback if CDN is blocked/offline)
  function triggerCelebrationConfetti(count = 70) {
    if (typeof window.confetti === 'function') {
      window.confetti({ particleCount: count, spread: 80, origin: { y: 0.6 } });
      return;
    }
    // Fallback lightweight canvas confetti
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#ffffff'];
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }

    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      frame++;
      if (frame < 120) {
        requestAnimationFrame(anim);
      } else {
        canvas.remove();
      }
    }
    anim();
  }
  function generate12DigitCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing 0, 1, O, I
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function formatCode(rawCode) {
    if (!rawCode) return '';
    const clean = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < clean.length && i < 12; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join('-');
  }

  function normalizeCode(str) {
    return (str || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  // --- API & Storage Handlers ---
  async function saveGreetingToServer(payload) {
    // 1. Try Python backend API
    try {
      const resp = await fetch('/api/greetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        return { success: true, ...data };
      }
    } catch (err) {
      console.warn("Backend API not reachable; saving to local storage fallback.", err);
    }

    // 2. Client-side LocalStorage Fallback (with 7-day auto-purge)
    try {
      const dbKey = 'celestial_greetings_db';
      let db = {};
      try {
        db = JSON.parse(localStorage.getItem(dbKey) || '{}');
      } catch (e) { db = {}; }

      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      // Purge expired
      const validDb = {};
      Object.keys(db).forEach(k => {
        if (now - (db[k].createdAt || now) < SEVEN_DAYS_MS) {
          validDb[k] = db[k];
        }
      });

      payload.createdAt = now;
      payload.normalizedCode = payload.code;
      validDb[payload.code] = payload;
      localStorage.setItem(dbKey, JSON.stringify(validDb));

      return {
        success: true,
        code: payload.code,
        formattedCode: formatCode(payload.code),
        expiresAt: now + SEVEN_DAYS_MS,
        validDays: 7
      };
    } catch (e) {
      console.error("Local storage save error:", e);
      return { success: false, error: e.message };
    }
  }

  async function fetchGreetingFromServer(rawCode) {
    const code = normalizeCode(rawCode);
    if (!code || code.length !== 12) {
      return { success: false, error: "Access Denied: Code must be 12 characters." };
    }

    // 1. Try Backend API
    try {
      const resp = await fetch(`/api/greetings/${code}`);
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch (err) {
      console.warn("Backend fetch failed; checking local storage fallback...", err);
    }

    // 2. Try LocalStorage Fallback
    try {
      const dbKey = 'celestial_greetings_db';
      const db = JSON.parse(localStorage.getItem(dbKey) || '{}');
      const item = db[code];
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      if (item) {
        if (now - (item.createdAt || now) < SEVEN_DAYS_MS) {
          return {
            success: true,
            code: code,
            greeting: item,
            expiresAt: item.createdAt + SEVEN_DAYS_MS,
            remainingSeconds: Math.floor((item.createdAt + SEVEN_DAYS_MS - now) / 1000)
          };
        } else {
          // Expired
          delete db[code];
          localStorage.setItem(dbKey, JSON.stringify(db));
          return { success: false, error: "Access Denied: Greeting expired (> 7 days)." };
        }
      }
    } catch (e) {}

    return { success: false, error: "Access Denied: Invalid or non-existent code." };
  }

  // --- View Switcher ---
  function switchView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    // Header Back Button visibility
    const backBtn = document.getElementById('global-back-btn');
    if (backBtn) {
      if (viewName === 'root') {
        backBtn.classList.add('hidden');
      } else {
        backBtn.classList.remove('hidden');
      }
    }

    // Stop active audio on view change
    if (viewName !== 'receive' && state.revealAudioObj) {
      state.revealAudioObj.pause();
    }
    if (viewName !== 'send' && state.previewAudio) {
      state.previewAudio.pause();
      const btnPlayAudioPreview = document.getElementById('btn-play-preview-audio');
      if (btnPlayAudioPreview) btnPlayAudioPreview.innerHTML = '▶ Preview';
    }

    // View-specific initializations
    if (viewName === 'send') {
      initSendView();
    } else if (viewName === 'receive') {
      initReceiveView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Send View Logic ---
  function initSendView() {
    // Initialize slide editor if not created
    if (!state.slideEditor) {
      state.slideEditor = new SlideEditor('slide-editor-container');
      state.slideEditor.loadTemplate('birthday');
    }

    renderCalendar();
    updateWishSelectionUI();
  }

  function updateWishSelectionUI() {
    document.querySelectorAll('.wish-option-card').forEach(card => {
      const type = card.dataset.wish;
      if (type === state.selectedWishType) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const customInputContainer = document.getElementById('custom-wish-container');
    if (customInputContainer) {
      if (state.selectedWishType === 'other') {
        customInputContainer.classList.remove('hidden');
      } else {
        customInputContainer.classList.add('hidden');
      }
    }
  }

  // Interactive Live Calendar
  function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('calendar-month-year');
    const countdownLabel = document.getElementById('calendar-countdown-info');
    if (!calendarGrid || !monthYearLabel) return;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const year = state.calendarYear;
    const month = state.calendarMonth;
    monthYearLabel.textContent = `${monthNames[month]} ${year}`;

    // Clear days
    calendarGrid.innerHTML = '';

    // Day headers (Sun, Mon, Tue...)
    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayHeaders.forEach(d => {
      const th = document.createElement('div');
      th.className = 'cal-day-header';
      th.textContent = d;
      calendarGrid.appendChild(th);
    });

    // First day of month & total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day-cell cal-empty';
      calendarGrid.appendChild(blank);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('button');
      cell.className = 'cal-day-cell';
      cell.textContent = day;
      cell.type = 'button';

      if (cellDateStr === todayStr) {
        cell.classList.add('is-today');
      }
      if (cellDateStr === state.selectedDate) {
        cell.classList.add('is-selected');
      }

      cell.addEventListener('click', () => {
        state.selectedDate = cellDateStr;
        renderCalendar();
        if (window.SoundSystem) window.SoundSystem.playClick();
      });

      calendarGrid.appendChild(cell);
    }

    // Countdown / Date Info Calculation
    if (countdownLabel && state.selectedDate) {
      const sel = new Date(state.selectedDate + 'T00:00:00');
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const diffTime = sel.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let msg = `Selected: ${sel.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
      if (diffDays === 0) {
        msg += " • 🎉 Happening TODAY!";
      } else if (diffDays === 1) {
        msg += " • ⏳ In 1 day (Tomorrow!)";
      } else if (diffDays > 1) {
        msg += ` • ⏳ In ${diffDays} days`;
      } else {
        msg += ` • 📜 Celebrated ${Math.abs(diffDays)} days ago`;
      }
      countdownLabel.textContent = msg;
    }
  }

  // --- Proceed & Generate 12-Digit Code ---
  async function handleProceed() {
    const proceedBtn = document.getElementById('btn-proceed-send');
    if (proceedBtn) proceedBtn.disabled = true;

    // Validate Wish
    let finalWish = "Happy Birthday";
    if (state.selectedWishType === 'birthday') finalWish = "Happy Birthday";
    else if (state.selectedWishType === 'congrats') finalWish = "Congratulations";
    else {
      const customInput = document.getElementById('custom-wish-input');
      finalWish = (customInput && customInput.value.trim()) ? customInput.value.trim() : "Special Greeting";
    }

    // Validate Slide Data
    const slideData = state.slideEditor ? state.slideEditor.exportData() : { elements: [] };

    // Generate 12-Digit Code
    const rawCode = generate12DigitCode();
    const formatted = formatCode(rawCode);

    const payload = {
      code: rawCode,
      wish: finalWish,
      wishType: state.selectedWishType,
      customWish: state.customWishText,
      date: state.selectedDate,
      slideData: slideData,
      audioData: state.greetingAudioData || null
    };

    if (window.SoundSystem) window.SoundSystem.playLockUnlock();

    // Use unified storage manager (pure static, cloud sync, local storage & python)
    const result = window.CelestialStorage 
      ? await window.CelestialStorage.saveGreeting(payload)
      : await saveGreetingToServer(payload);

    if (proceedBtn) proceedBtn.disabled = false;

    if (result.success) {
      showProceedSuccessModal(rawCode, formatted, finalWish, state.selectedDate, result.shareUrl);
    } else {
      alert("Error saving greeting: " + (result.error || "Unknown error"));
    }
  }

  function showProceedSuccessModal(rawCode, formattedCode, wish, date, dynamicShareUrl) {
    const modal = document.getElementById('proceed-modal');
    if (!modal) return;

    const codeEl = document.getElementById('modal-generated-code');
    const expiryEl = document.getElementById('modal-expiry-notice');
    const shareUrlInput = document.getElementById('modal-share-link');

    if (codeEl) codeEl.textContent = formattedCode;
    if (expiryEl) {
      const expDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expiryEl.textContent = `Auto-clears in 7 days on ${expDate.toLocaleDateString()} at ${expDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Direct standalone URL (works 100% statically on Vercel without any backend)
    const fullUrl = dynamicShareUrl || `${window.location.origin}${window.location.pathname}?code=${rawCode}`;
    if (shareUrlInput) shareUrlInput.value = fullUrl;

    modal.classList.remove('hidden');

    // Trigger celebration confetti
    triggerCelebrationConfetti(70);
  }

  // --- Receive View Logic & Workflow ---
  function initReceiveView() {
    // Reset stages
    document.getElementById('receive-stage-door').classList.remove('hidden');
    document.getElementById('receive-stage-blackhole').classList.add('hidden');
    document.getElementById('receive-stage-loading').classList.add('hidden');
    document.getElementById('receive-stage-reveal').classList.add('hidden');

    // Reset door animation
    const doorContainer = document.getElementById('wooden-door-wrapper');
    if (doorContainer) {
      doorContainer.classList.remove('doors-open');
    }
    const padlock = document.getElementById('door-padlock');
    if (padlock) padlock.classList.remove('unlocked');

    // Reset error warning
    hideDoorError();

    // Clear code input or prefill if URL had code
    const input = document.getElementById('door-code-input');
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam && input) {
      input.value = formatCode(codeParam);
    }
  }

  function showDoorError(message) {
    const errorBox = document.getElementById('door-access-denied');
    const errorText = document.getElementById('door-error-message');
    const doorWrapper = document.getElementById('wooden-door-wrapper');

    if (errorBox) {
      errorBox.classList.remove('hidden');
      if (errorText) errorText.textContent = message || "ACCESS DENIED: Code not recognized or expired (> 7 days).";
    }

    if (doorWrapper) {
      doorWrapper.classList.add('shake-error');
      setTimeout(() => doorWrapper.classList.remove('shake-error'), 700);
    }

    if (window.SoundSystem) window.SoundSystem.playAccessDenied();

    // Android haptic vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }
  }

  function hideDoorError() {
    const errorBox = document.getElementById('door-access-denied');
    if (errorBox) errorBox.classList.add('hidden');
  }

  // Step 1: Unlock Door with 12-Digit Code
  async function handleUnlockDoor() {
    if (state.isProcessingUnlock) return;

    const input = document.getElementById('door-code-input');
    const rawVal = input ? input.value : '';
    const normCode = normalizeCode(rawVal);

    if (normCode.length !== 12) {
      showDoorError("ACCESS DENIED: Please enter a full 12-character code.");
      return;
    }

    state.isProcessingUnlock = true;
    hideDoorError();

    const unlockBtn = document.getElementById('btn-door-unlock');
    if (unlockBtn) unlockBtn.disabled = true;

    // Fetch using multi-tier storage (LocalStorage, URL Payload, Cloud KV, Local Python)
    const result = window.CelestialStorage
      ? await window.CelestialStorage.getGreeting(normCode)
      : await fetchGreetingFromServer(normCode);

    state.isProcessingUnlock = false;
    if (unlockBtn) unlockBtn.disabled = false;

    if (!result.success) {
      showDoorError(result.error || "ACCESS DENIED: Code is invalid or has expired.");
      return;
    }

    // Success! Unlock procedure
    state.unlockedGreeting = result.greeting;

    // Padlock opens
    const padlock = document.getElementById('door-padlock');
    if (padlock) padlock.classList.add('unlocked');
    if (window.SoundSystem) window.SoundSystem.playDoorCreak();

    // Doors swing open
    const doorWrapper = document.getElementById('wooden-door-wrapper');
    if (doorWrapper) doorWrapper.classList.add('doors-open');

    // Wait for door opening animation, then transition to 3D Black Hole
    setTimeout(() => {
      transitionToBlackHole();
    }, 1200);
  }

  // Step 2: 3D Black Hole Stage
  function transitionToBlackHole() {
    document.getElementById('receive-stage-door').classList.add('hidden');
    const blackHoleStage = document.getElementById('receive-stage-blackhole');
    blackHoleStage.classList.remove('hidden');

    // Initialize 3D Black Hole WebGL Engine if not started
    if (!state.blackHole) {
      state.blackHole = new BlackHoleEngine('blackhole-canvas');
    } else {
      state.blackHole.resetScene();
    }
    if (state.blackHole && state.blackHole.setTheme) {
      state.blackHole.setTheme(state.blackHoleTheme);
    }
  }

  // Step 3: Enter Singularity Button Clicked (Warp Plunge)
  function handleEnterBlackHole() {
    const enterBtn = document.getElementById('btn-enter-blackhole');
    if (enterBtn) enterBtn.classList.add('fading');

    if (window.SoundSystem) window.SoundSystem.playWarp();

    // Trigger relativistic warp animation inside WebGL shader
    if (state.blackHole) {
      state.blackHole.triggerWarp(() => {
        // Warp completed: scene is now deep black space with tiny stars!
        transitionToCyberLoading();
      });
    } else {
      setTimeout(() => transitionToCyberLoading(), 1500);
    }
  }

  // Step 4: Cyber Theme Loading Animation (0% to 100%)
  function transitionToCyberLoading() {
    const bhUi = document.getElementById('blackhole-ui-overlay');
    if (bhUi) bhUi.classList.add('hidden');

    const loadingStage = document.getElementById('receive-stage-loading');
    loadingStage.classList.remove('hidden');

    const percentText = document.getElementById('cyber-percent');
    const progressBar = document.getElementById('cyber-progress-fill');
    const terminalLogs = document.getElementById('cyber-terminal-logs');

    let percent = 0;
    const duration = 2800; // 2.8 seconds
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const logMessages = [
      { at: 10, text: "[INIT] QUANTUM SINGULARITY STABILIZED..." },
      { at: 28, text: "[KEY] 12-DIGIT CIPHER SYNCED..." },
      { at: 50, text: "[DECRYPT] PARSING WISH MATRIX & DATE VECTOR..." },
      { at: 75, text: "[RENDER] DECOMPRESSING PPT SLIDE MEMORY CORES..." },
      { at: 92, text: "[EXPIRY] 7-DAY EPHEMERAL PURGE ENGINE ENGAGED..." },
      { at: 100, text: "[COMPLETE] ACCESS GRANTED. UNVEILING CELESTIAL WISH!" }
    ];

    let nextLogIdx = 0;

    const timer = setInterval(() => {
      percent = Math.min(100, percent + step);
      const rounded = Math.floor(percent);

      if (percentText) percentText.textContent = `${rounded}%`;
      if (progressBar) progressBar.style.width = `${rounded}%`;

      // Telemetry sound blip
      if (Math.random() > 0.65 && window.SoundSystem) {
        window.SoundSystem.playCyberBeep();
      }

      // Check log output
      if (nextLogIdx < logMessages.length && rounded >= logMessages[nextLogIdx].at) {
        if (terminalLogs) {
          const line = document.createElement('div');
          line.className = 'cyber-log-line';
          line.textContent = logMessages[nextLogIdx].text;
          terminalLogs.appendChild(line);
          terminalLogs.scrollTop = terminalLogs.scrollHeight;
        }
        nextLogIdx++;
      }

      if (percent >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          transitionToRevealGreeting();
        }, 600);
      }
    }, intervalTime);
  }

  // Step 5: Grand Greeting Reveal Page
  function transitionToRevealGreeting() {
    document.getElementById('receive-stage-loading').classList.add('hidden');
    const revealStage = document.getElementById('receive-stage-reveal');
    revealStage.classList.remove('hidden');

    const greeting = state.unlockedGreeting || {
      wish: "Happy Birthday",
      date: new Date().toISOString().split('T')[0],
      slideData: { elements: [] }
    };

    // 1. Set Wish Banner
    const wishBanner = document.getElementById('reveal-wish-title');
    const wishSub = document.getElementById('reveal-wish-sub');
    if (wishBanner) wishBanner.textContent = greeting.wish || "Celestial Greeting";
    if (wishSub) wishSub.textContent = `A special message across space and time`;

    // 2. Set Date Card
    const dateValue = document.getElementById('reveal-date-value');
    const dateDesc = document.getElementById('reveal-date-desc');
    if (dateValue && greeting.date) {
      const d = new Date(greeting.date + 'T00:00:00');
      dateValue.textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      // Relative calculation
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) dateDesc.textContent = "Today is the grand celebration day!";
      else if (diff > 0) dateDesc.textContent = `Coming up in ${diff} day(s)!`;
      else dateDesc.textContent = `Celebrated ${Math.abs(diff)} day(s) ago!`;
    }

    // 3. Render PPT-style Slide Read-Only
    const slideContainer = document.getElementById('reveal-slide-stage');
    if (slideContainer && greeting.slideData) {
      SlideEditor.renderReadOnly(slideContainer, greeting.slideData);
    }

    // 4. Custom Celebration Audio Player (if attached by sender)
    const revealAudioPlayer = document.getElementById('reveal-audio-player');
    const revealAudioTitle = document.getElementById('reveal-audio-title');
    const btnRevealAudioToggle = document.getElementById('btn-reveal-audio-toggle');
    const revealAudioBtnIcon = document.getElementById('reveal-audio-btn-icon');
    const revealAudioBtnText = document.getElementById('reveal-audio-btn-text');

    if (revealAudioPlayer) {
      if (greeting.audioData && greeting.audioData.dataUrl) {
        revealAudioPlayer.classList.remove('hidden');
        if (revealAudioTitle) {
          revealAudioTitle.textContent = greeting.audioData.name || "Special Celebration Song";
        }

        if (state.revealAudioObj) {
          state.revealAudioObj.pause();
          state.revealAudioObj = null;
        }

        state.revealAudioObj = new Audio(greeting.audioData.dataUrl);
        state.revealAudioObj.loop = true;

        const updateAudioBtnUI = (isPlaying) => {
          if (revealAudioBtnIcon) revealAudioBtnIcon.textContent = isPlaying ? '❚❚' : '▶';
          if (revealAudioBtnText) revealAudioBtnText.textContent = isPlaying ? 'Pause Song' : 'Play Song';
          if (revealAudioPlayer) {
            if (isPlaying) revealAudioPlayer.classList.add('audio-active');
            else revealAudioPlayer.classList.remove('audio-active');
          }
        };

        // Try playing sender's custom song
        state.revealAudioObj.play().then(() => {
          updateAudioBtnUI(true);
          // Pause synthesizer background music so custom track takes full spotlight
          if (window.SoundSystem && window.SoundSystem.bgmPlaying) {
            window.SoundSystem.stopBackgroundMusic();
          }
        }).catch(() => {
          // Autoplay blocked by browser policy without user gesture
          updateAudioBtnUI(false);
        });

        if (btnRevealAudioToggle) {
          btnRevealAudioToggle.onclick = (e) => {
            e.stopPropagation();
            if (!state.revealAudioObj) return;
            if (state.revealAudioObj.paused) {
              state.revealAudioObj.play().then(() => updateAudioBtnUI(true)).catch(() => {});
            } else {
              state.revealAudioObj.pause();
              updateAudioBtnUI(false);
            }
          };
        }
      } else {
        revealAudioPlayer.classList.add('hidden');
      }
    }

    // Fanfare and Confetti
    if (window.SoundSystem) window.SoundSystem.playCelebrationFanfare();
    triggerCelebrationConfetti(120);
  }

  // --- Attach All UI Listeners on DOM Load ---
  document.addEventListener('DOMContentLoaded', () => {
    // Root Option 1: SEND
    const btnRootSend = document.getElementById('btn-root-send');
    if (btnRootSend) {
      btnRootSend.addEventListener('click', () => {
        if (window.SoundSystem) window.SoundSystem.playClick();
        switchView('send');
      });
    }

    // Root Option 2: RECEIVE
    const btnRootReceive = document.getElementById('btn-root-receive');
    if (btnRootReceive) {
      btnRootReceive.addEventListener('click', () => {
        if (window.SoundSystem) window.SoundSystem.playClick();
        switchView('receive');
      });
    }

    // Global Back Button
    const globalBackBtn = document.getElementById('global-back-btn');
    if (globalBackBtn) {
      globalBackBtn.addEventListener('click', () => {
        if (window.SoundSystem) window.SoundSystem.playClick();
        switchView('root');
      });
    }

    // Sound Toggle Button
    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    if (soundToggleBtn) {
      const updateSoundIcon = () => {
        const isMuted = window.SoundSystem.isMuted();
        soundToggleBtn.innerHTML = isMuted ? '🔇 <span class="sr-only">Muted</span>' : '🔊 <span class="sr-only">Sound ON</span>';
        soundToggleBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
      };
      updateSoundIcon();

      soundToggleBtn.addEventListener('click', () => {
        window.SoundSystem.toggleMute();
        updateSoundIcon();
        if (!window.SoundSystem.isMuted()) {
          window.SoundSystem.playClick();
        }
      });
    }

    // --- Send Category Events ---
    // Wish Selection Cards
    document.querySelectorAll('.wish-option-card').forEach(card => {
      card.addEventListener('click', () => {
        state.selectedWishType = card.dataset.wish;
        updateWishSelectionUI();
        if (window.SoundSystem) window.SoundSystem.playClick();

        // If template exists in editor, update slide heading
        if (state.slideEditor) {
          if (state.selectedWishType === 'birthday') {
            state.slideEditor.loadTemplate('birthday');
          } else if (state.selectedWishType === 'congrats') {
            state.slideEditor.loadTemplate('congrats');
          } else {
            state.slideEditor.loadTemplate('other');
          }
        }
      });
    });

    const customWishInput = document.getElementById('custom-wish-input');
    if (customWishInput) {
      customWishInput.addEventListener('input', (e) => {
        state.customWishText = e.target.value;
      });
    }

    // Calendar Navigation Buttons
    const prevMonthBtn = document.getElementById('cal-prev-month');
    const nextMonthBtn = document.getElementById('cal-next-month');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        state.calendarMonth--;
        if (state.calendarMonth < 0) {
          state.calendarMonth = 11;
          state.calendarYear--;
        }
        renderCalendar();
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        state.calendarMonth++;
        if (state.calendarMonth > 11) {
          state.calendarMonth = 0;
          state.calendarYear++;
        }
        renderCalendar();
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    }

    // Quick Date Presets
    document.querySelectorAll('.date-quick-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const offset = parseInt(btn.dataset.offset || 0, 10);
        const d = new Date();
        d.setDate(d.getDate() + offset);
        state.selectedDate = d.toISOString().split('T')[0];
        state.calendarMonth = d.getMonth();
        state.calendarYear = d.getFullYear();
        renderCalendar();
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    });

    // Slide Editor Toolbar Controls
    const btnAddHeading = document.getElementById('btn-add-heading');
    if (btnAddHeading) {
      btnAddHeading.addEventListener('click', () => state.slideEditor && state.slideEditor.addText('heading'));
    }
    const btnAddBody = document.getElementById('btn-add-body');
    if (btnAddBody) {
      btnAddBody.addEventListener('click', () => state.slideEditor && state.slideEditor.addText('body'));
    }
    const btnAddCursive = document.getElementById('btn-add-cursive');
    if (btnAddCursive) {
      btnAddCursive.addEventListener('click', () => state.slideEditor && state.slideEditor.addText('cursive'));
    }

    // Sticker Buttons
    document.querySelectorAll('.sticker-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji || btn.textContent.trim();
        if (state.slideEditor) state.slideEditor.addSticker(emoji);
      });
    });

    // Photo Upload Handler
    const imageUploadInput = document.getElementById('slide-image-upload');
    const btnUploadPhoto = document.getElementById('btn-upload-photo');
    if (btnUploadPhoto && imageUploadInput) {
      btnUploadPhoto.addEventListener('click', () => imageUploadInput.click());
      imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (state.slideEditor) state.slideEditor.addImage(ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    }

    // Background Theme Selector
    document.querySelectorAll('.bg-theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (state.slideEditor) state.slideEditor.setBackground(theme);
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    });

    // Formatting Toolbar changes
    const fontSelect = document.getElementById('slide-font-family');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => state.slideEditor && state.slideEditor.updateSelected('fontFamily', e.target.value));
    }
    const fontSizeInput = document.getElementById('slide-font-size');
    if (fontSizeInput) {
      fontSizeInput.addEventListener('input', (e) => state.slideEditor && state.slideEditor.updateSelected('fontSize', parseInt(e.target.value, 10)));
    }
    const fontColorInput = document.getElementById('slide-text-color');
    if (fontColorInput) {
      fontColorInput.addEventListener('input', (e) => state.slideEditor && state.slideEditor.updateSelected('color', e.target.value));
    }
    const fontGlowCheckbox = document.getElementById('slide-text-glow');
    if (fontGlowCheckbox) {
      fontGlowCheckbox.addEventListener('change', (e) => state.slideEditor && state.slideEditor.updateSelected('textGlow', e.target.checked));
    }

    // Slide Editor Move & Nudge Position Controls
    const btnNudgeLeft = document.getElementById('btn-nudge-left');
    if (btnNudgeLeft) {
      btnNudgeLeft.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.slideEditor) state.slideEditor.nudgeSelected(-2, 0);
      });
    }
    const btnNudgeRight = document.getElementById('btn-nudge-right');
    if (btnNudgeRight) {
      btnNudgeRight.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.slideEditor) state.slideEditor.nudgeSelected(2, 0);
      });
    }
    const btnNudgeUp = document.getElementById('btn-nudge-up');
    if (btnNudgeUp) {
      btnNudgeUp.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.slideEditor) state.slideEditor.nudgeSelected(0, -2);
      });
    }
    const btnNudgeDown = document.getElementById('btn-nudge-down');
    if (btnNudgeDown) {
      btnNudgeDown.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.slideEditor) state.slideEditor.nudgeSelected(0, 2);
      });
    }
    const btnNudgeCenter = document.getElementById('btn-nudge-center');
    if (btnNudgeCenter) {
      btnNudgeCenter.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.slideEditor) state.slideEditor.centerSelected();
      });
    }

    // --- Option 4: Custom Audio Upload (Celebration Song / Voice Message) ---
    const greetingAudioFileInput = document.getElementById('greeting-custom-audio-file');
    const btnBrowseAudio = document.getElementById('btn-browse-audio');
    const zoneAudioUpload = document.getElementById('zone-audio-upload');
    const greetingAudioPreview = document.getElementById('greeting-audio-preview');
    const greetingAudioName = document.getElementById('greeting-audio-name');
    const btnPlayAudioPreview = document.getElementById('btn-play-preview-audio');
    const btnRemoveAudioPreview = document.getElementById('btn-remove-preview-audio');

    const handleUploadedGreetingAudio = (file) => {
      if (!file) return;
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(file.name)) {
        alert("Please select a valid audio file (MP3, WAV, M4A, OGG).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert("Audio file is larger than 8MB. Please choose a smaller track for fast cosmic loading.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        state.greetingAudioData = {
          name: file.name,
          dataUrl: ev.target.result,
          size: file.size,
          type: file.type || 'audio/mp3'
        };

        if (greetingAudioName) greetingAudioName.textContent = file.name;
        if (zoneAudioUpload) zoneAudioUpload.classList.add('hidden');
        if (greetingAudioPreview) greetingAudioPreview.classList.remove('hidden');

        if (btnPlayAudioPreview) btnPlayAudioPreview.innerHTML = '▶ Preview';
        if (state.previewAudio) {
          state.previewAudio.pause();
          state.previewAudio = null;
        }

        if (window.SoundSystem) window.SoundSystem.playClick();
      };
      reader.readAsDataURL(file);
    };

    if (btnBrowseAudio && greetingAudioFileInput) {
      btnBrowseAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        greetingAudioFileInput.click();
      });
    }

    if (zoneAudioUpload && greetingAudioFileInput) {
      zoneAudioUpload.addEventListener('click', () => {
        greetingAudioFileInput.click();
      });

      zoneAudioUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        zoneAudioUpload.style.borderColor = 'var(--primary-cyan)';
      });
      zoneAudioUpload.addEventListener('dragleave', () => {
        zoneAudioUpload.style.borderColor = '';
      });
      zoneAudioUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        zoneAudioUpload.style.borderColor = '';
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleUploadedGreetingAudio(e.dataTransfer.files[0]);
        }
      });
    }

    if (greetingAudioFileInput) {
      greetingAudioFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleUploadedGreetingAudio(e.target.files[0]);
        }
      });
    }

    if (btnPlayAudioPreview) {
      btnPlayAudioPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!state.greetingAudioData || !state.greetingAudioData.dataUrl) return;

        if (state.previewAudio && !state.previewAudio.paused) {
          state.previewAudio.pause();
          btnPlayAudioPreview.innerHTML = '▶ Preview';
        } else {
          if (!state.previewAudio) {
            state.previewAudio = new Audio(state.greetingAudioData.dataUrl);
            state.previewAudio.addEventListener('ended', () => {
              btnPlayAudioPreview.innerHTML = '▶ Preview';
            });
          }
          state.previewAudio.play().then(() => {
            btnPlayAudioPreview.innerHTML = '❚❚ Pause';
          }).catch(err => {
            console.warn("Audio preview playback failed:", err);
          });
        }
      });
    }

    if (btnRemoveAudioPreview) {
      btnRemoveAudioPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.previewAudio) {
          state.previewAudio.pause();
          state.previewAudio = null;
        }
        state.greetingAudioData = null;
        if (greetingAudioFileInput) greetingAudioFileInput.value = '';
        if (greetingAudioPreview) greetingAudioPreview.classList.add('hidden');
        if (zoneAudioUpload) zoneAudioUpload.classList.remove('hidden');
        if (btnPlayAudioPreview) btnPlayAudioPreview.innerHTML = '▶ Preview';
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    }

    // Template Presets
    const btnTplBday = document.getElementById('btn-template-birthday');
    if (btnTplBday) {
      btnTplBday.addEventListener('click', () => state.slideEditor && state.slideEditor.loadTemplate('birthday'));
    }
    const btnTplCongrats = document.getElementById('btn-template-congrats');
    if (btnTplCongrats) {
      btnTplCongrats.addEventListener('click', () => state.slideEditor && state.slideEditor.loadTemplate('congrats'));
    }
    const btnClearSlide = document.getElementById('btn-clear-slide');
    if (btnClearSlide) {
      btnClearSlide.addEventListener('click', () => {
        if (confirm("Clear slide and start from blank?")) {
          if (state.slideEditor) {
            state.slideEditor.elementsLayer.innerHTML = '';
            state.slideEditor.elements = [];
          }
        }
      });
    }

    // Proceed Button
    const btnProceed = document.getElementById('btn-proceed-send');
    if (btnProceed) {
      btnProceed.addEventListener('click', handleProceed);
    }

    // Modal Copy Code Button
    const btnCopyCode = document.getElementById('btn-copy-code');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const codeText = document.getElementById('modal-generated-code').textContent;
        navigator.clipboard.writeText(codeText.replace(/-/g, '')).then(() => {
          btnCopyCode.textContent = "✓ Copied!";
          setTimeout(() => btnCopyCode.textContent = "Copy Code", 2000);
        });
      });
    }

    // Modal Copy Share Link Button
    const btnCopyLink = document.getElementById('btn-copy-link');
    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', () => {
        const linkInput = document.getElementById('modal-share-link');
        navigator.clipboard.writeText(linkInput.value).then(() => {
          btnCopyLink.textContent = "✓ Link Copied!";
          setTimeout(() => btnCopyLink.textContent = "Copy Link", 2000);
        });
      });
    }

    // Modal WhatsApp / Android Share API
    const btnShareNative = document.getElementById('btn-share-native');
    if (btnShareNative) {
      btnShareNative.addEventListener('click', () => {
        const codeText = document.getElementById('modal-generated-code').textContent;
        const link = document.getElementById('modal-share-link').value;
        const shareData = {
          title: "Celestial Greeting For You!",
          text: `You have received a secret cosmic greeting! Unlock code: ${codeText}\nAccess here: ${link}`,
          url: link
        };

        if (navigator.share) {
          navigator.share(shareData).catch(() => {});
        } else {
          // Fallback to WhatsApp Web/App
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)}`;
          window.open(waUrl, '_blank');
        }
      });
    }

    // Modal "Test in Receive Mode" Button
    const btnTestReceive = document.getElementById('btn-test-in-receive');
    if (btnTestReceive) {
      btnTestReceive.addEventListener('click', () => {
        const code = document.getElementById('modal-generated-code').textContent;
        document.getElementById('proceed-modal').classList.add('hidden');
        switchView('receive');
        const doorInput = document.getElementById('door-code-input');
        if (doorInput) doorInput.value = code;
      });
    }

    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        document.getElementById('proceed-modal').classList.add('hidden');
      });
    }

    // --- Receive Category Events ---
    // Code input auto-formatting (adds dash every 4 chars)
    const doorCodeInput = document.getElementById('door-code-input');
    if (doorCodeInput) {
      doorCodeInput.addEventListener('input', (e) => {
        const cursor = e.target.selectionStart;
        const oldVal = e.target.value;
        const formatted = formatCode(oldVal);
        e.target.value = formatted;
        hideDoorError();
      });

      doorCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleUnlockDoor();
        }
      });
    }

    // Unlock Door Button
    const btnDoorUnlock = document.getElementById('btn-door-unlock');
    if (btnDoorUnlock) {
      btnDoorUnlock.addEventListener('click', handleUnlockDoor);
    }

    // Enter Singularity / Black Hole Button
    const btnEnterBH = document.getElementById('btn-enter-blackhole');
    if (btnEnterBH) {
      btnEnterBH.addEventListener('click', handleEnterBlackHole);
    }

    // Reveal Action Buttons
    const btnReplay = document.getElementById('btn-replay-reveal');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        triggerCelebrationConfetti(100);
        if (window.SoundSystem) window.SoundSystem.playCelebrationFanfare();
      });
    }

    const btnNewWish = document.getElementById('btn-create-another-wish');
    if (btnNewWish) {
      btnNewWish.addEventListener('click', () => {
        switchView('send');
      });
    }

    // --- ARTISAN ENHANCEMENTS: CANVAS, DOOR KNOCKERS & MUSIC ---
    // 1. Initialize Ambient Canvas Engine (Stardust & Shooting Stars)
    state.ambientEngine = new AmbientCanvasEngine('ambient-canvas');

    // 2. Interactive Wooden Door Ring Knockers
    const knockerLeft = document.getElementById('knocker-left');
    const knockerRight = document.getElementById('knocker-right');
    [knockerLeft, knockerRight].forEach(k => {
      if (k) {
        k.addEventListener('click', (e) => {
          e.stopPropagation();
          k.classList.add('knocking');
          if (window.SoundSystem) window.SoundSystem.playDoorKnock();
          setTimeout(() => k.classList.remove('knocking'), 450);
        });
      }
    });

    // 3. Floating Background Music Player Pill
    const btnMusic = document.getElementById('btn-music-toggle');
    const trackLabel = document.getElementById('current-track-name');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        if (window.SoundSystem) {
          const isPlaying = window.SoundSystem.toggleBackgroundMusic();
          if (isPlaying) {
            btnMusic.classList.add('music-playing');
            if (trackLabel) trackLabel.textContent = 'Music: On';
          } else {
            btnMusic.classList.remove('music-playing');
            if (trackLabel) trackLabel.textContent = 'Music: Off';
          }
        }
      });
    }

    // 4. Artisan Customizer Modal Open / Close
    const btnOpenCustomizer = document.getElementById('btn-open-customizer');
    const btnCloseCustomizer = document.getElementById('btn-close-customizer');
    const btnSaveCustomizer = document.getElementById('btn-save-customizer');
    const customizerModal = document.getElementById('customizer-modal');

    const toggleCustomizerModal = (show) => {
      if (!customizerModal) return;
      if (show) {
        customizerModal.classList.remove('hidden');
        if (window.SoundSystem) window.SoundSystem.playClick();
      } else {
        customizerModal.classList.add('hidden');
      }
    };

    if (btnOpenCustomizer) btnOpenCustomizer.addEventListener('click', () => toggleCustomizerModal(true));
    if (btnCloseCustomizer) btnCloseCustomizer.addEventListener('click', () => toggleCustomizerModal(false));
    if (btnSaveCustomizer) btnSaveCustomizer.addEventListener('click', () => {
      toggleCustomizerModal(false);
      if (window.SoundSystem) window.SoundSystem.playClick();
      try {
        localStorage.setItem('celestial_customizer_prefs', JSON.stringify({
          bh: state.blackHoleTheme,
          door: state.doorWoodTheme,
          nebula: state.nebulaTheme,
          stars: state.ambientEngine ? state.ambientEngine.shootingStarsEnabled : true
        }));
      } catch (e) {}
    });

    // Black Hole Theme Chips
    document.querySelectorAll('[data-bh]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-bh]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.blackHoleTheme = chip.dataset.bh;
        if (state.blackHole && state.blackHole.setTheme) {
          state.blackHole.setTheme(state.blackHoleTheme);
        }
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    });

    // Door Woodcraft Chips
    document.querySelectorAll('[data-door]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-door]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.doorWoodTheme = chip.dataset.door;
        const doorWrapper = document.getElementById('wooden-door-wrapper');
        if (doorWrapper) {
          doorWrapper.className = `wooden-door-wrapper ${state.doorWoodTheme}`;
        }
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    });

    // Cosmic Nebula Atmosphere Chips
    document.querySelectorAll('[data-nebula]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-nebula]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.nebulaTheme = chip.dataset.nebula;
        document.body.className = `cosmic-body ${state.nebulaTheme}`;
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    });

    // Music Track Chips
    document.querySelectorAll('[data-track]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-track]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const track = chip.dataset.track;
        if (window.SoundSystem) {
          window.SoundSystem.currentTrack = track;
          if (window.SoundSystem.bgmPlaying) {
            window.SoundSystem.startBackgroundMusic(track);
          }
          window.SoundSystem.playClick();
        }
      });
    });

    // Custom MP3 Audio Upload
    const customBgmInput = document.getElementById('custom-bgm-file');
    const customBgmStatus = document.getElementById('custom-bgm-status');
    if (customBgmInput) {
      customBgmInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (window.SoundSystem) {
          if (window.SoundSystem.customAudio) {
            window.SoundSystem.customAudio.pause();
          }
          window.SoundSystem.customAudio = new Audio(url);
          window.SoundSystem.customAudio.loop = true;
          window.SoundSystem.customAudio.volume = 0.5;
          window.SoundSystem.stopBackgroundMusic();
          window.SoundSystem.customAudio.play().catch(() => {});
          if (btnMusic) btnMusic.classList.add('music-playing');
          if (trackLabel) trackLabel.textContent = file.name;
          if (customBgmStatus) customBgmStatus.textContent = `Playing: ${file.name}`;
        }
      });
    }

    // Shooting Stars Toggle
    const toggleStars = document.getElementById('toggle-shooting-stars');
    if (toggleStars && state.ambientEngine) {
      toggleStars.addEventListener('change', (e) => {
        state.ambientEngine.shootingStarsEnabled = e.target.checked;
        if (window.SoundSystem) window.SoundSystem.playClick();
      });
    }

    // Load saved customizer preferences
    try {
      const savedPrefs = JSON.parse(localStorage.getItem('celestial_customizer_prefs') || '{}');
      if (savedPrefs.bh) {
        state.blackHoleTheme = savedPrefs.bh;
        const chip = document.querySelector(`[data-bh="${savedPrefs.bh}"]`);
        if (chip) {
          document.querySelectorAll('[data-bh]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      }
      if (savedPrefs.door) {
        state.doorWoodTheme = savedPrefs.door;
        const doorWrapper = document.getElementById('wooden-door-wrapper');
        if (doorWrapper) doorWrapper.className = `wooden-door-wrapper ${state.doorWoodTheme}`;
        const chip = document.querySelector(`[data-door="${savedPrefs.door}"]`);
        if (chip) {
          document.querySelectorAll('[data-door]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      }
      if (savedPrefs.nebula) {
        state.nebulaTheme = savedPrefs.nebula;
        document.body.className = `cosmic-body ${state.nebulaTheme}`;
        const chip = document.querySelector(`[data-nebula="${savedPrefs.nebula}"]`);
        if (chip) {
          document.querySelectorAll('[data-nebula]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      }
    } catch (e) {}

    // Auto-detect ?code= or compressed greeting in URL on initial page load
    if (window.CelestialStorage) {
      const initialData = window.CelestialStorage.parseUrlOnLoad();
      if (initialData && initialData.code) {
        switchView('receive');
        const doorInput = document.getElementById('door-code-input');
        if (doorInput) {
          doorInput.value = formatCode(initialData.code);
        }
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const initialCode = urlParams.get('code');
      if (initialCode) {
        switchView('receive');
        const doorInput = document.getElementById('door-code-input');
        if (doorInput) {
          doorInput.value = formatCode(initialCode);
        }
      }
    }
  });

})();
