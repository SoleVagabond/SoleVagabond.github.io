# Project review

This review looks at the two applications and the portfolio as a connected body of self-directed work. It distinguishes working behavior from configuration and from remaining operational proof.

## Northline Cycle

The strongest part is the complete request-to-collection workflow: a server-calculated estimate, saved repair, customer approval, seven stages, and a retained journal. Separate visitor workspaces, retry references, and storage-version checks give the workflow substance beyond the interface.

The main gap was repeatable browser evidence. The new suite runs eight scenarios at three screen sizes in GitHub: the complete journey and reload, response loss after saving, competing tabs, conflict recovery, separate visitors, startup recovery, keyboard focus, and automated accessibility/layout checks. It uses a real loopback application and fresh storage; selected failure responses are deliberately injected.

The scan caught low contrast in orange accents and stage labels. Those colors were corrected. The skip link now focuses main content, and a named container has a valid group role.

Evidence: [32 backend checks and 24 browser scenarios passed](https://github.com/SoleVagabond/northline-cycle/actions/runs/37176343156). [QA record](https://github.com/SoleVagabond/northline-cycle/blob/main/qa/QA-REPORT.md).

The hosted 12-check smoke record remains separate from these local browser checks. Customer and workshop views are demonstration controls available to every visitor. This remains a fictional workshop; real customer accounts, bookings, payments, notifications, and observed scheduled cleanup are outside the verified release.

## SentinelNode

The project now includes a working single-operator application for a computer or server. Its workflow covers service configuration, scheduled/manual checks, incident acknowledgement and notes, confirmed recovery, optional webhook delivery, history exports, and database backups/restoration. Live mode starts empty; its separate demonstration uses real loopback services. The public portfolio lab remains a recorded replay.

SQLite commits completed observations, incident transitions, and newly queued notifications together. A process lock prevents competing writers, configuration revisions reject stale edits, and local host/origin/session guards protect mutations. The portable Python archive includes the dashboard and requires no runtime packages. It is a private operator workspace, without hosted accounts, team roles, or installed process supervision.

The review found two concrete display errors around separately written history. Malformed optional history could hide valid current health. A newer history write could also appear beside an older completed status snapshot. History now validates independently and excludes samples newer than the displayed snapshot. It does not mutate the underlying evidence or claim the two writes are transactional.

Incident notification delivery now adds a durable outbox, stable opening/escalation/recovery references, bounded retries, and a deduplicating local receiver. A saved receipt with a lost HTTP reply produces two accepted requests but one notification. Delivery failure stays separate from observed health, and notification checkpoints survive restart and partially failed telemetry writes.

The [notification recording](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/evidence/notification-delivery.json) retains six actual loopback stages: healthy baseline, unavailable receiver, restored receiver, a saved notification with a lost reply, the matching retry, and recovery. Its final five unique notifications come from six accepted requests. The portfolio's table is derived from that unchanged source record, and its browser check compares every displayed count and the downloaded evidence with the original.

The notification panel now confirms each receiver setting, explains empty and not-yet-due retries, and sends an explicit test message without altering service health. The latest test result follows its eventual acknowledgement. Local file reads and writes are serialized to avoid Windows replacement conflicts, and a failed background check retries on the next tick rather than terminating the loop.

The operator interface now has a direct first-service action, optional advanced settings, explicit receiver setup steps, and explanations for disabled delivery actions. Overview counts and service names open the related views. History filters load automatically; its chart has labeled axes, exact keyboard/pointer readings, and gaps for checks without HTTP replies. A slow old filter response cannot replace the current selection.

Evidence: [163 checks passed](https://github.com/SoleVagabond/sentinel-node/actions/runs/37217553493): 72 Python, 11 frontend, four packaged-SDK contracts, 75 browser scenarios, and one mocked infrastructure scenario. The added browser coverage checks retained custom settings, paused/unsaved receiver settings, retry timing, shortcuts, chart inspection, missing replies, and competing filter responses at all three sizes. Another [35 live workflows](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/live-verification.md) exercise actual public websites, deliberate HTTP/TLS/DNS/timeout failures, real retry waits, eight concurrent local probes, scheduler behavior, restart persistence, and backup restoration through the portable application. That earlier record retains its original package hash and observations; the interface update leaves its monitoring backend unchanged. The independently regenerated original notification recording remains unchanged. See the [verification record](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/validation.md).

Live AWS operation remains unverified. The current project establishes local behavior and checked infrastructure configuration, without claiming production uptime or deployed monitoring experience. Actual cloud permissions, scheduled execution, delivery, and controlled outage/recovery remain a separate release gate.

## Portfolio

The portfolio provides direct application/source links, actual screenshots, native project disclosures, and a systems lab with shareable state and evidence exports. The Sentinel replay uses the project's own telemetry library and original recording; the Northline trace describes implemented code and links to it.

The homepage now reflects the expanded application evidence. The shared telemetry file matches Sentinel's updated source. The 33-scenario browser workflow checks desktop and narrow layouts, keyboard access, accessibility, replay boundaries, error recovery, navigation, exports, and the notification table against the original recording before GitHub Pages publishes.

## Further development

The single-operator application has a defined 1.0 workflow and a separate easy demonstration. The portfolio links its run instructions and guide while retaining the original lab screenshots and evidence. Cloud integration remains a separate operating decision: Lambda continues to run its existing telemetry-only path. An independent monitor-heartbeat alert also remains outside this release.

Teams and Internet-facing accounts should follow defined user and operating requirements. They are not required for this private monitoring app. Present it as a tested application with a bounded scope and controlled local verification, without claiming customer adoption or cloud uptime.
