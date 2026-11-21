/**
 * Cosmic 3D Black Hole Engine
 * Pure WebGL Gravitational Lensing & Relativistic Accretion Disk
 * Optimized for 60fps on Android Chrome and Desktop.
 */

class BlackHoleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.warn("WebGL not supported; activating 2D fallback.");
      this.init2DFallback();
      return;
    }

    this.isWarping = false;
    this.warpProgress = 0.0;
    this.startTime = performance.now();
    this.mouse = { x: 0.0, y: 0.0, targetX: 0.0, targetY: 0.0 };
    this.starsMode = false; // When true, only deep black space with tiny stars is drawn
    this.starsFade = 0.0;

    this.initShaders();
    this.initBuffers();
    this.initEvents();
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initShaders() {
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Raymarching / Analytic Gravitational Lensing & Relativistic Accretion Disk Fragment Shader
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_warp;
      uniform float u_starsMode;
      varying vec2 v_uv;

      // Hash function for procedural stars & noise
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Background stars
      vec3 renderStars(vec2 uv, float time) {
        vec3 col = vec3(0.005, 0.006, 0.015); // Deep cosmos dark
        vec2 grid = floor(uv * 120.0);
        float h = hash(grid);
        if (h > 0.982) {
          float sparkle = sin(time * 3.0 + h * 6.28) * 0.4 + 0.6;
          float starBrightness = (h - 0.982) * 55.0 * sparkle;
          vec3 starColor = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.8, 0.6), hash(grid + 3.14));
          col += starColor * starBrightness;
        }
        return col;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        float t = u_time * 0.8;

        // Mouse tilt effect
        uv += u_mouse * 0.12;

        // If in deep black space with tiny stars mode (after warp):
        if (u_starsMode >= 1.0) {
          vec3 starSky = renderStars(uv + vec2(0.05 * t, 0.0), t * 0.5);
          gl_FragColor = vec4(starSky, 1.0);
          return;
        }

        // Warp effect: zoom into singularity & streaking hyperspace
        if (u_warp > 0.0) {
          float speed = u_warp * 14.0;
          float r = length(uv);
          float angle = atan(uv.y, uv.x);
          float streak = noise(vec2(angle * 12.0, r * 4.0 - t * speed)) * u_warp;
          vec3 warpColor = mix(vec3(0.1, 0.3, 0.8), vec3(0.9, 0.95, 1.0), streak);
          
          // Blend into darkness
          vec3 darkSpace = renderStars(uv, t);
          vec3 outCol = mix(warpColor * (1.0 - u_warp * 0.8), darkSpace, clamp((u_warp - 0.5) * 2.0, 0.0, 1.0));
          gl_FragColor = vec4(outCol, 1.0);
          return;
        }

        // Standard 3D Black Hole Rendering
        // Distance to singularity center
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);

        // Gravitational lensing deflection
        float rs = 0.22; // Event horizon radius
        float deflection = (rs * rs * 0.45) / max(dist, 0.001);
        vec2 lensedUV = uv + normalize(uv) * deflection;

        // Background cosmic stars distorted by lensing
        vec3 col = renderStars(lensedUV * 1.5, t);

        // Relativistic Accretion Disk (inclined ellipse)
        float inclination = 0.36; // perspective squash
        vec2 diskUV = vec2(uv.x, uv.y / inclination);
        float diskDist = length(diskUV);
        float diskAngle = atan(diskUV.y, diskUV.x) + t * 0.9;

        // Accretion disk inner and outer limits
        float innerR = 0.35;
        float outerR = 1.35;

        if (diskDist > innerR && diskDist < outerR) {
          float normD = (diskDist - innerR) / (outerR - innerR);
          
          // Relativistic Doppler Beaming: moving toward left is brighter and bluer
          float doppler = 1.0 - (uv.x * 0.95) / (diskDist + 0.1);
          doppler = clamp(doppler, 0.3, 2.2);

          // Plasma turbulence noise
          float n = noise(vec2(diskAngle * 5.0, diskDist * 9.0 - t * 1.5));
          float n2 = noise(vec2(diskAngle * 12.0 - t * 2.5, diskDist * 16.0));
          float turbulence = (n * 0.65 + n2 * 0.35);

          // Disk opacity curve (soft edges, dense mid-core)
          float density = sin(normD * 3.14159) * (0.85 + 0.35 * turbulence) * doppler;

          // Color palette: Hot white/blue inner ring -> Vivid golden orange -> Deep cosmic crimson
          vec3 hotCore = vec3(0.9, 0.95, 1.0);
          vec3 midFlame = vec3(1.0, 0.58, 0.15);
          vec3 outerAmber = vec3(0.85, 0.18, 0.05);

          vec3 diskColor = mix(hotCore, midFlame, clamp(normD * 1.8, 0.0, 1.0));
          diskColor = mix(diskColor, outerAmber, clamp((normD - 0.45) * 1.8, 0.0, 1.0));

          // Lensed top/bottom ghost halo (Einstein ring of the disk behind black hole)
          float verticalLensing = exp(-abs(uv.y) * 9.0) * exp(-abs(uv.x) * 1.8) * 0.8;
          diskColor += midFlame * verticalLensing * doppler;

          col = mix(col, diskColor * 1.35, clamp(density, 0.0, 0.95));
        }

        // Photon Ring (intense bright golden boundary just above event horizon)
        float photonDist = abs(dist - rs * 1.15);
        if (photonDist < 0.045) {
          float photonIntensity = (1.0 - photonDist / 0.045) * 1.8;
          col += vec3(1.0, 0.85, 0.55) * photonIntensity;
        }

        // Inner Event Horizon (Pure Black Singularity)
        if (dist < rs) {
          float edgeSoft = smoothstep(rs, rs - 0.015, dist);
          col = mix(col, vec3(0.0), edgeSoft);
        }

        // Ambient cosmic glow
        col += vec3(0.08, 0.04, 0.12) * (1.0 / (dist + 0.6));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.program = this.createProgram(vsSource, fsSource);
    this.uResolution = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uWarp = this.gl.getUniformLocation(this.program, "u_warp");
    this.uStarsMode = this.gl.getUniformLocation(this.program, "u_starsMode");
  }

  createShader(type, source) {
    const s = this.gl.createShader(type);
    this.gl.shaderSource(s, source);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", this.gl.getShaderInfoLog(s));
      this.gl.deleteShader(s);
      return null;
    }
    return s;
  }

  createProgram(vsSource, fsSource) {
    const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
    const prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
      console.error("Program link error:", this.gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  initBuffers() {
    this.posBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
  }

  initEvents() {
    // Smooth mouse & touch responsiveness
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        this.mouse.targetX = (t.clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -((t.clientY / window.innerHeight) * 2 - 1);
      }
    }, { passive: true });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  triggerWarp(onComplete) {
    if (this.isWarping) return;
    this.isWarping = true;
    this.warpProgress = 0.0;
    const warpDuration = 2400; // 2.4s cinematic plunge
    const startWarpTime = performance.now();

    const warpStep = (now) => {
      const elapsed = now - startWarpTime;
      const t = Math.min(1.0, elapsed / warpDuration);
      // Ease in-out cubic
      this.warpProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      if (t < 1.0) {
        requestAnimationFrame(warpStep);
      } else {
        // Warp completed: turn scene into deep black space with tiny stars
        this.starsMode = true;
        this.isWarping = false;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(warpStep);
  }

  resetScene() {
    this.starsMode = false;
    this.isWarping = false;
    this.warpProgress = 0.0;
  }

  animate() {
    // Interpolate mouse for smooth orbital parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    const time = (performance.now() - this.startTime) * 0.001;

    if (this.gl && this.program) {
      this.gl.useProgram(this.program);

      this.gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
      this.gl.uniform1f(this.uTime, time);
      this.gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);
      this.gl.uniform1f(this.uWarp, this.warpProgress);
      this.gl.uniform1f(this.uStarsMode, this.starsMode ? 1.0 : 0.0);

      const aPos = this.gl.getAttribLocation(this.program, "a_position");
      this.gl.enableVertexAttribArray(aPos);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
      this.gl.vertexAttribPointer(aPos, 2, this.gl.FLOAT, false, 0, 0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    requestAnimationFrame(this.animate);
  }

  init2DFallback() {
    const ctx = this.canvas.getContext('2d');
    const draw = () => {
      ctx.fillStyle = "#03030c";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.beginPath();
      ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 100, 0, Math.PI * 2);
      ctx.fillStyle = "#ff6600";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 60, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      requestAnimationFrame(draw);
    };
    draw();
  }
}

window.BlackHoleEngine = BlackHoleEngine;
