const toggleButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

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
