/* ============================================================================
   STRATEJI AKADEMI - PRODUCTION-READY FRONTEND
   Backend API endpoints hazır, şu an localStorage ile demo çalışıyor
   ============================================================================ */

const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function setStatus(el, msg, type = "ok") {
  if (!el) return;
  el.classList.add("show");
  el.classList.remove("ok", "bad");
  el.classList.add(type === "ok" ? "ok" : "bad");
  el.textContent = msg;
  
  // Auto-hide after 5 seconds for success messages
  if (type === "ok") {
    setTimeout(() => {
      el.classList.remove("show");
    }, 5000);
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// REVEAL ANIMATIONS
// ============================================================================

(function initReveal() {
  const els = qsa(".reveal");
  if (!els.length) return;
  
  if (!("IntersectionObserver" in window)) {
    els.forEach(e => e.classList.add("in"));
    return;
  }
  
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
  );
  
  els.forEach(e => io.observe(e));
})();

// ============================================================================
// MOBILE DRAWER
// ============================================================================

(function initDrawer() {
  const burger = qs("[data-burger]");
  const drawer = qs("[data-drawer]");
  const closes = qsa("[data-close]");
  if (!burger || !drawer) return;

  const open = () => {
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  
  const close = () => {
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", () => {
    drawer.getAttribute("aria-hidden") === "true" ? open() : close();
  });
  
  closes.forEach(c => c.addEventListener("click", close));
  
  // Close on drawer links click
  qsa(".drawer-link").forEach(link => {
    link.addEventListener("click", close);
  });
})();

// ============================================================================
// STICKY CTA
// ============================================================================

(function initStickyCTA() {
  const bar = qs("[data-sticky-cta]");
  if (!bar) return;
  
  const onScroll = debounce(() => {
    const y = window.scrollY || 0;
    if (y > 600) bar.classList.add("show");
    else bar.classList.remove("show");
  }, 50);
  
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ============================================================================
// MODALS
// ============================================================================

(function initModals() {
  const opens = qsa("[data-modal-open]");
  const modals = qsa(".modal[data-modal]");
  const closeEls = qsa("[data-modal-close]");

  const closeAll = () => {
    modals.forEach(m => {
      m.classList.remove("show");
      m.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "";
  };

  opens.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-modal-open");
      const m = qs(`.modal[data-modal="${id}"]`);
      if (!m) return;
      
      closeAll();
      m.classList.add("show");
      m.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  closeEls.forEach(el => el.addEventListener("click", closeAll));
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
  });
})();

// ============================================================================
// DEVICE FINGERPRINTING
// ============================================================================

function getOrCreateDeviceId() {
  const key = "sa_device_id_v1";
  let id = localStorage.getItem(key);
  if (id) return id;

  // Generate device ID
  if (crypto?.randomUUID) {
    id = crypto.randomUUID();
  } else {
    const arr = new Uint8Array(16);
    if (crypto?.getRandomValues) crypto.getRandomValues(arr);
    else {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    id = [...arr].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  
  localStorage.setItem(key, id);
  return id;
}

// Render device ID on page
(function renderDeviceId() {
  const el = qs("#deviceIdText");
  if (!el) return;
  const id = getOrCreateDeviceId();
  el.textContent = id;
})();

// ============================================================================
// AUTHENTICATION SYSTEM
// Production ready - switch to API calls when backend is ready
// ============================================================================

const SA_AUTH = {
  // Config
  tokenKey: "sa_demo_token_v1",
  codeMaskKey: "sa_demo_code_mask_v1",
  boundKeyPrefix: "sa_demo_bound_",
  sessionKey: "sa_session_data",
  
  // API endpoints (ready for backend)
  API_BASE: "/api/v1", // Change to your backend URL
  endpoints: {
    validateCode: "/auth/validate-code",
    refreshSession: "/auth/refresh",
    logout: "/auth/logout",
    getModules: "/content/modules",
    trackProgress: "/analytics/progress",
  },

  // Normalize code
  normalize(code) {
    return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  },

  // Mask code for display
  mask(code) {
    if (code.length <= 8) return "SA-…";
    return `${code.slice(0, 7)}…${code.slice(-4)}`;
  },

  // Validate code format
  isValidCode(code) {
    // Demo code
    if (code === "SA-DEMO-2024") return true;
    
    // Production format: SA-XXXX-XXXX-XXXX
    return /^SA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
  },

  // Redeem code
  async redeem(code) {
    const deviceId = getOrCreateDeviceId();
    const norm = this.normalize(code);

    if (!this.isValidCode(norm)) {
      return {
        ok: false,
        message: "Geçersiz kod formatı. Kod şu formatta olmalı: SA-XXXX-XXXX-XXXX"
      };
    }

    // ========================================
    // BACKEND INTEGRATION POINT
    // Replace localStorage with API call:
    // ========================================
    /*
    try {
      const response = await fetch(`${this.API_BASE}${this.endpoints.validateCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: norm,
          deviceId: deviceId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { ok: false, message: data.message || 'Kod doğrulaması başarısız' };
      }
      
      // Store session
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.sessionKey, JSON.stringify({
        userId: data.userId,
        email: data.email,
        package: data.package,
        expiresAt: data.expiresAt
      }));
      localStorage.setItem(this.codeMaskKey, this.mask(norm));
      
      return { ok: true, message: 'Giriş başarılı! Dashboard\'a yönlendiriliyorsunuz...' };
      
    } catch (error) {
      console.error('Auth error:', error);
      return { ok: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
    */

    // DEMO MODE (current implementation)
    const boundKey = this.boundKeyPrefix + norm;
    const boundDevice = localStorage.getItem(boundKey);

    if (boundDevice && boundDevice !== deviceId) {
      return {
        ok: false,
        message: "Bu kod başka bir cihazda kullanılıyor. Tek cihaz politikası gereği giriş yapılamıyor."
      };
    }

    if (!boundDevice) {
      localStorage.setItem(boundKey, deviceId);
    }

    // Create demo session
    const session = {
      userId: "demo-user-" + deviceId.slice(0, 8),
      code: norm,
      deviceId: deviceId,
      loginAt: new Date().toISOString(),
      package: "premium-pro",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    localStorage.setItem(this.tokenKey, "demo-token-" + Date.now());
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem(this.codeMaskKey, this.mask(norm));

    return {
      ok: true,
      message: "✓ Giriş başarılı! Dashboard'a yönlendiriliyorsunuz..."
    };
  },

  // Logout
  async logout() {
    // ========================================
    // BACKEND INTEGRATION POINT
    // ========================================
    /*
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        await fetch(`${this.API_BASE}${this.endpoints.logout}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    */

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.codeMaskKey);
    localStorage.removeItem(this.sessionKey);
  },

  // Check if authenticated
  isAuthed() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    // Check session expiry
    const session = this.getSession();
    if (session?.expiresAt) {
      const expiry = new Date(session.expiresAt);
      if (expiry < new Date()) {
        this.logout();
        return false;
      }
    }

    return true;
  },

  // Get session data
  getSession() {
    const data = localStorage.getItem(this.sessionKey);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // Get masked code
  codeMask() {
    return localStorage.getItem(this.codeMaskKey) || "SA-…";
  }
};

// ============================================================================
// REDEEM PAGE
// ============================================================================

(function initRedeem() {
  const codeInput = qs("#codeInput");
  const btn = qs("#redeemBtn");
  const status = qs("#statusBox");
  if (!codeInput || !btn || !status) return;

  btn.addEventListener("click", async () => {
    const code = SA_AUTH.normalize(codeInput.value);
    
    if (!code) {
      setStatus(status, "Lütfen lisans kodunuzu girin.", "bad");
      return;
    }

    // Show loading state
    btn.disabled = true;
    btn.textContent = "Doğrulanıyor...";

    const res = await SA_AUTH.redeem(code);
    
    btn.disabled = false;
    btn.textContent = "Giriş Yap";

    if (!res.ok) {
      setStatus(status, res.message, "bad");
    } else {
      setStatus(status, res.message, "ok");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "./dashboard.html";
      }, 1000);
    }
  });

  // Enter key to submit
  codeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btn.click();
  });
})();

// ============================================================================
// DASHBOARD
// ============================================================================

(function initDashboard() {
  const listEl = qs("#lessonList");
  const titleEl = qs("#lessonTitle");
  const metaEl = qs("#lessonMeta");
  const wmEl = qs("#wmText");
  const logoutBtn = qs("#logoutBtn");
  const progressChip = qs("#progressChip");
  const progressBar = qs("#progressBar");
  const progressText = qs("#progressText");
  const contentEl = qs("#moduleContent");

  if (!listEl || !titleEl) return;

  // Check auth (optional - can force redirect)
  // if (!SA_AUTH.isAuthed()) {
  //   window.location.href = "./redeem.html";
  //   return;
  // }

  const deviceId = getOrCreateDeviceId();
  const session = SA_AUTH.getSession();
  
  if (wmEl) {
    const timestamp = new Date().toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    wmEl.textContent = `${SA_AUTH.codeMask()} • ${deviceId.slice(0, 8)}… • ${timestamp}`;
  }

  // Module data - Tüm dersler açık
  const modules = [
    {
      id: "m1",
      title: "Risk Yönetimi Temelleri",
      description: "Position sizing, stop-loss mantığı, sermaye koruma. Trading'in %80'i burası.",
      topics: ["Position sizing nasıl yapılır?", "Stop-loss seviyesi belirleme", "Sermaye koruma stratejileri", "Risk/Reward oranı", "Maksimum kayıp limitleri"],
      unlocked: true
    },
    {
      id: "m2",
      title: "Teknik Analiz - İşe Yarayanlar",
      description: "100 indikatör değil, 3-4 etkili araç. Support, resistance, trend, volume.",
      topics: ["Support ve Resistance", "Trend çizgileri", "Volume analizi", "Basit ve etkili indikatörler", "Gerçek örnekler"],
      unlocked: true
    },
    {
      id: "m3",
      title: "Piyasa Psikolojisi",
      description: "FOMO, panic selling, revenge trading. En büyük düşman: sen.",
      topics: ["FOMO'dan kaçınma", "Panic selling kontrolü", "Revenge trading tuzağı", "Disiplinli trading", "Duygusal karar vermeme"],
      unlocked: true
    },
    {
      id: "m4",
      title: "Giriş ve Çıkış Stratejileri",
      description: "Ne zaman giriyorsun? Nerede çıkıyorsun? Plan olmadan işlem yok.",
      topics: ["Giriş noktası belirleme", "Çıkış stratejileri", "Trailing stop kullanımı", "Kar realizasyonu", "Plan yapma ve uygulama"],
      unlocked: true
    },
    {
      id: "m5",
      title: "Portföy Yönetimi",
      description: "Tüm paran bir hissede olmamalı. Diversification, correlation, rebalancing.",
      topics: ["Diversifikasyon nedir?", "Correlation analizi", "Portföy dengeleme", "Sektör dağılımı", "Risk dağıtımı"],
      unlocked: true
    },
    {
      id: "m6",
      title: "Gerçek Piyasa Örnekleri",
      description: "Canlı analizler, geçmiş trade'lerin incelemesi, neler ters gitti, neler doğru.",
      topics: ["Başarılı trade örnekleri", "Hatalı trade analizleri", "Canlı piyasa okuması", "Post-trade analizi", "Sürekli gelişim"],
      unlocked: true
    }
  ];

  // Render modules
  listEl.innerHTML = "";
  modules.forEach((m, idx) => {
    const btn = document.createElement("button");
    btn.className = "lesson-btn";
    btn.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span>${m.title}</span>
        <span style="color:var(--a)">✓</span>
      </div>
      <small>Açık • İzleyebilirsin</small>
    `;
    
    btn.addEventListener("click", () => {
      titleEl.textContent = m.title;
      if (metaEl) metaEl.textContent = "Tüm videolar mevcut";
      
      if (contentEl) {
        contentEl.innerHTML = `
          <p style="margin-bottom:12px">${m.description}</p>
          <div style="margin-bottom:12px">
            <strong style="display:block;margin-bottom:6px">Bu derste neler var:</strong>
            <ul style="margin:0;padding-left:20px;color:var(--muted)">
              ${m.topics.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Mark as active
      qsa('.lesson-btn').forEach(b => b.style.background = 'rgba(0,0,0,.20)');
      btn.style.background = 'rgba(0,255,136,.08)';
    });
    
    listEl.appendChild(btn);

    // Select first module by default
    if (idx === 0) btn.click();
  });

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (!confirm("Çıkış yapmak istediğinizden emin misiniz?")) return;
      
      await SA_AUTH.logout();
      window.location.href = "./redeem.html";
    });
  }
})();

