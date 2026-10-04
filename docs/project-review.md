# Project review

This review looks at the two applications and the portfolio as a connected body of self-directed work. It distinguishes working behavior from configuration and from remaining operational proof.

## Northline Cycle

The strongest part is the complete request-to-collection workflow: a server-calculated estimate, saved repair, customer approval, seven stages, and a retained journal. Separate visitor workspaces, retry references, and storage-version checks give the workflow substance beyond the interface.

The main gap was repeatable browser evidence. The new suite runs eight scenarios at three screen sizes in GitHub: the complete journey and reload, response loss after saving, competing tabs, conflict recovery, separate visitors, startup recovery, keyboard focus, and automated accessibility/layout checks. It uses a real loopback application and fresh storage; selected failure responses are deliberately injected.

The scan caught low contrast in orange accents and stage labels. Those colors were corrected. The skip link now focuses main content, and a named container has a valid group role.

Evidence: [32 backend checks and 24 browser scenarios passed](https://github.com/SoleVagabond/northline-cycle/actions/runs/37176343156). [QA record](https://github.com/SoleVagabond/northline-cycle/blob/main/qa/QA-REPORT.md).

The hosted 12-check smoke record remains separate from these local browser checks. Customer and workshop views are demonstration controls available to every visitor. This remains a fictional workshop; real customer accounts, bookings, payments, notifications, and observed scheduled cleanup are outside the verified release.

## SentinelNode

The project demonstrates concurrent HTTP observations, incident transitions, and the difference between a service failure and a monitor that stopped reporting. The local lab is an actual HTTP experiment; the public portfolio lab replays its recorded observations.

The review found two concrete display errors around separately written history. Malformed optional history could hide valid current health. A newer history write could also appear beside an older completed status snapshot. History now validates independently and excludes samples newer than the displayed snapshot. It does not mutate the underlying evidence or claim the two writes are transactional.

Incident notification delivery now adds a durable outbox, stable opening/escalation/recovery references, bounded retries, and a deduplicating local receiver. A saved receipt with a lost HTTP reply produces two accepted requests but one notification. Delivery failure stays separate from observed health, and notification checkpoints survive restart and partially failed telemetry writes.

The [notification recording](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/evidence/notification-delivery.json) retains six actual loopback stages: healthy baseline, unavailable receiver, restored receiver, a saved notification with a lost reply, the matching retry, and recovery. Its final five unique notifications come from six accepted requests. The portfolio's table is derived from that unchanged source record, and its browser check compares every displayed count and the downloaded evidence with the original.

Evidence: [90 checks passed](https://github.com/SoleVagabond/sentinel-node/actions/runs/37179009669): 45 Python, 10 frontend, four packaged-SDK contracts, 30 browser scenarios, and one mocked infrastructure scenario. The independently regenerated notification recording also passed its actual HTTP assertions. See the [verification record](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/validation.md).

Live AWS operation remains unverified. The current project establishes local behavior and checked infrastructure configuration, without claiming production uptime or deployed monitoring experience. Actual cloud permissions, scheduled execution, delivery, and controlled outage/recovery remain a separate release gate.

## Portfolio

The portfolio provides direct application/source links, actual screenshots, native project disclosures, and a systems lab with shareable state and evidence exports. The Sentinel replay uses the project's own telemetry library and original recording; the Northline trace describes implemented code and links to it.

The homepage now reflects the expanded application evidence. The shared telemetry file matches Sentinel's updated source. The 33-scenario browser workflow checks desktop and narrow layouts, keyboard access, accessibility, replay boundaries, error recovery, navigation, exports, and the notification table against the original recording before GitHub Pages publishes.

## Further development

The incident notification extension is now implemented locally and available as an opt-in standalone monitor feature. Cloud integration remains a separate operating decision: it requires a private queue store, secret configuration, serialized processing, and observed delivery verification. Lambda continues to run its existing telemetry-only path. An independent monitor-heartbeat alert also remains outside this feature.

Authentication and real operational deployment are larger project decisions. They should be implemented when their user, storage, and operating requirements are defined. The current work can be presented as functioning, tested demonstrations with explicit scope.
