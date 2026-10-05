/**
 * TchotchoPay Cookie Consent Banner
 * GDPR compliant — EN / HT / FR / ES
 */
(function () {
  "use strict";

  const STORAGE_KEY = "tcp_cookie_consent";
  const CONSENT_VERSION = "1";

  // Already consented? Skip everything
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const s = JSON.parse(stored);
      if (s.version === CONSENT_VERSION) {
        if (s.analytics) enableAnalytics();
        return;
      }
    } catch (e) {}
  }

  // ── Language detection ────────────────────────────────────────────────────
  const lang = (navigator.language || "en").toLowerCase().split("-")[0];
  const T = {
    en: {
      message: "We use cookies to improve your experience and analyze site traffic. By clicking \"Accept All\", you agree to our use of cookies.",
      accept: "Accept All",
      decline: "Essential Only",
      policy: "Cookie Policy",
    },
    ht: {
      message: "Nou itilize cookies pou amelyore eksperyans ou epi analize trafik sit la. Lè ou klike \"Aksepte Tout\", ou dakò ak itilizasyon cookies nou yo.",
      accept: "Aksepte Tout",
      decline: "Esansyèl Sèlman",
      policy: "Politik Cookies",
    },
    fr: {
      message: "Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. En cliquant sur \"Tout accepter\", vous acceptez notre utilisation des cookies.",
      accept: "Tout accepter",
      decline: "Essentiel seulement",
      policy: "Politique cookies",
    },
    es: {
      message: "Usamos cookies para mejorar su experiencia y analizar el tráfico. Al hacer clic en \"Aceptar todo\", acepta nuestro uso de cookies.",
      accept: "Aceptar todo",
      decline: "Solo esenciales",
      policy: "Política de cookies",
    },
  };
  const t = T[lang] || T.en;

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #tcp-cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999999;
      background: #020B2D;
      border-top: 2px solid #1055CC;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: translateY(100%);
      transition: transform 0.35s ease;
    }
    #tcp-cookie-banner.tcp-show { transform: translateY(0); }

    #tcp-cookie-text {
      flex: 1;
      min-width: 260px;
      font-size: 13.5px;
      line-height: 1.6;
      color: #c8d0e0;
      margin: 0;
    }
    #tcp-cookie-text a {
      color: #00AEEF;
      text-decoration: underline;
      white-space: nowrap;
    }

    #tcp-cookie-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .tcp-cookie-btn {
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-family: inherit;
      white-space: nowrap;
      transition: transform 0.15s, opacity 0.15s;
    }
    .tcp-cookie-btn:hover { opacity: 0.88; transform: translateY(-1px); }

    #tcp-cookie-accept {
      background: linear-gradient(135deg, #1055CC, #00AEEF);
      color: #fff;
    }
    #tcp-cookie-decline {
      background: transparent;
      color: #8899bb;
      border: 1px solid #334;
    }
    #tcp-cookie-decline:hover { color: #fff; border-color: #556; }

    @media (max-width: 600px) {
      #tcp-cookie-banner { padding: 14px 16px; gap: 12px; }
      #tcp-cookie-actions { width: 100%; justify-content: flex-end; }
    }
  `;
  document.head.appendChild(style);

  // ── Banner HTML ───────────────────────────────────────────────────────────
  const banner = document.createElement("div");
  banner.id = "tcp-cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <p id="tcp-cookie-text">
      ${t.message}
      <a href="/terms.html#cookies" target="_blank">${t.policy}</a>
    </p>
    <div id="tcp-cookie-actions">
      <button class="tcp-cookie-btn" id="tcp-cookie-decline">${t.decline}</button>
      <button class="tcp-cookie-btn" id="tcp-cookie-accept">${t.accept}</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Animate in after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add("tcp-show"));
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  function saveConsent(analytics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      analytics,
      date: new Date().toISOString(),
    }));
    banner.classList.remove("tcp-show");
    setTimeout(() => banner.remove(), 400);
    if (analytics) enableAnalytics();
  }

  document.getElementById("tcp-cookie-accept").addEventListener("click", () => saveConsent(true));
  document.getElementById("tcp-cookie-decline").addEventListener("click", () => saveConsent(false));

  // ── Analytics opt-in ──────────────────────────────────────────────────────
  function enableAnalytics() {
    // Enable GA4 if it was loaded in deferred mode
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
    }
  }
})();
