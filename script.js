const toggleButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const progressBar = document.querySelector(".reading-progress");
const revealElements = document.querySelectorAll(".reveal");
const tipButtons = document.querySelectorAll(".tip-button");
const quizForm = document.querySelector("#ai-quiz");
const quizResult = document.querySelector("#quiz-result");
const heroTitle = document.querySelector("#hero-title");

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

    if (score === 3) {
      quizResult.textContent = "Excelente! Voce esta preparado para usar IA com responsabilidade.";
    } else if (score === 2) {
      quizResult.textContent = "Muito bem! Continue praticando uso critico e seguro da IA.";
    } else {
      quizResult.textContent = "Vale revisar os blocos do site e tentar novamente. Voce consegue!";
    }
  });
}

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
