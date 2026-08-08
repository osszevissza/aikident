const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#main-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Menü megnyitása" : "Menü bezárása",
    );

    menu.classList.toggle("is-open", !isOpen);
  });
}
