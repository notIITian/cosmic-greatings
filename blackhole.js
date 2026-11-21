/**
 * Handcrafted 3D Black Hole Engine
 * Dual-Arc Relativistic Accretion Disk, Doppler Beaming & Gravitational Lensing.
 * Inspired by Kip Thorne & Interstellar Gargantua.
 * 60fps on Android Chrome & Desktop WebGL.
 */

class BlackHoleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.warn("WebGL not supported; using fallback.");
      return;
    }

    this.isWarping = false;
    this.warpProgress = 0.0;
    this.startTime = performance.now();
    this.mouse = { x: 0.0, y: 0.0, targetX: 0.0, targetY: 0.0 };
    this.starsMode = false;
    
    // Theme palette: 0 = Gargantua Gold, 1 = Cyber Cyan, 2 = Cosmic Violet, 3 = Supernova Crimson
    this.themeId = 0; 

    this.initShaders();
    this.initBuffers();
    this.initEvents();
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setTheme(themeName) {
    const themes = { 'gargantua': 0, 'cyber': 1, 'violet': 2, 'supernova': 3 };
    this.themeId = themes[themeName] !== undefined ? themes[themeName] : 0;
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

    // Handcrafted Relativistic Black Hole Shader with Dual-Arc Lensing & Doppler Beaming
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_warp;
      uniform float u_starsMode;
      uniform int u_theme;
      varying vec2 v_uv;

      // Hash & Noise
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

      float fbm(vec2 p) {
        float v = 0.0;
        v += 0.500 * noise(p); p *= 2.02;
        v += 0.250 * noise(p); p *= 2.03;
        v += 0.125 * noise(p); p *= 2.01;
        return v;
      }

      // Handcrafted Starfield with subtle sparkling twinkling
      vec3 renderHandcraftedStars(vec2 uv, float t) {
        vec3 col = vec3(0.003, 0.004, 0.010); // Deep velvety cosmos
        vec2 grid = floor(uv * 140.0);
        float h = hash(grid);
        if (h > 0.978) {
          float sparkle = sin(t * 3.5 + h * 6.28) * 0.45 + 0.55;
          float size = (h - 0.978) * 50.0;
          vec3 starTint = mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.88, 0.7), hash(grid + 7.7));
          col += starTint * size * sparkle;
        }
        return col;
      }

      // Color Palette Selector
      void getThemeColors(int th, float normD, out vec3 hotCore, out vec3 midBody, out vec3 outerGlow) {
        if (th == 1) {
          // Cyber Cyan
          hotCore = vec3(0.85, 0.98, 1.0);
          midBody = vec3(0.06, 0.72, 0.92);
          outerGlow = vec3(0.04, 0.25, 0.55);
        } else if (th == 2) {
          // Cosmic Violet
          hotCore = vec3(0.95, 0.88, 1.0);
          midBody = vec3(0.68, 0.25, 0.95);
          outerGlow = vec3(0.35, 0.05, 0.55);
        } else if (th == 3) {
          // Supernova Crimson
          hotCore = vec3(1.0, 0.95, 0.85);
          midBody = vec3(0.95, 0.28, 0.12);
          outerGlow = vec3(0.55, 0.05, 0.04);
        } else {
          // Gargantua Gold (Default Interstellar)
          hotCore = vec3(1.0, 0.96, 0.88);
          midBody = vec3(1.0, 0.62, 0.18);
          outerGlow = vec3(0.82, 0.22, 0.05);
        }
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        float t = u_time * 0.75;

        // Subtle interactive perspective tilt
        uv += u_mouse * 0.10;

        // If in deep black space with tiny stars mode (after warp):
        if (u_starsMode >= 1.0) {
          vec3 starryVoid = renderHandcraftedStars(uv + vec2(0.04 * t, 0.0), t * 0.6);
          gl_FragColor = vec4(starryVoid, 1.0);
          return;
        }

        // Warp effect: Relativistic streak plunge into singularity
        if (u_warp > 0.0) {
          float speed = u_warp * 16.0;
          float r = length(uv);
          float angle = atan(uv.y, uv.x);
          float streak = fbm(vec2(angle * 14.0, r * 5.0 - t * speed)) * u_warp;
          
          vec3 warpCore = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.95, 0.9), streak);
          vec3 darkVoid = renderHandcraftedStars(uv, t);
          vec3 outCol = mix(warpCore * (1.0 - u_warp * 0.8), darkVoid, clamp((u_warp - 0.5) * 2.0, 0.0, 1.0));
          
          gl_FragColor = vec4(outCol, 1.0);
          return;
        }

        // --- RELATIVISTIC BLACK HOLE RENDERING ---
        float dist = length(uv);
        float rs = 0.22; // Schwarzschild radius (event horizon)

        // Gravitational deflection of background light rays
        float deflection = (rs * rs * 0.52) / max(dist, 0.001);
        vec2 lensedUV = uv + normalize(uv) * deflection;

        // Distant distorted stars
        vec3 col = renderHandcraftedStars(lensedUV * 1.6, t);

        // Theme colors
        vec3 hotCore, midBody, outerGlow;
        getThemeColors(u_theme, 0.5, hotCore, midBody, outerGlow);

        // 1. Accretion Disk (Inclined Elliptical Plane)
        float inclination = 0.38; // 3D tilt
        vec2 diskUV = vec2(uv.x, uv.y / inclination);
        float diskDist = length(diskUV);
        float diskAngle = atan(diskUV.y, diskUV.x) + t * 0.85;

        float innerR = 0.32;
        float outerR = 1.45;

        if (diskDist > innerR && diskDist < outerR) {
          float normD = (diskDist - innerR) / (outerR - innerR);

          // Relativistic Doppler Beaming: Approaching plasma (left) is brighter and hotter
          float doppler = 1.0 - (uv.x * 0.92) / (diskDist + 0.15);
          doppler = clamp(doppler, 0.35, 2.3);

          // Multi-octave turbulent plasma filaments
          float n1 = fbm(vec2(diskAngle * 6.0, diskDist * 10.0 - t * 1.8));
          float n2 = noise(vec2(diskAngle * 14.0 - t * 3.0, diskDist * 18.0));
          float plasma = (n1 * 0.7 + n2 * 0.3);

          // Radial density profile (smooth fade edges, fiery core)
          float density = sin(normD * 3.14159) * (0.8 + 0.4 * plasma) * doppler;

          // Color gradient across disk
          vec3 diskColor = mix(hotCore, midBody, clamp(normD * 1.9, 0.0, 1.0));
          diskColor = mix(diskColor, outerGlow, clamp((normD - 0.42) * 1.8, 0.0, 1.0));

          col = mix(col, diskColor * 1.45, clamp(density, 0.0, 0.96));
        }

        // 2. Gravitational Lensing Secondary Arcs (Top and Bottom Einstein Haloes)
        // Light from the rear disk bent above and beneath the black hole
        float topLensingDist = abs(uv.y - sqrt(max(0.0, rs * rs * 1.6 - uv.x * uv.x)));
        if (topLensingDist < 0.12 && abs(uv.x) < 0.7) {
          float lensedIntensity = exp(-topLensingDist * 22.0) * exp(-abs(uv.x) * 1.6) * 1.1;
          col += midBody * lensedIntensity;
        }

        float botLensingDist = abs(uv.y + sqrt(max(0.0, rs * rs * 1.6 - uv.x * uv.x)));
        if (botLensingDist < 0.08 && abs(uv.x) < 0.6) {
          float botIntensity = exp(-botLensingDist * 28.0) * exp(-abs(uv.x) * 2.2) * 0.7;
          col += outerGlow * botIntensity;
        }

        // 3. Photon Sphere Ring (Ultra-bright luminous boundary at r = 1.5 * rs)
        float photonR = rs * 1.18;
        float photonDist = abs(dist - photonR);
        if (photonDist < 0.038) {
          float photonIntensity = (1.0 - photonDist / 0.038) * 2.2;
          col += hotCore * photonIntensity;
        }

        // 4. Inward-spiraling hot plasma matter streaks
        float spiralAngle = angle + log(dist + 0.01) * 3.2 - t * 1.2;
        float matterStream = smoothstep(0.7, 0.95, sin(spiralAngle * 4.0)) * (1.0 - smoothstep(rs, outerR * 0.7, dist));
        col += midBody * matterStream * 0.35;

        // 5. Central Event Horizon (Absolute Void Black Hole Shadow)
        if (dist < rs) {
          float edgeSoft = smoothstep(rs, rs - 0.018, dist);
          col = mix(col, vec3(0.0), edgeSoft);
        }

        // Ambient celestial haze
        col += outerGlow * 0.08 * (1.0 / (dist + 0.5));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.program = this.createProgram(vsSource, fsSource);
    this.uResolution = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uWarp = this.gl.getUniformLocation(this.program, "u_warp");
    this.uStarsMode = this.gl.getUniformLocation(this.program, "u_starsMode");
    this.uTheme = this.gl.getUniformLocation(this.program, "u_theme");
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
      this.warpProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      if (t < 1.0) {
        requestAnimationFrame(warpStep);
      } else {
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
      this.gl.uniform1i(this.uTheme, this.themeId);

      const aPos = this.gl.getAttribLocation(this.program, "a_position");
      this.gl.enableVertexAttribArray(aPos);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
      this.gl.vertexAttribPointer(aPos, 2, this.gl.FLOAT, false, 0, 0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    requestAnimationFrame(this.animate);
  }
}

window.BlackHoleEngine = BlackHoleEngine;