// ============================================================================
// COUNT-UP ANIMATION
// ============================================================================

(function initCountUp() {
  const wrap = qs("[data-countup]");
  if (!wrap) return;
  const nums = qsa("[data-target]", wrap);

  const animate = (el, target) => {
    const start = 0;
    const dur = 800;
    const t0 = performance.now();
    
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.floor(start + (target - start) * (p * p * (3 - 2 * p))); // smoothstep
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(n => animate(n, parseInt(n.getAttribute("data-target"), 10)));
    return;
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        nums.forEach(n => animate(n, parseInt(n.getAttribute("data-target"), 10)));
        io.disconnect();
      });
    },
    { threshold: 0.4 }
  );

  io.observe(wrap);
})();

// ============================================================================
// ANALYTICS & TRACKING (ready for backend)
// ============================================================================

const SA_ANALYTICS = {
  // Track page view
  pageView(page) {
    // Production: send to backend
    console.log('📊 Page view:', page);
    
    /* Backend integration:
    fetch(`${SA_AUTH.API_BASE}/analytics/pageview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(SA_AUTH.tokenKey)}`
      },
      body: JSON.stringify({
        page,
        timestamp: new Date().toISOString(),
        deviceId: getOrCreateDeviceId()
      })
    });
    */
  },

  // Track video progress
  videoProgress(moduleId, progress, duration) {
    console.log('📹 Video progress:', { moduleId, progress, duration });
    
    /* Backend integration:
    fetch(`${SA_AUTH.API_BASE}/analytics/video-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(SA_AUTH.tokenKey)}`
      },
      body: JSON.stringify({
        moduleId,
        progress,
        duration,
        timestamp: new Date().toISOString()
      })
    });
    */
  },

  // Track module completion
  moduleComplete(moduleId) {
    console.log('✅ Module completed:', moduleId);
    
    /* Backend integration:
    fetch(`${SA_AUTH.API_BASE}/analytics/module-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(SA_AUTH.tokenKey)}`
      },
      body: JSON.stringify({
        moduleId,
        timestamp: new Date().toISOString()
      })
    });
    */
  }
};

// Track current page
(function trackPage() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  SA_ANALYTICS.pageView(page);
})();

// ============================================================================
// ERROR HANDLING & LOGGING
// ============================================================================

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  // Production: send to error tracking service (Sentry, etc.)
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  // Production: send to error tracking service
});

// ============================================================================
// SERVICE WORKER (for offline support - optional)
// ============================================================================

/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
*/

console.log('%c🚀 Strateji Akademi Platform', 'color: #00ff88; font-size: 16px; font-weight: bold');
console.log('%cBackend integration ready • Production grade', 'color: #0099ff; font-size: 12px');
