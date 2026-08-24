(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header.top");
    const btn = document.querySelector("[data-menu-toggle]");
    if (!header || !btn) return;

    const setOpen = (open) => {
      header.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    btn.addEventListener("click", () => {
      setOpen(!header.classList.contains("is-open"));
    });

    header.querySelectorAll(".nav a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setOpen(false);
    });
  });
})();
