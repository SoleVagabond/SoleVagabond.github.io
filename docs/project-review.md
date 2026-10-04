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

Evidence: [55 checks passed](https://github.com/SoleVagabond/sentinel-node/actions/runs/37176167008): 19 Python, 10 frontend, four packaged-SDK contracts, 21 browser scenarios, and one mocked infrastructure scenario. [Verification record](https://github.com/SoleVagabond/sentinel-node/blob/main/docs/validation.md).

Live AWS operation remains unverified. The current project establishes local behavior and checked infrastructure configuration, without claiming production uptime or deployed monitoring experience. Actual cloud permissions, scheduled execution, delivery, and controlled outage/recovery remain a separate release gate.

## Portfolio

The portfolio provides direct application/source links, actual screenshots, native project disclosures, and a systems lab with shareable state and evidence exports. The Sentinel replay uses the project's own telemetry library and original recording; the Northline trace describes implemented code and links to it.

The homepage now reflects the expanded application evidence. The shared telemetry file matches Sentinel's updated source. The existing 30-scenario browser workflow checks desktop and narrow layouts, keyboard access, accessibility, replay boundaries, error recovery, navigation, and exports before GitHub Pages publishes.

## Further development

The next substantial development should add an observable capability with clear failure behavior and a reproducible demonstration, rather than repeating another showcase interface. Incident notifications are one possible automation extension: incident-open, escalation, and recovery events, with delivery retries and duplicate suppression verified against a local recipient fixture. That work would be a separate feature, not a claim about this release.

Authentication and real operational deployment are larger project decisions. They should be implemented when their user, storage, and operating requirements are defined. The current work can be presented as functioning, tested demonstrations with explicit scope.
