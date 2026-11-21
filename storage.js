/**
 * Celestial Storage Manager
 * 100% Static & Serverless Ready with Multi-Tier Storage:
 * 1. URL Payload Compression (Works purely statically on Vercel without any backend)
 * 2. Client-side LocalStorage (with strict 7-day auto-purge)
 * 3. Free Cloud KV Bucket (Cross-device code-only lookup on static hosting)
 * 4. Local Python API fallback (When running server.py locally)
 */

class CelestialStorageManager {
  constructor() {
    this.STORAGE_KEY = 'celestial_greetings_db';
    this.SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604,800,000 ms
    // Free anonymous public KV bucket for cross-device code lookups on static Vercel
    this.CLOUD_KV_URL = 'https://kvdb.io/6PZ8XyqYtEaQvU9x4mK2M1';
  }

  // --- Compression Utilities ---
  compressToUrl(obj) {
    try {
      const jsonStr = JSON.stringify(obj);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64 = btoa(binary);
      // Make URL-safe
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      console.warn('URL compression failed:', e);
      return null;
    }
  }

  decompressFromUrl(str) {
    if (!str) return null;
    try {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('URL decompression failed:', e);
      return null;
    }
  }

  normalizeCode(codeStr) {
    if (!codeStr) return '';
    return codeStr.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  formatCode(rawCode) {
    const clean = this.normalizeCode(rawCode);
    const parts = [];
    for (let i = 0; i < clean.length && i < 12; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join('-');
  }

  // --- LocalStorage Operations (with 7-day Auto-Purge) ---
  loadLocalDB() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveLocalDB(db) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  cleanExpiredLocal() {
    const db = this.loadLocalDB();
    const now = Date.now();
    const validDb = {};
    let purgedCount = 0;

    Object.keys(db).forEach(code => {
      const item = db[code];
      const created = item.createdAt || now;
      if (now - created < this.SEVEN_DAYS_MS) {
        validDb[code] = item;
      } else {
        purgedCount++;
      }
    });

    if (purgedCount > 0) {
      console.log(`[Storage] Auto-purged ${purgedCount} expired greeting(s) (> 7 days old).`);
      this.saveLocalDB(validDb);
    }
    return validDb;
  }

  // --- Main Save Handler (Multi-Tier) ---
  async saveGreeting(payload) {
    const normCode = this.normalizeCode(payload.code);
    if (!normCode || normCode.length !== 12) {
      return { success: false, error: 'Code must be exactly 12 alphanumeric characters.' };
    }

    const now = Date.now();
    payload.createdAt = now;
    payload.expiresAt = now + this.SEVEN_DAYS_MS;
    payload.code = normCode;

    // 1. Save to LocalStorage with auto-purge
    const db = this.cleanExpiredLocal();
    db[normCode] = payload;
    this.saveLocalDB(db);

    // 2. Generate Compressed URL for 100% Static Zero-Backend Sharing
    // We create a lightweight copy for the URL (stripping heavy media if any)
    const urlPayload = {
      c: normCode,
      w: payload.wish,
      t: payload.wishType,
      d: payload.date,
      s: payload.slideData,
      a: now
    };
    if (payload.audioData && payload.audioData.dataUrl && payload.audioData.dataUrl.length < 60000) {
      urlPayload.m = payload.audioData;
    }
    const compressedStr = this.compressToUrl(urlPayload);

    // Build the direct share link
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = compressedStr 
      ? `${baseUrl}?code=${normCode}&d=${compressedStr}`
      : `${baseUrl}?code=${normCode}`;

    // 3. Background Cloud Sync (Cross-Device Lookup without Python)
    this.syncToCloud(normCode, payload).catch(() => {});

    // 4. Background Python Server Sync (If running locally with server.py)
    this.syncToLocalPython(payload).catch(() => {});

    return {
      success: true,
      code: normCode,
      formattedCode: this.formatCode(normCode),
      shareUrl: shareUrl,
      expiresAt: payload.expiresAt,
      validDays: 7
    };
  }

  // --- Main Fetch Handler (Multi-Tier) ---
  async getGreeting(rawCode) {
    const normCode = this.normalizeCode(rawCode);
    if (!normCode || normCode.length !== 12) {
      return { success: false, error: 'ACCESS DENIED: Please enter a 12-digit code.' };
    }

    const now = Date.now();

    // Tier 1: Check LocalStorage
    const db = this.cleanExpiredLocal();
    const localItem = db[normCode];
    if (localItem) {
      if (now - (localItem.createdAt || now) < this.SEVEN_DAYS_MS) {
        return {
          success: true,
          code: normCode,
          greeting: localItem,
          expiresAt: localItem.createdAt + this.SEVEN_DAYS_MS,
          remainingSeconds: Math.floor((localItem.createdAt + this.SEVEN_DAYS_MS - now) / 1000)
        };
      } else {
        delete db[normCode];
        this.saveLocalDB(db);
        return { success: false, expired: true, error: 'ACCESS DENIED: Greeting expired (> 7 days).' };
      }
    }

    // Tier 2: Check URL compressed data in current browser location
    const urlItem = this.checkUrlForCode(normCode);
    if (urlItem) {
      if (now - (urlItem.createdAt || now) < this.SEVEN_DAYS_MS) {
        // Cache locally for fast future lookups
        db[normCode] = urlItem;
        this.saveLocalDB(db);
        return {
          success: true,
          code: normCode,
          greeting: urlItem,
          expiresAt: urlItem.createdAt + this.SEVEN_DAYS_MS,
          remainingSeconds: Math.floor((urlItem.createdAt + this.SEVEN_DAYS_MS - now) / 1000)
        };
      } else {
        return { success: false, expired: true, error: 'ACCESS DENIED: Greeting expired (> 7 days).' };
      }
    }

    // Tier 3: Fetch from Local Python Server (If running locally)
    try {
      const pyRes = await fetch(`/api/greetings/${normCode}`, { signal: AbortSignal.timeout(1500) });
      if (pyRes.ok) {
        const data = await pyRes.json();
        if (data && data.success && data.greeting) {
          db[normCode] = data.greeting;
          this.saveLocalDB(db);
          return data;
        }
      }
    } catch (e) {
      // Local server not running or not reachable; proceed to cloud tier
    }

    // Tier 4: Fetch from Cloud KV Store (Cross-device static lookup)
    try {
      const cloudRes = await fetch(`${this.CLOUD_KV_URL}/${normCode}`, { signal: AbortSignal.timeout(3000) });
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData && (cloudData.wish || cloudData.slideData)) {
          const created = cloudData.createdAt || now;
          if (now - created < this.SEVEN_DAYS_MS) {
            db[normCode] = cloudData;
            this.saveLocalDB(db);
            return {
              success: true,
              code: normCode,
              greeting: cloudData,
              expiresAt: created + this.SEVEN_DAYS_MS,
              remainingSeconds: Math.floor((created + this.SEVEN_DAYS_MS - now) / 1000)
            };
          } else {
            return { success: false, expired: true, error: 'ACCESS DENIED: Greeting expired (> 7 days).' };
          }
        }
      }
    } catch (e) {
      console.warn('Cloud KV lookup unavailable:', e);
    }

    return {
      success: false,
      error: 'ACCESS DENIED // CODE NOT RECOGNIZED OR EXPIRED (> 7 DAYS)'
    };
  }

