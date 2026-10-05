/**
 * TchotchoPay AI Chat Widget
 * Multilingual: English · Kreyòl · Français · Español
 * Powered by OpenAI via Netlify Function
 */
(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────────
  const API_URL = "/.netlify/functions/chat";

  const UI = {
    en: {
      title: "TchotchoPay Assistant",
      subtitle: "Ask me anything • 24/7",
      placeholder: "Type your message...",
      send: "Send",
      welcome: "👋 Hello! I'm your TchotchoPay Assistant. I can help you send money to Haiti, check fees, or answer any questions. How can I help you today?",
      error: "Sorry, something went wrong. Please try again.",
      typing: "Typing...",
    },
    ht: {
      title: "Asistan TchotchoPay",
      subtitle: "Poze kesyon • 24/7",
      placeholder: "Ekri mesaj ou...",
      send: "Voye",
      welcome: "👋 Bonjou! Mwen se Asistan TchotchoPay ou a. Mwen ka ede ou voye lajan Ayiti, tcheke frè, oswa reponn nenpòt kesyon. Kijan mwen ka ede ou jodi a?",
      error: "Padon, yon bagay mal pase. Tanpri eseye ankò.",
      typing: "Ap ekri...",
    },
    fr: {
      title: "Assistant TchotchoPay",
      subtitle: "Posez vos questions • 24/7",
      placeholder: "Écrivez votre message...",
      send: "Envoyer",
      welcome: "👋 Bonjour! Je suis votre Assistant TchotchoPay. Je peux vous aider à envoyer de l'argent en Haïti, vérifier les frais ou répondre à vos questions. Comment puis-je vous aider aujourd'hui?",
      error: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      typing: "En train d'écrire...",
    },
    es: {
      title: "Asistente TchotchoPay",
      subtitle: "Pregúntame algo • 24/7",
      placeholder: "Escribe tu mensaje...",
      send: "Enviar",
      welcome: "👋 ¡Hola! Soy tu Asistente TchotchoPay. Puedo ayudarte a enviar dinero a Haití, verificar tarifas o responder cualquier pregunta. ¿En qué puedo ayudarte hoy?",
      error: "Lo sentimos, algo salió mal. Por favor intenta de nuevo.",
      typing: "Escribiendo...",
    },
  };

  // Detect browser language
  function detectLang() {
    const lang = (navigator.language || navigator.userLanguage || "en")
      .toLowerCase()
      .split("-")[0];
    if (lang === "ht") return "ht";
    if (lang === "fr") return "fr";
    if (lang === "es") return "es";
    return "en";
  }

  let currentLang = detectLang();
  let t = UI[currentLang];
  let conversationHistory = [];
  let isTyping = false;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --tcp-navy: #020B2D;
      --tcp-blue: #0A1F6E;
      --tcp-mid: #1055CC;
      --tcp-cyan: #00AEEF;
      --tcp-green: #00C896;
      --tcp-gold: #F7B731;
    }

    #tcp-chat-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--tcp-mid), var(--tcp-cyan));
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,174,239,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }
    #tcp-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,174,239,0.6);
    }
    #tcp-chat-btn svg { width: 28px; height: 28px; fill: #fff; }
    #tcp-chat-btn .tcp-close { display: none; }
    #tcp-chat-btn.open .tcp-chat-icon { display: none; }
    #tcp-chat-btn.open .tcp-close { display: block; }

    #tcp-chat-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 12px 50px rgba(2,11,45,0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99998;
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s ease, opacity 0.25s ease;
      transform-origin: bottom right;
    }
    #tcp-chat-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    #tcp-chat-header {
      background: linear-gradient(135deg, var(--tcp-navy) 0%, var(--tcp-blue) 100%);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #tcp-chat-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--tcp-mid), var(--tcp-cyan));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #tcp-chat-avatar svg { width: 22px; height: 22px; fill: #fff; }
    #tcp-chat-header-text { flex: 1; }
    #tcp-chat-title {
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
    }
    #tcp-chat-subtitle {
      color: var(--tcp-cyan);
      font-size: 11.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 2px 0 0;
    }
    #tcp-online-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--tcp-green);
      box-shadow: 0 0 0 2px rgba(0,200,150,0.3);
      animation: tcp-pulse 2s infinite;
      flex-shrink: 0;
    }
    @keyframes tcp-pulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(0,200,150,0.3); }
      50% { box-shadow: 0 0 0 5px rgba(0,200,150,0.1); }
    }

    #tcp-lang-bar {
      background: rgba(255,255,255,0.07);
      display: flex;
      gap: 4px;
      padding: 6px 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }
    .tcp-lang-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.25);
      background: transparent;
      color: rgba(255,255,255,0.65);
      cursor: pointer;
      transition: all 0.15s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .tcp-lang-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .tcp-lang-btn.active {
      background: var(--tcp-cyan);
      border-color: var(--tcp-cyan);
      color: var(--tcp-navy);
    }

    #tcp-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f5f7fb;
      scroll-behavior: smooth;
    }
    #tcp-messages::-webkit-scrollbar { width: 4px; }
    #tcp-messages::-webkit-scrollbar-track { background: transparent; }
    #tcp-messages::-webkit-scrollbar-thumb { background: #ccd; border-radius: 4px; }

    .tcp-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.55;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      word-break: break-word;
    }
    .tcp-msg.bot {
      align-self: flex-start;
      background: #fff;
      color: #1a1a2e;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .tcp-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, var(--tcp-mid), var(--tcp-cyan));
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    #tcp-typing-indicator {
      align-self: flex-start;
      background: #fff;
      padding: 10px 16px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: none;
      align-items: center;
      gap: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    #tcp-typing-indicator.show { display: flex; }
    .tcp-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--tcp-mid);
      animation: tcp-bounce 1.2s infinite;
    }
    .tcp-dot:nth-child(2) { animation-delay: 0.2s; }
    .tcp-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes tcp-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    #tcp-input-area {
      padding: 12px 14px;
      background: #fff;
      border-top: 1px solid #eaeef4;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
    }
    #tcp-input {
      flex: 1;
      border: 1.5px solid #dde3ef;
      border-radius: 22px;
      padding: 10px 14px;
      font-size: 13.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      outline: none;
      resize: none;
      min-height: 40px;
      max-height: 100px;
      line-height: 1.4;
      color: #1a1a2e;
      background: #f8fafd;
      transition: border-color 0.2s;
    }
    #tcp-input:focus { border-color: var(--tcp-mid); background: #fff; }
    #tcp-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, var(--tcp-mid), var(--tcp-cyan));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s, box-shadow 0.15s;
      outline: none;
    }
    #tcp-send-btn:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,174,239,0.4); }
    #tcp-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    #tcp-send-btn svg { width: 18px; height: 18px; fill: #fff; }

    #tcp-footer {
      padding: 5px 14px 8px;
      text-align: center;
      font-size: 10.5px;
      color: #9aa3b5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      flex-shrink: 0;
    }
    #tcp-footer a { color: var(--tcp-mid); text-decoration: none; }

    @media (max-width: 420px) {
      #tcp-chat-panel { right: 12px; bottom: 90px; width: calc(100vw - 24px); }
      #tcp-chat-btn { right: 16px; bottom: 20px; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────────────────────────
  const container = document.createElement("div");
  container.id = "tcp-chat-root";
  container.innerHTML = `
    <!-- Toggle Button -->
    <button id="tcp-chat-btn" aria-label="Open chat">
      <svg class="tcp-chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
      <svg class="tcp-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <!-- Chat Panel -->
    <div id="tcp-chat-panel" role="dialog" aria-label="TchotchoPay Chat">
      <div id="tcp-chat-header">
        <div id="tcp-chat-avatar">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        <div id="tcp-chat-header-text">
          <p id="tcp-chat-title"></p>
          <p id="tcp-chat-subtitle"></p>
        </div>
        <div id="tcp-online-dot"></div>
      </div>

      <div id="tcp-lang-bar">
        <button class="tcp-lang-btn" data-lang="en">EN</button>
        <button class="tcp-lang-btn" data-lang="ht">HT</button>
        <button class="tcp-lang-btn" data-lang="fr">FR</button>
        <button class="tcp-lang-btn" data-lang="es">ES</button>
      </div>

      <div id="tcp-messages">
        <div id="tcp-typing-indicator">
          <div class="tcp-dot"></div>
          <div class="tcp-dot"></div>
          <div class="tcp-dot"></div>
        </div>
      </div>

      <div id="tcp-input-area">
        <textarea id="tcp-input" rows="1" maxlength="500"></textarea>
        <button id="tcp-send-btn" aria-label="Send">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div id="tcp-footer">Powered by <a href="https://tchotchopay.com" target="_blank">TchotchoPay</a> AI</div>
    </div>
  `;
  document.body.appendChild(container);

  // ── References ────────────────────────────────────────────────────────────
  const btn = document.getElementById("tcp-chat-btn");
  const panel = document.getElementById("tcp-chat-panel");
  const messagesEl = document.getElementById("tcp-messages");
  const typingEl = document.getElementById("tcp-typing-indicator");
  const inputEl = document.getElementById("tcp-input");
  const sendBtn = document.getElementById("tcp-send-btn");
  const titleEl = document.getElementById("tcp-chat-title");
  const subtitleEl = document.getElementById("tcp-chat-subtitle");
  const langBtns = document.querySelectorAll(".tcp-lang-btn");

  // ── Language ──────────────────────────────────────────────────────────────
  function applyLang(lang) {
    currentLang = lang;
    t = UI[lang];
    titleEl.textContent = t.title;
    subtitleEl.textContent = t.subtitle;
    inputEl.placeholder = t.placeholder;
    langBtns.forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
  }

  langBtns.forEach((b) => {
    b.addEventListener("click", () => {
      applyLang(b.dataset.lang);
    });
  });

  applyLang(currentLang);

  // ── Toggle ────────────────────────────────────────────────────────────────
  let opened = false;

  function openChat() {
    opened = true;
    btn.classList.add("open");
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    // Add welcome message on first open
    if (messagesEl.querySelectorAll(".tcp-msg").length === 0) {
      addMessage("bot", t.welcome);
    }
    setTimeout(() => inputEl.focus(), 300);
  }

  function closeChat() {
    opened = false;
    btn.classList.remove("open");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  btn.addEventListener("click", () => (opened ? closeChat() : openChat()));

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && opened) closeChat();
  });

  // ── Messages ──────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `tcp-msg ${role}`;
    div.textContent = text;
    messagesEl.insertBefore(div, typingEl);
    scrollBottom();
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    typingEl.classList.add("show");
    scrollBottom();
  }

  function hideTyping() {
    isTyping = false;
    typingEl.classList.remove("show");
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Add user message
    addMessage("user", text);
    conversationHistory.push({ role: "user", content: text });
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const reply = data.reply || t.error;

      conversationHistory.push({ role: "assistant", content: reply });
      hideTyping();
      addMessage("bot", reply);
    } catch (err) {
      hideTyping();
      addMessage("bot", t.error);
      console.error("TchotchoPay chat error:", err);
    }

    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener("click", sendMessage);

  // Enter sends, Shift+Enter = new line
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });

  panel.setAttribute("aria-hidden", "true");
})();
