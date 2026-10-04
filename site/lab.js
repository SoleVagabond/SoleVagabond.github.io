/* Recorded observations remain separate from the replay's computed display state. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const scenarios = ["healthy", "outage", "stale", "recovered"];
  const stageNames = ["request", "validate", "save", "track"];
  const labels = {
    Green: "Operational",
    Red: "Outage",
    Yellow: "Degraded",
    Unknown: "Unknown",
  };
  const scenarioLabels = {
    healthy: "Healthy step",
    outage: "Outage step",
    stale: "Lost-signal step",
    recovered: "Recovery step",
  };
  const sourceBase =
    "https://github.com/SoleVagabond/northline-cycle/blob/main/";
  const trace = {
    request: {
      title: "One request, one reference.",
      description:
        "The browser sends controlled service, bike, concern, time, and collection choices with a request reference. The estimate is recalculated by the server.",
      safeguard:
        "The same request reference can be retried after an interrupted response, helping prevent a second repair from being created.",
      question: "What if the reply gets lost?",
      answer:
        "The API looks for the reference in the existing workspace. Matching choices return the already-saved repair; different choices return a conflict.",
      file: "app.js",
      related: "lib/api.js",
    },
    validate: {
      title: "Validate before changing anything.",
      description:
        "The API checks the content type, input size, JSON shape, permitted fields, and allowed sample choices. Cross-origin writes are rejected when an Origin header is present.",
      safeguard:
        "Unexpected personal fields are rejected. The estimate comes from the service catalogue, rather than trusting a submitted price.",
      question: "What if a request is malformed?",
      answer:
        "The API returns an error instead of creating a repair. Input validation is shared by the local server and the hosted function.",
      file: "lib/api.js",
    },
    save: {
      title: "The saved version matters.",
      description:
        "On Netlify, a fresh storage adapter reads the workspace and its version. It writes the repair and journal inside one workspace object, using a conditional version check.",
      safeguard:
        "A competing update makes the conditional write fail with a conflict. The API confirms success only after storage reports that the save completed.",
      question: "What if two views update together?",
      answer:
        "The outdated view cannot silently overwrite the other change. It receives a conflict so it can reload current progress before another action.",
      file: "lib/blob-store.js",
      related: "lib/api.js",
    },
    track: {
      title: "Progress follows the rules.",
      description:
        "Seven repair stages connect the request to collection. The transition rules gate repair work on customer approval and retain a journal of changes.",
      safeguard:
        "The API checks the workspace revision before applying a tracker action. An expired workspace is unavailable, and visitor workspaces keep samples separate.",
      question: "What makes this more than a progress bar?",
      answer:
        "Actions change persisted workflow state. The next stage depends on the current stage and approval, and the journal survives a reload.",
      file: "lib/repairs.js",
      related: "lib/api.js",
    },
  };
  let recording = null;
  let evidenceLoading = false;
  let downloadUrl = null;
  let state = readState();
  function readState() {
    const parts = location.hash.slice(1).split("/");
    if (parts[0] === "northline")
      return {
        mode: "northline",
        stage: stageNames.includes(parts[1]) ? parts[1] : "request",
        scenario: "healthy",
        age: 0,
      };
    const value = Number(parts[2] ?? 0);
    return {
      mode: "sentinel",
      scenario: scenarios.includes(parts[1]) ? parts[1] : "healthy",
      age: Number.isInteger(value) && value >= 0 && value <= 60 ? value : 0,
      stage: "request",
    };
  }
  function stateHash() {
    return state.mode === "sentinel"
      ? `#sentinel/${state.scenario}/${state.age}`
      : `#northline/${state.stage}`;
  }
  function setState(next, replace = false) {
    state = { ...state, ...next };
    const hash = stateHash();
    if (location.hash !== hash)
      history[replace ? "replaceState" : "pushState"](null, "", hash);
    $("share-status").textContent = "";
    render();
  }
  function node(tag, value, className) {
    const element = document.createElement(tag);
    if (value !== undefined) element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  function setPressed(selector, key, value) {
    for (const button of document.querySelectorAll(selector))
      button.setAttribute(
        "aria-pressed",
        String(button.dataset[key] === value),
      );
  }
  function outcome() {
    const step = recording.steps.find(
      (item) => item.scenario === state.scenario,
    );
    const baseAge = state.scenario === "stale" ? 45 : 0;
    const virtualNow =
      Date.parse(step.snapshot.last_updated) + (baseAge + state.age) * 1000;
    return {
      step,
      virtualNow,
      health: SentinelTelemetry.health(step.snapshot, virtualNow),
    };
  }
  function renderReplay() {
    const { step, health } = outcome();
    const trustworthy = !["stale", "unknown"].includes(health.state);
    $("replay-status").dataset.state = health.state;
    $("replay-status-text").textContent = health.label;
    $("replay-explanation").textContent = trustworthy
      ? `This recorded observation is ${Math.round(health.age)} seconds old at the replay clock. Its response results can still inform the current display.`
      : `At the replay clock, this observation is ${Math.round(health.age)} seconds old. Its responses remain visible as evidence; current service health is unknown.`;
    $("observation-age").value = state.age;
    $("age-output").textContent = `${state.age} seconds`;
    $("freshness-limit").textContent =
      `${step.snapshot.stale_after_seconds} seconds`;
    $("replay-services").textContent = step.snapshot.endpoints.length;
    $("replay-healthy").textContent = trustworthy
      ? step.snapshot.endpoints.filter((item) => item.status === "Green").length
      : "Unknown";
    $("replay-active").textContent = trustworthy
      ? step.snapshot.incidents.filter((item) => item.resolved_at === null)
          .length
      : "Unknown";
    $("recording-label").textContent = scenarioLabels[state.scenario];
    $("response-rows").replaceChildren(
      ...step.snapshot.endpoints.map((endpoint) => {
        const row = node("tr");
        const displayedStatus = trustworthy ? endpoint.status : "Unknown";
        const badge = node("span", labels[displayedStatus], "response-state");
        badge.dataset.status = displayedStatus;
        const statusCell = node("td");
        statusCell.append(badge);
        row.append(
          node("td", endpoint.name),
          node("td", endpoint.status_code ?? "—"),
          node("td", `${endpoint.latency_ms.toFixed(2)} ms`),
          statusCell,
        );
        return row;
      }),
    );
    $("history-bars").replaceChildren(
      ...step.history.samples.map((sample, index) => {
        const api = sample.endpoints.find((endpoint) => endpoint.id === "api");
        const item = node("li");
        item.dataset.status = api.status;
        item.append(
          node("span", `Sample ${index + 1}`),
          node("strong", `HTTP ${api.status_code}`),
          node("span", `${api.latency_ms.toFixed(2)} ms`),
        );
        return item;
      }),
    );
    const memory = $("incident-memory");
    memory.className = "incident-memory";
    if (!step.snapshot.incidents.length)
      memory.replaceChildren(
        node("p", "No incident had been recorded at this step."),
      );
    else
      memory.replaceChildren(
        ...step.snapshot.incidents.map((incident) => {
          const article = node("article");
          const label = incident.resolved_at
            ? "Recovered"
            : trustworthy
              ? "Active"
              : "Last observed active";
          article.append(
            node("span", label),
            node("strong", incident.name),
            node("p", incident.reason),
            node(
              "p",
              incident.resolved_at
                ? "A healthy check resolved this incident. The original outage is retained."
                : trustworthy
                  ? "Waiting for a healthy observation before marking recovery."
                  : "The observation is stale. We cannot establish whether this incident is still active.",
            ),
          );
          return article;
        }),
      );
    setPressed("[data-scenario]", "scenario", state.scenario);
  }
  function renderTrace() {
    const item = trace[state.stage];
    $("trace-kicker").textContent =
      `Stage ${stageNames.indexOf(state.stage) + 1} / ${state.stage}`;
    $("trace-step-title").textContent = item.title;
    $("trace-description").textContent = item.description;
    $("trace-safeguard").textContent = item.safeguard;
    $("trace-question-title").textContent = item.question;
    $("trace-answer").textContent = item.answer;
    $("trace-source").href = sourceBase + item.file;
    setPressed("[data-stage]", "stage", state.stage);
  }
  function renderTools() {
    $("lab-tools").hidden = state.mode === "sentinel" && !recording;
    if ($("lab-tools").hidden) return;
    const shareUrl = new URL(location.href);
    shareUrl.search = "";
    shareUrl.hash = stateHash();
    $("state-link").value = shareUrl.href;
    const data =
      state.mode === "sentinel"
        ? (() => {
            const { step, health, virtualNow } = outcome();
            return {
              type: "recorded-incident-replay",
              source:
                "https://github.com/SoleVagabond/sentinel-node/blob/main/docs/evidence/local-incident-sequence.json",
              environment: recording.environment,
              notes: recording.notes,
              scenario: state.scenario,
              recording: step,
              replay: {
                addedAgeSeconds: state.age,
                assumedOriginalAgeSeconds: state.scenario === "stale" ? 45 : 0,
                virtualNow: new Date(virtualNow).toISOString(),
                computedObservation: health,
                currentServiceStatusKnown: !["stale", "unknown"].includes(
                  health.state,
                ),
              },
            };
          })()
        : {
            type: "architecture-walkthrough",
            project: "Northline Cycle",
            stage: state.stage,
            implementation: trace[state.stage],
            source: sourceBase + trace[state.stage].file,
            note: "This explains implemented code; it does not submit a repair request.",
          };
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2) + "\n"], {
        type: "application/json",
      }),
    );
    $("download-state").href = downloadUrl;
    $("download-state").download =
      `devin-${state.mode}-${state.mode === "sentinel" ? state.scenario : state.stage}.json`;
  }
  function render() {
    $("sentinel-panel").hidden = state.mode !== "sentinel";
    $("notification-evidence").hidden = state.mode !== "sentinel";
    $("northline-panel").hidden = state.mode !== "northline";
    setPressed("[data-mode]", "mode", state.mode);
    if (state.mode === "sentinel" && recording) renderReplay();
    else if (state.mode === "northline") renderTrace();
    renderTools();
  }
  function validateRecording(data) {
    if (
      !data ||
      data.environment !== "local incident lab" ||
      typeof data.notes !== "string" ||
      !Array.isArray(data.steps) ||
      data.steps.length !== 4
    )
      throw new Error("Invalid recording");
    for (const scenario of scenarios) {
      const items = data.steps.filter((step) => step.scenario === scenario);
      if (items.length !== 1)
        throw new Error("Missing or duplicate recording step");
      const step = items[0];
      SentinelTelemetry.validateSnapshot(step.snapshot);
      if (
        !Array.isArray(step.history?.samples) ||
        step.history.samples.length > 60
      )
        throw new Error("Invalid history");
      for (const sample of step.history.samples) {
        const api = sample.endpoints?.find((endpoint) => endpoint.id === "api");
        if (
          !api ||
          !["Green", "Yellow", "Red"].includes(api.status) ||
          !Number.isFinite(api.latency_ms) ||
          api.latency_ms < 0
        )
          throw new Error("Invalid history sample");
      }
    }
    return data;
  }
  async function loadEvidence() {
    if (evidenceLoading) return;
    evidenceLoading = true;
    $("lab-error").hidden = true;
    $("lab-loading").hidden = false;
    $("replay-body").hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch("assets/local-incident-sequence.json", {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Recording unavailable");
      recording = validateRecording(await response.json());
      $("replay-body").hidden = false;
    } catch {
      recording = null;
      $("lab-error").hidden = false;
    } finally {
      clearTimeout(timeout);
      evidenceLoading = false;
      $("lab-loading").hidden = true;
      render();
    }
  }
  document.querySelector(".lab-switch").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) setState({ mode: button.dataset.mode });
  });
  document
    .querySelector(".scenario-switch")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-scenario]");
      if (button) setState({ scenario: button.dataset.scenario, age: 0 });
    });
  document
    .querySelector(".architecture-path")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage]");
      if (button) setState({ stage: button.dataset.stage });
    });
  $("observation-age").addEventListener("input", (event) =>
    setState({ age: Number(event.target.value) }, true),
  );
  $("retry-evidence").addEventListener("click", loadEvidence);
  $("copy-state-link").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("state-link").value);
      $("share-status").textContent =
        "Link copied. It opens this project, step, and observation age.";
    } catch {
      $("state-link").focus();
      $("state-link").select();
      $("share-status").textContent =
        "Copy the selected link from the field above.";
    }
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#main") return;
    state = readState();
    $("share-status").textContent = "";
    render();
  });
  window.addEventListener("pagehide", () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) renderTools();
  });
  render();
  loadEvidence();
})();
