/* Rolagem no #scroll-root: a janela não rola (evita Safari/Chrome mobile abrirem no meio). */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const scrollRoot = document.getElementById("scroll-root");

const shouldStartAtTop = () => !location.hash || location.hash === "#";

const forceScrollTop = () => {
  if (!shouldStartAtTop()) return;
  if (scrollRoot) {
    scrollRoot.scrollTop = 0;
  }
  const se = document.scrollingElement;
  if (se) se.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  const hero = document.getElementById("top");
  if (hero) {
    try {
      hero.scrollIntoView({ block: "start", behavior: "instant" });
    } catch {
      hero.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }
};

forceScrollTop();

document.addEventListener("DOMContentLoaded", forceScrollTop);

window.addEventListener(
  "pageshow",
  () => {
    if (shouldStartAtTop()) {
      forceScrollTop();
      setTimeout(forceScrollTop, 0);
    }
  },
  { passive: true }
);

window.addEventListener("load", () => {
  forceScrollTop();
  requestAnimationFrame(() => {
    requestAnimationFrame(forceScrollTop);
  });
  [0, 100, 400, 900].forEach((ms) => {
    setTimeout(forceScrollTop, ms);
  });
});

const boot = Date.now();
const vv = window.visualViewport;
if (vv) {
  vv.addEventListener(
    "resize",
    () => {
      if (!shouldStartAtTop()) return;
      if (Date.now() - boot < 3500) forceScrollTop();
    },
    { passive: true }
  );
}

window.addEventListener(
  "orientationchange",
  () => {
    if (shouldStartAtTop()) setTimeout(forceScrollTop, 100);
  },
  { passive: true }
);

const toggleButton = document.querySelector(".menu-toggle[aria-controls='menu']");
const menu = document.querySelector(".menu");
const progressBar = document.querySelector(".reading-progress");
const revealElements = document.querySelectorAll(".reveal");
const tipButtons = document.querySelectorAll(".tip-button");
const quizForm = document.querySelector("#ai-quiz");
const quizResult = document.querySelector("#quiz-result");
const heroTitle = document.querySelector("#hero-title");
const quizModal = document.querySelector("#quiz-modal");
const quizModalScore = document.querySelector("#quiz-modal-score");
const quizModalMessage = document.querySelector("#quiz-modal-message");
const closeQuizModalButton = document.querySelector("#close-quiz-modal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const shouldUseCustomCursor = supportsDesktopPointer && !hasTouch && !isIOS;
const constellationCanvas = document.querySelector("#constellation-canvas");
const soundToggle = document.querySelector("#sound-toggle");
const cursorDot = document.querySelector("#cursor-dot");
const cursorRing = document.querySelector("#cursor-ring");

if (toggleButton && menu) {
  toggleButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Add glitch-text source to interactive elements.
document
  .querySelectorAll(
    ".menu a, .btn, .tip-button, .faq summary, .audio-orb, .copy-prompt-btn, .math-subnav-link"
  )
  .forEach((element) => {
    element.setAttribute("data-glitch", element.textContent?.trim() || "");
  });

if (progressBar) {
  const updateProgress = () => {
    let scrollTop;
    let docHeight;
    if (scrollRoot) {
      scrollTop = scrollRoot.scrollTop;
      docHeight = scrollRoot.scrollHeight - scrollRoot.clientHeight;
    } else {
      scrollTop = window.scrollY;
      docHeight = document.documentElement.scrollHeight - window.innerHeight;
    }
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  const scrollTarget = scrollRoot || window;
  scrollTarget.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

if (revealElements.length > 0) {
  // threshold 0.16 fails for tall sections: intersectionRatio = visibleHeight/totalHeight
  // can stay below 16% on mobile. Use 0 so any visible strip reveals the whole block.
  const revealOpts = { threshold: 0, rootMargin: "80px 0px 80px 0px" };
  if (scrollRoot) {
    revealOpts.root = scrollRoot;
  }
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    revealOpts
  );

  const revealNow = (el) => {
    if (!el.classList.contains("show")) {
      el.classList.add("show");
      revealObserver.unobserve(el);
    }
  };

  const revealIfInViewport = (el) => {
    if (el.classList.contains("show")) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      revealNow(el);
    }
  };

  const revealHashSection = () => {
    if (!location.hash) return;
    try {
      const el = document.querySelector(location.hash);
      if (el?.classList?.contains("reveal")) {
        revealNow(el);
      }
    } catch {
      /* invalid hash selector */
    }
  };

  revealElements.forEach((el) => {
    revealObserver.observe(el);
    revealIfInViewport(el);
  });

  revealHashSection();
  window.addEventListener("hashchange", revealHashSection);

  window.addEventListener("load", () => {
    revealElements.forEach(revealIfInViewport);
    revealHashSection();
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revealElements.forEach(revealIfInViewport);
      revealHashSection();
    });
  });
}

tipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".tip-card");
    if (!card) return;
    const isOpen = card.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "Ocultar dica" : "Ver dica prática";
  });
});

