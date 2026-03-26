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
    button.textContent = isOpen ? "Ocultar dica" : "Ver dica pratica";
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
      message = "Excelente! Voce esta preparado para usar IA com responsabilidade.";
    } else if (score === 2) {
      message = "Muito bem! Continue praticando uso critico e seguro da IA.";
    } else {
      message = "Vale revisar os blocos do site e tentar novamente. Voce consegue!";
    }

    quizResult.textContent = message;

    if (quizModal && quizModalScore && quizModalMessage) {
      quizModalScore.textContent = `Pontuacao: ${score}/3`;
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
  let i = 0;
  heroTitle.textContent = "";
  const type = () => {
    heroTitle.textContent = fullText.slice(0, i);
    i += 1;
    if (i <= fullText.length) {
      setTimeout(type, 22);
    }
  };
  type();
}
