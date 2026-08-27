(() => {
  const tabs = [...document.querySelectorAll("[data-legal-tab]")];
  const panels = [...document.querySelectorAll("[data-legal-panel]")];
  if (!tabs.length || !panels.length) return;

  const valid = new Set(tabs.map((tab) => tab.getAttribute("data-legal-tab")));

  function show(id, { pushHash = true } = {}) {
    const key = valid.has(id) ? id : "privacy";

    tabs.forEach((tab) => {
      const active = tab.getAttribute("data-legal-tab") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-current", active ? "page" : "false");
    });

    panels.forEach((panel) => {
      const active = panel.getAttribute("data-legal-panel") === key;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    if (pushHash) {
      const next = `#${key}`;
      if (location.hash !== next) {
        history.replaceState(null, "", next);
      }
    }

    const activePanel = panels.find((panel) => panel.getAttribute("data-legal-panel") === key);
    if (activePanel) {
      activePanel.focus({ preventScroll: true });
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      show(tab.getAttribute("data-legal-tab"));
    });
  });

  window.addEventListener("hashchange", () => {
    show(location.hash.replace(/^#/, "") || "privacy", { pushHash: false });
  });

  show(location.hash.replace(/^#/, "") || "privacy", { pushHash: false });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const topic = String(data.get("topic") || "General enquiry");
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nTopic: ${topic}\n\n${data.get("message")}`;
      const status = document.getElementById("contact-status");
      if (status) status.textContent = "Opening your email app…";
      window.location.href = `mailto:support@kccdigital.com?subject=${encodeURIComponent(`Kincore enquiry: ${topic}`)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