if (quizForm && quizResult) {
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(quizForm);
    const answers = {
      q1: "b",
      q2: "a",
      q3: "b",
    };

    let score = 0;
    Object.entries(answers).forEach(([key, value]) => {
      if (formData.get(key) === value) score += 1;
    });

    let message = "";
    if (score === 3) {
      message = "Excelente! Você está preparado para usar IA com responsabilidade.";
    } else if (score === 2) {
      message = "Muito bem! Continue praticando uso crítico e seguro da IA.";
    } else {
      message = "Vale revisar os blocos do site e tentar novamente. Você consegue!";
    }

    quizResult.textContent = message;

    if (quizModal && quizModalScore && quizModalMessage) {
      quizModalScore.textContent = `Pontuação: ${score}/3`;
      quizModalMessage.textContent = message;
      quizModal.classList.add("show");
      quizModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (scrollRoot) scrollRoot.style.overflow = "hidden";
    }
  });
}

if (closeQuizModalButton && quizModal) {
  closeQuizModalButton.addEventListener("click", () => {
    quizModal.classList.remove("show");
    quizModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (scrollRoot) scrollRoot.style.overflow = "";
  });
}

if (quizModal) {
  quizModal.addEventListener("click", (event) => {
    if (event.target === quizModal) {
      quizModal.classList.remove("show");
      quizModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (scrollRoot) scrollRoot.style.overflow = "";
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quizModal && quizModal.classList.contains("show")) {
    quizModal.classList.remove("show");
    quizModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (scrollRoot) scrollRoot.style.overflow = "";
  }
});

if (heroTitle) {
  const fullText = heroTitle.textContent || "";
  if (prefersReducedMotion) {
    heroTitle.textContent = fullText;
  } else {
    let i = 0;
    let last = 0;
    const interval = 18;
    heroTitle.textContent = "";

    const type = (time) => {
      if (time - last >= interval) {
        heroTitle.textContent = fullText.slice(0, i);
        i += 1;
        last = time;
      }

      if (i <= fullText.length) {
        window.requestAnimationFrame(type);
      }
    };

    window.requestAnimationFrame(type);
  }
}

if (!shouldUseCustomCursor) {
  cursorDot?.remove();
  cursorRing?.remove();
} else if (cursorDot && cursorRing && !prefersReducedMotion) {
  let ringX = 0;
  let ringY = 0;
  let dotX = 0;
  let dotY = 0;

  window.addEventListener("mousemove", (event) => {
    document.body.classList.add("cursor-active");
    dotX = event.clientX;
    dotY = event.clientY;
    cursorDot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
  });

  const animateRing = () => {
    ringX += (dotX - ringX) * 0.2;
    ringY += (dotY - ringY) * 0.2;
    cursorRing.style.transform = `translate(${ringX - 13}px, ${ringY - 13}px)`;
    window.requestAnimationFrame(animateRing);
  };
  animateRing();

  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
    document.body.classList.remove("cursor-on-clickable");
  });
}

