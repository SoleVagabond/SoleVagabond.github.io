"use strict";
const gallery = document.querySelector("[data-gallery]");
const states = {
  outage: {
    caption: "Service outage / An HTTP 503 opens an incident.",
    alt: "Sentinel’s local incident lab showing an Orders API outage and an active incident.",
  },
  stale: {
    caption: "Lost signal / An old observation becomes unknown.",
    alt: "Sentinel warning that telemetry is stale, with health totals suppressed and service health marked unknown.",
  },
  recovery: {
    caption:
      "Recovery / Healthy services, with the resolved incident retained.",
    alt: "Sentinel showing operational services and a resolved Orders API HTTP 503 in the incident timeline.",
  },
};
if (gallery) {
  gallery.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-image]");
    if (!button || !gallery.contains(button)) return;
    const key = button.dataset.image;
    const state = states[key];
    if (!state) return;
    const img = gallery.querySelector("img");
    img.src = `assets/sentinel-${key}.png`;
    img.alt = state.alt;
    gallery.querySelector("figure a").href = img.src;
    gallery.querySelector("figcaption").textContent = state.caption;
    for (const control of gallery.querySelectorAll("button"))
      control.setAttribute("aria-pressed", String(control === button));
  });
}
