# Devin — Selected work

A personal portfolio for web applications, automation, and systems.

[Live portfolio](https://solevagabond.github.io/) · [Northline Cycle](https://github.com/SoleVagabond/northline-cycle) · [SentinelNode](https://github.com/SoleVagabond/sentinel-node)

The original static site uses semantic HTML, responsive CSS, and a small progressively enhanced screenshot gallery. Native project disclosures, navigation and evidence links work without JavaScript. All featured screenshots come from the actual project applications. The two featured projects are self-directed work; Northline is a fictional workshop and Sentinel’s live AWS operation remains unverified.

## Interactive systems lab

[Open the lab](https://solevagabond.github.io/lab.html). Sentinel's four-step local recording can be replayed, aged against its freshness limit, shared through a URL, and exported as JSON. The export separates original observations from computed status. The lab reuses Sentinel's unchanged `frontend/telemetry.js` and original recorded sequence; it doesn't perform live probes. The lost-signal baseline assumes the documented 45-second deliberate timestamp aging.

Northline's architecture walkthrough links each implemented request-processing stage to its source. It describes safeguards rather than pretending to submit a repair. Visitors can share and download any selected trace stage.

The expanded browser suite checks freshness boundaries, recovery history, malformed/unavailable evidence, retry behavior, deep links, browser history, keyboard controls, JSON exports, layouts, and automated accessibility rules.

## Local preview

Run `python -m http.server 8794 --bind 127.0.0.1 --directory site` from this directory and open http://127.0.0.1:8794/.

## Verify

Node.js 22 and Python 3.13 are the development baseline. Run `npm ci`, `npx playwright install --with-deps chromium`, and `npm test`.

The browser suite checks project links, image loading, all three gallery states, disclosures, keyboard navigation, narrow-screen overflow, and automated accessibility rules. It runs at 1280, 375 and 320 pixel widths and saves screenshots and reports under `work/`. Automated scans are a useful check, not a full accessibility certification.

GitHub Actions runs those checks before publishing `site/` to GitHub Pages. Failed checks prevent deployment. Only the static public assets are deployed; there is no contact form or tracking service.