document
  .querySelectorAll("a, button, summary, [role='button'], input, label")
  .forEach((element) => {
    element.addEventListener("mouseenter", () => {
      if (!shouldUseCustomCursor) return;
      document.body.classList.add("cursor-on-clickable");
    });
    element.addEventListener("mouseleave", () => {
      if (!shouldUseCustomCursor) return;
      document.body.classList.remove("cursor-on-clickable");
    });
  });

if (soundToggle) {
  let soundEnabled = false;
  let audioCtx = null;
  let ambientNodes = null;

  const ensureContext = () => {
    if (!audioCtx) audioCtx = new window.AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  };

  const startAmbient = () => {
    const ctx = ensureContext();
    if (ambientNodes) return;

    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.018;
    ambientGain.connect(ctx.destination);

    // Low synth pad for a calm Y2K ambient texture.
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = "triangle";
    padOsc.frequency.value = 92;
    padGain.gain.value = 0.009;
    padOsc.connect(padGain);
    padGain.connect(ambientGain);
    padOsc.start();

    // Soft filtered noise to add airy background.
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.28;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 680;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.014;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGain);
    noiseSource.start();

    ambientNodes = { ambientGain, padOsc, noiseSource };
  };

  const stopAmbient = () => {
    if (!ambientNodes) return;
    const { ambientGain, padOsc, noiseSource } = ambientNodes;
    const ctx = ensureContext();
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    padOsc.stop(ctx.currentTime + 0.24);
    noiseSource.stop(ctx.currentTime + 0.24);
    ambientNodes = null;
  };

  const playSoftClick = (frequency = 460, duration = 0.035, gainValue = 0.018) => {
    if (!soundEnabled) return;
    const ctx = ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.textContent = soundEnabled ? "ON" : "OFF";
    soundToggle.setAttribute("data-glitch", soundToggle.textContent);
    if (soundEnabled) {
      startAmbient();
      playSoftClick(520, 0.05, 0.024);
    } else {
      stopAmbient();
    }
  });

  document.querySelectorAll("a, button, summary").forEach((element) => {
    element.addEventListener("click", () => playSoftClick(420, 0.03, 0.018));
  });
}

if (constellationCanvas) {
  const context = constellationCanvas.getContext("2d");
  const points = [];
  const maxPoints = 34;
  const maxDistance = 150;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resizeCanvas = () => {
    constellationCanvas.width = Math.floor(window.innerWidth * dpr);
    constellationCanvas.height = Math.floor(window.innerHeight * dpr);
    constellationCanvas.style.width = `${window.innerWidth}px`;
    constellationCanvas.style.height = `${window.innerHeight}px`;
    if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createPoints = () => {
    points.length = 0;
    for (let i = 0; i < maxPoints; i += 1) {
      points.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + 0.6,
        dx: (Math.random() - 0.5) * 0.12,
        dy: (Math.random() - 0.5) * 0.12,
      });
    }
  };

  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];

      context.beginPath();
      context.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      context.fill();

      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < maxDistance) {
          const alpha = 1 - dist / maxDistance;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.28})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    }
  };

  const update = () => {
    if (!prefersReducedMotion) {
      points.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
      });
    }
    draw();
    window.requestAnimationFrame(update);
  };

  resizeCanvas();
  createPoints();
  update();
  window.addEventListener("resize", () => {
    resizeCanvas();
    createPoints();
  });
}

document.querySelectorAll(".copy-prompt-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const id = button.getAttribute("data-target");
    const source = id ? document.getElementById(id) : null;
    const text = source?.textContent?.trim() || "";
    if (!text) return;
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copiado!";
      setTimeout(() => {
        button.textContent = original;
      }, 2200);
    } catch {
      button.textContent = "Tente de novo";
      setTimeout(() => {
        button.textContent = original;
      }, 2000);
    }
  });
});