  // --- Background Cloud & Python Helpers ---
  async syncToCloud(code, payload) {
    try {
      // Save with 7-day TTL (604800 seconds)
      await fetch(`${this.CLOUD_KV_URL}/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '604800'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Cloud sync skipped (offline or blocked).');
    }
  }

  async syncToLocalPython(payload) {
    try {
      await fetch('/api/greetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Silently ignore if running statically without Python
    }
  }

  checkUrlForCode(targetCode) {
    const params = new URLSearchParams(window.location.search);
    const codeParam = this.normalizeCode(params.get('code'));
    const compressed = params.get('d') || window.location.hash.replace(/^#g=/, '');

    if (compressed) {
      const decoded = this.decompressFromUrl(compressed);
      if (decoded) {
        // Expand short keys
        const greeting = {
          code: decoded.c || codeParam,
          wish: decoded.w,
          wishType: decoded.t,
          date: decoded.d,
          slideData: decoded.s,
          audioData: decoded.m || null,
          createdAt: decoded.a || Date.now()
        };
        if (!targetCode || this.normalizeCode(greeting.code) === targetCode) {
          return greeting;
        }
      }
    }
    return null;
  }

  // Parse URL on Initial Load
  parseUrlOnLoad() {
    this.cleanExpiredLocal();

    const params = new URLSearchParams(window.location.search);
    const rawCode = params.get('code');
    const normCode = this.normalizeCode(rawCode);
    const compressed = params.get('d') || (window.location.hash.startsWith('#g=') ? window.location.hash.substring(3) : null);

    let greetingFromUrl = null;
    if (compressed) {
      const decoded = this.decompressFromUrl(compressed);
      if (decoded) {
        greetingFromUrl = {
          code: decoded.c || normCode,
          wish: decoded.w,
          wishType: decoded.t,
          date: decoded.d,
          slideData: decoded.s,
          audioData: decoded.m || null,
          createdAt: decoded.a || Date.now()
        };
        // Cache immediately in local storage
        if (greetingFromUrl.code) {
          const db = this.loadLocalDB();
          db[greetingFromUrl.code] = greetingFromUrl;
          this.saveLocalDB(db);
        }
      }
    }

    return {
      code: normCode,
      greeting: greetingFromUrl
    };
  }
}

window.CelestialStorage = new CelestialStorageManager();
