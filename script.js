const toggleButton = document.querySelector(".menu-toggle");
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
const constellationCanvas = document.querySelector("#constellation-canvas");

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

if (progressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
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
    }
  });
}

if (closeQuizModalButton && quizModal) {
  closeQuizModalButton.addEventListener("click", () => {
    quizModal.classList.remove("show");
    quizModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  });
}

if (quizModal) {
  quizModal.addEventListener("click", (event) => {
    if (event.target === quizModal) {
      quizModal.classList.remove("show");
      quizModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quizModal && quizModal.classList.contains("show")) {
    quizModal.classList.remove("show");
    quizModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
